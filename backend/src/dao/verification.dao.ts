import mongoose, { Schema } from 'mongoose';
import { ClaimStatus } from '../enums/claim-status.enum.js';
import { TrustLabel } from '../enums/trust-label.enum.js';

const EvidenceSchema = new Schema(
  {
    source: { type: String, required: true },
    verdict: { type: String, required: true },
    url: { type: String }
  },
  { _id: false }
);

const ClaimSchema = new Schema(
  {
    text: { type: String, required: true },
    status: { type: String, enum: Object.values(ClaimStatus), required: true },
    confidence: { type: Number, required: true },
    shortReason: { type: String, required: true },
    evidence: { type: [EvidenceSchema], default: [] }
  },
  { _id: false }
);

const VerificationSchema = new Schema(
  {
    trustScore: { type: Number, required: true },
    label: { type: String, enum: Object.values(TrustLabel), required: true },
    claims: { type: [ClaimSchema], default: [] },
    verifiedText: { type: String, default: '' },
    summary: { type: String, default: '' },
    inputText: { type: String, required: true }
  },
  { timestamps: true }
);

export const VerificationModel = mongoose.models.Verification || mongoose.model('Verification', VerificationSchema);

export const verificationDao = {
  create: async (payload: {
    trustScore: number;
    label: TrustLabel;
    claims: Array<{
      text: string;
      status: ClaimStatus;
      confidence: number;
      shortReason: string;
      evidence: Array<{ source: string; verdict: string; url?: string }>;
    }>;
    verifiedText: string;
    summary: string;
    inputText: string;
  }) => VerificationModel.create(payload),

  getById: async (id: string) => VerificationModel.findById(id)
};
