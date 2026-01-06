
import { GoogleGenAI } from '@google/genai';

/**
 * Note: Actual calls are made directly in components to ensure fresh API key usage 
 * per the coding guidelines, but this service can house configuration constants.
 */

export const GEMINI_MODEL = 'gemini-3-flash-preview';

export const getGeminiInstance = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};
