import { NextFunction, Request, Response } from 'express';
import { verificationService } from '../service/verification.service.js';
import { VerifyRequestDto } from '../dto/verification.dto.js';

const handleNotFound = (res: Response) => res.status(404).json({ message: 'Not found' });

export const analyzeResponse = async (
  req: Request<unknown, unknown, VerifyRequestDto>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { text } = req.body;
    if (!text || text.length < 20) {
      return res.status(400).json({ message: 'Text too short to verify' });
    }

    const result = await verificationService.analyze(text);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const getClaims = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const claims = await verificationService.getClaims(req.params.analysisId);
    res.json(claims);
  } catch (err) {
    if ((err as Error).message === 'analysis_not_found') return handleNotFound(res);
    next(err);
  }
};

export const getClaimEvidence = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const evidence = await verificationService.getEvidence(req.params.claimId);
    res.json(evidence);
  } catch (err) {
    if ((err as Error).message === 'claim_not_found' || (err as Error).message === 'analysis_not_found') {
      return handleNotFound(res);
    }
    next(err);
  }
};

export const getVerifiedText = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await verificationService.getVerifiedText(req.params.analysisId);
    res.json(result);
  } catch (err) {
    if ((err as Error).message === 'analysis_not_found') return handleNotFound(res);
    next(err);
  }
};
