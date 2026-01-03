/**
 * TrustLayer AI - Express Server Application
 * 
 * Main Express app configuration with middleware, routes, and real-time log streaming.
 * Handles all API endpoints for verification, authentication, and report management.
 */

import express from "express";
import cors from "cors";
import verificationRoutes from "./route/verification.route";
import authRoutes from "./route/auth.route";
import reportsRoutes from "./route/reports.route";
import { logEmitter, LogEntry } from "./service/logger.service";

const app = express();

app.use(cors());
app.use(express.json());

/**
 * Server-Sent Events (SSE) endpoint for real-time log streaming.
 * Clients subscribe to live verification engine events.
 */
app.get("/api/logs/stream", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.flushHeaders();

  const onLog = (entry: LogEntry) => {
    res.write(`data: ${JSON.stringify(entry)}\n\n`);
  };

  logEmitter.on("log", onLog);

  req.on("close", () => {
    logEmitter.off("log", onLog);
  });
});

// Routes
/**
 * API Route Registration
 * - /api/auth: Authentication & user management
 * - /api/verification: Core verification engine
 * - /api/reports: Report storage & retrieval
 */
app.use("/api/auth", authRoutes);
app.use("/api/verification", verificationRoutes);
app.use("/api/reports", reportsRoutes);

/**
 * Health Check Endpoint
 * Returns server status and timestamp for monitoring/load balancing.
 */
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

/**
 * Global Error Handler Middleware
 * Catches unhandled errors and returns 500 response.
 */
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ message: "Unexpected error" });
});

export default app;
