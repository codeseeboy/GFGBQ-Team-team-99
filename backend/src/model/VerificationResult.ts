/**
 * VerificationResult MongoDB Model
 * 
 * Stores completed verification reports with analysis results, trust scores, and claims.
 * Used to retrieve past reports and enable users to download/share verification results.
 */

import { Schema, model } from "mongoose";

/**
 * VerificationResult Schema Definition
 * @property {ObjectId} userId - Reference to User who created the verification
 * @property {String} originalText - Original input text that was analyzed
 * @property {Number} trustScore - Final calculated trust score (0-100)
 * @property {String} label - Human-readable label (e.g., "High Confidence", "Review Required")
 * @property {Array} claims - Array of extracted and verified claims
 * @property {String} verifiedText - Annotated version of original text with verification marks
 * @property {Date} createdAt - Automatic timestamp of report creation
 * @property {Date} updatedAt - Automatic timestamp of last update
 */
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

/**
 * Export the compiled VerificationResult model for use throughout the backend
 */
export const VerificationResult = model("VerificationResult", VerificationSchema);
