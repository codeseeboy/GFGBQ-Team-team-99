import { extractClaims } from "./claim.service";
import { verifyClaim } from "./citation.service";
import { calculateTrustScore } from "./scoring.service";
import { VerificationResult } from "../model/VerificationResult";

const analyze = async (text: string, userId?: string) => {
  const claims = await extractClaims(text);

  const verifiedClaims = await Promise.all(
    claims.map(async (c, idx) => {
      const verification = await verifyClaim(c);
      return {
        id: `c${idx + 1}`,
        claim: c, // Frontend expects 'claim' not 'text'
        status: verification.status,
        confidence: verification.confidence,
        explanation: verification.explanation,
        evidence: verification.evidence
      };
    })
  );

  const scoreResult = calculateTrustScore(verifiedClaims);

  const verifiedText = verifiedClaims
    .filter((c) => c.status === "verified")
    .map((c) => c.claim)
    .join(". ");

  // Stopwords and pronouns to filter out from sources
  const badSourceWords = new Set([
    'the', 'a', 'an', 'his', 'her', 'its', 'their', 'he', 'she', 'it', 'they',
    'this', 'that', 'these', 'those', 'is', 'are', 'was', 'were', 'be', 'been',
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should',
    'may', 'might', 'must', 'can', 'however', 'although', 'because', 'since',
    'while', 'when', 'where', 'which', 'who', 'whom', 'whose', 'what', 'how',
    'and', 'or', 'but', 'if', 'then', 'else', 'for', 'with', 'from', 'to', 'of',
    'in', 'on', 'at', 'by', 'as', 'verification engine', 'wikipedia:'
  ]);

  // Helper to check if source title is valid
  const isValidSource = (title: string): boolean => {
    const lowerTitle = title.toLowerCase().trim();
    // Must be at least 3 characters
    if (lowerTitle.length < 3) return false;
    // Check for "Wikipedia: X" pattern and validate X
    if (lowerTitle.startsWith('wikipedia:')) {
      const entity = lowerTitle.replace('wikipedia:', '').trim();
      if (entity.length < 3 || badSourceWords.has(entity)) return false;
    }
    // Check if it's just a stopword
    if (badSourceWords.has(lowerTitle)) return false;
    return true;
  };

  // Extract sources for frontend - CLEANED
  const sources = verifiedClaims
    .flatMap((c) => c.evidence)
    .filter((e) => isValidSource(e.source))
    .filter((e, i, arr) => arr.findIndex((x) => x.source === e.source) === i)
    .map((e) => ({
      title: e.source,
      url: e.url || `https://en.wikipedia.org/wiki/${encodeURIComponent(e.source.replace('Wikipedia: ', '').replace(/ /g, '_'))}`,
      verified: e.verdict.toLowerCase().includes("support")
    }));

  const saved = await VerificationResult.create({
    userId: userId || null,
    originalText: text,
    trustScore: scoreResult.score,
    label: scoreResult.label,
    claims: verifiedClaims,
    verifiedText
  });

  // Build dynamic summary based on claim distribution
  const breakdown = (scoreResult as any).breakdown || {
    verified: verifiedClaims.filter(c => c.status === "verified").length,
    uncertain: verifiedClaims.filter(c => c.status === "uncertain").length,
    hallucinated: verifiedClaims.filter(c => c.status === "hallucinated").length,
    total: verifiedClaims.length
  };

  let summary = (scoreResult as any).summary || `${verifiedClaims.length} claims analyzed`;
  
  // Override with more specific message if hallucinations detected
  if (breakdown.hallucinated > 0) {
    summary = `⚠️ ${breakdown.hallucinated} hallucination${breakdown.hallucinated > 1 ? 's' : ''} detected. ${breakdown.verified} verified, ${breakdown.uncertain} uncertain out of ${breakdown.total} claims.`;
  } else if (breakdown.verified === breakdown.total) {
    summary = `✓ All ${breakdown.total} claims verified against trusted sources.`;
  } else if (breakdown.verified > 0) {
    summary = `${breakdown.verified} of ${breakdown.total} claims verified. ${breakdown.uncertain} claims need additional review.`;
  } else {
    summary = `${breakdown.total} claims analyzed. ${breakdown.uncertain} need additional verification.`;
  }

  // Return format matching frontend expectations
  return {
    analysisId: saved._id,
    score: scoreResult.score,
    label: scoreResult.label,
    claims: verifiedClaims,
    sources,
    verifiedText,
    summary,
    breakdown
  };
};

const getClaims = async (id: string) => {
  const result = await VerificationResult.findById(id);
  if (!result) throw new Error("not_found");
  return result.claims;
};

const getEvidence = async (claimId: string) => {
  // For demo: claim IDs are simple like "c1", "c2"
  // In production you'd index claims separately
  const allResults = await VerificationResult.find().limit(50);
  
  for (const result of allResults) {
    const claim = (result.claims as any[]).find((c: any) => c.id === claimId);
    if (claim) {
      return {
        claimId: claim.id,
        status: claim.status,
        evidence: claim.evidence,
        citationCheck: {
          exists: claim.evidence.length > 0,
          valid: claim.status === "VERIFIED",
          reason:
            claim.status === "VERIFIED"
              ? "Citation matches supporting source"
              : "Citation missing or contradicted"
        }
      };
    }
  }
  
  throw new Error("not_found");
};

const getVerifiedText = async (id: string) => {
  const result = await VerificationResult.findById(id);
  if (!result) throw new Error("not_found");

  const removedClaims = (result.claims as any[])
    .filter((c: any) => c.status !== "verified")
    .map((c: any) => c.claim || c.text);

  return {
    verifiedText: result.verifiedText,
    removedClaims
  };
};

export const verificationService = {
  analyze,
  getClaims,
  getEvidence,
  getVerifiedText
};
