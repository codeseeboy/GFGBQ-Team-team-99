import axios from "axios";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";
import OpenAI from "openai";
import { logger } from "./logger.service";
import { rateLimiter } from "./rate-limiter.service";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const openrouter = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
  defaultHeaders: {
    "HTTP-Referer": "http://localhost:3000",
    "X-Title": "TrustLayer AI Verification",
  },
});
const SERP_API_KEY = process.env.SERP_API_KEY;

interface VerificationResult {
  status: "verified" | "uncertain" | "hallucinated";
  confidence: number;
  explanation: string;
  evidence: Array<{
    source: string;
    verdict: string;
    url?: string;
  }>;
}

interface ClaimAnalysis {
  entities: string[];
  intent: string;
  attributes: string[];
  searchQuery: string;
}

interface LLMVerdict {
  status: "verified" | "partially_verified" | "hallucinated";
  confidence: number;
  reason: string;
}

// ============================================================================
// STEP 1: ENTITY & INTENT EXTRACTION (LLM-BASED, NO HARDCODING)
// ============================================================================

/**
 * Extract main entities and intent from a claim using LLM
 * Tries Gemini first, then Groq as fallback
 */
async function extractClaimAnalysis(claim: string): Promise<ClaimAnalysis> {
  const prompt = `You are an entity extraction engine for fact-checking. Analyze this claim and extract key information.

CLAIM: "${claim}"

Extract:
1. Main entities (people, places, organizations, scientific concepts) - these will be used to search Wikipedia
2. Claim intent (what type of fact: historical_event, scientific_fact, medical_claim, geographic_fact, award_claim, invention_claim, etc.)
3. Key attributes that need verification (year, location, reason, inventor, discoverer, etc.)
4. Best search query for web verification

Return ONLY a JSON object:
{
  "entities": ["Entity1", "Entity2"],
  "intent": "claim_type",
  "attributes": ["attribute1", "attribute2"],
  "searchQuery": "optimized search query for verification"
}

IMPORTANT: 
- Extract REAL entity names (not pronouns like "he", "his", "the")
- Entity names should be Wikipedia article titles
- Keep entities clean and specific

JSON only, no markdown:`;

  // Try Gemini first with rate limiting and retries
  try {
    const result = await rateLimiter.executeWithRetry("gemini", async () => {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      const response = await model.generateContent(prompt);
      return response.response.text();
    });
    
    const output = result.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(output);
    console.log(`[EntityExtract-Gemini] Claim: "${claim.slice(0, 50)}..." → Entities: ${parsed.entities.join(", ")}`);
    return parsed;
  } catch (geminiErr) {
    console.log(`[EntityExtract] Gemini failed after retries, trying Groq...`);
  }

  // Try Groq as primary fallback
  try {
    const result = await rateLimiter.executeWithRetry("groq", async () => {
      const response = await groq.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "llama-3.3-70b-versatile",
        temperature: 0.3,
        max_tokens: 500
      });
      return response.choices[0]?.message?.content || "{}";
    });
    
    const output = result.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(output);
    console.log(`[EntityExtract-Groq] Claim: "${claim.slice(0, 50)}..." → Entities: ${parsed.entities.join(", ")}`);
    return parsed;
  } catch (groqErr) {
    console.log(`[EntityExtract] Groq failed after retries, trying OpenRouter...`);
  }

  // Try OpenRouter as third fallback
  try {
    const result = await rateLimiter.executeWithRetry("openrouter", async () => {
      const response = await openrouter.chat.completions.create({
        model: "qwen/qwen-2.5-72b-instruct",
        temperature: 0.1,
        max_tokens: 500,
        messages: [{ role: "user", content: prompt }]
      });
      return response.choices[0]?.message?.content || "{}";
    });
    
    const output = result.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(output);
    console.log(`[EntityExtract-OpenRouter] Claim: "${claim.slice(0, 50)}..." → Entities: ${parsed.entities.join(", ")}`);
    return parsed;
  } catch (openrouterErr) {
    console.log(`[EntityExtract] OpenRouter also failed, using fallback`);
    return extractClaimAnalysisFallback(claim);
  }
}

/**
 * Fallback entity extraction without AI
 */
