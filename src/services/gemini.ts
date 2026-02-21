
import { GoogleGenAI, Type } from "@google/genai";
import { HealthGoal, MealAnalysis, Recipe, UserProfile } from "../../types";

// Always use the process.env.API_KEY directly for initialization
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeMealImage = async (base64Image: string, mimeType: string, profile: UserProfile): Promise<MealAnalysis> => {
  const model = 'gemini-3-flash-preview';
  
  const prompt = `
    ACT AS: Clinical Bio-Nutritional Scientist.
    CONTEXT: User goals: ${profile.goals.join(', ')}.
    
    TASK: Analyze meal image for biological impact.
    
    STRICT RULES:
    1. Be concise. Accuracy is critical.
    2. Only identify nutrients verified in identified ingredients.
    3. If not food, set isFood to false.
    
    DATA SCHEMA:
    1. isFood: Boolean.
    2. foodName: Clear ID.
    3. glycemicScore: 1-10.
    4. iIndexScore: 0-100 (Inflammation).
    5. description: 1-sentence metabolic summary.
    6. portionAnalysis: Macro balance.
    7. macronutrients: Gram estimates (Protein, Carbs, Fats, Fiber).
    8. biologicalPathways: Mechanistic tags (e.g., Sirtuin, GLP-1).
    9. pairingSuggestions: Science-backed improvements.
    10. nutrients: 2-3 key micros + benefits.
    11. goalAlignment: Link to ${profile.goals[0]}.
    12. healthRisks: Mandatory metabolic triggers (High sodium, trans fats, etc).
  `;

  const response = await ai.models.generateContent({
    model,
    contents: {
      parts: [
        { inlineData: { data: base64Image, mimeType: mimeType } },
        { text: prompt }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          isFood: { type: Type.BOOLEAN },
          foodName: { type: Type.STRING },
          description: { type: Type.STRING },
          glycemicScore: { type: Type.NUMBER },
          iIndexScore: { type: Type.NUMBER },
          portionAnalysis: { type: Type.STRING },
          macronutrients: {
            type: Type.OBJECT,
            properties: {
              protein: { type: Type.STRING },
              carbs: { type: Type.STRING },
              fats: { type: Type.STRING },
              fiber: { type: Type.STRING }
            }
          },
          biologicalPathways: { type: Type.ARRAY, items: { type: Type.STRING } },
          pairingSuggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
          nutrients: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                benefit: { type: Type.STRING }
              }
            }
          },
          goalAlignment: { type: Type.STRING },
          healthRisks: { type: Type.STRING }
        },
        required: ["isFood", "foodName", "description", "glycemicScore", "iIndexScore", "portionAnalysis", "macronutrients", "biologicalPathways", "pairingSuggestions", "nutrients", "goalAlignment", "healthRisks"]
      }
    }
  });

  const rawText = response.text?.trim();
  if (!rawText) {
    throw new Error("No response received from analysis. Please try again.");
  }
  try {
    const data = JSON.parse(rawText);
    return {
      ...data,
      id: crypto.randomUUID(),
      timestamp: Date.now()
    };
  } catch (e) {
    console.error("Clinical Interpretation Error:", rawText);
    throw new Error("Precision mismatch. Please capture a clearer, well-lit image.");
  }
};

export const generateLongevityPlate = async (goal: HealthGoal, cuisine: string): Promise<Recipe[]> => {
  const model = 'gemini-3-flash-preview';
  const prompt = `As a Medical Nutritionist, generate 3 clinical recipes for "${goal}" in "${cuisine}" style. Focus on metabolic synergy and biological longevity.`;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            ingredients: { type: Type.ARRAY, items: { type: Type.STRING } },
            instructions: { type: Type.ARRAY, items: { type: Type.STRING } },
            biologicalBenefits: { type: Type.STRING }
          },
          required: ["title", "ingredients", "instructions", "biologicalBenefits"]
        }
      }
    }
  });

  const rawText = response.text?.trim();
  if (!rawText) {
    throw new Error("No response received from recipe generation. Please try again.");
  }
  return JSON.parse(rawText);
};

export const generateBioReport = async (meals: MealAnalysis[], profile: UserProfile): Promise<string> => {
  const model = 'gemini-3-flash-preview';
  const historyText = meals.slice(0, 10).map(m => `- ${m.foodName}: Glycemic ${m.glycemicScore}, Inflammatory ${m.iIndexScore}`).join('\n');
  
  const prompt = `Generate a Clinical Metabolic Report for ${profile.name} (Age: ${profile.age}) based on these recent meals:\n${historyText}\nProvide actionable healthspan advice based on their goals: ${profile.goals.join(', ')}.`;

  const response = await ai.models.generateContent({
    model,
    contents: prompt
  });

  const rawText = response.text?.trim();
  if (!rawText) {
    throw new Error("No response received from recipe generation. Please try again.");
  }
  return JSON.parse(rawText);
};
