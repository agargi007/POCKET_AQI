import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function getHealthRecommendations(aqi: number, age: number, conditions: string[]) {
  const model = "gemini-3-flash-preview";
  const prompt = `Provide personalized health recommendations for someone with the following profile:
  - Age: ${age}
  - Health Conditions: ${conditions.join(", ") || "None"}
  - Current Air Quality Index (AQI): ${aqi} (Scale 1-5, where 1 is Good and 5 is Very Poor)
  
  Please provide:
  1. A summary of the risk level.
  2. Specific actions to take (e.g., mask usage, air purifier, exercise).
  3. Activity-specific advice (e.g., outdoor running, walking).
  
  Format the response in Markdown.`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error generating recommendations:", error);
    return "Failed to generate personalized recommendations. Please follow general health guidelines.";
  }
}
