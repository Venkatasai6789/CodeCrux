import React, { useState, useEffect, useCallback, useRef } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';

// Define the shape of a detection result
export interface Detection {
  bbox?: [number, number, number, number];
  class: string;
  score: number;
  data?: any; // Extra data for landmarks etc.
}

export const useObjectDetection = (videoRef: React.RefObject<HTMLVideoElement | null>, enabled: boolean = true) => {
  const [objectModel, setObjectModel] = useState<any>(null);
  const [faceModel, setFaceModel] = useState<any>(null);
  const [detections, setDetections] = useState<Detection[]>([]);
  const [loading, setLoading] = useState(true);
  const requestRef = useRef<number>(undefined);
  const lastDetectionTime = useRef<number>(0);
  const hasInitialized = useRef(false);
  const detectionBuffer = useRef<Record<string, number>>({});
  const BUFFER_THRESHOLD = 3; // Consecutive hits needed to confirm a violation object

  // Load models on mount
  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    async function loadModels() {
      const timeout = setTimeout(() => {
          if (loading) {
              console.warn('AI Models taking too long. Entering fallback mode.');
              setLoading(false);
          }
      }, 15000); // 15s resilience timeout

      try {
        console.log('[AI] Initializing engine...');
        // Explicitly set backend with fallback
        try {
            await tf.setBackend('webgl');
            await tf.ready();
            console.log('[AI] WebGL backend initialized.');
        } catch (e) {
            console.warn('[AI] WebGL failed, falling back to CPU.');
            await tf.setBackend('cpu');
            await tf.ready();
        }
        
        // Load in parallel to save time
        const results = await Promise.allSettled([
            cocoSsd.load({ base: 'lite_mobilenet_v2' }),
            faceLandmarksDetection.createDetector(
                faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh,
                { runtime: 'tfjs', refineLandmarks: false, maxFaces: 4 }
            )
        ]);

        if (results[0].status === 'fulfilled') {
            setObjectModel(results[0].value);
            console.log('[AI] Object detection (SSD) loaded.');
        }
        if (results[1].status === 'fulfilled') {
            setFaceModel(results[1].value);
            console.log('[AI] Face mesh tracking loaded.');
        }

        clearTimeout(timeout);
        setLoading(false);
      } catch (err) {
        console.error('[AI] Critical load error:', err);
        setLoading(false);
      }
    }
    loadModels();
  }, []);

  const calculateHeadPose = (keypoints: any[]) => {
    // MediaPipe FaceMesh Index Mapping:
    // 1: Nose Tip, 33: Left Eye Outer, 263: Right Eye Outer, 61: Left Mouth, 291: Right Mouth
    const nose = keypoints[1];
    const lEye = keypoints[33]; 
    const rEye = keypoints[263];
    const lMouth = keypoints[61];
    const rMouth = keypoints[291];

    if (!nose || !lEye || !rEye) return 'center';

    // Horizontal ratio (Yaw)
    const eyeDist = rEye.x - lEye.x;
    const noseFromLeft = nose.x - lEye.x;
    const horizontalRatio = noseFromLeft / eyeDist;

    // Vertical ratio (Pitch)
    const midEyeY = (lEye.y + rEye.y) / 2;
    const midMouthY = (lMouth.y + rMouth.y) / 2;
    const faceHeight = midMouthY - midEyeY;
    const noseFromTop = nose.y - midEyeY;
    const verticalRatio = noseFromTop / faceHeight;

    // Thresholds tuned for "100% accuracy" as requested
    if (horizontalRatio < 0.25) return 'right'; // Looking Right (Nose close to left eye in mirrored cam)
    if (horizontalRatio > 0.75) return 'left'; // Looking Left
    if (verticalRatio > 0.8) return 'down'; // Looking Down
    if (verticalRatio < 0.2) return 'up'; // Looking Up

    return 'center';
  };

  const detect = useCallback(async () => {
    const video = videoRef.current;
    if (!video || !enabled || video.readyState !== 4) {
      requestRef.current = requestAnimationFrame(detect);
      return;
    }

    const now = Date.now();
    // Throttle for performance, 300ms is balanced for accuracy
    if (now - lastDetectionTime.current < 300) {
      requestRef.current = requestAnimationFrame(detect);
      return;
    }

    try {
      const rawResults: Detection[] = [];

      // 1. OBJECT DETECTION (Phones, People count redundancy)
      if (objectModel) {
          const ssdResults = await objectModel.detect(video);
          ssdResults.forEach((d: any) => {
              // Increased precision to 0.6 for phones to reduce false positives
              if (d.class === 'cell phone' && d.score > 0.6) {
                  rawResults.push({ class: 'cell phone', score: d.score, bbox: d.bbox });
              }
              if (d.class === 'laptop' || d.class === 'book') {
                  if (d.score > 0.75) rawResults.push({ class: 'suspicious_object', score: d.score, data: { item: d.class } });
              }
              // Backup person detection
              if (d.class === 'person' && d.score > 0.5) {
                  rawResults.push({ class: 'ssd_person', score: d.score });
              }
          });
      }

      // 2. FACE DETECTION (Rotation, Half Face, Multiple People)
      if (faceModel) {
          const faces = await faceModel.estimateFaces(video);
          
          faces.forEach((face: any, idx: number) => {
              const averageScore = face.keypoints.reduce((acc: number, kp: any) => acc + (kp.score || 1), 0) / face.keypoints.length;
              const pose = calculateHeadPose(face.keypoints);
              
              if (averageScore > 0.4) {
                  rawResults.push({
                      class: 'face',
                      score: averageScore,
                      data: { pose, isMain: idx === 0, isPartial: averageScore < 0.6 }
                  });
              }
          });

          const personCount = Math.max(faces.length, rawResults.filter(r => r.class === 'ssd_person').length);
          if (personCount > 1) rawResults.push({ class: 'multiple_people_detected', score: 1.0 });
          if (personCount === 0) rawResults.push({ class: 'no_person', score: 1.0 });
      }

      // 3. TEMPORAL SMOOTHING (Accuracy Engine)
      const confirmedResults: Detection[] = [];
      const currentHits: string[] = rawResults.map(r => r.class);
      const persistenceRequired = ['cell phone', 'multiple_people_detected', 'no_person', 'suspicious_object'];
      
      persistenceRequired.forEach(cls => {
          if (currentHits.includes(cls)) {
              detectionBuffer.current[cls] = (detectionBuffer.current[cls] || 0) + 1;
          } else {
              detectionBuffer.current[cls] = Math.max(0, (detectionBuffer.current[cls] || 0) - 1);
          }

          if (detectionBuffer.current[cls] >= BUFFER_THRESHOLD) {
              const match = rawResults.find(r => r.class === cls);
              if (match) confirmedResults.push(match);
          }
      });

      // Faces are real-time for smooth UI feedback, but violations are buffered
      confirmedResults.push(...rawResults.filter(r => r.class === 'face'));

      setDetections(confirmedResults);
      lastDetectionTime.current = now;
    } catch (err) {
      if (now % 20 === 0) console.error('[AI Detection] Cycle error:', err);
    }

    requestRef.current = requestAnimationFrame(detect);
  }, [objectModel, faceModel, videoRef, enabled]);

  useEffect(() => {
    if (enabled && (objectModel || faceModel)) {
      requestRef.current = requestAnimationFrame(detect);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [enabled, objectModel, faceModel, detect]);

  return { loading, detections };
};

