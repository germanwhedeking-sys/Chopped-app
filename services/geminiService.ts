
import { GoogleGenAI } from "@google/genai";
import { UserProfile } from "../types";

// The API key will be obtained exclusively from the environment variable process.env.API_KEY.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeProfileVibe = async (profile: UserProfile): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analyze this dating profile for a "realness" check. 
      Name: ${profile.name}
      Self-Rating: ${profile.selfRating}/10
      Bio: ${profile.bio}
      Red Flags: ${profile.redFlags.join(', ')}
      
      Provide a 1-sentence humorous but encouraging summary of their "vibe" that fits an app for "down-to-earth" people. Be slightly edgy but kind.`,
    });
    // The .text property is a getter, not a method.
    return response.text || "Just a normal human looking for another normal human.";
  } catch (error) {
    console.error("Gemini analysis failed", error);
    return "Authentic and ready to mingle.";
  }
};

export const getMatchInsight = async (userBio: string, matchProfile: UserProfile): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Explain why these two "average but awesome" people might get along. 
      User Bio: ${userBio}
      Match: ${matchProfile.name}, Bio: ${matchProfile.bio}, Interests: ${matchProfile.interests.join(', ')}
      
      Keep it short (max 2 sentences), funny, and grounded in reality. Avoid toxic positivity.`,
    });
    // The .text property is a getter, not a method.
    return response.text || "You both seem like you'd enjoy a quiet night in.";
  } catch (error) {
    return "You both have similar energy.";
  }
};