function extractClaimAnalysisFallback(claim: string): ClaimAnalysis {
  const stopwords = new Set([
    'the', 'a', 'an', 'his', 'her', 'its', 'their', 'he', 'she', 'it', 'they',
    'this', 'that', 'these', 'those', 'is', 'are', 'was', 'were', 'be', 'been',
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should',
    'however', 'although', 'because', 'since', 'while', 'when', 'where', 'which',
    'who', 'whom', 'whose', 'what', 'how', 'and', 'or', 'but', 'if', 'then',
    'for', 'with', 'from', 'to', 'of', 'in', 'on', 'at', 'by', 'as', 'also',
    'first', 'second', 'third', 'new', 'old', 'many', 'some', 'all', 'most',
    'according', 'stated', 'claimed', 'said', 'reported', 'during', 'recent'
  ]);

  const words = claim.split(" ");
  const properNouns: string[] = [];
  let currentNoun = "";
  
  for (const word of words) {
    const cleanWord = word.replace(/[^a-zA-Z]/g, "");
    if (cleanWord && 
        cleanWord[0] === cleanWord[0].toUpperCase() && 
        cleanWord.length > 2 && 
        !stopwords.has(cleanWord.toLowerCase())) {
      currentNoun += (currentNoun ? " " : "") + cleanWord;
    } else if (currentNoun) {
      if (currentNoun.length > 2) {
        properNouns.push(currentNoun);
      }
      currentNoun = "";
    }
  }
  if (currentNoun && currentNoun.length > 2) {
    properNouns.push(currentNoun);
  }

  return {
    entities: properNouns.slice(0, 4),
    intent: "general_fact",
    attributes: [],
    searchQuery: claim.slice(0, 100)
  };
}

// ============================================================================
// STEP 2: WIKIPEDIA API (ENTITY-BASED LOOKUP, NO HARDCODING)
// ============================================================================

/**
 * Fetch Wikipedia summary for an entity
 * Uses entity names ONLY, not full sentences
 */
