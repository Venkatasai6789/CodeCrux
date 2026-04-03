import React, { useState } from 'react';
import { ProctoringSession } from '../../types';
import { CheckCircle2, AlertTriangle, Eye, ShieldCheck, Smartphone, Users, Video, Monitor, X, Maximize2, Clock } from 'lucide-react';

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

  const safeScore = typeof attentionScore === 'number' ? attentionScore : 0;
  const safeTimeline = (timelineData && timelineData.length > 0) ? timelineData : [{time: 0, score: safeScore}, {time: 60, score: safeScore}];
  const safeIncidents = incidents || [];

  // X-Axis range calculation
  const times = safeTimeline.map(d => d.time);
  const maxTime = Math.max(...times, 60);
  const minTime = Math.min(...times, 0);
  const timeRange = maxTime - minTime || 1;

  // Generate dynamic labels (0%, 25%, 50%, 75%, 100% of duration)
  const labels = [0, 0.25, 0.5, 0.75, 1].map(p => {
      const val = minTime + (p * timeRange);
      if (timeRange < 120) return `${Math.floor(val)}s`;
      return `${Math.floor(val / 60)}m`;
  });

  const generatePath = () => {
    const points = safeTimeline.map(d => {
      const x = ((d.time - minTime) / timeRange) * (chartWidth - padding * 2) + padding;
      const y = chartHeight - (d.score / 100) * (chartHeight - padding * 2) - padding;
      return `${x},${y}`;
    }).join(' L ');
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
                <h4 className="text-[11px] font-black text-slate-400 mb-6 uppercase tracking-[0.2em]">Compliance Rank</h4>
                <div className="relative w-40 h-40 group cursor-default">
                    <div className="absolute inset-0 rounded-full bg-slate-50 scale-90 group-hover:scale-100 transition-transform duration-500" />
                    <svg className="w-full h-full -rotate-90 relative z-10" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="42" fill="none" stroke="#F1F5F9" strokeWidth="8" />
                        <circle 
                            cx="50" cy="50" r="42" fill="none" stroke="url(#scoreGradient)" 
                            strokeWidth="10" strokeDasharray="264" 
                            strokeDashoffset={264 - (safeScore / 100) * 264} 
                            strokeLinecap="round" 
                            className="transition-all duration-1000 ease-out"
                        />
                        <defs>
                            <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor={safeScore >= 90 ? '#10B981' : safeScore >= 70 ? '#F59E0B' : '#EF4444'} />
                                <stop offset="100%" stopColor={safeScore >= 90 ? '#3B82F6' : safeScore >= 70 ? '#D97706' : '#DC2626'} />
                            </linearGradient>
                        </defs>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
                        <div className="flex items-baseline">
                            <span className={`text-[42px] font-black leading-none tracking-tighter ${
                                safeScore >= 90 ? 'text-emerald-600' : safeScore >= 70 ? 'text-amber-600' : 'text-red-600'
                            }`}>
                                {safeScore}
                            </span>
                            <span className="text-sm font-bold text-slate-300 ml-0.5">%</span>
                        </div>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Integrity</span>
                    </div>
                </div>
                <div className={`mt-6 px-4 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border shadow-sm transition-all duration-300 ${
                    safeScore >= 90 ? 'bg-emerald-50 text-emerald-700 border-emerald-100 shadow-emerald-100/20' : 
                    safeScore >= 70 ? 'bg-amber-50 text-amber-700 border-amber-100 shadow-amber-100/20' : 
                    'bg-red-50 text-red-700 border-red-100 shadow-red-100/20'
                }`}>
                    {safeScore >= 90 ? 'High Fidelity' : safeScore >= 70 ? 'Minor Flags' : 'Integrity Warning'}
                </div>
            </div>

            {/* Timeline Chart */}
            <div className="flex-1 w-full min-w-0">
                <h4 className="text-[11px] font-black text-slate-400 mb-6 uppercase tracking-[0.2em]">Activity Flux</h4>
                <div className="w-full aspect-[2/1] lg:aspect-[3/1] bg-slate-50/50 rounded-2xl border border-slate-100 p-4 relative overflow-hidden group">
                    <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-full overflow-visible">
                        {/* Grid Lines */}
                        {[0, 50, 100].map(val => (
                             <line key={val} x1={padding} y1={getYForScore(val)} x2={chartWidth - padding} y2={getYForScore(val)} stroke="#E2E8F0" strokeDasharray="4" strokeWidth="1" />
                        ))}

                        {/* Data Line */}
                        <path 
                            d={generatePath()} 
                            fill="none" 
                            stroke="url(#lineGradient)" 
                            strokeWidth="5" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                            className="drop-shadow-[0_4px_8px_rgba(99,102,241,0.2)]"
                        />
                        <defs>
                            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#6366F1" />
                                <stop offset="100%" stopColor="#8B5CF6" />
                            </linearGradient>
                        </defs>

                        {/* Incident Markers */}
                        {safeIncidents.map((incident) => {
                            const x = getXForTime(incident.timestamp);
                            const closest = safeTimeline.reduce((prev, curr) => 
                                Math.abs(curr.time - incident.timestamp) < Math.abs(prev.time - incident.timestamp) ? curr : prev,
                                safeTimeline[0] || {time: 0, score: 100}
                            );
                            const y = getYForScore(closest.score);
                            return (
                                <g key={incident.id} className="cursor-pointer group/marker">
                                    <circle cx={x} cy={y} r="12" fill="rgba(239, 68, 68, 0.15)" stroke="none" className="animate-pulse" />
                                    <circle cx={x} cy={y} r="6" fill="#EF4444" stroke="white" strokeWidth="2.5" className="drop-shadow-md" />
                                    <title>{`${incident.timeLabel} - ${incident.type}`}</title>
                                </g>
                            );
                        })}
                    </svg>
                    
                    {/* X-Axis Labels */}
                    <div className="absolute bottom-1.5 left-6 right-6 flex justify-between text-[8px] text-slate-400 font-black uppercase tracking-widest">
                        {labels.map((l, i) => <span key={i}>{l}</span>)}
                    </div>
                </div>
            </div>
        </div>

        {/* Security Metrics Grid - Optimized for no-overlap */}
        <div className="mt-8 pt-8 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
             <MetricCheck label="Face Detection" status={checks?.faceDetected !== false} icon={ShieldCheck} passedLabel="Verified" />
             <MetricCheck label="Identity Verified" status={checks?.idVerified !== false} icon={Eye} passedLabel="Confirmed" />
             <MetricCheck label="Absence Monitor" status={!safeIncidents.some(i => i.type.includes('ABSENCE'))} icon={Video} passedLabel="Continuous" />
             <MetricCheck label="Phone Detection" status={!checks?.phoneDetected} icon={Smartphone} passedLabel="None" />
             <MetricCheck label="Multiple People" status={!checks?.multiplePeople} icon={Users} passedLabel="Single" />
             <MetricCheck label="Session Integrity" status={safeScore >= 70} icon={Monitor} passedLabel="Secure" />
        </div>

        {/* Snapshot Evidence Gallery */}
        {safeIncidents.some(i => i.snapshot) && (
            <div className="mt-10 pt-8 border-t border-slate-100">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h4 className="text-[14px] font-black text-slate-900 flex items-center gap-2 uppercase tracking-tight">
                            <AlertTriangle className="w-5 h-5 text-amber-500" />
                            Incident Evidence Log
                        </h4>
                        <p className="text-[11px] text-slate-500 mt-1 font-medium">Automatic captures generated by Artificial Intelligence proctoring service.</p>
                    </div>
                    <div className="px-4 py-1.5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.15em]">
                        {safeIncidents.filter(i => i.snapshot).length} Critical Events
                    </div>
                </div>
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {safeIncidents.filter(i => i.snapshot).map((incident) => (
                        <div 
                            key={incident.id} 
                            onClick={() => setSelectedSnapshot(incident.snapshot || null)}
                            className="group cursor-pointer bg-white border border-slate-100 rounded-[2.5rem] p-5 hover:border-indigo-200 hover:shadow-2xl hover:shadow-indigo-50/50 transition-all duration-500 relative flex flex-col sm:flex-row gap-6 items-center overflow-hidden"
                        >
                            <div className="relative w-full sm:w-56 rounded-3xl overflow-hidden border border-slate-100 h-36 bg-slate-50 shadow-md shrink-0">
                              <img 
                                  src={incident.snapshot} 
                                  alt={incident.type} 
                                  className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-105"
                              />
                              <div className="absolute top-2 left-2 px-2.5 py-1 bg-black/60 backdrop-blur-md text-white text-[9px] font-black rounded-lg uppercase tracking-widest flex items-center gap-1 shadow-lg">
                                  <Clock className="w-3 h-3 text-indigo-300" />
                                  {incident.timeLabel}
                              </div>
                              <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 duration-500">
                                 <button className="bg-white/95 backdrop-blur-sm px-4 py-2 rounded-xl text-slate-900 shadow-xl flex items-center gap-2 font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-transform">
                                   <Maximize2 className="w-3 h-3 text-indigo-600" /> Expand
                                 </button>
                              </div>
                            </div>
                            
                            <div className="flex-1 w-full flex flex-col justify-center">
                                <div className="flex justify-between items-start w-full mb-3">
                                  <span className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] border shadow-sm ${
                                      incident.type.includes('HIGH') || incident.type.includes('PHONE') || incident.type.includes('ABSENCE') || incident.type.includes('MULTIPLE') 
                                      ? 'bg-red-50 text-red-600 border-red-100 shadow-red-100/50' 
                                      : 'bg-amber-50 text-amber-600 border-amber-100 shadow-amber-100/50'
                                  }`}>
                                      {incident.type}
                                  </span>
                                </div>
                                <h4 className="text-lg font-black text-slate-900 tracking-tight leading-tight mb-2">
                                  {incident.description || 'Integrity Protocol Flag'}
                                </h4>
                                <p className="text-xs font-medium text-slate-500 leading-relaxed mt-1">
                                  Captured at <strong className="text-slate-700">{incident.timeLabel}</strong> during the assessment.
                                </p>
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
    return (
        <div className="flex items-center gap-4 p-4 bg-slate-50/50 rounded-2xl border border-slate-100 min-w-0 hover:bg-white hover:shadow-xl hover:shadow-slate-200/40 hover:-translate-y-0.5 transition-all duration-300">
            <div className={`w-11 h-11 flex items-center justify-center rounded-2xl shrink-0 transition-colors ${status ? 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100' : 'bg-red-50 text-red-600 ring-1 ring-red-100'}`}>
                <Icon className="w-6 h-6" />
            </div>
            <div className="min-w-0 flex-1">
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest leading-tight mb-1">{label}</p>
                <div className="flex items-center gap-2">
                    <p className={`text-[12px] font-black tracking-tight ${status ? 'text-slate-900' : 'text-red-600'}`}>
                        {status ? passedLabel : 'Anomalous'}
                    </p>
                    {status ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <AlertTriangle className="w-3.5 h-3.5 text-red-500 animate-pulse" />}
                </div>
            </div>
        </div>
    );
}

