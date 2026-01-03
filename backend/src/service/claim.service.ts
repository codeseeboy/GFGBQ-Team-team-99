import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export const extractClaims = async (text: string): Promise<string[]> => {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

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

  try {
    const result = await model.generateContent(prompt);
    const output = result.response.text();

    // Try parsing as JSON
    const cleaned = output.replace(/```json|```/g, "").trim();
    return JSON.parse(cleaned);
  } catch (err) {
    console.warn("Gemini parse failed, using fallback splitter", err);
    // Fallback: simple sentence split
    return text
      .split(".")
      .map((s) => s.trim())
      .filter((s) => s.length > 10);
  }
};
