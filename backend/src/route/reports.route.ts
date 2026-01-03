import { Router } from "express";
import { VerificationResult } from "../model/VerificationResult";
import { authMiddleware, AuthRequest } from "../middleware/auth.middleware";

const router = Router();

// Get all reports for authenticated user
router.get("/", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const reports = await VerificationResult.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .limit(50)
      .select("_id originalText trustScore label createdAt");

    const formattedReports = reports.map((report: any) => ({
      id: report._id.toString(),
      title: report.originalText.slice(0, 50) + (report.originalText.length > 50 ? "..." : ""),
      timestamp: formatTimeAgo(report.createdAt),
      score: report.trustScore,
      status: getStatusFromScore(report.trustScore),
      label: report.label
    }));

    res.json(formattedReports);
  } catch (err) {
    console.error("Get reports error:", err);
    res.status(500).json({ message: "Failed to fetch reports" });
  }
});

// Get single report details
router.get("/:id", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const report = await VerificationResult.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    res.json({
      id: report._id.toString(),
      originalText: report.originalText,
      score: report.trustScore,
      label: report.label,
      claims: report.claims,
      verifiedText: report.verifiedText,
      createdAt: report.createdAt
    });
  } catch (err) {
    console.error("Get report error:", err);
    res.status(500).json({ message: "Failed to fetch report" });
  }
});

// Delete a report
router.delete("/:id", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const result = await VerificationResult.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId
    });

    if (!result) {
      return res.status(404).json({ message: "Report not found" });
    }

    res.json({ message: "Report deleted successfully" });
  } catch (err) {
    console.error("Delete report error:", err);
    res.status(500).json({ message: "Failed to delete report" });
  }
});

// Helper functions
function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 60) return `${minutes} min ago`;
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  if (days < 7) return `${days} day${days > 1 ? "s" : ""} ago`;
  return new Date(date).toLocaleDateString();
}

function getStatusFromScore(score: number): string {
  if (score >= 75) return "Verified";
  if (score >= 50) return "Flagged";
  return "Critical";
}

export default router;
