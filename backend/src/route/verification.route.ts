import { Router } from "express";
import {
  analyzeText,
  getClaims,
  getClaimEvidence,
  getVerifiedText
} from "../controller/verification.controller";
import { optionalAuth } from "../middleware/auth.middleware";

const router = Router();

// Use optional auth so analysis works with or without login
// But if logged in, the report will be saved to user's account
router.post("/analyze", optionalAuth, analyzeText);
router.get("/:id/claims", getClaims);
router.get("/claim/:claimId/evidence", getClaimEvidence);
router.get("/:id/verified-text", getVerifiedText);

export default router;