async function getWikipediaSummary(entity: string): Promise<{ extract: string; url: string; title: string } | null> {
  const cleanEntity = entity.replace(/['"]/g, "").trim();
  const wikiTitle = cleanEntity.replace(/ /g, "_");
  const directUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(wikiTitle)}`;
  
  console.log(`[Wikipedia] Fetching entity: "${cleanEntity}"`);
  logger.wikipediaFetch(cleanEntity);
  
  try {
    const response = await axios.get(directUrl, { 
      timeout: 8000,
      headers: { 'User-Agent': 'VerificationEngine/1.0 (Hackathon Project)' }
    });
    if (response.data?.extract) {
      console.log(`[Wikipedia] Found: ${response.data.title}`);
      logger.wikipediaFound(response.data.title);
      return {
        extract: response.data.extract,
        url: response.data.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${wikiTitle}`,
        title: response.data.title || entity
      };
    }
  } catch (err: any) {
    console.log(`[Wikipedia] Direct lookup failed for "${cleanEntity}": ${err.message}`);
  }
  
  // Fallback: Wikipedia search API
  try {
    const searchApiUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(cleanEntity)}&format=json&origin=*&srlimit=3`;
    const searchResponse = await axios.get(searchApiUrl, { 
      timeout: 8000,
      headers: { 'User-Agent': 'VerificationEngine/1.0 (Hackathon Project)' }
    });
    
    if (searchResponse.data?.query?.search?.[0]) {
      const title = searchResponse.data.query.search[0].title;
      console.log(`[Wikipedia] Search found: ${title}`);
      
      const summaryUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title.replace(/ /g, "_"))}`;
      const summaryResponse = await axios.get(summaryUrl, { 
        timeout: 8000,
        headers: { 'User-Agent': 'VerificationEngine/1.0 (Hackathon Project)' }
      });
      
      if (summaryResponse.data?.extract) {
        return {
          extract: summaryResponse.data.extract,
          url: summaryResponse.data.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${encodeURIComponent(title)}`,
          title: summaryResponse.data.title || title
        };
      }
    }
  } catch (searchErr: any) {
    console.log(`[Wikipedia] Search failed: ${searchErr.message}`);
  }
  
  return null;
}

// ============================================================================
// STEP 3: WEB SEARCH API (CROSS-VERIFICATION)
// ============================================================================

/**
 * Search web using SerpAPI for cross-verification
 */
async function searchWeb(query: string): Promise<Array<{ title: string; snippet: string; url: string }>> {
  if (!SERP_API_KEY) {
    console.log(`[WebSearch] No SERP_API_KEY configured`);
    return [];
  }
  
  try {
    console.log(`[WebSearch] Searching: "${query.slice(0, 60)}..."`);
    logger.searchQuery(query);
    const response = await axios.get("https://serpapi.com/search", {
      params: {
        q: query,
        api_key: SERP_API_KEY,
        num: 5,
        engine: "google"
      },
      timeout: 10000
    });
    
    if (response.data?.organic_results) {
      const results = response.data.organic_results.slice(0, 5).map((r: any) => ({
        title: r.title || "",
        snippet: r.snippet || "",
        url: r.link || ""
      }));
      console.log(`[WebSearch] Found ${results.length} results`);
      logger.searchResults(results.length);
      return results;
    }
  } catch (err: any) {
    console.log(`[WebSearch] Search failed: ${err.message}`);
  }
  
  return [];
}

// ============================================================================
// STEP 4: LLM-BASED VERDICT (THE CORE AI REASONING - NO HARDCODING!)
// ============================================================================

/**
 * ABSOLUTE CLAIM DETECTION
 * Claims with absolute words require absolute proof - partial evidence = HALLUCINATED
 */
const ABSOLUTE_CLAIM_WORDS = [
  'widely', 'all', 'every', 'always', 'never', 'only', 'fully', 'completely',
  'entirely', 'officially', 'deployed', 'launched', 'released', 'implemented',
  'established', 'created', 'founded', 'invented', 'discovered', 'proven',
  'confirmed', 'guaranteed', 'certain', 'definitely', 'exclusively', 'universally'
];

function isAbsoluteClaim(claim: string): boolean {
  const lowerClaim = claim.toLowerCase();
  return ABSOLUTE_CLAIM_WORDS.some(word => lowerClaim.includes(word));
}

/**
 * EVIDENCE NORMALIZATION
 * Hedging language in evidence = uncertainty marker, not confirmation
 */
function normalizeEvidence(text: string): string {
  return text
    // Hedging verbs → explicit uncertainty
    .replace(/\b(may|might|could|can potentially)\b/gi, '[UNCERTAIN]')
    .replace(/\b(is exploring|is researching|is investigating|is considering)\b/gi, '[UNCERTAIN]')
    .replace(/\b(plans to|intends to|aims to|hopes to)\b/gi, '[FUTURE_INTENT]')
    // Non-production states → explicit markers
    .replace(/\b(pilot|trial|experiment|prototype|beta|testing phase)\b/gi, '[NOT_PRODUCTION]')
    .replace(/\b(proposed|potential|possible|expected)\b/gi, '[UNCERTAIN]');
}

/**
 * LLM-BASED VERDICT - The AI reasons from sources dynamically
 * Uses Groq as PRIMARY (most stable under load)
 * Falls back to Gemini, then OpenRouter
 * 
 * STRICT BINARY VERIFICATION: Only VERIFIED or HALLUCINATED
 * No partial/uncertain - if not proven, it's hallucinated
 */
async function getLLMVerdict(
  claim: string,
  wikipediaSummary: string | null,
  searchSnippets: string[],
  claimAnalysis: ClaimAnalysis
): Promise<LLMVerdict> {
  // Normalize evidence to expose hedging language
  const normalizedWiki = wikipediaSummary ? normalizeEvidence(wikipediaSummary) : null;
  const normalizedSnippets = searchSnippets.map(s => normalizeEvidence(s));
  
  // OPTIMIZED: Truncate evidence to avoid token bloat
  const wikiContext = normalizedWiki 
    ? `WIKIPEDIA EVIDENCE:\n"${normalizedWiki.slice(0, 1500)}"` // Reduced from 2500
    : "WIKIPEDIA: No relevant article found.";
  
  const searchContext = normalizedSnippets.length > 0
    ? `WEB SEARCH EVIDENCE:\n${normalizedSnippets.slice(0, 2).map((s, i) => `${i + 1}. ${s.slice(0, 400)}`).join("\n\n")}` // Reduced from 3 snippets
    : "WEB SEARCH: No results available.";

  // Check if this is an absolute claim (requires absolute proof)
  const hasAbsoluteWords = isAbsoluteClaim(claim);

  const prompt = `You are an EXTREMELY STRICT fact verification engine. Your job is to catch HALLUCINATIONS.

CLAIM TO VERIFY:
"${claim}"

EXTRACTED INFO:
- Entities: ${claimAnalysis.entities.join(", ")}
- Claim Type: ${claimAnalysis.intent}
${hasAbsoluteWords ? "- ⚠️ ABSOLUTE CLAIM: Requires EXPLICIT, DIRECT confirmation" : ""}

${wikiContext}

${searchContext}

VERIFICATION RULES (STRICT - NO EXCEPTIONS):

VERIFIED (confidence 85-100):
✓ Evidence DIRECTLY states the claim fact
✓ Names, dates, numbers, places EXACTLY match
✓ No hedging language (no "may", "might", "could", "exploring")
✓ Clear statement in Wikipedia or multiple news sources
✓ Sources EXPLICITLY support the claim

HALLUCINATED (confidence 85-100):
✗ Evidence does NOT mention the claim at all
✗ Evidence CONTRADICTS the claim
✗ Evidence shows hedging: "may", "might", "could", "exploring", "researching", "plans to"
✗ Evidence shows non-production: "pilot", "trial", "experiment", "testing"
✗ Evidence is about something DIFFERENT (wrong date, wrong person, wrong location)
✗ Claim uses absolute words ("deployed", "launched", "released") but evidence shows "planning" or "testing"
✗ Only ONE source mentions it, most sources don't
✗ No Wikipedia article exists for the claim topic
✗ Web search results contradict the claim

DEFAULT: If evidence is WEAK or MISSING → HALLUCINATED

OUTPUT JSON:
{
  "status": "verified" | "hallucinated",
  "confidence": 85-100,
  "reason": "Specific quote from evidence OR why evidence doesn't support claim"
}

JSON ONLY, NO MARKDOWN:`;

  /**
   * POST-PROCESS LLM VERDICT
   * Enforce strict rules - if evidence is weak, mark as hallucinated
   */
  function enforceStrictVerdict(parsed: LLMVerdict, claim: string): LLMVerdict {
    // Rule 1: Map partially_verified to hallucinated (binary only)
    if (parsed.status === "partially_verified") {
      console.log(`[LLMVerdict] Mapping partially_verified → hallucinated (strict mode)`);
      return {
        status: "hallucinated",
        confidence: 85,
        reason: parsed.reason + " [Partial verification = unverified]"
      };
    }
    
    // Rule 2: Low confidence verified → hallucinated
    if (parsed.status === "verified" && parsed.confidence < 85) {
      console.log(`[LLMVerdict] Low confidence verdict upgraded to hallucinated (${parsed.confidence}% < 85%)`);
      return {
        status: "hallucinated",
        confidence: 85,
        reason: parsed.reason + " [Below confidence threshold]"
      };
    }
    
    // Rule 3: Absolute claims require 90+ confidence
    if (isAbsoluteClaim(claim) && parsed.status === "verified" && parsed.confidence < 90) {
      console.log(`[LLMVerdict] Absolute claim with ${parsed.confidence}% < 90% → hallucinated`);
      return {
        status: "hallucinated",
        confidence: 85,
        reason: parsed.reason + " [Absolute claim requires 90%+ confidence]"
      };
    }
    
    // Rule 4: Ensure valid confidence range
    if (parsed.confidence < 85 || parsed.confidence > 100) {
      parsed.confidence = parsed.status === "verified" ? 85 : 85;
    }
    
    return parsed;
  }

  // TRY GROQ FIRST (MOST STABLE UNDER LOAD)
  try {
    const result = await rateLimiter.executeWithRetry("groq", async () => {
      const response = await groq.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "llama-3.3-70b-versatile",
        temperature: 0.1,
        max_tokens: 800 // Reduced from 1000
      });
      return response.choices[0]?.message?.content || "{}";
    });
    
    const rawOutput = result;
    console.log(`[LLMVerdict-Groq] Raw response: ${rawOutput.slice(0, 150)}...`);
    
    if (!rawOutput || rawOutput.length < 20) {
      throw new Error("Empty response from Groq");
    }
    const output = rawOutput.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(output);
    
    const enforced = enforceStrictVerdict(parsed, claim);
    console.log(`[LLMVerdict-Groq] Result: ${enforced.status} (${enforced.confidence}%) - ${enforced.reason.slice(0, 80)}...`);
    return enforced;
  } catch (groqErr: any) {
    console.log(`[LLMVerdict] Groq failed: ${groqErr.message?.slice(0, 80)}, trying Gemini...`);
  }

  // TRY GEMINI AS FALLBACK
  try {
    const result = await rateLimiter.executeWithRetry("gemini", async () => {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      const response = await model.generateContent(prompt);
      return response.response.text();
    });
    
    const rawOutput = result;
    console.log(`[LLMVerdict-Gemini] Raw response: ${rawOutput.slice(0, 150)}...`);
    
    if (!rawOutput || rawOutput.length < 20) {
      throw new Error("Empty response from Gemini");
    }
    const output = rawOutput.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(output);
    
    const enforced = enforceStrictVerdict(parsed, claim);
    console.log(`[LLMVerdict-Gemini] Result: ${enforced.status} (${enforced.confidence}%) - ${enforced.reason.slice(0, 80)}...`);
    return enforced;
  } catch (geminiErr: any) {
    console.log(`[LLMVerdict] Gemini failed: ${geminiErr.message?.slice(0, 80)}, trying OpenRouter...`);
  }

  // TRY OPENROUTER AS SECOND FALLBACK
  try {
    const result = await rateLimiter.executeWithRetry("openrouter", async () => {
      const response = await openrouter.chat.completions.create({
        model: "meta-llama/llama-3-70b-instruct",
        temperature: 0.1,
        max_tokens: 800,
        messages: [{ role: "user", content: prompt }]
      });
      return response.choices[0]?.message?.content || "{}";
    });
    
    const rawOutput = result;
    console.log(`[LLMVerdict-OpenRouter] Raw response: ${rawOutput.slice(0, 150)}...`);
    
    if (!rawOutput || rawOutput.length < 20) {
      throw new Error("Empty response from OpenRouter");
    }
    const output = rawOutput.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(output);
    
    const enforced = enforceStrictVerdict(parsed, claim);
    console.log(`[LLMVerdict-OpenRouter] Result: ${enforced.status} (${enforced.confidence}%) - ${enforced.reason.slice(0, 80)}...`);
    return enforced;
  } catch (openrouterErr: any) {
    console.log(`[LLMVerdict] OpenRouter also failed: ${openrouterErr.message?.slice(0, 80)}`);
    
    // STRICT FALLBACK: If no AI available, claim cannot be verified = hallucinated
    console.log(`[LLMVerdict] ALL AI providers failed - returning HALLUCINATED (cannot verify)`);
    logger.providerFailure("all", "All LLM providers exhausted");
    return {
      status: "hallucinated",
      confidence: 85,
      reason: "AI verification unavailable. Claim cannot be verified without AI reasoning."
    };
  }
}

// ============================================================================
// STEP 5: MAIN VERIFICATION FUNCTION (ORCHESTRATOR)
// ============================================================================

/**
 * MAIN VERIFICATION FUNCTION
 * 100% DYNAMIC PIPELINE:
 * 1. LLM extracts entities
 * 2. Wikipedia API fetches evidence
 * 3. Web Search API cross-checks
 * 4. LLM reasons and decides verdict
 * 
 * NO HARDCODED FACTS - Everything is real-time AI + API verified
 */
export const verifyClaim = async (claim: string): Promise<VerificationResult> => {
  const evidence: VerificationResult["evidence"] = [];
  
  console.log(`\n${"=".repeat(60)}`);
  console.log(`[Verify] Starting DYNAMIC verification for: "${claim.slice(0, 80)}..."`);
  console.log(`${"=".repeat(60)}`);
  
  // STEP 1: Extract entities and intent using LLM
  logger.analyzing(claim);
  const claimAnalysis = await extractClaimAnalysis(claim);
  console.log(`[Verify] Analysis: entities=${claimAnalysis.entities.join(", ")}, intent=${claimAnalysis.intent}`);
  logger.entitiesFound(claimAnalysis.entities);
  
  // STEP 2: Gather Wikipedia evidence for each entity
  let combinedWikiSummary = "";
  const wikiSources: Array<{ title: string; url: string; extract: string }> = [];
  
  for (const entity of claimAnalysis.entities.slice(0, 3)) {
    const wikiResult = await getWikipediaSummary(entity);
    if (wikiResult) {
      wikiSources.push(wikiResult);
      combinedWikiSummary += `\n\n[${wikiResult.title}]: ${wikiResult.extract}`;
      
      evidence.push({
        source: `Wikipedia: ${wikiResult.title}`,
        verdict: "Source retrieved",
        url: wikiResult.url
      });
    }
  }
  
  console.log(`[Verify] Found ${wikiSources.length} Wikipedia sources`);
  
  // STEP 3: Web search for cross-verification
  const searchResults = await searchWeb(claimAnalysis.searchQuery);
  const searchSnippets = searchResults.map(r => `${r.title}: ${r.snippet}`);
  
  // Add top search results to evidence
  searchResults.slice(0, 2).forEach(r => {
    evidence.push({
      source: r.title.slice(0, 50),
      verdict: "Web source",
      url: r.url
    });
  });
  
  // STEP 4: LLM-based verdict (THE CORE AI REASONING)
  const llmVerdict = await getLLMVerdict(
    claim,
    combinedWikiSummary || null,
    searchSnippets,
    claimAnalysis
  );
  
  // STEP 5: Map LLM verdict to final status
  let finalStatus: VerificationResult["status"];
  let finalConfidence = llmVerdict.confidence;
  
  if (llmVerdict.status === "verified") {
    finalStatus = "verified";
  } else if (llmVerdict.status === "hallucinated") {
    finalStatus = "hallucinated";
  } else {
    // partially_verified maps to uncertain
    finalStatus = "uncertain";
  }
  
  // Update evidence verdicts based on final status
  if (evidence.length > 0) {
    evidence[0].verdict = finalStatus === "verified" ? "Supports claim" :
                          finalStatus === "hallucinated" ? "Contradicts claim" : "Related content";
  }
  
  console.log(`[Verify] FINAL: ${finalStatus.toUpperCase()} (${finalConfidence}%)`);
  console.log(`${"=".repeat(60)}\n`);
  logger.verdict(finalStatus, finalConfidence);
  
  return {
    status: finalStatus,
    confidence: finalConfidence,
    explanation: llmVerdict.reason,
    evidence: evidence.length > 0 ? evidence : [
      { source: "AI Verification Engine", verdict: "Analysis complete" }
    ]
  };
};

// ============================================================================
// CLAIM EXTRACTION (FOR MULTI-CLAIM INPUT)
// ============================================================================

/**
 * Extract multiple claims from a text block using LLM
 * Used by the verification controller
 */
export const extractClaims = async (text: string): Promise<string[]> => {
  try {
    const prompt = `You are a claim extraction engine. Extract ALL distinct factual claims from this text that can be verified.

TEXT:
"${text}"

RULES:
1. Extract only FACTUAL claims (not opinions, questions, or commands)
2. Each claim should be a complete, standalone sentence
3. Split compound claims into separate atomic claims
4. Include claims about: dates, locations, people, events, scientific facts, statistics
5. Exclude: opinions, predictions, subjective statements

Return ONLY a JSON array of claim strings:
["claim 1", "claim 2", "claim 3"]

If no verifiable claims found, return: []

JSON only, no markdown:`;

    const result = await rateLimiter.executeWithRetry("gemini", async () => {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      const response = await model.generateContent(prompt);
      return response.response.text();
    });
    
    const output = result.replace(/```json|```/g, "").trim();
    const claims = JSON.parse(output);
    
    console.log(`[ExtractClaims] Found ${claims.length} claims in text`);
    return claims;
  } catch (err) {
    console.log(`[ExtractClaims] LLM extraction failed, using sentence split`);
    // Fallback: split by sentences and filter
    return text
      .split(/[.!?]+/)
      .map(s => s.trim())
      .filter(s => s.length > 20 && s.length < 300);
  }
};
