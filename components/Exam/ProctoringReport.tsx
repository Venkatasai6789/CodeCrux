import React, { useState } from 'react';
import { ProctoringSession } from '../../types';
import { CheckCircle2, AlertTriangle, Eye, ShieldCheck, Smartphone, Users, Video, Monitor, X, Maximize2 } from 'lucide-react';

interface ProctoringReportProps {
  session: ProctoringSession;
}

export const ProctoringReport: React.FC<ProctoringReportProps> = ({ session }) => {
  const { attentionScore, checks, timelineData, incidents } = session;
  const [selectedSnapshot, setSelectedSnapshot] = useState<string | null>(null);

  // Chart Dimensions
  const chartHeight = 200;
  const chartWidth = 800; 
  const padding = 20;

  // X-Axis range calculation
  const times = timelineData.map(d => d.time);
  const maxTime = Math.max(...times, 5) || 5;
  const minTime = Math.min(...times, 0);
  const timeRange = maxTime - minTime || 1;

  // Generate dynamic labels (0%, 25%, 50%, 75%, 100% of duration)
  const labels = [0, 0.25, 0.5, 0.75, 1].map(p => {
      const minutes = Math.floor((minTime + (p * timeRange)) / 60);
      return `${minutes}m`;
  });

  const generatePath = () => {
    if (timelineData.length === 0) return '';
    const points = timelineData.map(d => {
      const x = ((d.time - minTime) / timeRange) * (chartWidth - padding * 2) + padding;
      const y = chartHeight - (d.score / 100) * (chartHeight - padding * 2) - padding;
      return `${x},${y}`;
    }).join(' ');
    return `M ${points}`;
  };

  const getXForTime = (time: number) => {
    return ((time - minTime) / timeRange) * (chartWidth - padding * 2) + padding;
  };

  const getYForScore = (score: number) => {
    return chartHeight - (score / 100) * (chartHeight - padding * 2) - padding;
  };

  return (
    <div className="mt-8 relative">
      {/* Lightbox Modal */}
      {selectedSnapshot && (
        <div 
          className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedSnapshot(null)}
        >
          <button className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
          <div className="max-w-5xl w-full max-h-[85vh] relative" onClick={e => e.stopPropagation()}>
             <img src={selectedSnapshot} className="w-full h-full object-contain rounded-lg shadow-2xl" alt="Violation Evidence" />
             <div className="absolute -bottom-10 left-0 right-0 text-center text-white/70 text-sm">
                Click anywhere outside to close
             </div>
          </div>
        </div>
      )}

      <div className="mb-4">
        <h3 className="text-[16px] font-extrabold text-slate-900 tracking-tight">Proctoring Analytics</h3>
        <p className="text-[12px] text-slate-500">Intelligent monitoring report for academic integrity</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-8 items-center lg:items-start">
            {/* Attention Score Ring */}
            <div className="flex flex-col items-center shrink-0 lg:w-48">
                <h4 className="text-[13px] font-bold text-slate-700 mb-4 uppercase tracking-wider">Integrity Score</h4>
                <div className="relative w-40 h-40">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="45" fill="none" stroke="#F1F5F9" strokeWidth="10" />
                        <circle 
                            cx="50" cy="50" r="45" fill="none" stroke="url(#scoreGradient)" 
                            strokeWidth="10" strokeDasharray="283" 
                            strokeDashoffset={283 - (attentionScore / 100) * 283} 
                            strokeLinecap="round" 
                            className="transition-all duration-1000 ease-out"
                        />
                        <defs>
                            <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#10B981" />
                                <stop offset="100%" stopColor="#3B82F6" />
                            </linearGradient>
                        </defs>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-[32px] font-black text-slate-900 leading-none">{attentionScore}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Percent</span>
                    </div>
                </div>
                <div className={`mt-4 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${attentionScore > 80 ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                    {attentionScore > 80 ? 'High Integrity' : 'Caution Required'}
                </div>
            </div>

            {/* Timeline Chart */}
            <div className="flex-1 w-full min-w-0">
                <h4 className="text-[13px] font-bold text-slate-700 mb-4 uppercase tracking-wider">Session Timeline</h4>
                <div className="w-full aspect-[2/1] lg:aspect-[3/1] bg-slate-50 rounded-xl border border-slate-100 p-4 relative overflow-hidden group">
                    <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-full overflow-visible">
                        {/* Grid Lines */}
                        {[0, 25, 50, 75, 100].map(val => (
                             <line key={val} x1={padding} y1={getYForScore(val)} x2={chartWidth - padding} y2={getYForScore(val)} stroke="#E2E8F0" strokeDasharray="4" />
                        ))}

                        {/* Data Line */}
                        <path 
                            d={generatePath()} 
                            fill="none" 
                            stroke="url(#lineGradient)" 
                            strokeWidth="4" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                            className="drop-shadow-sm"
                        />
                        <defs>
                            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#6366F1" />
                                <stop offset="100%" stopColor="#9333EA" />
                            </linearGradient>
                        </defs>

                        {/* Incident Markers */}
                        {incidents.map((incident) => {
                            const x = getXForTime(incident.timestamp);
                            const closest = timelineData.reduce((prev, curr) => 
                                Math.abs(curr.time - incident.timestamp) < Math.abs(prev.time - incident.timestamp) ? curr : prev,
                                timelineData[0] || {time: 0, score: 100}
                            );
                            const y = getYForScore(closest.score);
                            return (
                                <g key={incident.id} className="cursor-pointer group/marker">
                                    <circle cx={x} cy={y} r="8" fill="rgba(239, 68, 68, 0.2)" stroke="none" className="animate-ping" />
                                    <circle cx={x} cy={y} r="5" fill="#EF4444" stroke="white" strokeWidth="2" />
                                    <title>{`${incident.timeLabel} - ${incident.type}`}</title>
                                </g>
                            );
                        })}
                    </svg>
                    
                    {/* X-Axis Labels */}
                    <div className="absolute bottom-1 left-4 right-4 flex justify-between text-[9px] text-slate-400 font-bold uppercase tracking-tighter">
                        {labels.map((l, i) => <span key={i}>{l}</span>)}
                    </div>
                </div>
            </div>
        </div>

        {/* Security Metrics Grid - Optimized for no-overlap */}
        <div className="mt-8 pt-6 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
             <MetricCheck label="Face Detection" status={checks.faceDetected} icon={ShieldCheck} passedLabel="Verified" />
             <MetricCheck label="Identity Verified" status={checks.idVerified} icon={Eye} passedLabel="Confirmed" />
             <MetricCheck label="Phone Detection" status={checks.phoneDetected} icon={Smartphone} passedLabel="None" />
             <MetricCheck label="Multiple People" status={checks.multiplePeople} icon={Users} passedLabel="Single" />
             <MetricCheck label="Webcam Active" status={checks.webcamActive} icon={Video} passedLabel="Active" />
             <MetricCheck label="Screen Sharing" status={checks.screenSharing} icon={Monitor} passedLabel="Locked" />
        </div>

        {/* Snapshot Evidence Gallery */}
        {incidents.some(i => i.snapshot) && (
            <div className="mt-10 pt-8 border-t border-slate-100">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h4 className="text-[15px] font-bold text-slate-900 flex items-center gap-2">
                            <ShieldCheck className="w-5 h-5 text-indigo-500" />
                            Incident Evidence Log
                        </h4>
                        <p className="text-[11px] text-slate-500 mt-1">Click snapshots to expand and review violation evidence.</p>
                    </div>
                    <div className="px-3 py-1 bg-red-50 text-red-600 rounded-lg text-[10px] font-bold border border-red-100">
                        {incidents.filter(i => i.snapshot).length} Critical Captures
                    </div>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {incidents.filter(i => i.snapshot).map((incident) => (
                        <div 
                            key={incident.id} 
                            onClick={() => setSelectedSnapshot(incident.snapshot || null)}
                            className="group cursor-pointer relative bg-slate-900 rounded-xl overflow-hidden aspect-video border border-slate-200 hover:ring-2 hover:ring-indigo-500 hover:ring-offset-2 transition-all"
                        >
                            <img 
                                src={incident.snapshot} 
                                alt={incident.type} 
                                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Maximize2 className="w-8 h-8 text-white/50" />
                            </div>
                            <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-red-600/90 text-white text-[8px] font-black rounded uppercase">
                                {incident.type}
                            </div>
                            <div className="absolute bottom-2 left-2 right-2 flex justify-between items-end">
                                <p className="text-[9px] text-white/90 font-medium truncate flex-1 mr-2">{incident.description || 'Proctoring Flag'}</p>
                                <span className="text-[8px] text-white/60 font-mono shrink-0">{incident.timeLabel}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

const MetricCheck = ({ label, status, icon: Icon, passedLabel }: { label: string, status: boolean, icon: any, passedLabel: string }) => {
    let isSuccess = false;
    if (label === 'Phone Detection' || label === 'Multiple People') {
        isSuccess = !status;
    } else {
        isSuccess = status;
    }

    return (
        <div className="flex items-center gap-3 p-3 bg-slate-50/50 rounded-xl border border-slate-100 min-w-0 hover:bg-white hover:shadow-sm transition-all duration-200">
            <div className={`w-9 h-9 flex items-center justify-center rounded-xl shrink-0 ${isSuccess ? 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100' : 'bg-red-50 text-red-600 ring-1 ring-red-100'}`}>
                <Icon className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
                <p className="text-[11px] font-bold text-slate-900 truncate leading-tight mb-0.5 tracking-tight">{label}</p>
                <div className="flex items-center gap-1.5">
                    <p className={`text-[9px] font-black uppercase tracking-tighter ${isSuccess ? 'text-emerald-500' : 'text-red-500'}`}>
                        {isSuccess ? passedLabel : 'Detected'}
                    </p>
                    {isSuccess ? <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" /> : <AlertTriangle className="w-2.5 h-2.5 text-red-500" />}
                </div>
            </div>
        </div>
    );
}
