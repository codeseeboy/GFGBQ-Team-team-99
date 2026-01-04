import { EventEmitter } from "events";

// Global event emitter for log streaming
export const logEmitter = new EventEmitter();
logEmitter.setMaxListeners(100);

// Log types for different stages
export type LogType = 
  | "extract" 
  | "entity" 
  | "wikipedia" 
  | "search" 
  | "verdict" 
  | "score" 
  | "info";

export interface LogEntry {
  type: LogType;
  message: string;
  timestamp: number;
  status?: "success" | "pending" | "error";
}

// Send log to all connected clients
export function emitLog(type: LogType, message: string, status?: "success" | "pending" | "error") {
  const entry: LogEntry = {
    type,
    message,
    timestamp: Date.now(),
    status
  };
  logEmitter.emit("log", entry);
}

// Helper functions for clean logging
export const logger = {
  extracting: (claim: string) => {
    emitLog("extract", `Extracting claims from text...`, "pending");
  },
  
  extractSuccess: (count: number) => {
    emitLog("extract", `Found ${count} claims to verify`, "success");
  },

  analyzing: (claim: string) => {
    const shortClaim = claim.length > 60 ? claim.slice(0, 60) + "..." : claim;
    emitLog("entity", `Analyzing: "${shortClaim}"`, "pending");
  },

  entitiesFound: (entities: string[]) => {
    emitLog("entity", `Entities: ${entities.join(", ")}`, "success");
  },

  wikipediaFetch: (entity: string) => {
    emitLog("wikipedia", `Fetching: ${entity}`, "pending");
  },

  wikipediaFound: (entity: string) => {
    emitLog("wikipedia", `Found: ${entity}`, "success");
  },

  wikipediaNotFound: (entity: string) => {
    emitLog("wikipedia", `Not found: ${entity}`, "error");
  },

  searchQuery: (query: string) => {
    const shortQuery = query.length > 50 ? query.slice(0, 50) + "..." : query;
    emitLog("search", `Searching: ${shortQuery}`, "pending");
  },

  searchResults: (count: number) => {
    emitLog("search", `Found ${count} web results`, "success");
  },

  verifying: (claim: string) => {
    const shortClaim = claim.length > 50 ? claim.slice(0, 50) + "..." : claim;
    emitLog("verdict", `Verifying: "${shortClaim}"`, "pending");
  },

  verdict: (status: string, confidence: number) => {
    const emoji = status === "verified" ? "✓" : status === "hallucinated" ? "✗" : "?";
    emitLog("verdict", `${emoji} ${status.toUpperCase()} (${confidence}%)`, "success");
  },

  trustScore: (score: number, label: string) => {
    emitLog("score", `Trust Score: ${score}% - ${label}`, "success");
  },

  providerFailure: (provider: string, error: string) => {
    emitLog("info", `[${provider.toUpperCase()}] Failed: ${error}`, "error");
  },

  providerSuccess: (provider: string, model: string) => {
    emitLog("info", `[${provider.toUpperCase()}] Success with ${model}`, "success");
  },

  info: (message: string) => {
    emitLog("info", message, "success");
  }
};
