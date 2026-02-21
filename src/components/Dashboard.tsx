
import React, { useMemo, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MealAnalysis, UserProfile } from '../../types';
import { Activity, Flame, Droplets, Info, Camera, ShieldAlert, ChevronRight, Share2, Loader2, X, Clipboard, Check, FileText } from 'lucide-react';
import MealDetailView from './MealDetailView';
import { generateBioReport } from '../services/gemini';

interface DashboardProps {
  profile: UserProfile;
  mealHistory: MealAnalysis[];
  onDeleteMeal: (id: string) => void;
  onUpdateMeal: (meal: MealAnalysis) => void;
  cachedReport: string | null;
  onReportGenerated: (report: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  profile, 
  mealHistory, 
  onDeleteMeal, 
  onUpdateMeal, 
  cachedReport, 
  onReportGenerated 
}) => {
  const [selectedMeal, setSelectedMeal] = useState<MealAnalysis | null>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const defaultAvatar = `https://picsum.photos/seed/${profile.name}/100/100`;

  const avgIIndex = useMemo(() => {
    if (mealHistory.length === 0) return 0;
    return Math.round(mealHistory.reduce((acc, m) => acc + m.iIndexScore, 0) / mealHistory.length);
  }, [mealHistory]);

  const avgGlycemic = useMemo(() => {
    if (mealHistory.length === 0) return '0.0';
    return (mealHistory.reduce((acc, m) => acc + m.glycemicScore, 0) / mealHistory.length).toFixed(1);
  }, [mealHistory]);

  const handleReportAction = async () => {
    if (cachedReport) {
      setShowReportModal(true);
      return;
    }
    
    if (mealHistory.length === 0) return;
    setIsGeneratingReport(true);
    try {
      const bioReport = await generateBioReport(mealHistory, profile);
      onReportGenerated(bioReport);
      setShowReportModal(true);
    } catch (err) {
      console.error("Report generation failed", err);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const handleShare = async () => {
    if (!cachedReport) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'MaVita Metabolic Bio-Report',
          text: cachedReport,
        });
      } catch (err) {
        console.log('Share failed or cancelled', err);
      }
    } else {
      handleCopyToClipboard();
    }
  };

  const handleCopyToClipboard = () => {
    if (!cachedReport) return;
    navigator.clipboard.writeText(cachedReport);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const chartData = useMemo(() => {
    const baseData = [
      { time: '8am', glucose: 85 },
      { time: '10am', glucose: 110 },
      { time: '12pm', glucose: 95 },
      { time: '2pm', glucose: 135 },
      { time: '4pm', glucose: 105 },
      { time: '6pm', glucose: 115 },
      { time: '8pm', glucose: 145 },
      { time: '10pm', glucose: 100 },
    ];
    return baseData;
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img 
              src={profile.avatarUrl || defaultAvatar} 
              className="w-14 h-14 rounded-2xl object-cover border-2 border-slate-50 shadow-sm" 
              alt="profile" 
            />
            <div className="absolute -bottom-1 -right-1 bg-[#8CC63F] w-4 h-4 rounded-full border-2 border-white shadow-sm" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[#1F4D54] leading-tight">Hello, {profile.name}</h2>
            <div className="flex items-center gap-2">
              <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">Actual Age: {profile.age}</span>
              <span className="w-1 h-1 rounded-full bg-slate-200" />
              <div className="flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-full">
                <Activity size={10} className="text-[#8CC63F]" />
                <span className="text-[#1F4D54] text-[10px] font-bold uppercase tracking-tighter">Metabolic Score: {profile.age - 2}</span>
              </div>
            </div>
          </div>
        </div>
        <button className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-slate-100 transition-colors">
          <Share2 size={20} />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[#1F4D54] p-5 rounded-3xl text-white shadow-lg shadow-teal-50">
          <div className="flex justify-between items-start mb-4">
            <Flame size={20} className="text-[#8CC63F]" />
            <div className="text-[10px] font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full">
              {avgIIndex < 40 ? 'Optimal' : 'Elevated'}
            </div>
          </div>
          <div className="text-3xl font-bold">{avgIIndex}</div>
          <div className="text-xs opacity-70 font-medium">Daily I-Index</div>
          <div className="mt-3 h-1 w-full bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-[#8CC63F]" style={{ width: `${Math.max(0, 100 - avgIIndex)}%` }} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <Droplets className="text-[#3498DB]" size={20} />
            <div className="text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
              {Number(avgGlycemic) < 5 ? 'Stable' : 'Variable'}
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-800">{avgGlycemic}</div>
          <div className="text-xs text-slate-500 font-medium">Avg Glycemic Load</div>
          <div className="mt-3 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-[#3498DB]" style={{ width: `${(Number(avgGlycemic) / 10) * 100}%` }} />
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <Activity className="text-[#8CC63F]" size={20} />
              Metabolic Pathway Sync
            </h3>
            <p className="text-xs text-slate-500">Live predicted glucose response based on your meals.</p>
          </div>
          <button className="text-emerald-600 bg-emerald-50 p-2 rounded-full hover:bg-emerald-100 transition-colors">
            <Info size={16} />
          </button>
        </div>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorGlucose" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8CC63F" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#8CC63F" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#64748b'}} />
              <YAxis hide domain={[60, 180]} />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                labelStyle={{ fontWeight: 'bold' }}
              />
              <Area type="monotone" dataKey="glucose" stroke="#8CC63F" strokeWidth={3} fillOpacity={1} fill="url(#colorGlucose)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <h3 className="font-bold text-slate-800">Nutritional Impact Log</h3>
          {mealHistory.length > 0 && (
             <button 
               onClick={handleReportAction}
               disabled={isGeneratingReport}
               className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50 ${
                 cachedReport 
                   ? 'bg-blue-50 text-blue-600 hover:bg-blue-100' 
                   : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
               }`}
             >
               {isGeneratingReport ? (
                 <Loader2 size={12} className="animate-spin" />
               ) : cachedReport ? (
                 <FileText size={12} />
               ) : (
                 <Share2 size={12} />
               )}
               {cachedReport ? 'View Bio-Report' : 'Generate Bio-Report'}
             </button>
          )}
        </div>
        
        {mealHistory.length === 0 ? (
          <div className="bg-emerald-50 p-6 rounded-3xl border-2 border-dashed border-emerald-200 text-center">
            <p className="text-emerald-700 font-medium">Scan your first meal to start tracking biological pathways!</p>
          </div>
        ) : (
          mealHistory.map((meal, idx) => (
            <button 
              key={meal.id || idx} 
              onClick={() => setSelectedMeal(meal)}
              className="w-full text-left bg-white p-5 rounded-3xl border border-slate-200 flex flex-col gap-3 transition-all active:scale-[0.98] hover:border-emerald-200 group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-slate-100 flex-shrink-0 flex items-center justify-center text-slate-400 overflow-hidden shadow-inner">
                  {meal.imageUrl ? (
                    <img src={meal.imageUrl} alt={meal.foodName} className="w-full h-full object-cover" />
                  ) : (
                    <Camera size={20} />
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-slate-800 group-hover:text-emerald-700 transition-colors">{meal.foodName}</h4>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {meal.biologicalPathways.slice(0, 2).map((p, i) => (
                      <span key={i} className="text-[9px] bg-slate-100 px-2 py-0.5 rounded-full font-bold text-slate-600 uppercase tracking-wider">
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="text-right flex items-center gap-2">
                  <div>
                    <div className={`text-lg font-bold ${meal.glycemicScore > 7 ? 'text-rose-500' : 'text-emerald-600'}`}>
                      {meal.glycemicScore}/10
                    </div>
                    <div className="text-[9px] font-bold text-slate-400 uppercase">Glycemic</div>
                  </div>
                  <ChevronRight size={16} className="text-slate-300 group-hover:text-emerald-400 transition-colors" />
                </div>
              </div>
              
              <div className="bg-rose-50/50 p-3 rounded-xl border border-rose-100/50 flex items-start gap-2">
                <ShieldAlert size={14} className="text-rose-500 flex-shrink-0 mt-0.5" />
                <p className="text-[11px] text-rose-700 font-medium leading-tight line-clamp-2">
                  <span className="font-bold">Risk Insight:</span> {meal.healthRisks}
                </p>
              </div>
            </button>
          ))
        )}
      </div>

      {showReportModal && cachedReport && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <FileText className="text-emerald-500" size={20} />
                Bio-Report Summary
              </h3>
              <button onClick={() => setShowReportModal(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400">
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-8 prose prose-slate max-w-none">
              <div className="whitespace-pre-wrap text-sm text-slate-700 font-medium leading-relaxed">
                {cachedReport}
              </div>
            </div>
            <div className="p-6 bg-slate-50 border-t border-slate-200 flex gap-3">
              <button 
                onClick={handleCopyToClipboard}
                className="flex-1 bg-white text-slate-700 border border-slate-200 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-100 transition-all active:scale-95"
              >
                {copied ? <Check size={18} className="text-emerald-500" /> : <Clipboard size={18} />}
                {copied ? 'Copied!' : 'Copy Text'}
              </button>
              <button 
                onClick={handleShare}
                className="flex-[2] bg-emerald-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all active:scale-95"
              >
                <Share2 size={18} />
                Share Report
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedMeal && (
        <MealDetailView 
          meal={selectedMeal} 
          onClose={() => setSelectedMeal(null)} 
          onDelete={onDeleteMeal}
          onUpdate={onUpdateMeal}
        />
      )}
    </div>
  );
};

export default Dashboard;
