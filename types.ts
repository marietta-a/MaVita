
export enum HealthGoal {
  RADIANT_GLOW = 'Radiant Glow',
  WEIGHT_MANAGEMENT = 'Weight Management',
  DIABETIC = 'Diabetic',
  CARDIAC = 'Cardiac',
  RENAL = 'Renal',
  GASTROINTESTINAL = 'Gastrointestinal',
  LIVER = 'Liver Disease',
  ONCOLOGY = 'Cancer & Oncology',
  NEUROLOGICAL = 'Neurological',
  METABOLIC = 'Metabolic',
  POST_SURGICAL = 'Post-Surgical',
  PULMONARY = 'Pulmonary',
  PEDIATRIC = 'Pediatric',
  EYE_HEALTH = 'Eye Health',
  GASTRITIC = 'Gastritic'
}

export interface UserProfile {
  name: string;
  age: number;
  familyHistory: string[];
  lifestyle: 'Sedentary' | 'Moderate' | 'Active' | 'Athlete';
  stressLevels: 'Low' | 'Medium' | 'High';
  goals: HealthGoal[];
  cuisinePreference: string;
  onboarded: boolean;
  avatarUrl?: string;
}

export interface MealAnalysis {
  id: string;
  isFood: boolean;
  foodName: string;
  description: string;
  glycemicScore: number; // 1-10
  iIndexScore: number; // 0-100
  portionAnalysis: string;
  macronutrients: {
    protein: string;
    carbs: string;
    fats: string;
    fiber: string;
  };
  biologicalPathways: string[];
  pairingSuggestions: string[];
  nutrients: {
    name: string;
    benefit: string;
  }[];
  goalAlignment: string;
  healthRisks: string;
  timestamp: string | number;
  imageUrl?: string;
  userNotes?: string;
}

export interface Recipe {
  title: string;
  ingredients: string[];
  instructions: string[];
  biologicalBenefits: string;
}
