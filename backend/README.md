# TrustLayer AI - Backend

Advanced AI-powered claim verification engine with multi-LLM fallback, evidence cross-verification, and MongoDB persistence.

## 🎯 Features

- **Multi-LLM Verification**: Google Gemini 2.5 Flash → Groq LLaMA-3.3-70B → OpenRouter fallback
- **Evidence Gathering**: Wikipedia entity lookup + SerpAPI web search
- **Intelligent Claim Extraction**: Entity recognition, intent analysis, confidence scoring
- **Strict Verification Logic**: 85%+ confidence thresholds, hallucination detection
- **Real-time Streaming**: SSE endpoint for live verification logs
- **MongoDB Persistence**: Complete report storage and retrieval

## 🚀 Tech Stack

| Component | Technology |
|-----------|-----------|
| **Runtime** | Node.js 18+ |
| **Language** | TypeScript 5.6 |
| **Framework** | Express.js 4.19 |
| **Database** | MongoDB Atlas |
| **Primary LLM** | Google Gemini 2.5 Flash |
| **Fallback LLMs** | Groq LLaMA-3.3-70B, OpenRouter |
| **Search APIs** | Wikipedia REST, SerpAPI |
| **Auth** | JWT (jsonwebtoken) |

## 📋 Prerequisites

- Node.js 18+ and npm/pnpm
- MongoDB Atlas cluster (free tier available)
- API Keys:
  - Google Gemini: <https://makersuite.google.com/app/apikey>
  - Groq: <https://console.groq.com/keys>
  - OpenRouter: <https://openrouter.ai/keys>
  - SerpAPI: <https://serpapi.com> (web search)

## 🛠️ Installation

1. **Clone and install**:

   ```bash
   cd backend
   npm install
   ```

2. **Configure environment**:

   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your actual credentials:

   ```env
   PORT=4000
   MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/?appName=YourApp
   GEMINI_API_KEY=your_key_here
   GROQ_API_KEY=your_key_here
   OPENROUTER_API_KEY=your_key_here
   SERP_API_KEY=your_key_here
   ```

3. **Start development server**:

   ```bash
   npm run dev
   ```

   Expected output:

   ```
   ✓ Database connected
   ✓ Server running on http://localhost:4000
   ✓ All services initialized and ready
   ```

## 📡 API Endpoints

### POST `/api/verification/analyze`

Analyze text and extract claims with verification.

**Request**:

```bash
curl -X POST http://localhost:4000/api/verification/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Albert Einstein developed the theory of relativity and won the Nobel Prize in 1922."
  }'
```

**Response**:

```json
{
  "analysisId": "abc123xyz",
  "trustScore": 85,
  "label": "Verified",
  "summary": "Text verified with 85% confidence...",
  "claims": [
    {
      "id": "c1",
      "claim": "Albert Einstein developed the theory of relativity",
      "status": "verified",
      "confidence": 95,
      "evidence": ["Wikipedia article on General Relativity"]
    }
  ]
}
```

### GET `/api/verification/:analysisId/claims`

Retrieve all extracted claims from an analysis.

**Response**:

```json
{
  "claims": [{ "id": "c1", "claim": "...", "status": "verified", ... }]
}
```

### GET `/api/verification/claim/:claimId/evidence`

Get detailed evidence for a specific claim.

**Response**:

```json
{
  "evidence": [
    {
      "source": "Wikipedia",
      "content": "Albert Einstein was a theoretical physicist...",
      "verified": true
    }
  ]
}
```

### GET `/api/verification/:analysisId/verified-text`

Get the corrected/verified version of the original text.

### GET `/api/logs/stream`

Real-time SSE stream of verification logs.

```bash
curl http://localhost:4000/api/logs/stream
# Returns: Server-Sent Events with live logs
```

### GET `/api/health`

Health check endpoint.

## 🏗️ Project Structure

