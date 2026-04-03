import React, { useEffect, useState } from 'react';
import { ResultsScoreRing } from '../components/Exam/ResultsScoreRing';
import { ProctoringReport } from '../components/Exam/ProctoringReport';
import { QuestionReviewAccordion } from '../components/Exam/QuestionReviewAccordion';
import { Download, ArrowRight, CheckCircle, Clock, BarChart, Loader2 } from 'lucide-react';

interface ExamResultsProps {
  onNavigate: (path: string) => void;
}

export const ExamResultsScreen: React.FC<ExamResultsProps> = ({ onNavigate }) => {
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    // Try to get result from global state or localStorage
    const savedResult = (window as any).lastExamResult || JSON.parse(localStorage.getItem('last_exam_result') || 'null');
    
    if (savedResult) {
      setResult(savedResult);
    } else {
      // Fallback to minimal mock if nothing found (should not happen in real flow)
      setResult({
        examTitle: 'Assessment Completed',
        completedAt: new Date().toISOString(),
        score: 0,
        totalQuestions: 0,
        correctAnswers: 0,
        timeSpent: 'N/A',
        difficulty: 'Stable',
        status: 'completed',
        questions: [],
        proctoring: {
          attentionScore: 100,
          checks: { faceDetected: true, idVerified: true },
          timelineData: [],
          incidents: []
        }
      });
    }
  }, []);

  if (!result) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-white">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
        <h2 className="text-xl font-bold text-slate-800">Generating Report...</h2>
      </div>
    );
  }

  const completedDate = new Date(result.completedAt);

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto animate-slide-up">
        
        {/* Header */}
        <div className="mb-8">
            <h1 className="text-[28px] font-bold text-slate-900 mb-1">Exam Summary</h1>
            <p className="text-[12px] text-slate-500">
                Course: <span className="text-indigo-600 font-bold">{result.examTitle}</span> • Completed on {completedDate.toLocaleDateString()} at {completedDate.toLocaleTimeString()}
            </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Main Score */}
            <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
                    <div className="flex flex-col md:flex-row items-center gap-12">
                        <ResultsScoreRing score={result.score} status={result.score >= 40 ? 'passed' : 'failed'} />
                        
                        <div className="flex-1 grid grid-cols-1 gap-6 w-full">
                            <StatBox 
                                icon={CheckCircle} 
                                color="text-emerald-500" 
                                value={`${result.correctAnswers}/${result.totalQuestions}`} 
                                label="Questions Correct" 
                            />
                            <StatBox 
                                icon={Clock} 
                                color="text-indigo-500" 
                                value={result.timeSpent} 
                                label="Total Time Taken" 
                            />
                        </div>
                    </div>
                </div>

                {/* Review Section */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                         <h3 className="font-bold text-slate-800 text-sm italic">Question Breakdown</h3>
                         <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Review your performance</span>
                    </div>
                    <QuestionReviewAccordion questions={result.questions} />
                </div>
            </div>

            {/* Right: Proctoring Insights */}
            <div className="space-y-6">
                <ProctoringReport session={result.proctoring} />
                
                <div className="bg-indigo-900 text-white p-6 rounded-2xl shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                        <BarChart className="w-16 h-16" />
                    </div>
                    <h4 className="font-bold mb-2">Certificate of Integrity</h4>
                    <p className="text-[11px] text-indigo-200 leading-relaxed mb-4">
                        This exam was completed under secure proctoring conditions. A digital certificate is now available for download.
                    </p>
                    <button className="w-full bg-white text-indigo-900 py-2.5 rounded-xl font-bold text-xs hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2">
                        <Download className="w-4 h-4" /> Download Certificate
                    </button>
                </div>

                <button 
                  onClick={() => onNavigate('/dashboard')}
                  className="w-full bg-white border border-slate-200 text-slate-600 py-4 rounded-2xl font-bold text-sm hover:bg-slate-50 transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                    Return to Dashboard <ArrowRight className="w-4 h-4" />
                </button>
            </div>
        </div>

      </div>
    </div>
  );
};

const StatBox = ({ icon: Icon, color, value, label }: { icon: any, color: string, value: string, label: string }) => (
    <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50/50 border border-slate-100">
        <div className={`p-3 rounded-xl bg-white shadow-sm ${color}`}>
            <Icon className="w-5 h-5" />
        </div>
        <div>
            <p className="text-[18px] font-bold text-slate-800 leading-none mb-1">{value}</p>
            <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">{label}</p>
        </div>
    </div>
);
