import { Router } from 'express';
import {
	analyzeResponse,
	getClaimEvidence,
	getClaims,
	getVerifiedText
} from '../controller/verification.controller.js';

const router = Router();

router.post('/verification/analyze', analyzeResponse);
router.get('/verification/:analysisId/claims', getClaims);
router.get('/verification/claim/:claimId/evidence', getClaimEvidence);
router.get('/verification/:analysisId/verified-text', getVerifiedText);

export default router;
