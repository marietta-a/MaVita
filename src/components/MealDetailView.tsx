
import React, { useState } from 'react';
import { MealAnalysis } from '../../types';
import { 
  X, Trash2, Edit3, Save, Calendar, Clock, 
  ShieldAlert, Activity, Utensils, Zap, 
  ChevronLeft, HeartPulse, Microscope
} from 'lucide-react';

interface MealDetailViewProps {
  meal: MealAnalysis;
  onClose: () => void;
  onDelete: (id: string) => void;
  onUpdate: (meal: MealAnalysis) => void;
}

const MealDetailView: React.FC<MealDetailViewProps> = ({ meal, onClose, onDelete, onUpdate }) => {
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notes, setNotes] = useState(meal.userNotes || '');

  const handleSaveNotes = () => {
    onUpdate({ ...meal, userNotes: notes });
    setIsEditingNotes(false);
  };

  const formattedDate = new Date(meal.timestamp).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric'
  });
  const formattedTime = new Date(meal.timestamp).toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit'
  });

  return (
    <div className="fixed inset-0 z-[100] bg-white flex flex-col overflow-hidden animate-in slide-in-from-right duration-300">
      <header className="px-6 py-4 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
        <button 
          onClick={onClose}
          className="p-2 -ml-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
        >
          <ChevronLeft size={24} />
        </button>
        <div className="text-center">
          <h2 className="font-bold text-slate-900">Meal Analysis</h2>
          <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest justify-center">
             <Calendar size={10} /> {formattedDate} • <Clock size={10} /> {formattedTime}
          </div>
        </div>
        <button 
          onClick={() => {
            if(confirm('Are you sure you want to delete this biological log?')) {
              onDelete(meal.id);
              onClose();
            }
          }}
          className="p-2 -mr-2 rounded-full hover:bg-rose-50 text-rose-500 transition-colors"
        >
          <Trash2 size={20} />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto pb-12">
        {meal.imageUrl && (
          <div className="relative h-72 w-full overflow-hidden">
            <img src={meal.imageUrl} alt={meal.foodName} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <h1 className="text-3xl font-bold text-white mb-2">{meal.foodName}</h1>
              <div className="flex gap-2">
                <span className="bg-emerald-500 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                  Glycemic: {meal.glycemicScore}
                </span>
                <span className="bg-indigo-500 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                  I-Index: {meal.iIndexScore}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="p-6 space-y-8">
          <section className="space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Bio-Summary</h3>
            <p className="text-slate-700 leading-relaxed font-medium">{meal.description}</p>
          </section>

          <section className="bg-rose-50 p-6 rounded-[2rem] border border-rose-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 text-rose-500/10">
              <ShieldAlert size={64} />
            </div>
            <h3 className="text-xs font-bold text-rose-900 flex items-center gap-2 mb-3 uppercase tracking-widest relative z-10">
              <ShieldAlert size={14} className="text-rose-600" />
              Identified Risks
            </h3>
            <p className="text-xs text-rose-800 font-medium leading-relaxed relative z-10">
              {meal.healthRisks}
            </p>
          </section>

          <section className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Personal Notes</h3>
              {!isEditingNotes ? (
                <button onClick={() => setIsEditingNotes(true)} className="text-emerald-600 p-2 rounded-full hover:bg-emerald-50">
                  <Edit3 size={16} />
                </button>
              ) : (
                <button onClick={handleSaveNotes} className="text-emerald-600 p-2 rounded-full hover:bg-emerald-50">
                  <Save size={16} />
                </button>
              )}
            </div>
            {isEditingNotes ? (
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes about how you felt or modifications made..."
                className="w-full p-4 rounded-2xl border border-emerald-100 bg-emerald-50/20 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[100px]"
              />
            ) : (
              <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50 min-h-[60px]">
                <p className="text-sm text-slate-600 italic">
                  {meal.userNotes || "No personal notes added yet."}
                </p>
              </div>
            )}
          </section>

          <section className="grid grid-cols-2 gap-4">
            <div className="bg-emerald-50 p-5 rounded-3xl border border-emerald-100">
               <h4 className="text-[10px] font-bold text-emerald-800 uppercase mb-3 flex items-center gap-2">
                 <Activity size={12} /> Pathways
               </h4>
               <ul className="space-y-2">
                 {meal.biologicalPathways.map((p, i) => (
                   <li key={i} className="text-[10px] font-bold text-emerald-700 bg-white/60 px-2 py-1 rounded-lg">
                     {p}
                   </li>
                 ))}
               </ul>
            </div>
            <div className="bg-amber-50 p-5 rounded-3xl border border-amber-100">
               <h4 className="text-[10px] font-bold text-amber-800 uppercase mb-3 flex items-center gap-2">
                 <Utensils size={12} /> Macros
               </h4>
               <div className="grid grid-cols-2 gap-2 text-[9px] font-bold uppercase">
                 <div className="bg-white/60 p-1.5 rounded-lg text-amber-900">P: {meal.macronutrients.protein}</div>
                 <div className="bg-white/60 p-1.5 rounded-lg text-amber-900">C: {meal.macronutrients.carbs}</div>
                 <div className="bg-white/60 p-1.5 rounded-lg text-amber-900">F: {meal.macronutrients.fats}</div>
                 <div className="bg-white/60 p-1.5 rounded-lg text-amber-900">Fi: {meal.macronutrients.fiber}</div>
               </div>
            </div>
          </section>

          <section className="space-y-4">
             <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Longevity Nutrients</h3>
             <div className="space-y-3">
               {meal.nutrients.map((n, i) => (
                 <div key={i} className="p-4 rounded-2xl border border-slate-100 bg-slate-50 flex flex-col gap-1">
                    <span className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Microscope size={14} className="text-emerald-500" />
                      {n.name}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">{n.benefit}</span>
                 </div>
               ))}
             </div>
          </section>

          <section className="space-y-4">
             <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
               <Zap size={14} className="text-amber-500" />
               Pairing Protocols
             </h3>
             <div className="space-y-2">
               {meal.pairingSuggestions.map((s, i) => (
                 <div key={i} className="bg-white p-4 rounded-2xl border border-slate-100 text-xs text-slate-600 font-medium leading-relaxed flex gap-3">
                   <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
                   {s}
                 </div>
               ))}
             </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default MealDetailView;
