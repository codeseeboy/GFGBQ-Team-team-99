import { Schema, model } from "mongoose";

const VerificationSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    originalText: { type: String, required: true },
    trustScore: { type: Number, required: true },
    label: { type: String, required: true },
    claims: { type: Array, default: [] },
    verifiedText: { type: String, default: "" }
  },
  { timestamps: true }
);

export const VerificationResult = model("VerificationResult", VerificationSchema);
