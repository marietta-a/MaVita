import { json } from "stream/consumers";
import { 
  UserProfile, 
  MealAnalysis, 
  Recipe, 
  HealthGoal,
  RecipeRequest,
  BioReportRequest
} from "../../types";
import { buildReport } from "../helpers/reportBuilder";

const API_BASE_URL = process.env.API_BASE_URL;


/**
 * Converts a Base64 string to a binary Blob for FormData upload.
 */
const base64ToBlob = (base64: string, mimeType: string): Blob => {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
};

/**
 * Endpoint: POST /analyze-meal
 * Sends image as multipart/form-data and profile as JSON string field.
 */
export const analyzeMealImage = async (
  base64Image: string, 
  mimeType: string, 
  profile: UserProfile
): Promise<MealAnalysis> => {
  try {
    const formData = new FormData();
    
    // 1. Convert Base64 image back to Blob
    const imageBlob = base64ToBlob(base64Image, mimeType);
    formData.append('file', imageBlob, 'meal_scan.jpg');

    // 2. Prepare Profile JSON
    formData.append('profile', JSON.stringify(profile));

    const response = await fetch(`${API_BASE_URL}/analyze-meal`, {
      method: 'POST',
      body: formData, 
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error ${response.status}: ${errorText}`);
    }

    const data = await response.json();

    // Map response to frontend MealAnalysis model
    return {
      ...data,
      id: data.id || crypto.randomUUID(),
      timestamp: data.timestamp || Date.now(),
      imageUrl: `data:${mimeType};base64,${base64Image}` 
    };

  } catch (error) {
    console.error("Meal Analysis Service Error:", error);
    throw new Error("Failed to analyze meal. Please check your connection and try again.");
  }
};

/**
 * Endpoint: POST /generate-recipes
 */
export const generateLongevityPlate = async (goal: HealthGoal, cuisine: string): Promise<Recipe[]> => {
  try {
    const payload: RecipeRequest = {
      goal: goal.toString(),
      cuisine: cuisine
    };

    const response = await fetch(`${API_BASE_URL}/generate-longevity-plate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      console.error(`API Error ${response.status}: ${await response.text()}`);
      console.log(`API Endpoint ${API_BASE_URL}`);
      throw new Error(`Recipe Generation Error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Recipe Service Error:", error);
    throw error;
  }
};

/**
 * Endpoint: POST /generate-report
 */
export const generateBioReport = async (meals: MealAnalysis[], profile: UserProfile): Promise<string> => {
  try {
    // Note: We must manually map the complex MealAnalysis array to the backend's expected structure
    const mealsForApi = meals.map(meal => ({
        id: meal.id,
        timestamp: meal.timestamp,
        isFood: meal.isFood,
        foodName: meal.foodName,
        description: meal.description,
        glycemicScore: meal.glycemicScore,
        iIndexScore: meal.iIndexScore,
        portionAnalysis: meal.portionAnalysis,
        macronutrients: meal.macronutrients,
        biologicalPathways: meal.biologicalPathways,
        pairingSuggestions: meal.pairingSuggestions,
        nutrients: meal.nutrients,
        goalAlignment: meal.goalAlignment,
        healthRisks: meal.healthRisks,
    }));


    const payload: BioReportRequest = {
      meals: mealsForApi as MealAnalysis[], // Type assertion required for structure match
      profile: profile
    };

    const response = await fetch(`${API_BASE_URL}/generate-report`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Report Generation Error: ${response.statusText}`);
    }
    const data = await response.json();
    const report = buildReport(data.report);

    return report;
  } catch (error) {
    console.error("Report Service Error:", error);
    throw error;
  }
};