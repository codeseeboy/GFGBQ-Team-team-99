# PS-03 Verification Backend

Node.js + Express + TypeScript + MongoDB Atlas service for claim verification.

## Quick start

1. Install deps:
   ```bash
   npm install
   ```
2. Copy env:
   ```bash
   cp .env.example .env
   ```
   Set `MONGO_URI` and `PORT`.
3. Run dev:
   ```bash
   npm run dev
   ```
4. Hit APIs (examples):
    ```bash
    # Analyze text
    curl -X POST http://localhost:4000/api/verification/analyze \
       -H "Content-Type: application/json" \
       -d '{"text":"Albert Einstein developed the theory of relativity."}'

    # Then fetch claims
    curl http://localhost:4000/api/verification/<analysisId>/claims

    # Evidence for a claim
    curl http://localhost:4000/api/verification/claim/<claimId>/evidence

    # Verified rewrite
    curl http://localhost:4000/api/verification/<analysisId>/verified-text
    ```

## Project structure
- `src/app.ts` Express app wiring
- `src/server.ts` bootstrap + DB connect
- `src/config/db.ts` Mongo connection helper
- `src/route/verification.route.ts` routes for analyze, claims, evidence, verified text
- `src/controller/verification.controller.ts` request validation + dispatch
- `src/service/*.ts` business logic (claims, citations, scoring, orchestration)
- `src/dto/*.ts` request/response contracts
- `src/enums/*.ts` enums for statuses/labels
- `src/dao/verification.dao.ts` optional persistence of runs

## Notes
- Claim/citation logic is stubbed; swap in Wikipedia/search or LLM calls.
- Uses ESM (`type: module`); compiled output goes to `dist/` via `npm run build` then `npm start`.
