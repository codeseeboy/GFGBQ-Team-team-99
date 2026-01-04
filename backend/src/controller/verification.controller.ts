import { Request, Response } from "express";
import { verificationService } from "../service/verification.service";
import { AuthRequest } from "../middleware/auth.middleware";
import { rateLimiter } from "../service/rate-limiter.service";

export const analyzeText = async (req: AuthRequest, res: Response) => {
  try {
    const { text } = req.body;

    if (!text || text.length < 20) {
      return res.status(400).json({ message: "Text too short to verify (min 20 chars)" });
    }

    // Pass userId if authenticated
    const result = await verificationService.analyze(text, req.userId);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Analysis failed" });
  }
};

export const getClaims = async (req: Request, res: Response) => {
  try {
    const claims = await verificationService.getClaims(req.params.id);
    res.json(claims);
  } catch (err) {
    res.status(404).json({ message: "Analysis not found" });
  }
};

export const getClaimEvidence = async (req: Request, res: Response) => {
  try {
    const evidence = await verificationService.getEvidence(req.params.claimId);
    res.json(evidence);
  } catch (err) {
    res.status(404).json({ message: "Claim not found" });
  }
};

export const getVerifiedText = async (req: Request, res: Response) => {
  try {
    const result = await verificationService.getVerifiedText(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(404).json({ message: "Analysis not found" });
  }
};

export const getProviderMetrics = async (req: Request, res: Response) => {
  try {
    const metrics = rateLimiter.getMetrics();
    rateLimiter.logStats();
    res.json({
      providers: metrics,
      bestProvider: rateLimiter.getBestProvider(),
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to retrieve metrics" });
  }
};
