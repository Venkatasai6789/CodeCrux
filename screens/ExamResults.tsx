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

        <div className="flex flex-col gap-8">
            {/* Top Stats Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Score Section */}
                <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm p-8 lg:p-10">
                    <div className="flex flex-col md:flex-row items-center gap-12 h-full">
                        <ResultsScoreRing score={result.score || 0} status={result.score >= 40 ? 'passed' : 'failed'} />
                        
                        <div className="flex-1 flex flex-col gap-5 w-full mt-6 md:mt-0">
                            <StatBox 
                                icon={CheckCircle} 
                                color="text-emerald-500" 
                                value={`${result.correctAnswers || 0}/${result.totalQuestions || 0}`} 
                                label="Questions Correct" 
                            />
                            <StatBox 
                                icon={Clock} 
                                color="text-indigo-500" 
                                value={result.timeSpent || 'N/A'} 
                                label="Total Time Taken" 
                            />
                        </div>
                    </div>
                </div>

                {/* Certificate Section */}
                <div className="bg-indigo-900 text-white p-8 rounded-3xl shadow-xl relative overflow-hidden group flex flex-col justify-between min-h-[250px]">
                    <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform duration-700">
                        <BarChart className="w-24 h-24" />
                    </div>
                    <div className="relative z-10">
                        <h4 className="text-xl font-black mb-3">Certificate of Integrity</h4>
                        <p className="text-xs text-indigo-200 leading-relaxed font-medium max-w-[200px]">
                            This exam was completed under secure proctoring conditions. Your verified digital certificate is now available.
                        </p>
                    </div>
                    <button className="w-full bg-white text-indigo-900 py-3.5 rounded-2xl font-black text-[11px] uppercase tracking-widest mt-6 hover:bg-slate-50 transition-colors shadow-lg flex items-center justify-center gap-2 relative z-10 hover:scale-[1.02] active:scale-95 duration-200">
                        <Download className="w-4 h-4" /> Download Certificate
                    </button>
                </div>
            </div>

            {/* AI Proctoring Details - FULL WIDTH to resolve overlaps */}
            <div className="w-full">
                <ProctoringReport session={result.proctoring} />
            </div>

            {/* Detailed Question Review */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                     <h3 className="text-lg font-black text-slate-800 tracking-tight">Question Breakdown</h3>
                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-white px-3 py-1.5 rounded-xl border border-slate-100 shadow-sm">Review your performance</span>
                </div>
                <div className="p-4 sm:p-6 bg-slate-50">
                    <QuestionReviewAccordion questions={result.questions || []} />
                </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-center mt-4">
                <button 
                  onClick={() => onNavigate('/dashboard')}
                  className="bg-white border-2 border-slate-200 text-slate-600 px-10 py-4 rounded-[2rem] font-black text-[11px] uppercase tracking-widest hover:border-indigo-200 hover:text-indigo-600 hover:bg-indigo-50 hover:shadow-lg hover:shadow-indigo-50/50 transition-all duration-300 flex items-center justify-center gap-2"
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
    <div className="flex items-center gap-4 p-4 lg:p-5 rounded-3xl bg-slate-50/80 border border-slate-100 w-full transition-all duration-300 hover:shadow-md hover:border-slate-200">
        <div className={`p-3 lg:p-4 rounded-2xl bg-white shadow-sm ring-1 ring-slate-100 flex items-center justify-center shrink-0 ${color}`}>
            <Icon className="w-5 h-5 lg:w-6 lg:h-6" />
        </div>
        <div className="flex-1 min-w-0">
            <p className="text-xl lg:text-[22px] font-black text-slate-800 leading-none mb-1.5 tracking-tight truncate">{value}</p>
            <p className="text-[9px] lg:text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">{label}</p>
        </div>
    </div>
);
