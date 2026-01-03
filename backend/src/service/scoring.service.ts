import { ClaimResultDto, VerifyResponseDto } from '../dto/verification.dto.js';
import { ClaimStatus } from '../enums/claim-status.enum.js';
import { TrustLabel } from '../enums/trust-label.enum.js';

export const calculateTrustScore = (claims: ClaimResultDto[]): Pick<VerifyResponseDto, 'trustScore' | 'label'> => {
  let score = 0;

  claims.forEach((c) => {
    if (c.status === ClaimStatus.VERIFIED) score += 1;
    if (c.status === ClaimStatus.PARTIAL) score += 0.5;
    if (c.status === ClaimStatus.HALLUCINATED) score -= 1.2;
  });

  const finalScore = Math.max(0, Math.min(100, (score / Math.max(1, claims.length)) * 100));

  return {
    trustScore: Math.round(finalScore),
    label: finalScore >= 80 ? TrustLabel.HIGH : finalScore >= 50 ? TrustLabel.REVIEW : TrustLabel.RISK
  };
};

export const generateSafeRewrite = (claims: ClaimResultDto[]): string => {
  const verified = claims.filter((c) => c.status === ClaimStatus.VERIFIED).map((c) => c.text);
  return verified.length ? `${verified.join('. ')}.` : '';
};
