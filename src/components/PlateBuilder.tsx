
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { HealthGoal, Recipe, UserProfile } from '../../types';
import { generateLongevityPlate } from '../services/gemini';
import { Sparkles, Loader2, BookOpen, ChefHat, HeartPulse, Search, ChevronDown, Check, Filter, Trash2, Globe } from 'lucide-react';

interface PlateBuilderProps {
  profile: UserProfile;
  onUpdateProfile: (profile: UserProfile) => void;
}

const PlateBuilder: React.FC<PlateBuilderProps> = ({ profile, onUpdateProfile }) => {
  // Initialize state from profile goals (primary focus) or localStorage
  const [selectedGoal, setSelectedGoal] = useState<HealthGoal>(() => {
    const savedGoal = localStorage.getItem('mavita_selected_goal');
    // Default to the first goal in the profile if no local preference is saved
    return (savedGoal as HealthGoal) || (profile.goals[0] as HealthGoal) || HealthGoal.RADIANT_GLOW;
  });

  const [selectedCuisine, setSelectedCuisine] = useState<string>(() => {
    const savedCuisine = localStorage.getItem('mavita_selected_cuisine');
    return savedCuisine || profile.cuisinePreference || 'Mediterranean';
  });
  
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [isGoalDropdownOpen, setIsGoalDropdownOpen] = useState(false);
  const [isCuisineDropdownOpen, setIsCuisineDropdownOpen] = useState(false);
  const [goalSearchQuery, setGoalSearchQuery] = useState('');
  
  const goalDropdownRef = useRef<HTMLDivElement>(null);
  const cuisineDropdownRef = useRef<HTMLDivElement>(null);

  const goals = Object.values(HealthGoal);
  const cuisines = [
    'Mediterranean', 'Japanese', 'Indian', 'Mexican', 'Italian', 'Thai', 'Middle Eastern', 'Scandinavian', 'Standard American', 'Continental'
  ];

  // Sync selected goal with profile when it changes
  const handleGoalSelection = (newGoal: HealthGoal) => {
    setSelectedGoal(newGoal);
    setIsGoalDropdownOpen(false);
    setGoalSearchQuery('');
    localStorage.setItem('mavita_selected_goal', newGoal);

    // Update the profile's primary health goal to match the builder's selection
    const updatedGoals = [
      newGoal,
      ...profile.goals.filter(g => g !== newGoal)
    ];
    onUpdateProfile({ ...profile, goals: updatedGoals });
  };

  // Persistence: Save the selected states whenever they change
  useEffect(() => {
    localStorage.setItem('mavita_selected_goal', selectedGoal);
    localStorage.setItem('mavita_selected_cuisine', selectedCuisine);
  }, [selectedGoal, selectedCuisine]);

  // Load cached recipes for the selected combination
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
    return goals.filter(goal => 
      goal.toLowerCase().includes(goalSearchQuery.toLowerCase())
    );
  }, [goalSearchQuery, goals]);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const result = await generateLongevityPlate(selectedGoal, selectedCuisine);
      setRecipes(result);
      
      // Update cache
      const cacheKey = `mavita_recipes_${selectedGoal}_${selectedCuisine.replace(/\s+/g, '_')}`;
      localStorage.setItem(cacheKey, JSON.stringify(result));
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  const clearCacheForCombo = () => {
    const cacheKey = `mavita_recipes_${selectedGoal}_${selectedCuisine.replace(/\s+/g, '_')}`;
    localStorage.removeItem(cacheKey);
    setRecipes([]);
  };

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (goalDropdownRef.current && !goalDropdownRef.current.contains(event.target as Node)) {
        setIsGoalDropdownOpen(false);
      }
      if (cuisineDropdownRef.current && !cuisineDropdownRef.current.contains(event.target as Node)) {
        setIsCuisineDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      <div className="text-center space-y-3">
        <h2 className="text-4xl font-bold text-slate-900 font-display tracking-tight text-[#1F4D54]">Longevity Plate Builder</h2>
        <p className="text-slate-500 max-w-sm mx-auto text-sm font-medium">Design bio-optimized meals to support specific biological pathways.</p>
      </div>

      <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-xl shadow-slate-100/50 space-y-8 relative overflow-visible">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-[5rem] -z-0 opacity-50 overflow-hidden pointer-events-none" />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Health Goal Dropdown */}
          <div className="relative z-30 space-y-4" ref={goalDropdownRef}>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-[0.25em] ml-2">Preventive Focus</label>
            <div className="relative">
              <button
                onClick={() => { setIsGoalDropdownOpen(!isGoalDropdownOpen); setIsCuisineDropdownOpen(false); }}
                className="w-full flex items-center justify-between bg-slate-50 border border-slate-200 p-5 rounded-2xl hover:border-emerald-300 transition-all group active:scale-[0.99]"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-emerald-500/10 p-2 rounded-xl text-emerald-600">
                    <Filter size={18} />
                  </div>
                  <span className="font-bold text-slate-800 text-sm md:text-base truncate max-w-[150px]">{selectedGoal}</span>
                </div>
                <ChevronDown className={`text-slate-400 transition-transform duration-300 ${isGoalDropdownOpen ? 'rotate-180' : ''}`} size={20} />
              </button>

              {isGoalDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-3 bg-white border border-slate-200 rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.2)] z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
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
                  <div className="max-h-64 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-slate-200">
                    {filteredGoals.map((goal) => (
                      <button
                        key={goal}
                        onClick={() => handleGoalSelection(goal)}
                        className={`w-full text-left p-4 rounded-xl flex items-center justify-between transition-colors ${selectedGoal === goal ? 'bg-emerald-50 text-emerald-700 font-bold' : 'hover:bg-slate-50 text-slate-600 font-medium'}`}
                      >
                        <span className="text-sm">{goal}</span>
                        {selectedGoal === goal && <Check size={16} className="text-emerald-500" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Cuisine Preference Dropdown */}
          <div className="relative z-20 space-y-4" ref={cuisineDropdownRef}>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-[0.25em] ml-2">Cuisine Palette</label>
            <div className="relative">
              <button
                onClick={() => { setIsCuisineDropdownOpen(!isCuisineDropdownOpen); setIsGoalDropdownOpen(false); }}
                className="w-full flex items-center justify-between bg-slate-50 border border-slate-200 p-5 rounded-2xl hover:border-emerald-300 transition-all group active:scale-[0.99]"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-amber-500/10 p-2 rounded-xl text-amber-600">
                    <Globe size={18} />
                  </div>
                  <span className="font-bold text-slate-800 text-sm md:text-base truncate max-w-[150px]">{selectedCuisine}</span>
                </div>
                <ChevronDown className={`text-slate-400 transition-transform duration-300 ${isCuisineDropdownOpen ? 'rotate-180' : ''}`} size={20} />
              </button>

              {isCuisineDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-3 bg-white border border-slate-200 rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.2)] z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="max-h-64 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-slate-200">
                    {cuisines.map((cuisine) => (
                      <button
                        key={cuisine}
                        onClick={() => { setSelectedCuisine(cuisine); setIsCuisineDropdownOpen(false); }}
                        className={`w-full text-left p-4 rounded-xl flex items-center justify-between transition-colors ${selectedCuisine === cuisine ? 'bg-amber-50 text-amber-700 font-bold' : 'hover:bg-slate-50 text-slate-600 font-medium'}`}
                      >
                        <span className="text-sm">{cuisine}</span>
                        {selectedCuisine === cuisine && <Check size={16} className="text-amber-500" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-3 relative z-10 pt-4">
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="flex-1 bg-[#1F4D54] text-white py-6 rounded-2xl font-bold flex items-center justify-center gap-3 shadow-2xl shadow-teal-100 hover:bg-[#163B41] active:scale-[0.98] transition-all disabled:opacity-50 text-lg"
          >
            {loading ? (
              <><Loader2 className="animate-spin" size={24} /><span>Sequencing...</span></>
            ) : (
              <><Sparkles size={24} /><span>{recipes.length > 0 ? 'Regenerate Recipes' : 'Generate Recipes'}</span></>
            )}
          </button>
          
          {recipes.length > 0 && !loading && (
            <button
              onClick={clearCacheForCombo}
              title="Clear cache"
              className="bg-slate-100 text-slate-400 p-6 rounded-2xl hover:bg-rose-50 hover:text-rose-500 transition-all active:scale-[0.98]"
            >
              <Trash2 size={24} />
            </button>
          )}
        </div>
      </div>

      <div className="space-y-8 pb-12 relative z-0">
        {recipes.length > 0 ? (
          recipes.map((recipe, idx) => (
            <div 
              key={idx} 
              className="bg-white rounded-[3rem] border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all animate-in slide-in-from-bottom-6 duration-500" 
              style={{ animationDelay: `${idx * 150}ms` }}
            >
              <div className="bg-emerald-50/50 p-6 flex items-center justify-between border-b border-emerald-100">
                <div className="flex items-center gap-4">
                  <div className="bg-white p-3 rounded-2xl text-emerald-600 shadow-sm border border-emerald-50">
                    <ChefHat size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-xl tracking-tight leading-tight">{recipe.title}</h4>
                    <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mt-1">Bio-Optimized Protocol • {selectedCuisine}</p>
                  </div>
                </div>
              </div>
              
              <div className="p-8 space-y-8">
                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 relative group overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 text-emerald-500/5 group-hover:text-emerald-500/10 transition-colors">
                     <HeartPulse size={84} />
                  </div>
                  <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <HeartPulse size={14} className="text-emerald-500" />
                    Preventive Mechanism
                  </h5>
                  <p className="text-sm text-slate-700 leading-relaxed font-semibold italic relative z-10">"{recipe.biologicalBenefits}"</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-4">
                    <h5 className="font-bold text-slate-900 text-sm flex items-center gap-3 uppercase tracking-widest">
                      <BookOpen size={18} className="text-emerald-500" />
                      Ingredients
                    </h5>
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
                    <h5 className="font-bold text-slate-900 text-sm flex items-center gap-3 uppercase tracking-widest">
                      <Check size={18} className="text-emerald-500" />
                      Protocol
                    </h5>
                    <ul className="space-y-4">
                      {recipe.instructions.map((step, i) => (
                        <li key={i} className="text-sm text-slate-600 flex gap-4">
                          <span className="font-bold text-emerald-500 tabular-nums bg-emerald-50 w-6 h-6 rounded-full flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5">
                            {i + 1}
                          </span>
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
          <div className="bg-white p-12 rounded-[3rem] border border-dashed border-slate-200 text-center space-y-4 shadow-inner">
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 mx-auto">
              <Sparkles size={32} />
            </div>
            <div className="space-y-1">
              <p className="text-slate-800 font-bold">No biological maps generated</p>
              <p className="text-slate-400 text-sm">Targeting {selectedGoal} in {selectedCuisine} style.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlateBuilder;
