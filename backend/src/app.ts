import express from "express";
import cors from "cors";
import verificationRoutes from "./route/verification.route";
import authRoutes from "./route/auth.route";
import reportsRoutes from "./route/reports.route";

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/verification", verificationRoutes);
app.use("/api/reports", reportsRoutes);

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ message: "Unexpected error" });
});

export default app;
