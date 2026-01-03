import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";
import OpenAI from "openai";
import { logger } from "./logger.service";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const openrouter = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
  defaultHeaders: {
    "HTTP-Referer": "http://localhost:3000",
    "X-Title": "TrustLayer AI Verification",
  },
});

export const extractClaims = async (text: string): Promise<string[]> => {
  logger.extracting(text);
  
  const prompt = `
Extract factual claims only from the text below.
Rules:
- One claim per line
- No opinions or subjective statements
- No explanations
- Return ONLY a JSON array of strings

Text:
${text}
`;

  // Try Gemini first
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    const output = result.response.text();
    const cleaned = output.replace(/```json|```/g, "").trim();
    console.log("[ExtractClaims-Gemini] Successfully extracted claims");
    const claims = JSON.parse(cleaned);
    logger.extractSuccess(claims.length);
    return claims;
  } catch (geminiErr) {
    console.log("[ExtractClaims] Gemini failed, trying Groq...");
  }

  // Try Groq as fallback
  try {
    const response = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      temperature: 0.3,
      max_tokens: 1000
    });
    const output = response.choices[0]?.message?.content || "[]";
    const cleaned = output.replace(/```json|```/g, "").trim();
    console.log("[ExtractClaims-Groq] Successfully extracted claims");
    const claims = JSON.parse(cleaned);
    logger.extractSuccess(claims.length);
    return claims;
  } catch (groqErr) {
    console.log("[ExtractClaims] Groq failed, trying OpenRouter...");
  }

  // Try OpenRouter as third fallback
  try {
    const response = await openrouter.chat.completions.create({
      model: "meta-llama/llama-3-70b-instruct",
      temperature: 0.1,
      max_tokens: 1000,
      messages: [{ role: "user", content: prompt }]
    });
    const output = response.choices[0]?.message?.content || "[]";
    const cleaned = output.replace(/```json|```/g, "").trim();
    console.log("[ExtractClaims-OpenRouter] Successfully extracted claims");
    const claims = JSON.parse(cleaned);
    logger.extractSuccess(claims.length);
    return claims;
  } catch (openrouterErr) {
    console.warn("[ExtractClaims] All AI providers failed, using fallback splitter");
    // Fallback: simple sentence split
    const claims = text
      .split(".")
      .map((s) => s.trim())
      .filter((s) => s.length > 10);
    logger.extractSuccess(claims.length);
    return claims;
  }
};
