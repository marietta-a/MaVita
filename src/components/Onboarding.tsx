
import React, { useState } from 'react';
import { HealthGoal, UserProfile } from '../../types';
import { 
  ChevronRight, ChevronLeft, Heart, Brain, Zap, Shield, Sparkles, 
  Droplets, Utensils, Activity, Microscope, Flame, 
  PlusCircle, Wind, Baby, Eye, AlertCircle, Globe
} from 'lucide-react';
import { Logo } from './Logo';

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(0); // Start at 0 for splash
  const [profile, setProfile] = useState<Partial<UserProfile>>({
    goals: [],
    familyHistory: [],
    lifestyle: 'Moderate',
    stressLevels: 'Medium',
    cuisinePreference: 'Mediterranean'
  });

  const goalsList = [
    { id: HealthGoal.RADIANT_GLOW, icon: Sparkles, color: 'bg-rose-100 text-rose-600' },
    { id: HealthGoal.WEIGHT_MANAGEMENT, icon: Zap, color: 'bg-amber-100 text-amber-600' },
    { id: HealthGoal.DIABETIC, icon: Shield, color: 'bg-blue-100 text-blue-600' },
    { id: HealthGoal.CARDIAC, icon: Heart, color: 'bg-red-100 text-red-600' },
    { id: HealthGoal.RENAL, icon: Droplets, color: 'bg-indigo-100 text-indigo-600' },
    { id: HealthGoal.GASTROINTESTINAL, icon: Utensils, color: 'bg-orange-100 text-orange-600' },
    { id: HealthGoal.LIVER, icon: Activity, color: 'bg-emerald-100 text-emerald-600' },
    { id: HealthGoal.ONCOLOGY, icon: Microscope, color: 'bg-pink-100 text-pink-600' },
    { id: HealthGoal.NEUROLOGICAL, icon: Brain, color: 'bg-purple-100 text-purple-600' },
    { id: HealthGoal.METABOLIC, icon: Flame, color: 'bg-orange-100 text-orange-600' },
    { id: HealthGoal.POST_SURGICAL, icon: PlusCircle, color: 'bg-cyan-100 text-cyan-600' },
    { id: HealthGoal.PULMONARY, icon: Wind, color: 'bg-sky-100 text-sky-600' },
    { id: HealthGoal.PEDIATRIC, icon: Baby, color: 'bg-yellow-100 text-yellow-600' },
    { id: HealthGoal.EYE_HEALTH, icon: Eye, color: 'bg-violet-100 text-violet-600' },
    { id: HealthGoal.GASTRITIC, icon: AlertCircle, color: 'bg-rose-100 text-rose-600' },
  ];

  const cuisines = [
    'Mediterranean', 'Japanese', 'Indian', 'Mexican', 'Italian', 'Thai', 'Middle Eastern', 'Scandinavian', 'Standard American', 'Continental'
  ];

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
    else if (profile.name && profile.age && profile.goals?.length) {
       onComplete({ ...profile, onboarded: true } as UserProfile);
    }
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const toggleGoal = (goal: HealthGoal) => {
    const currentGoals = profile.goals || [];
    if (currentGoals.includes(goal)) {
      setProfile({ ...profile, goals: currentGoals.filter(g => g !== goal) });
    } else {
      setProfile({ ...profile, goals: [...currentGoals, goal] });
    }
  };

  if (step === 0) {
    return (
      <div className="fixed inset-0 bg-white z-[110] flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-700">
        <div className="space-y-12 max-w-sm">
          <div className="animate-in zoom-in-50 duration-1000">
            <Logo className="w-48 h-48 mx-auto" showText />
          </div>
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-[#1F4D54]">Your AI Blueprint for Lifelong Wellness</h2>
            <p className="text-slate-500 font-medium">Predict metabolic response. Prevent chronic illness. Master your biology.</p>
          </div>
          <button 
            onClick={handleNext}
            className="w-full bg-[#1F4D54] text-white py-6 rounded-3xl font-bold text-xl shadow-2xl shadow-teal-200 active:scale-95 transition-all flex items-center justify-center gap-3"
          >
            Start Your Journey <ChevronRight size={24} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-emerald-50 z-[100] flex flex-col overflow-hidden text-slate-900" role="main" aria-label="MaVita Onboarding">
      <div className="flex-1 overflow-y-auto px-6">
        <div className="max-w-md mx-auto w-full py-8 space-y-8">
          
          <div className="flex justify-between items-center sticky top-0 bg-emerald-50 py-4 z-10">
            <div className="flex items-center gap-4">
              {step > 0 && (
                <button 
                  onClick={handleBack}
                  className="p-2 rounded-full hover:bg-emerald-100 text-emerald-700 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  aria-label="Go back to previous step"
                >
                  <ChevronLeft size={24} />
                </button>
              )}
              <div className="flex gap-1" role="progressbar" aria-valuenow={step} aria-valuemin={1} aria-valuemax={3}>
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={`h-1.5 w-12 rounded-full transition-all ${
                      step >= i ? 'bg-[#3498DB]' : 'bg-blue-100'
                    }`}
                    aria-hidden="true"
                  />
                ))}
              </div>
            </div>
            <span className="text-emerald-800 font-bold text-sm">Step {step}/3</span>
          </div>

          {step === 1 && (
            <section className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <h1 className="text-4xl font-bold text-slate-900 leading-tight">
                Let's create your <span className="text-[#3498DB]">Preventive Priority Map</span>.
              </h1>
              <p className="text-slate-600 text-lg">MaVita focuses on your long-term healthspan. Select your primary health priorities:</p>
              
              <div 
                className="grid grid-cols-1 gap-3 pb-4" 
                role="group" 
                aria-label="Health goal selection"
              >
                {goalsList.map((goal) => {
                  const Icon = goal.icon;
                  const isSelected = profile.goals?.includes(goal.id);
                  return (
                    <button
                      key={goal.id}
                      onClick={() => toggleGoal(goal.id)}
                      aria-pressed={isSelected}
                      className={`flex items-center gap-4 p-5 rounded-2xl border-2 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                        isSelected ? 'border-[#3498DB] bg-white shadow-lg scale-[1.02]' : 'border-emerald-100 bg-emerald-50/50 grayscale opacity-70 hover:opacity-100'
                      }`}
                    >
                      <div className={`p-3 rounded-xl ${goal.color}`} aria-hidden="true">
                        <Icon size={24} />
                      </div>
                      <span className="font-bold text-slate-800 text-lg">{goal.id}</span>
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {step === 2 && (
            <section className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <h1 className="text-3xl font-bold text-slate-900">Your Biology.</h1>
              <p className="text-slate-600">Tell us a bit about your personal and family history to refine our AI models.</p>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="full-name" className="block text-sm font-bold text-slate-700 uppercase">Full Name</label>
                  <input
                    id="full-name"
                    type="text"
                    autoComplete="name"
                    value={profile.name || ''}
                    placeholder="Sarah Johnson"
                    className="w-full p-4 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="age" className="block text-sm font-bold text-slate-700 uppercase">Age</label>
                  <input
                    id="age"
                    type="number"
                    value={profile.age || ''}
                    placeholder="35"
                    className="w-full p-4 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    onChange={(e) => setProfile({ ...profile, age: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <fieldset className="space-y-3">
                  <legend className="block text-sm font-bold text-slate-700 uppercase mb-2">Family History (Check all that apply)</legend>
                  <div className="flex flex-wrap gap-2" role="group" aria-label="Family history selection">
                    {['Heart Disease', 'Type 2 Diabetes', 'Alzheimer\'s', 'Inflammatory Issues', 'Autoimmune', 'Cancer'].map(item => {
                      const isSelected = profile.familyHistory?.includes(item);
                      return (
                        <button
                          key={item}
                          type="button"
                          onClick={() => {
                            const history = profile.familyHistory || [];
                            const next = history.includes(item) ? history.filter(h => h !== item) : [...history, item];
                            setProfile({ ...profile, familyHistory: next });
                          }}
                          aria-pressed={isSelected}
                          className={`px-4 py-2 rounded-full border transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                            isSelected ? 'bg-[#3498DB] border-[#3498DB] text-white shadow-md' : 'bg-white border-slate-200 text-slate-600 hover:border-emerald-300'
                          }`}
                        >
                          {item}
                        </button>
                      );
                    })}
                  </div>
                </fieldset>
              </div>
            </section>
          )}

          {step === 3 && (
            <section className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <h1 className="text-3xl font-bold text-slate-900">Lifestyle & Palette.</h1>
              <p className="text-slate-600">Your daily habits and taste preferences significantly impact your metabolic response.</p>
              
              <div className="space-y-8">
                <fieldset className="space-y-3">
                  <legend className="block text-sm font-bold text-slate-700 uppercase mb-3">Activity Level</legend>
                  <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Activity level selection">
                    {['Sedentary', 'Moderate', 'Active', 'Athlete'].map((l) => (
                      <button
                        key={l}
                        type="button"
                        onClick={() => setProfile({ ...profile, lifestyle: l as any })}
                        role="radio"
                        aria-checked={profile.lifestyle === l}
                        className={`p-4 rounded-xl border-2 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                          profile.lifestyle === l ? 'border-[#3498DB] bg-blue-50 font-bold text-blue-900' : 'border-slate-100 bg-white text-slate-600'
                        }`}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                </fieldset>

                <fieldset className="space-y-3">
                  <legend className="block text-sm font-bold text-slate-700 uppercase mb-3 flex items-center gap-2">
                    <Globe size={16} className="text-[#3498DB]" />
                    Cuisine Preference
                  </legend>
                  <div className="flex flex-wrap gap-2">
                    {cuisines.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setProfile({ ...profile, cuisinePreference: c })}
                        className={`px-4 py-2 rounded-full border transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs font-bold ${
                          profile.cuisinePreference === c ? 'bg-[#3498DB] border-[#3498DB] text-white shadow-md' : 'bg-white border-slate-200 text-slate-600 hover:border-emerald-300'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </fieldset>

                <fieldset className="space-y-3">
                  <legend className="block text-sm font-bold text-slate-700 uppercase mb-3">Daily Stress Level</legend>
                  <div className="flex gap-2" role="radiogroup" aria-label="Stress level selection">
                    {['Low', 'Medium', 'High'].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setProfile({ ...profile, stressLevels: s as any })}
                        role="radio"
                        aria-checked={profile.stressLevels === s}
                        className={`flex-1 p-4 rounded-xl border-2 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                          profile.stressLevels === s ? 'border-[#3498DB] bg-blue-50 font-bold text-blue-900' : 'border-slate-100 bg-white text-slate-600'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </fieldset>
              </div>
            </section>
          )}
        </div>
      </div>

      <div className="p-6 bg-white border-t border-emerald-100 sticky bottom-0 z-20">
        <div className="max-w-md mx-auto w-full flex gap-3">
          <button
            onClick={handleNext}
            disabled={
              (step === 1 && (!profile.goals || profile.goals.length === 0)) ||
              (step === 2 && (!profile.name || !profile.age))
            }
            className="flex-1 bg-[#1F4D54] text-white py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 shadow-xl shadow-teal-100 transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
          >
            {step === 3 ? "Complete Your Map" : "Continue"}
            <ChevronRight size={24} aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
