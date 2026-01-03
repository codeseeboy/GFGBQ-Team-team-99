import { ClaimStatus } from '../enums/claim-status.enum.js';
import { TrustLabel } from '../enums/trust-label.enum.js';

export interface VerifyRequestDto {
  text: string;
}

export interface EvidenceDto {
  source: string;
  verdict: string;
  url?: string;
}

export interface ClaimResultDto {
  id: string;
  text: string;
  status: ClaimStatus;
  confidence: number;
  evidence: EvidenceDto[];
  shortReason: string;
}

export interface AnalyzeResponseDto {
  analysisId: string;
  trustScore: number;
  label: TrustLabel;
  summary: string;
}

export interface ClaimListItemDto {
  id: string;
  text: string;
  status: ClaimStatus;
  confidence: number;
  shortReason: string;
}

export interface EvidenceResponseDto {
  claimId: string;
  status: ClaimStatus;
  evidence: EvidenceDto[];
  citationCheck: {
    exists: boolean;
    valid: boolean;
    reason: string;
  };
}

export interface VerifiedTextResponseDto {
  verifiedText: string;
  removedClaims: string[];
}

export interface VerifyResponseDto {
  trustScore: number;
  label: TrustLabel;
  claims: ClaimResultDto[];
  verifiedText: string;
  summary: string;
}
