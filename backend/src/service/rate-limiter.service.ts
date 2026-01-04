import { logger } from "./logger.service";

/**
 * RATE LIMITING & RETRY UTILITY
 * Prevents burst load on LLM APIs (Gemini, Groq, OpenRouter)
 * 
 * Implements:
 * - Per-provider rate limiting (10 req/min)
 * - Exponential backoff retry (up to 3 attempts)
 * - Provider-specific metrics tracking
 */

// Use dynamic import for p-queue (ESM module)
let PQueue: any;
(async () => {
  const module = await import("p-queue");
  PQueue = module.default;
})();

interface ProviderStats {
  name: string;
  successCount: number;
  failureCount: number;
  lastError?: string;
  successRate: number;
}

/**
 * Simple async queue implementation as fallback if p-queue fails to load
 */
class SimpleQueue {
  private queue: Array<() => Promise<any>> = [];
  private processing = false;
  private intervalCap: number;
  private interval: number;
  private requestTimes: number[] = [];

  constructor(options: { interval: number; intervalCap: number }) {
    this.interval = options.interval;
    this.intervalCap = options.intervalCap;
  }

  async add<T>(fn: () => Promise<T>): Promise<T> {
    const now = Date.now();
    
    // Remove old timestamps outside the interval
    this.requestTimes = this.requestTimes.filter(time => now - time < this.interval);
    
    // If at capacity, wait
    if (this.requestTimes.length >= this.intervalCap) {
      const oldestTime = this.requestTimes[0];
      const waitTime = this.interval - (now - oldestTime) + 100;
      await new Promise(r => setTimeout(r, Math.max(0, waitTime)));
    }
    
    this.requestTimes.push(Date.now());
    return fn();
  }
}

export class RateLimiter {
  private geminiQueue: any;
  private groqQueue: any;
  private openrouterQueue: any;
  
  private stats: { [key: string]: ProviderStats } = {
    gemini: { name: "Gemini", successCount: 0, failureCount: 0, successRate: 0 },
    groq: { name: "Groq", successCount: 0, failureCount: 0, successRate: 0 },
    openrouter: { name: "OpenRouter", successCount: 0, failureCount: 0, successRate: 0 }
  };

  constructor() {
    // Use p-queue if available, otherwise use simple queue
    const QueueImpl = PQueue || SimpleQueue;
    
    // Rate limits per provider (10 requests per minute to avoid quota exhaustion)
    this.geminiQueue = new QueueImpl({
      interval: 60000,      // 1 minute window
      intervalCap: 10,      // max 10 requests/min
      carryoverConcurrencyCount: false
    });

    this.groqQueue = new QueueImpl({
      interval: 60000,
      intervalCap: 15,      // Groq slightly higher limit
      carryoverConcurrencyCount: false
    });

    this.openrouterQueue = new QueueImpl({
      interval: 60000,
      intervalCap: 12,
      carryoverConcurrencyCount: false
    });
  }

  /**
   * Execute function with rate limiting and retry logic
   * @param provider "gemini" | "groq" | "openrouter"
   * @param fn The async function to execute
   * @param maxRetries Number of retry attempts (default: 3)
   * @returns The result of fn()
   */
  async executeWithRetry<T>(
    provider: "gemini" | "groq" | "openrouter",
    fn: () => Promise<T>,
    maxRetries: number = 3
  ): Promise<T> {
    const queue = this.getQueue(provider);
    const stats = this.stats[provider];
    let lastError: Error | null = null;
    let delay = 1000; // Start with 1 second

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const result = await queue.add(async () => {
          return await fn();
        });
        
        // Success: track metrics
        stats.successCount++;
        this.updateSuccessRate(provider);
        console.log(`[RateLimit-${provider}] ✓ Success (attempt ${attempt}/${maxRetries})`);
        return result;
      } catch (error: any) {
        lastError = error;
        const errorMsg = error?.message?.slice(0, 100) || "Unknown error";
        
        console.log(
          `[RateLimit-${provider}] ✗ Attempt ${attempt}/${maxRetries} failed: ${errorMsg}`
        );

        // If this was the last attempt, fail
        if (attempt === maxRetries) {
          stats.failureCount++;
          stats.lastError = errorMsg;
          this.updateSuccessRate(provider);
          console.log(`[RateLimit-${provider}] All ${maxRetries} attempts exhausted`);
          break;
        }

        // Wait before retry (exponential backoff)
        // 1s → 2s → 4s
        await new Promise((r) => setTimeout(r, delay));
        delay *= 2;
      }
    }

    // All retries failed
    logger.providerFailure(provider, lastError?.message || "Unknown error");
    throw lastError || new Error(`${provider} verification failed after ${maxRetries} retries`);
  }

  /**
   * Get queue for specific provider
   */
  private getQueue(provider: "gemini" | "groq" | "openrouter"): any {
    switch (provider) {
      case "gemini":
        return this.geminiQueue;
      case "groq":
        return this.groqQueue;
      case "openrouter":
        return this.openrouterQueue;
      default:
        return this.geminiQueue;
    }
  }

  /**
   * Update success rate metrics
   */
  private updateSuccessRate(provider: "gemini" | "groq" | "openrouter"): void {
    const stats = this.stats[provider];
    const total = stats.successCount + stats.failureCount;
    stats.successRate = total > 0 ? (stats.successCount / total) * 100 : 0;
    console.log(
      `[RateLimit-${provider}] Success rate: ${stats.successRate.toFixed(1)}% (${stats.successCount}/${total})`
    );
  }

  /**
   * Get metrics for all providers
   */
  getMetrics(): Record<string, ProviderStats> {
    return this.stats;
  }

  /**
   * Get best performing provider
   */
  getBestProvider(): string {
    const rates: { [key: string]: number } = {
      gemini: this.stats.gemini.successRate,
      groq: this.stats.groq.successRate,
      openrouter: this.stats.openrouter.successRate
    };
    
    return Object.entries(rates).sort(([, a], [, b]) => b - a)[0]?.[0] || "groq";
  }

  /**
   * Log provider statistics
   */
  logStats(): void {
    console.log("\n[RateLimit] PROVIDER STATISTICS:");
    Object.values(this.stats).forEach((stat) => {
      const total = stat.successCount + stat.failureCount;
      console.log(
        `  ${stat.name}: ${stat.successRate.toFixed(1)}% success ` +
        `(${stat.successCount} success, ${stat.failureCount} failures)` +
        `${stat.lastError ? ` - Last error: ${stat.lastError}` : ""}`
      );
    });
    console.log("");
  }
}

// Singleton instance
export const rateLimiter = new RateLimiter();