```
src/
├── app.ts                          # Express app config & middleware
├── server.ts                       # Server bootstrap & MongoDB connection
├── controller/
│   └── verification.controller.ts  # Request handlers
├── route/
│   ├── verification.route.ts       # Verification API endpoints
│   ├── auth.route.ts              # Authentication routes
│   └── reports.route.ts           # Report retrieval routes
├── service/
│   ├── citation.service.ts        # Core verification engine
│   ├── claim.service.ts           # Claim extraction logic
│   ├── scoring.service.ts         # Trust score calculation
│   └── logger.service.ts          # Real-time log streaming
└── model/
    └── VerificationResult.ts      # MongoDB schema
```

## 🔧 Build & Deploy

### Local Development

```bash
npm run dev    # Watch mode with ts-node-dev
```

### Production Build

```bash
npm run build  # Compile TypeScript to dist/
npm start      # Run compiled server.js
```

### Docker Deployment

```bash
docker build -t trustlayer-backend .
docker run -p 4000:4000 --env-file .env trustlayer-backend
```

### Deploy to Railway

```bash
npm install -g @railway/cli
railway login
railway up
```

## 📊 Verification Logic

### Claim Extraction

1. **Entity Recognition**: Identifies key entities (people, places, dates)
2. **Intent Analysis**: Determines claim context and scope
3. **Search Query Generation**: Creates optimized search queries

### Evidence Gathering

1. **Wikipedia Lookup**: Direct article fetch + semantic search
2. **Web Search**: SerpAPI for current news and sources
3. **Result Normalization**: Standardizes evidence format

### Verdict Generation

1. **Confidence Scoring**: LLM evaluates evidence match
2. **Threshold Validation**: 85% minimum for "Verified"
3. **Hallucination Detection**: Flags unsupported claims
4. **Post-Processing**: Applies strict verdict rules

### Confidence Levels

- **Verified** (90-100%): Strong evidence confirms claim
- **Uncertain** (50-89%): Mixed or limited evidence
- **Hallucinated** (<50%): Little/no evidence or contradicted

## 🔐 Security

- API keys stored in `.env` (never committed)
- JWT authentication for protected routes
- CORS enabled for frontend origin
- Input validation on all endpoints
- Rate limiting recommended for production

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| MongoDB connection fails | Check MONGO_URI format and network access whitelist |
| Gemini API errors | Verify API key and check quota on Google Cloud Console |
| Groq/OpenRouter timeout | Services fall back automatically; check API status |
| SERP_API_KEY not working | Ensure SerpAPI account is active and has quota |

## 📝 Environment Variables

```
PORT                  Server port (default: 4000)
MONGO_URI            MongoDB Atlas connection string
GEMINI_API_KEY       Google Gemini API key
GROQ_API_KEY         Groq API key
OPENROUTER_API_KEY   OpenRouter API key
SERP_API_KEY         SerpAPI key for web search
```

## 📚 Documentation

- [Express.js Docs](https://expressjs.com/)
- [MongoDB Mongoose](https://mongoosejs.com/)
- [Google Generative AI](https://ai.google.dev/)
- [Groq API](https://console.groq.com/docs)

## 📄 License

Private - ByteQuest 2025 Hackathon

- `src/controller/verification.controller.ts` – Request handlers
- `src/service/`
  - `claim.service.ts` – Gemini AI claim extraction
  - `citation.service.ts` – Wikipedia fact verification
  - `scoring.service.ts` – Trust score calculation
  - `verification.service.ts` – Orchestrator (analyze → verify → store)
- `src/model/VerificationResult.ts` – MongoDB schema

## API Flow

```
POST /api/verification/analyze
 → Gemini extracts claims
 → Wikipedia verifies each claim
 → Trust score calculated
 → Result saved to MongoDB
 → Returns analysisId + score

GET /api/verification/:id/claims
 → Returns claim list with status

GET /api/verification/claim/:claimId/evidence
 → Returns evidence + citation check

GET /api/verification/:id/verified-text
 → Returns hallucination-free rewrite
```

## Notes

- Gemini API key required (get from ai.google.dev)
- Wikipedia API is free (no key needed)
- SerpAPI optional (for enhanced web search)
- CommonJS for simpler Gemini integration
