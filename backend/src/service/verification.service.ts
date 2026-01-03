import { randomUUID } from 'crypto';
import { extractClaims } from './claim.service.js';
import { verifyClaim } from './citation.service.js';
import { calculateTrustScore, generateSafeRewrite } from './scoring.service.js';
import {
  AnalyzeResponseDto,
  ClaimListItemDto,
  EvidenceResponseDto,
  VerifyResponseDto,
  VerifiedTextResponseDto
} from '../dto/verification.dto.js';
import { ClaimStatus } from '../enums/claim-status.enum.js';
import { verificationDao } from '../dao/verification.dao.js';

type RunRecord = VerifyResponseDto & {
  analysisId: string;
  inputText: string;
  removedClaims: string[];
};

const runs = new Map<string, RunRecord>();
const claimIndex = new Map<string, string>();

const computeVerification = async (text: string): Promise<VerifyResponseDto> => {
  const claims = await extractClaims(text);

  const verifiedClaims = await Promise.all(
    claims.map(async (claim, idx) => ({
      id: `c${idx + 1}`,
      text: claim,
      ...(await verifyClaim(claim))
    }))
  );

  const scoreResult = calculateTrustScore(verifiedClaims);
  const verifiedText = generateSafeRewrite(verifiedClaims);

  return {
    ...scoreResult,
    claims: verifiedClaims,
    verifiedText,
    summary: `${verifiedClaims.length} claims analyzed`
  };
};

const analyze = async (text: string): Promise<AnalyzeResponseDto> => {
  const analysisId = randomUUID();
  const verification = await computeVerification(text);

  const claimsWithIds = verification.claims.map((c, idx) => ({
    ...c,
    id: `${analysisId}-c${idx + 1}`
  }));

  const run: RunRecord = {
    analysisId,
    inputText: text,
    removedClaims: claimsWithIds.filter((c) => c.status !== ClaimStatus.VERIFIED).map((c) => c.text),
    trustScore: verification.trustScore,
    label: verification.label,
    claims: claimsWithIds,
    verifiedText: verification.verifiedText,
    summary: verification.summary
  };

  runs.set(analysisId, run);
  run.claims.forEach((c) => claimIndex.set(c.id, analysisId));

  try {
    await verificationDao.create({
      trustScore: run.trustScore,
      label: run.label,
      claims: run.claims,
      verifiedText: run.verifiedText,
      summary: run.summary,
      inputText: text
    });
  } catch (err) {
    console.warn('Persisting verification failed (non-blocking)', err);
  }

  return {
    analysisId,
    trustScore: verification.trustScore,
    label: verification.label,
    summary: verification.summary
  };
};

const getClaims = async (analysisId: string): Promise<ClaimListItemDto[]> => {
  const run = runs.get(analysisId);
  if (!run) {
    throw new Error('analysis_not_found');
  }
  return run.claims.map(({ id, text, status, confidence, shortReason }) => ({ id, text, status, confidence, shortReason }));
};

const getEvidence = async (claimId: string): Promise<EvidenceResponseDto> => {
  const analysisId = claimIndex.get(claimId);
  if (!analysisId) {
    throw new Error('claim_not_found');
  }
  const run = runs.get(analysisId);
  if (!run) {
    throw new Error('analysis_not_found');
  }
  const claim = run.claims.find((c) => c.id === claimId);
  if (!claim) {
    throw new Error('claim_not_found');
  }

  return {
    claimId: claim.id,
    status: claim.status,
    evidence: claim.evidence,
    citationCheck: {
      exists: claim.evidence.length > 0,
      valid: claim.status === ClaimStatus.VERIFIED,
      reason: claim.status === ClaimStatus.VERIFIED ? 'Citation matches supporting source' : 'Citation missing or contradicted'
    }
  };
};

const getVerifiedText = async (analysisId: string): Promise<VerifiedTextResponseDto> => {
  const run = runs.get(analysisId);
  if (!run) {
    throw new Error('analysis_not_found');
  }
  return {
    verifiedText: run.verifiedText,
    removedClaims: run.removedClaims
  };
};

export const verificationService = {
  analyze,
  getClaims,
  getEvidence,
  getVerifiedText
};
