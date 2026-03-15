import React, { useState, useMemo, useRef, useEffect } from 'react';
import { HealthGoal, Recipe, UserProfile } from '../../types';
import { generateLongevityPlate } from '../services/gemini';
import { 
  Sparkles, 
  Loader2, 
  BookOpen, 
  ChefHat, 
  HeartPulse, 
  Search, 
  ChevronDown, 
  Check, 
  Filter, 
  Trash2, 
  Globe,
  Edit3
} from 'lucide-react';

interface PlateBuilderProps {
  profile: UserProfile;
  onUpdateProfile: (profile: UserProfile) => void;
}

const PlateBuilder: React.FC<PlateBuilderProps> = ({ profile, onUpdateProfile }) => {
  const standardCuisines = [
    'Mediterranean', 'Japanese', 'Indian', 'Mexican', 'Italian', 
    'Thai', 'Middle Eastern', 'Scandinavian', 'Standard American', 'Continental'
  ];

  // Initialize selected goal
  const [selectedGoal, setSelectedGoal] = useState<HealthGoal>(() => {
    const savedGoal = localStorage.getItem('mavita_selected_goal');
    return (savedGoal as HealthGoal) || (profile.goals[0] as HealthGoal) || HealthGoal.RADIANT_GLOW;
  });

  // Initialize cuisine logic
  const [selectedCuisine, setSelectedCuisine] = useState<string>(() => {
    const savedCuisine = localStorage.getItem('mavita_selected_cuisine');
    return savedCuisine || profile.cuisinePreference || 'Mediterranean';
  });

  // Track if "Other" mode is active
  const [isOtherCuisine, setIsOtherCuisine] = useState(() => {
    const current = localStorage.getItem('mavita_selected_cuisine') || profile.cuisinePreference;
    return current ? !standardCuisines.includes(current) : false;
  });
  
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [isGoalDropdownOpen, setIsGoalDropdownOpen] = useState(false);
  const [isCuisineDropdownOpen, setIsCuisineDropdownOpen] = useState(false);
  const [goalSearchQuery, setGoalSearchQuery] = useState('');
  
  const goalDropdownRef = useRef<HTMLDivElement>(null);
  const cuisineDropdownRef = useRef<HTMLDivElement>(null);

  const goals = Object.values(HealthGoal);

  // Syncing with Profile
  const handleGoalSelection = (newGoal: HealthGoal) => {
    setSelectedGoal(newGoal);
    setIsGoalDropdownOpen(false);
    setGoalSearchQuery('');
    
    const updatedGoals = [newGoal, ...profile.goals.filter(g => g !== newGoal)];
    onUpdateProfile({ ...profile, goals: updatedGoals });
  };

  const handleCuisineSelection = (cuisine: string) => {
    if (cuisine === 'Other') {
      setIsOtherCuisine(true);
      setSelectedCuisine(''); // Let user type
    } else {
      setIsOtherCuisine(false);
      setSelectedCuisine(cuisine);
      onUpdateProfile({ ...profile, cuisinePreference: cuisine });
    }
    setIsCuisineDropdownOpen(false);
  };

  const handleCustomCuisineChange = (value: string) => {
    setSelectedCuisine(value);
    // Debounce or update on blur might be better, but for simplicity:
    onUpdateProfile({ ...profile, cuisinePreference: value });
  };

  useEffect(() => {
    localStorage.setItem('mavita_selected_goal', selectedGoal);
    localStorage.setItem('mavita_selected_cuisine', selectedCuisine);
  }, [selectedGoal, selectedCuisine]);

  useEffect(() => {
    const cacheKey = `mavita_recipes_${selectedGoal}_${selectedCuisine.replace(/\s+/g, '_')}`;
    const cachedData = localStorage.getItem(cacheKey);
    if (cachedData) {
      setRecipes(JSON.parse(cachedData));
    } else {
      setRecipes([]);
    }
  }, [selectedGoal, selectedCuisine]);

  const filteredGoals = useMemo(() => {
    return goals.filter(goal => goal.toLowerCase().includes(goalSearchQuery.toLowerCase()));
  }, [goalSearchQuery]);

  const handleGenerate = async () => {
    if (!selectedCuisine.trim()) return;
    setLoading(true);
    try {
      const result = await generateLongevityPlate(selectedGoal, selectedCuisine);
      setRecipes(result);
      const cacheKey = `mavita_recipes_${selectedGoal}_${selectedCuisine.replace(/\s+/g, '_')}`;
      localStorage.setItem(cacheKey, JSON.stringify(result));
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (goalDropdownRef.current && !goalDropdownRef.current.contains(event.target as Node)) setIsGoalDropdownOpen(false);
      if (cuisineDropdownRef.current && !cuisineDropdownRef.current.contains(event.target as Node)) setIsCuisineDropdownOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      <div className="text-center space-y-3">
        <h2 className="text-4xl font-bold text-[#1F4D54] font-display tracking-tight">Longevity Plate Builder</h2>
        <p className="text-slate-500 max-w-sm mx-auto text-sm font-medium">Design bio-optimized meals to support specific biological pathways.</p>
      </div>

      <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-xl shadow-slate-100/50 space-y-8 relative overflow-visible">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Health Goal Selector */}
          <div className="relative z-30 space-y-4" ref={goalDropdownRef}>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-[0.25em] ml-2">Preventive Focus</label>
            <button
              onClick={() => { setIsGoalDropdownOpen(!isGoalDropdownOpen); setIsCuisineDropdownOpen(false); }}
              className="w-full flex items-center justify-between bg-slate-50 border border-slate-200 p-5 rounded-2xl hover:border-emerald-300 transition-all active:scale-[0.99]"
            >
              <div className="flex items-center gap-3">
                <div className="bg-emerald-500/10 p-2 rounded-xl text-emerald-600"><Filter size={18} /></div>
                <span className="font-bold text-slate-800 text-sm truncate max-w-[150px]">{selectedGoal}</span>
              </div>
              <ChevronDown className={`text-slate-400 transition-transform ${isGoalDropdownOpen ? 'rotate-180' : ''}`} size={20} />
            </button>

            {isGoalDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-3 bg-white border border-slate-200 rounded-3xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                <div className="p-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
                  <Search size={18} className="text-slate-400" />
                  <input
                    autoFocus
                    type="text"
                    placeholder="Search goals..."
                    className="w-full bg-transparent border-none focus:ring-0 text-sm font-medium text-slate-700"
                    value={goalSearchQuery}
                    onChange={(e) => setGoalSearchQuery(e.target.value)}
                  />
                </div>
                <div className="max-h-64 overflow-y-auto p-2">
                  {filteredGoals.map((goal) => (
                    <button
                      key={goal}
                      onClick={() => handleGoalSelection(goal)}
                      className={`w-full text-left p-4 rounded-xl flex items-center justify-between ${selectedGoal === goal ? 'bg-emerald-50 text-emerald-700 font-bold' : 'hover:bg-slate-50 text-slate-600'}`}
                    >
                      <span className="text-sm">{goal}</span>
                      {selectedGoal === goal && <Check size={16} />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Cuisine Preference Selector */}
          <div className="relative z-20 space-y-4" ref={cuisineDropdownRef}>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-[0.25em] ml-2">Cuisine Palette</label>
            <div className="space-y-3">
              <button
                onClick={() => { setIsCuisineDropdownOpen(!isCuisineDropdownOpen); setIsGoalDropdownOpen(false); }}
                className="w-full flex items-center justify-between bg-slate-50 border border-slate-200 p-5 rounded-2xl hover:border-emerald-300 transition-all active:scale-[0.99]"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-amber-500/10 p-2 rounded-xl text-amber-600"><Globe size={18} /></div>
                  <span className="font-bold text-slate-800 text-sm truncate max-w-[150px]">
                    {isOtherCuisine ? 'Other' : selectedCuisine}
                  </span>
                </div>
                <ChevronDown className={`text-slate-400 transition-transform ${isCuisineDropdownOpen ? 'rotate-180' : ''}`} size={20} />
              </button>

              {/* Conditional Input for "Other" */}
              {isOtherCuisine && (
                <div className="flex items-center gap-3 bg-amber-50/50 border border-amber-200 p-4 rounded-2xl animate-in slide-in-from-top-2">
                  <Edit3 size={18} className="text-amber-600" />
                  <input 
                    type="text"
                    placeholder="Enter custom cuisine (e.g. French)"
                    className="w-full bg-transparent border-none focus:ring-0 text-sm font-bold text-amber-900 placeholder:text-amber-300"
                    value={selectedCuisine}
                    onChange={(e) => handleCustomCuisineChange(e.target.value)}
                  />
                </div>
              )}
            </div>

            {isCuisineDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-3 bg-white border border-slate-200 rounded-3xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                <div className="max-h-64 overflow-y-auto p-2">
                  {[...standardCuisines, 'Other'].map((cuisine) => (
                    <button
                      key={cuisine}
                      onClick={() => handleCuisineSelection(cuisine)}
                      className={`w-full text-left p-4 rounded-xl flex items-center justify-between ${
                        (cuisine === 'Other' && isOtherCuisine) || (selectedCuisine === cuisine && !isOtherCuisine) 
                        ? 'bg-amber-50 text-amber-700 font-bold' : 'hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      <span className="text-sm">{cuisine}</span>
                      {((cuisine === 'Other' && isOtherCuisine) || (selectedCuisine === cuisine && !isOtherCuisine)) && <Check size={16} />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading || !selectedCuisine}
          className="w-full bg-[#1F4D54] text-white py-6 rounded-2xl font-bold flex items-center justify-center gap-3 shadow-2xl shadow-teal-100 hover:bg-[#163B41] active:scale-[0.98] transition-all disabled:opacity-50 text-lg"
        >
          {loading ? <><Loader2 className="animate-spin" size={24} /><span>Sequencing...</span></> : <><Sparkles size={24} /><span>Generate Recipes</span></>}
        </button>
      </div>

      {/* Recipes Listing */}
      <div className="space-y-8 pb-12">
        {recipes.length > 0 ? (
          recipes.map((recipe, idx) => (
            <div key={idx} className="bg-white rounded-[3rem] border border-slate-200 overflow-hidden shadow-sm animate-in slide-in-from-bottom-6">
              <div className="bg-emerald-50/50 p-6 flex items-center justify-between border-b border-emerald-100">
                <div className="flex items-center gap-4">
                  <div className="bg-white p-3 rounded-2xl text-emerald-600 shadow-sm border border-emerald-50"><ChefHat size={24} /></div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-xl tracking-tight leading-tight">{recipe.title}</h4>
                    <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mt-1">Bio-Optimized Protocol • {selectedCuisine}</p>
                  </div>
                </div>
              </div>
              <div className="p-8 space-y-8">
                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                  <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2"><HeartPulse size={14} className="text-emerald-500" /> Preventive Mechanism</h5>
                  <p className="text-sm text-slate-700 leading-relaxed font-semibold italic">"{recipe.biologicalBenefits}"</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-4">
                    <h5 className="font-bold text-slate-900 text-sm flex items-center gap-3 uppercase tracking-widest"><BookOpen size={18} className="text-emerald-500" /> Ingredients</h5>
                    <ul className="space-y-3">
                      {recipe.ingredients.map((ing, i) => (
                        <li key={i} className="text-sm text-slate-600 flex items-start gap-3">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                          <span className="font-medium">{ing}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="space-y-4">
                    <h5 className="font-bold text-slate-900 text-sm flex items-center gap-3 uppercase tracking-widest"><Check size={18} className="text-emerald-500" /> Protocol</h5>
                    <ul className="space-y-4">
                      {recipe.instructions.map((step, i) => (
                        <li key={i} className="text-sm text-slate-600 flex gap-4">
                          <span className="font-bold text-emerald-500 tabular-nums bg-emerald-50 w-6 h-6 rounded-full flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5">{i + 1}</span>
                          <span className="font-medium leading-relaxed">{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : !loading && (
          <div className="bg-white p-12 rounded-[3rem] border border-dashed border-slate-200 text-center space-y-4">
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 mx-auto"><Sparkles size={32} /></div>
            <p className="text-slate-800 font-bold">No biological maps generated</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlateBuilder;