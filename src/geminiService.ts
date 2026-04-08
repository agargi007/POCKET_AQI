import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function getHealthRecommendations(aqi: number, age: number, conditions: string[]) {
  const model = "gemini-3-flash-preview";
  const prompt = `Provide an extremely comprehensive, professional, and highly detailed personalized health risk assessment for an individual with the following profile:
  - Age: ${age}
  - Health Conditions: ${conditions.join(", ") || "None"}
  - Current Air Quality Index (AQI): ${aqi} (Scale 1-5, where 1 is Good and 5 is Very Poor)
  
  Your response must be a deep dive into the physiological impacts of the current air quality on this specific individual.
  
  Please provide the response in a strict JSON format with the following structure:
  {
    "riskLevel": "Low" | "Moderate" | "High" | "Critical",
    "summary": "A lengthy, 4-5 sentence detailed analysis of the specific physiological risks. Explain HOW the pollutants interact with the user's existing conditions (if any) and age-related vulnerabilities.",
    "actions": [
      { 
        "title": "Action Title", 
        "description": "A very thorough explanation (3-4 sentences) of the action. Include scientific reasoning, specific timing (e.g., 'between 10 AM and 4 PM'), and practical implementation steps.", 
        "icon": "shield" | "wind" | "activity" | "map-pin" 
      }
    ],
    "activityAdvice": [
      { 
        "activity": "Activity Name (e.g., High-Intensity Interval Training, Daily Commute, Outdoor Socializing)", 
        "advice": "Extremely specific and nuanced advice. If the activity is allowed, suggest modifications to reduce exposure. If not allowed, explain the specific danger.", 
        "allowed": boolean 
      }
    ],
    "generalTips": [
      "Highly specific medical-grade tip (e.g., specific antioxidant-rich foods like Vitamin C/E to combat oxidative stress from PM2.5)",
      "Environmental tip (e.g., specific HEPA filter ratings or indoor plant recommendations)",
      "Long-term health monitoring tip"
    ]
  }
  
  The advice should be authoritative, informative, and significantly more detailed than a standard summary. Tailor every single word to the user's age and health profile.
  
  Do not include any markdown formatting or extra text, just the JSON.`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error generating recommendations:", error);
    return JSON.stringify({
      riskLevel: "Moderate",
      summary: "Failed to generate personalized recommendations. Please follow general health guidelines.",
      actions: [],
      activityAdvice: [],
      generalTips: ["Stay hydrated", "Avoid heavy exercise outdoors"]
    });
  }
}
