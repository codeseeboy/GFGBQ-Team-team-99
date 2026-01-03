export const extractClaims = async (text: string): Promise<string[]> => {
  // Simple heuristic splitter; swap with LLM extraction when ready.
  return text
    .split('.')
    .map((s) => s.trim())
    .filter((s) => s.length > 10);
};
