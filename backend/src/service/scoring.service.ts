import { logger } from "./logger.service";

export const calculateTrustScore = (claims: any[]) => {
  if (claims.length === 0) {
    return {
      score: 50,
      label: "No Claims",
      summary: "No verifiable claims found in the text."
    };
  }

  // Count claim types
  const verified = claims.filter(c => c.status === "verified").length;
  const uncertain = claims.filter(c => c.status === "uncertain").length;
  const hallucinated = claims.filter(c => c.status === "hallucinated").length;
  const total = claims.length;

  // Calculate weighted score
  // VERIFIED = +1, UNCERTAIN = +0.3, HALLUCINATED = -1.5
  let score = 0;
  score += verified * 1.0;
  score += uncertain * 0.3;
  score += hallucinated * -1.5;

  // Normalize to 0-100 scale
  // Max score = total * 1.0, Min score = total * -1.5
  const maxScore = total * 1.0;
  const minScore = total * -1.5;
  const normalizedScore = ((score - minScore) / (maxScore - minScore)) * 100;
  const finalScore = Math.max(0, Math.min(100, normalizedScore));

  // Determine label based on claim distribution
  let label: string;
  let summary: string;

  if (hallucinated > 0) {
    // ANY hallucinations = warning
    if (hallucinated >= total * 0.5) {
      label = "High Risk - Multiple Hallucinations";
      summary = `${hallucinated} of ${total} claims contain false information. Manual review strongly recommended.`;
    } else if (hallucinated >= 2) {
      label = "Review Required - Hallucinations Detected";
      summary = `${hallucinated} hallucinated claims detected. Verify all information before use.`;
    } else {
      label = "Caution - Hallucination Detected";
      summary = `${hallucinated} claim appears to contain false information.`;
    }
  } else if (verified >= total * 0.7) {
    label = "High Confidence";
    summary = `${verified} of ${total} claims verified against trusted sources.`;
  } else if (verified >= total * 0.5) {
    label = "Moderate Confidence";
    summary = `${verified} verified, ${uncertain} uncertain. Some claims need additional verification.`;
  } else if (uncertain >= total * 0.7) {
    label = "Low Confidence - Mostly Uncertain";
    summary = `Only ${verified} of ${total} claims could be verified. Most claims need manual review.`;
  } else {
    label = "Review Recommended";
    summary = `Mixed results: ${verified} verified, ${uncertain} uncertain, ${hallucinated} hallucinated.`;
  }

  console.log(`[TrustScore] V=${verified}, U=${uncertain}, H=${hallucinated} → Score=${Math.round(finalScore)}, Label="${label}"`);
  logger.trustScore(Math.round(finalScore), label);

  return {
    score: Math.round(finalScore),
    label,
    summary,
    breakdown: {
      verified,
      uncertain,
      hallucinated,
      total
    }
  };
};

