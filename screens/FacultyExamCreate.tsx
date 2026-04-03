
import React, { useState } from 'react';
import { DashboardLayout } from '../components/Layout/DashboardLayout';
import { User, ExamQuestion } from '../types';
import { useAuth } from '../services/authContext';
import { Input } from '../components/ui/Input';
import { Toggle } from '../components/ui/Toggle';
import { Button } from '../components/ui/Button';
import { 
  ChevronRight, ChevronLeft, Check, Plus, Trash2, GripVertical, 
  Youtube, Calendar, Clock, Eye, Sparkles, Save, FileText,
  Code, Type, List, Wand2, Loader2, ArrowRight, ChevronDown, X
} from 'lucide-react';

interface FacultyExamCreateProps {
  onNavigate: (path: string) => void;
}

// --- Internal Types ---
type Step = 'details' | 'source' | 'editor' | 'settings';

export const FacultyExamCreateScreen: React.FC<FacultyExamCreateProps> = ({ onNavigate }) => {
  const { user: authUser } = useAuth();
  const facultyUser: User = { id: String(authUser?.id || ''), name: authUser ? `${authUser.first_name} ${authUser.last_name}`.trim() || authUser.username : 'Faculty', email: authUser?.email || '', role: 'faculty' };
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [generationStage, setGenerationStage] = useState('');

  // --- Form State ---
  const [details, setDetails] = useState({
    title: '',
    course: '',
    duration: 60,
    startDate: '',
  });

  const [aiConfig, setAiConfig] = useState({
    sourceType: 'manual', // 'manual' | 'youtube'
    youtubeUrl: '',
    difficulty: 'Intermediate',
    questionCount: 5,
    includeCoding: true
  });

  // Default Questions (will be overwritten by AI)
  const [questions, setQuestions] = useState<ExamQuestion[]>([
    { 
      id: 'q1', 
      type: 'mcq', 
      text: 'Sample Question', 
      points: 5, 
      options: [{ id: 'o1', text: 'Option A', isCorrect: false }, { id: 'o2', text: 'Option B', isCorrect: true }] 
    }
  ]);

  // --- Handlers ---

  const handleNext = () => {
    if (currentStep < 4) setCurrentStep(c => c + 1);
  };

  const handlePrev = () => {
    if (currentStep > 1) setCurrentStep(c => c - 1);
  };

  // Simulated AI Generation Logic
  const handleGenerateContent = () => {
    if (!aiConfig.youtubeUrl) return;
    
    setIsProcessingAI(true);
    setGenerationStage('Analyzing video transcript...');
    
    // Sequence of fake loading states
    setTimeout(() => setGenerationStage('Extracting key concepts...'), 1500);
    setTimeout(() => setGenerationStage('Generating coding challenges...'), 3000);
    setTimeout(() => setGenerationStage('Creating test cases...'), 4500);
    
    setTimeout(() => {
        // Mock Generated Content
        const generatedQuestions: ExamQuestion[] = [
            {
                id: 'gen_1',
                type: 'mcq',
                text: 'Based on the video, what is the primary advantage of using a Virtual DOM in React?',
                points: 5,
                options: [
                    { id: 'g1_a', text: 'It directly modifies the browser DOM for faster updates.', isCorrect: false },
                    { id: 'g1_b', text: 'It minimizes direct DOM manipulation by batching updates.', isCorrect: true },
                    { id: 'g1_c', text: 'It replaces the need for JavaScript in the browser.', isCorrect: false }
                ]
            },
            {
                id: 'gen_2',
                type: 'coding',
                text: 'Implement the debounce function discussed in the video.',
                points: 15,
                language: 'javascript',
                starterCode: 'function debounce(func, wait) {\n  // Your implementation here\n}',
                constraints: 'Time Limit: 500ms',
                testCases: [
                    { id: 'tc1', input: 'call twice in 100ms', output: '1 call', isHidden: false },
                    { id: 'tc2', input: 'call once', output: '1 call', isHidden: true }
                ]
            },
            {
                id: 'gen_3',
                type: 'short_answer',
                text: 'Explain the "stale closure" problem mentioned at 12:45.',
                points: 10,
            }
        ];
        
        setQuestions(generatedQuestions);
        setIsProcessingAI(false);
        handleNext(); // Move to editor
    }, 6000);
  };

  // --- Render Steps ---

  const renderStepper = () => (
    <div className="flex items-center justify-between max-w-2xl mx-auto mb-10 relative">
      <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-200 -z-10"></div>
      <div 
        className="absolute top-1/2 left-0 h-0.5 bg-indigo-600 -z-10 transition-all duration-500 ease-out"
        style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
      ></div>

      {[1, 2, 3, 4].map((step) => {
        const labels = ['Details', 'Content Source', 'Editor', 'Settings'];
        return (
            <div key={step} className="flex flex-col items-center gap-2 bg-[#F8FAFC] px-2">
            <div 
                className={`
                w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-300
                ${step < currentStep ? 'bg-indigo-600 border-indigo-600 text-white' : 
                    step === currentStep ? 'bg-white border-indigo-600 text-indigo-600 shadow-[0_0_0_4px_rgba(79,70,229,0.2)] scale-110' : 
                    'bg-white border-slate-300 text-slate-400'}
                `}
            >
                {step < currentStep ? <Check className="w-4 h-4" /> : step}
            </div>
            <span className={`text-[10px] font-bold uppercase tracking-wider ${step <= currentStep ? 'text-indigo-600' : 'text-slate-400'}`}>
                {labels[step-1]}
            </span>
            </div>
        );
      })}
    </div>
  );

  return (
    <DashboardLayout currentUser={facultyUser} onNavigate={onNavigate} currentPath="/faculty-exams">
      <div className="max-w-5xl mx-auto pb-24 animate-slide-up relative">
        
        {/* Header */}
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-6 cursor-pointer hover:text-indigo-600 w-fit" onClick={() => onNavigate('/faculty-exams')}>
            <ChevronLeft className="w-3 h-3" /> Back to Exams
        </div>
        
        <h1 className="text-3xl font-bold text-slate-900 text-center mb-8">Smart Exam Creator</h1>
        
        {renderStepper()}

        <div className="min-h-[400px]">
            {/* STEP 1: DETAILS */}
            {currentStep === 1 && (
                <div className="max-w-xl mx-auto bg-white p-8 rounded-2xl border border-slate-200 shadow-sm animate-fade-in">
                    <h2 className="text-xl font-bold text-slate-900 mb-6">Exam Details</h2>
                    <div className="space-y-6">
                        <Input 
                            label="Exam Title" 
                            placeholder="e.g. Advanced Algorithms Final"
                            value={details.title}
                            onChange={(e) => setDetails({...details, title: e.target.value})}
                        />
                        <div>
                            <label className="block text-xs font-medium text-slate-900 mb-1.5">Course</label>
                            <select 
                                className="w-full h-12 px-3 bg-white border border-slate-200 border-b-2 rounded-none text-slate-900 focus:outline-none focus:border-indigo-600"
                                value={details.course}
                                onChange={(e) => setDetails({...details, course: e.target.value})}
                            >
                                <option value="">Select a course...</option>
                                <option value="cs101">CS101: Intro to Programming</option>
                                <option value="cs302">CS302: Algorithms</option>
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-900 mb-1.5">Date</label>
                                <input type="date" className="w-full h-12 bg-transparent border-b border-slate-200 focus:border-indigo-600 outline-none" />
                            </div>
                            <Input 
                                label="Duration (Minutes)" 
                                type="number" 
                                value={details.duration} 
                                onChange={(e) => setDetails({...details, duration: parseInt(e.target.value)})} 
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* STEP 2: CONTENT SOURCE (AI) */}
            {currentStep === 2 && (
                <div className="max-w-4xl mx-auto animate-fade-in">
                    <h2 className="text-xl font-bold text-slate-900 mb-6 text-center">How would you like to create this exam?</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        {/* Manual Card */}
                        <div 
                            onClick={() => setAiConfig({...aiConfig, sourceType: 'manual'})}
                            className={`p-6 rounded-2xl border-2 cursor-pointer transition-all hover:shadow-lg ${aiConfig.sourceType === 'manual' ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-200 bg-white hover:border-slate-300'}`}
                        >
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${aiConfig.sourceType === 'manual' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                <FileText className="w-6 h-6" />
                            </div>
                            <h3 className="font-bold text-lg text-slate-900">Start from Scratch</h3>
                            <p className="text-sm text-slate-500 mt-2">Manually add questions one by one. Best for specific, custom assessments.</p>
                        </div>

                        {/* AI Card */}
                        <div 
                            onClick={() => setAiConfig({...aiConfig, sourceType: 'youtube'})}
                            className={`p-6 rounded-2xl border-2 cursor-pointer transition-all hover:shadow-lg relative overflow-hidden ${aiConfig.sourceType === 'youtube' ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-200 bg-white hover:border-slate-300'}`}
                        >
                            {aiConfig.sourceType === 'youtube' && <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl">SELECTED</div>}
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${aiConfig.sourceType === 'youtube' ? 'bg-red-600 text-white' : 'bg-red-50 text-red-500'}`}>
                                <Youtube className="w-6 h-6" />
                            </div>
                            <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                                AI Video Generator <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500 animate-pulse" />
                            </h3>
                            <p className="text-sm text-slate-500 mt-2">Paste a YouTube URL. Our AI analyzes the transcript to generate relevant questions and code challenges.</p>
                        </div>
                    </div>

                    {/* AI Configuration Panel */}
                    {aiConfig.sourceType === 'youtube' && (
                        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm animate-slide-up">
                            {isProcessingAI ? (
                                <div className="flex flex-col items-center justify-center py-12">
                                    <div className="relative">
                                        <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <Wand2 className="w-6 h-6 text-indigo-600" />
                                        </div>
                                    </div>
                                    <h3 className="mt-6 text-lg font-bold text-slate-900">Generating Exam Content</h3>
                                    <p className="text-slate-500 text-sm mt-2 animate-pulse">{generationStage}</p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <Input 
                                        label="YouTube Video URL" 
                                        placeholder="https://www.youtube.com/watch?v=..." 
                                        value={aiConfig.youtubeUrl}
                                        onChange={(e) => setAiConfig({...aiConfig, youtubeUrl: e.target.value})}
                                        leftIcon={<Youtube className="w-5 h-5 text-red-500" />}
                                    />
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-900 mb-2 uppercase tracking-wide">Difficulty</label>
                                            <div className="flex items-center gap-4 bg-slate-50 p-1 rounded-lg border border-slate-200">
                                                {['Easy', 'Intermediate', 'Hard'].map(level => (
                                                    <button 
                                                        key={level}
                                                        onClick={() => setAiConfig({...aiConfig, difficulty: level})}
                                                        className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${aiConfig.difficulty === level ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                                    >
                                                        {level}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-900 mb-2 uppercase tracking-wide">Question Count: {aiConfig.questionCount}</label>
                                            <input 
                                                type="range" min="3" max="20" 
                                                value={aiConfig.questionCount}
                                                onChange={(e) => setAiConfig({...aiConfig, questionCount: parseInt(e.target.value)})}
                                                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <input 
                                            type="checkbox" 
                                            id="coding" 
                                            checked={aiConfig.includeCoding}
                                            onChange={(e) => setAiConfig({...aiConfig, includeCoding: e.target.checked})}
                                            className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                                        />
                                        <label htmlFor="coding" className="text-sm text-slate-700 font-medium">Include Coding Challenges (if applicable)</label>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* STEP 3: EDITOR */}
            {currentStep === 3 && (
                <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold text-slate-900">Review Questions</h2>
                        <button className="text-sm font-bold text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-2">
                            <Plus className="w-4 h-4" /> Add Manual Question
                        </button>
                    </div>

                    {questions.map((q, idx) => (
                        <QuestionEditorCard key={q.id} question={q} index={idx} onDelete={() => {}} />
                    ))}
                </div>
            )}

            {/* STEP 4: SETTINGS (Placeholder) */}
            {currentStep === 4 && (
                <div className="max-w-xl mx-auto bg-white p-8 rounded-2xl border border-slate-200 text-center animate-fade-in">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Check className="w-8 h-8 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Ready to Publish!</h2>
                    <p className="text-slate-500 mb-8">Review your exam settings or publish immediately.</p>
                    <div className="bg-slate-50 rounded-xl p-4 text-left text-sm text-slate-600 space-y-2 mb-8">
                        <p><span className="font-bold">Title:</span> {details.title}</p>
                        <p><span className="font-bold">Questions:</span> {questions.length}</p>
                        <p><span className="font-bold">Duration:</span> {details.duration} mins</p>
                    </div>
                </div>
            )}
        </div>

        {/* Footer Actions */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 md:pl-64 z-30 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
            <div className="max-w-5xl mx-auto flex justify-between items-center">
                <Button 
                    variant="secondary" 
                    onClick={handlePrev} 
                    disabled={currentStep === 1 || isProcessingAI}
                    className="w-auto px-6 border-slate-300 text-slate-600 hover:bg-slate-50"
                >
                    <ChevronLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                
                {currentStep === 4 ? (
                    <Button onClick={() => onNavigate('/faculty-exams')} className="w-auto px-8 bg-green-600 hover:bg-green-700 shadow-green-500/30">
                        Publish Exam
                    </Button>
                ) : (
                    currentStep === 2 && aiConfig.sourceType === 'youtube' ? (
                        <Button 
                            onClick={handleGenerateContent} 
                            isLoading={isProcessingAI}
                            disabled={!aiConfig.youtubeUrl}
                            className="w-auto px-8 bg-indigo-600"
                        >
                            Analyze & Generate <Wand2 className="w-4 h-4 ml-2" />
                        </Button>
                    ) : (
                        <Button onClick={handleNext} className="w-auto px-8">
                            Next Step <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    )
                )}
            </div>
        </div>

      </div>
    </DashboardLayout>
  );
};

// --- Sub-Component: Question Editor Card ---
const QuestionEditorCard: React.FC<{ question: ExamQuestion, index: number, onDelete: () => void }> = ({ question, index, onDelete }) => {
    const [isExpanded, setIsExpanded] = useState(true);

    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden group hover:border-indigo-300 transition-all">
            {/* Card Header */}
            <div className="bg-slate-50 px-4 py-3 flex items-center justify-between border-b border-slate-200">
                <div className="flex items-center gap-3">
                    <span className="bg-white border border-slate-200 text-slate-500 font-mono font-bold text-xs px-2 py-1 rounded">Q{index + 1}</span>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${question.type === 'coding' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-200 text-slate-600'}`}>
                        {question.type}
                    </span>
                    <span className="text-xs font-bold text-slate-400">{question.points} pts</span>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => setIsExpanded(!isExpanded)} className="p-1.5 hover:bg-white rounded text-slate-400 hover:text-slate-700"><ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} /></button>
                    <button onClick={onDelete} className="p-1.5 hover:bg-red-50 rounded text-slate-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                </div>
            </div>

            {/* Expanded Editor */}
            {isExpanded && (
                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Problem Statement</label>
                        <textarea 
                            className="w-full p-3 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 min-h-[80px]"
                            defaultValue={question.text}
                        />
                    </div>

                    {/* Coding Specifics */}
                    {question.type === 'coding' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Starter Code</label>
                                <textarea 
                                    className="w-full p-3 bg-[#1e293b] text-indigo-100 font-mono text-xs rounded-lg min-h-[150px] border border-slate-700 focus:outline-none focus:border-indigo-500"
                                    defaultValue={question.starterCode}
                                />
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Constraints</label>
                                    <Input defaultValue={question.constraints} className="text-sm" />
                                </div>
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="block text-xs font-bold text-slate-700 uppercase">Test Cases</label>
                                        <button className="text-[10px] font-bold text-indigo-600 hover:underline">+ Add Case</button>
                                    </div>
                                    <div className="space-y-2">
                                        {question.testCases?.map((tc, i) => (
                                            <div key={i} className="flex gap-2 items-center bg-slate-50 p-2 rounded border border-slate-200">
                                                <div className="flex-1">
                                                    <span className="text-[10px] text-slate-400 block">Input</span>
                                                    <input className="w-full bg-transparent text-xs font-mono font-medium outline-none" defaultValue={tc.input} />
                                                </div>
                                                <div className="w-px h-6 bg-slate-200"></div>
                                                <div className="flex-1">
                                                    <span className="text-[10px] text-slate-400 block">Expected</span>
                                                    <input className="w-full bg-transparent text-xs font-mono font-medium text-emerald-600 outline-none" defaultValue={tc.output} />
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    {tc.isHidden && <Eye className="w-3 h-3 text-slate-400" />}
                                                    <button className="text-slate-300 hover:text-red-500"><X className="w-3 h-3" /></button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* MCQ Specifics */}
                    {question.type === 'mcq' && (
                        <div className="space-y-2">
                            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Options</label>
                            {question.options?.map((opt, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center cursor-pointer ${opt.isCorrect ? 'bg-green-500 border-green-500' : 'bg-white border-slate-300'}`}>
                                        {opt.isCorrect && <Check className="w-3 h-3 text-white" />}
                                    </div>
                                    <input className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded text-sm focus:border-indigo-500 outline-none" defaultValue={opt.text} />
                                    <button className="text-slate-300 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                                </div>
                            ))}
                            <button className="text-xs font-bold text-indigo-600 hover:underline mt-1">+ Add Option</button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}