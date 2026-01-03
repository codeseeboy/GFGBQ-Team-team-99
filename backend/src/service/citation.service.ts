import { ClaimResultDto } from '../dto/verification.dto.js';
import { ClaimStatus } from '../enums/claim-status.enum.js';

export const verifyClaim = async (claim: string): Promise<Omit<ClaimResultDto, 'id' | 'text'>> => {
  if (claim.toLowerCase().includes('relativity')) {
    return {
      status: ClaimStatus.HALLUCINATED,
      confidence: 0.2,
      shortReason: 'Contradicted by available sources',
      evidence: [
        {
          source: 'Wikipedia',
          verdict: 'Contradicts claim',
          url: 'https://en.wikipedia.org/wiki/Albert_Einstein'
        }
      ]
    };
  }

  return {
    status: ClaimStatus.VERIFIED,
    confidence: 0.95,
    shortReason: 'Supported by referenced sources',
    evidence: [
      {
        source: 'Wikipedia',
        verdict: 'Supports claim',
        url: 'https://en.wikipedia.org/wiki/Albert_Einstein'
      }
    ]
  };
};
