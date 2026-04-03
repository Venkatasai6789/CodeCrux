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

export const useObjectDetection = (videoRef: React.RefObject<HTMLVideoElement>, enabled: boolean = true) => {
  const [objectModel, setObjectModel] = useState<cocoSsd.ObjectDetection | null>(null);
  const [faceModel, setFaceModel] = useState<faceLandmarksDetection.FaceLandmarksDetector | null>(null);
  const [detections, setDetections] = useState<Detection[]>([]);
  const [loading, setLoading] = useState(true);
  const requestRef = useRef<number>(undefined);
  const lastDetectionTime = useRef<number>(0);

  // Load models on mount
  useEffect(() => {
    async function loadModels() {
      try {
        console.log('Loading AI models...');
        await tf.ready();
        
        // 1. COCO-SSD for People & Objects
        const ssd = await cocoSsd.load({
            base: 'lite_mobilenet_v2'
        });
        setObjectModel(ssd);

        // 2. Face Landmarks for Rotation & Presence
        const detector = await faceLandmarksDetection.createDetector(
          faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh,
          { 
            runtime: 'tfjs', 
            refineLandmarks: true,
            maxFaces: 5 
          }
        );
        setFaceModel(detector);

        setLoading(false);
        console.log('AI Proctoring models loaded successfully.');
      } catch (err) {
        console.error('Failed to load object detection models:', err);
        setLoading(false);
      }
    }
    loadModels();
  }, []);

  const calculateHeadPose = (keypoints: any[]) => {
    // Basic heuristic for head pose based on nose vs eye positions
    // In a full FaceMesh, we have 478 points.
    // Index mapping for key points: 1 (Nose Tip), 33 (Left Eye), 263 (Right Eye)
    const nose = keypoints[1];
    const leftEye = keypoints[33]; 
    const rightEye = keypoints[263];

    if (!nose || !leftEye || !rightEye) return 'center';

    // X-axis: Nose position relative to eye centers
    const dx = (leftEye.x + rightEye.x) / 2 - nose.x;
    
    // Y-axis: Nose position relative to eyes vertically
    const dy = (leftEye.y + rightEye.y) / 2 - nose.y;

    // Thresholds for "looking away"
    // Note: These values might need tuning based on camera focal length
    let pose = 'center';
    
    if (dx > 30) pose = 'right';
    else if (dx < -30) pose = 'left';
    else if (dy > 20) pose = 'down';
    else if (dy < -25) pose = 'up';

    return pose;
  };

  const detect = useCallback(async () => {
    if (!objectModel || !faceModel || !videoRef.current || videoRef.current.readyState !== 4 || !enabled) {
      requestRef.current = requestAnimationFrame(detect);
      return;
    }

    const now = Date.now();
    // Run detection every 400ms (balanced for accuracy vs CPU)
    if (now - lastDetectionTime.current < 400) {
      requestRef.current = requestAnimationFrame(detect);
      return;
    }

    try {
      const results: Detection[] = [];
      const video = videoRef.current;

      // 1. Run Object Detection (People, Phones)
      const ssdResults = await objectModel.detect(video);
      ssdResults.forEach(d => {
        results.push({
          bbox: d.bbox as [number, number, number, number],
          class: d.class,
          score: d.score
        });
      });

      // 2. Run Face Detection (Pose, Count)
      const faces = await faceModel.estimateFaces(video);
      faces.forEach((face, idx) => {
        const pose = calculateHeadPose(face.keypoints);
        results.push({
          class: 'face',
          score: 1.0, 
          data: {
            pose,
            landmarks: face.keypoints,
            isMain: idx === 0
          }
        });
      });

      // 3. Composite Logic for "No Person" or "Multiple People"
      const personCountSSD = ssdResults.filter(r => r.class === 'person').length;
      const personCountFace = faces.length;
      
      if (personCountFace === 0 && personCountSSD === 0) {
          results.push({ class: 'no_person', score: 1.0 });
      }
      
      if (personCountFace > 1 || personCountSSD > 1) {
          results.push({ class: 'multiple_people_detected', score: 1.0 });
      }

      setDetections(results);
      lastDetectionTime.current = now;
    } catch (err) {
      console.error('Proctoring detection error:', err);
    }

    requestRef.current = requestAnimationFrame(detect);
  }, [objectModel, faceModel, videoRef, enabled]);

  useEffect(() => {
    if (enabled && objectModel && faceModel) {
      requestRef.current = requestAnimationFrame(detect);
    }
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [enabled, objectModel, faceModel, detect]);

  return { loading, detections };
};
