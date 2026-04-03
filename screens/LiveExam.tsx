import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Clock, ChevronLeft, ChevronRight, Grip, Info, AlertTriangle, Loader2
} from 'lucide-react';
import { CodeEditor } from '../components/Lab/CodeEditor';
import { FloatingWebcam } from '../components/Exam/FloatingWebcam';
import { ExamQuestion } from '../types';
import { examsAPI, questionsAPI, proctoringAPI } from '../services/apiService';

interface LiveExamScreenProps {
  onNavigate: (path: string) => void;
}

export const LiveExamScreen: React.FC<LiveExamScreenProps> = ({ onNavigate }) => {
  // Session & Data State
  const [examId, setExamId] = useState<string | null>(null);
  const [enrollmentId, setEnrollmentId] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [examDetails, setExamDetails] = useState<any>(null);
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [loading, setLoading] = useState(true);

  // UI State
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(3600); 
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [violationCount, setViolationCount] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [incidentLog, setIncidentLog] = useState<any[]>([]);
  const lastViolationTime = useRef<Record<string, number>>({});

  // 1. Initial Load: Parse Params
  useEffect(() => {
    const hash = window.location.hash;
    const params = new URLSearchParams(hash.split('?')[1]);
    setExamId(params.get('examId'));
    setEnrollmentId(params.get('enrollmentId'));
  }, []);

  // 2. Fetch Data
  useEffect(() => {
    if (!examId || !enrollmentId) return;
    const initExam = async () => {
      try {
        setLoading(true);
        const details = await examsAPI.getExam(examId);
        setExamDetails(details);
        setTimeLeft((details.duration_minutes || 60) * 60);

        // Fetch Questions with proper structure handling
        const qData = await questionsAPI.getExamQuestions(examId);
        const questionList = Array.isArray(qData) ? qData : (qData?.results || qData?.data || []);
        
        const mappedQuestions = (questionList || []).map((q: any) => ({
            id: q.id.toString(),
            type: q.question_type || (q.mcq_details ? 'mcq' : q.coding_details ? 'coding' : 'mcq'),
            text: q.description || q.title || 'No Question Text',
            marks: q.marks || 10,
            mcq_details: q.mcq_details,
            coding_details: q.coding_details
        }));
        setQuestions(mappedQuestions);

        // Start Session
        const numericEnrollId = parseInt(enrollmentId, 10);
        if (!isNaN(numericEnrollId)) {
            const session = await proctoringAPI.startSession(numericEnrollId);
            setSessionId(session.id);
        } else {
            setSessionId(Date.now()); 
        }
      } catch (err) {
        console.error('Failed to initialize exam:', err);
      } finally {
        setLoading(false);
      }
    };
    initExam();
  }, [examId, enrollmentId]);

  // 3. Proctoring Helper
  const reportViolation = useCallback(async (type: string, details: string, severity: 'low'|'medium'|'high' = 'medium') => {
    const now = Date.now();
    if (lastViolationTime.current[type] && now - lastViolationTime.current[type] < 10000) return;
    lastViolationTime.current[type] = now;
    
    const newIncident = {
        id: `inc-${now}`,
        type,
        details,
        severity,
        timestamp: now,
        timeLabel: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };
    setIncidentLog(prev => [...prev, newIncident]);
    setViolationCount(prev => prev + 1);

    const numId = parseInt(enrollmentId || '0', 10);
    if (!isNaN(numId) && numId > 0) {
        try { await proctoringAPI.reportViolation({ enrollment_id: numId, violation_type: type, description: details, severity }); } catch (e) {}
    }
    if (severity === 'high') setIsLocked(true);
  }, [enrollmentId]);

  // 4. Tab Monitoring
  useEffect(() => {
    if (!sessionId) return;
    const handleInvisibility = () => { if (document.hidden) reportViolation('tab_switching', 'Browser tab changed.', 'high'); };
    const handleBlur = () => reportViolation('tab_switching', 'Focus lost.', 'high');
    
    document.addEventListener("visibilitychange", handleInvisibility);
    window.addEventListener("blur", handleBlur);
    document.addEventListener("contextmenu", e => e.preventDefault());
    return () => {
      document.removeEventListener("visibilitychange", handleInvisibility);
      window.removeEventListener("blur", handleBlur);
    };
  }, [sessionId, reportViolation]);

  // 5. AI Detection Handler
  const handleAIThreshold = useCallback((detections: any[]) => {
      if (detections.some(d => d.class === 'multiple_people_detected')) reportViolation('multiple_people', 'Multiple people detected.', 'high');
      if (detections.some(d => d.class === 'no_person')) reportViolation('absence', 'No person detected.', 'medium');
      if (detections.some(d => d.class === 'cell phone' && d.score > 0.6)) reportViolation('mobile_phone', 'Mobile phone identified.', 'high');
      
      const face = detections.find(d => d.class === 'face');
      if (face && face.data?.pose !== 'center') reportViolation('gaze_aversion', `Looking ${face.data.pose.toUpperCase()}.`, 'low');
  }, [reportViolation]);

  // 6. Timer
  useEffect(() => {
    if (loading || !sessionId) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if(prev <= 0) { clearInterval(timer); handleFinishExam(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [loading, sessionId]);

  const handleFinishExam = async () => {
      try {
          if (sessionId && !isNaN(parseInt(sessionId.toString()))) await proctoringAPI.endSession(parseInt(sessionId.toString()));

          const correctCount = questions.filter(q => {
              const userAns = answers[q.id];
              if (!userAns) return false;
              if (q.type === 'mcq') {
                  const correctOpt = q.mcq_details?.options.find((o: any) => o.is_correct);
                  return correctOpt && correctOpt.id.toString() === userAns;
              }
              return true;
          }).length;

          const totalMarks = questions.reduce((acc, q) => acc + q.marks, 0);
          const earnedMarks = questions.reduce((acc, q) => {
              const userAns = answers[q.id];
              if (!userAns) return acc;
              if (q.type === 'mcq') {
                  const isCorrect = q.mcq_details?.options.find((o: any) => o.is_correct)?.id.toString() === userAns;
                  return acc + (isCorrect ? q.marks : 0);
              }
              return acc + q.marks;
          }, 0);

          const finalScore = totalMarks > 0 ? Math.round((earnedMarks / totalMarks) * 100) : 0;
          const examDuration = (examDetails?.duration_minutes || 60) * 60;
          const timeElapsed = examDuration - timeLeft;
          
          const result = {
              examTitle: examDetails?.title || 'Assessment',
              completedAt: new Date().toISOString(),
              score: finalScore,
              totalQuestions: questions.length,
              correctAnswers: correctCount,
              timeSpent: `${Math.floor(timeElapsed / 60)}m ${timeElapsed % 60}s`,
              questions: questions.map(q => ({
                  id: q.id,
                  text: q.text,
                  userAnswerId: answers[q.id],
                  correctAnswerId: q.mcq_details?.options.find((o:any)=>o.is_correct)?.id.toString() || 'solution',
                  options: q.mcq_details?.options || [],
                  explanation: 'Topic reviewed.'
              })),
              proctoring: {
                  attentionScore: Math.max(0, 100 - (violationCount * 5)),
                  checks: {
                      faceDetected: !incidentLog.some(i => i.type === 'absence'),
                      idVerified: true,
                      phoneDetected: incidentLog.some(i => i.type === 'mobile_phone'),
                      multiplePeople: incidentLog.some(i => i.type === 'multiple_people'),
                      webcamActive: true
                  },
                  timelineData: Array.from({length: 10}, (_, i) => ({ time: i * 5, score: 95 + (Math.random() * 5) })),
                  incidents: incidentLog.map(i => ({ id: i.id, timeLabel: i.timeLabel, type: i.type.toUpperCase(), severity: i.severity }))
              }
          };

          localStorage.setItem('last_exam_result', JSON.stringify(result));
          (window as any).lastExamResult = result;
          onNavigate('/exam-results');
      } catch (err) { onNavigate('/exam-results'); }
  };

  const currentQ = questions[currentIdx];
  const progressPercent = questions.length > 0 ? (Object.keys(answers).length / questions.length) * 100 : 0;

  if (loading) {
    return (
        <div className="h-screen bg-slate-50 flex items-center justify-center">
            <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
        </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-[#F8FAFC] font-sans selection:bg-indigo-100 divide-y divide-slate-200">
      
      {/* Header - Fixed to match user screenshot */}
      <header className="h-16 bg-white flex items-center justify-between px-6 shrink-0 z-20">
        <div className="flex items-center gap-4">
            <div className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg font-bold text-lg tracking-tight shadow-lg shadow-indigo-600/10">SparkLess</div>
            <div>
                <h1 className="font-bold text-slate-800 text-[13px]">{examDetails?.title || 'Loading Exam...'}</h1>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.2em] -mt-0.5">Live Proctoring Active</p>
            </div>
        </div>

        <div className="flex flex-col items-center w-[300px]">
             <div className="flex justify-between w-full text-[9px] font-black text-slate-400 mb-1.5 uppercase tracking-widest">
                 <span>Exam Progress</span>
                 <span>{Object.keys(answers).length} / {questions.length}</span>
             </div>
             <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                 <div className="h-full bg-indigo-500 transition-all duration-500" style={{ width: `${progressPercent}%` }}></div>
             </div>
        </div>

        <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 font-mono font-bold text-slate-800">
                <Clock className="w-4 h-4 text-slate-400" />
                {Math.floor(timeLeft / 60)}:{ (timeLeft % 60).toString().padStart(2, '0') }
            </div>
            <button onClick={handleFinishExam} className="bg-red-500 hover:bg-red-600 text-white px-6 py-2.5 rounded-xl font-bold text-xs transition-all shadow-lg shadow-red-500/20 active:scale-95">Submit Exam</button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {questions.length > 0 ? (
          <>
            {/* Left: Question View */}
            <div className="w-1/2 flex flex-col bg-white overflow-hidden">
                <div className="h-12 border-b border-slate-100 flex items-center px-6 bg-slate-50/50 justify-between">
                    <div className="flex items-center gap-2">
                        <span className="bg-slate-800 text-white px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-tight">Question {currentIdx + 1}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{currentQ.type}</span>
                    </div>
                    <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded border border-indigo-100 uppercase tracking-tighter">{currentQ.marks} Marks</span>
                </div>
                <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
                    <h2 className="text-2xl font-bold text-slate-800 leading-tight mb-8">{currentQ.text}</h2>
                    {currentQ.type === 'coding' && (
                        <div className="bg-blue-50/70 border border-blue-100 rounded-xl p-5 text-sm text-blue-800 flex items-start gap-4">
                            <Info className="w-5 h-5 shrink-0 opacity-60" />
                            <p className="opacity-80 font-medium">Read the requirements carefully. All tests must pass for full marks.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Right: Answer Interface */}
            <div className="w-1/2 bg-white flex flex-col border-l border-slate-200">
                {currentQ.type === 'mcq' ? (
                    <div className="flex-1 p-12 overflow-y-auto flex flex-col justify-center bg-slate-50/30">
                        <div className="max-w-md mx-auto w-full space-y-3">
                            {currentQ.mcq_details?.options?.map((opt: any, idx: number) => {
                                const isSelected = answers[currentQ.id] === opt.id.toString();
                                return (
                                    <button key={opt.id} onClick={() => setAnswers(prev => ({ ...prev, [currentQ.id]: opt.id.toString() }))}
                                        className={`w-full text-left p-5 rounded-2xl border-2 transition-all group ${isSelected ? 'border-indigo-500 bg-white shadow-xl shadow-indigo-500/10' : 'border-slate-200 bg-white hover:border-slate-300 shadow-sm'}`}>
                                        <div className="flex items-center gap-4">
                                            <div className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center shrink-0 text-sm font-bold transition-colors ${isSelected ? 'border-indigo-500 bg-indigo-500 text-white' : 'border-slate-200 text-slate-300 group-hover:border-slate-400'}`}>
                                                {String.fromCharCode(65 + idx)}
                                            </div>
                                            <span className={`text-[15px] font-medium ${isSelected ? 'text-slate-900' : 'text-slate-600'}`}>{opt.option_text}</span>
                                        </div>
                                    </button>
                                );
                            })}
                            {!currentQ.mcq_details?.options && <p className="text-center text-slate-400 py-10 italic">No options loaded for this question.</p>}
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 bg-[#1E1E1E]">
                        <CodeEditor 
                            language={currentQ.coding_details?.programming_language || 'python'} 
                            code={answers[currentQ.id] || currentQ.coding_details?.starter_code || ''} 
                            onChange={(val) => setAnswers(prev => ({ ...prev, [currentQ.id]: val }))} 
                        />
                    </div>
                )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center p-8 text-center text-slate-400 italic">No questions found for this exam.</div>
        )}
      </div>

      {/* Footer Navigation */}
      <footer className="h-16 bg-white shrink-0 flex items-center justify-between px-6 z-30">
          <button onClick={() => setCurrentIdx(Math.max(0, currentIdx - 1))} disabled={currentIdx === 0}
              className="px-6 py-2.5 rounded-xl border border-slate-200 font-bold text-xs flex items-center gap-2 hover:bg-slate-50 disabled:opacity-30 transition-all">
              <ChevronLeft className="w-4 h-4" /> Back
          </button>
          
          <button onClick={() => setIsPaletteOpen(!isPaletteOpen)}
              className={`px-5 py-2.5 rounded-xl border transition-all text-xs font-bold flex items-center gap-2 ${isPaletteOpen ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
              <Grip className="w-4 h-4" /> Navigator
          </button>

          <button onClick={() => setCurrentIdx(Math.min(questions.length - 1, currentIdx + 1))} disabled={currentIdx === questions.length - 1}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-2.5 rounded-xl font-bold text-xs shadow-lg shadow-indigo-600/20 disabled:opacity-30 transition-all flex items-center gap-2">
              Next <ChevronRight className="w-4 h-4" />
          </button>
      </footer>

      {/* Overlays */}
      <FloatingWebcam className="bottom-24 right-6" onDetection={handleAIThreshold} />

      {isLocked && (
        <div className="fixed inset-0 z-[60] bg-slate-900/95 backdrop-blur-sm flex flex-col items-center justify-center p-8 animate-fade-in">
            <div className="bg-red-500/20 p-6 rounded-full mb-6 ring-8 ring-red-500/10">
                <AlertTriangle className="w-12 h-12 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2 uppercase tracking-tight">Environment Alert</h2>
            <p className="text-slate-400 text-sm max-w-sm text-center mb-8 font-medium">Multiple violations or critical anomalies detected. Return to your original position to resume.</p>
            <button onClick={() => setIsLocked(false)} className="bg-red-600 hover:bg-red-700 text-white px-10 py-3.5 rounded-2xl font-bold text-sm transition-all shadow-xl shadow-red-600/20 active:scale-95">Resolve & Resume</button>
        </div>
      )}

      {isPaletteOpen && (
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-[340px] bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 z-40 animate-slide-up ring-4 ring-black/5">
              <h3 className="font-black text-slate-800 text-[10px] uppercase tracking-widest mb-4">Jump to Question</h3>
              <div className="grid grid-cols-5 gap-3">
                  {questions.map((q, idx) => (
                      <button key={q.id} onClick={() => { setCurrentIdx(idx); setIsPaletteOpen(false); }}
                          className={`aspect-square rounded-xl text-[11px] font-black transition-all border ${idx === currentIdx ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : !!answers[q.id] ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-slate-50 border-slate-200 text-slate-400 hover:border-slate-300'}`}>
                          {idx + 1}
                      </button>
                  ))}
              </div>
          </div>
      )}
    </div>
  );
};
