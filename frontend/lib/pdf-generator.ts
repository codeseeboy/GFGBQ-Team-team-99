/**
 * PDF Report Generator - TrustLayer AI
 * 
 * Generates professional PDF reports from verification analysis results.
 * Features:
 * - Dark theme matching UI design
 * - Multi-page layout with automatic pagination
 * - Claim cards with status indicators
 * - Evidence sources and citations
 * - Formatted trust scores and confidence levels
 * 
 * @requires jsPDF for PDF generation
 * @requires AnalysisResult interface for type safety
 */

import { jsPDF } from "jspdf";
import { AnalysisResult, Claim, Source } from "./api";

/**
 * Extended report data interface
 * @property {string} originalText - Original input text analyzed
 * @property {string} createdAt - ISO timestamp of report creation
 */
interface ReportData extends AnalysisResult {
  originalText: string;
  createdAt: string;
}

/**
 * Generates and downloads a verification report as PDF
 * 
 * @param {ReportData} report - Complete analysis result with original text
 * @param {string} reportId - Unique report identifier (used in filename)
 * @returns {Promise<void>} Triggers PDF download
 * 
 * @example
 * await generateReportPDF(analysisData, "report-123-abc");
 * // Downloads: TrustLayer_Report_report-1_2026-01-04.pdf
 */
export async function generateReportPDF(report: ReportData, reportId: string): Promise<void> {
  const pdf = new jsPDF("p", "mm", "a4");
  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 20;
  const maxW = pageWidth - margin * 2;
  let y = margin;

  /**
   * Color Palette - RGB arrays for jsPDF compatibility
   * Matches dark theme: purple (#8b5cf6), dark background (#0a0a0f)
   */
  // Colors as RGB arrays
  const purple = [139, 92, 246];
  const darkBg = [10, 10, 15];
  const cardBg = [20, 20, 28];
  const white = [255, 255, 255];
  const gray = [140, 140, 160];
  const green = [34, 197, 94];
  const yellow = [234, 179, 8];
  const red = [239, 68, 68];

  /**
   * Fills entire page with dark background color
   */
  // Fill entire page with dark background
  const fillPage = () => {
    pdf.setFillColor(darkBg[0], darkBg[1], darkBg[2]);
    pdf.rect(0, 0, pageWidth, pageHeight, "F");
  };

  /**
   * Creates a new page with dark background
   * Used for automatic pagination when content exceeds page height
   */
  // New page
  const newPage = () => {
    pdf.addPage();
    fillPage();
    y = margin;
  };

  /**
   * Checks if adding height h would exceed page bounds.
   * Automatically creates new page if necessary.
   * @param {number} h - Height in mm needed for next element
   */
  // Check page break
  const checkY = (h: number) => {
    if (y + h > pageHeight - margin) {
      newPage();
    }
  };

  /**
   * Cleans text by removing newlines, carriage returns, and normalizing spaces
   * Prevents text wrapping issues and overlapping text in PDF
   * @param {string} text - Raw text to clean
   * @returns {string} Cleaned text with single spaces
   */
  // Clean text - remove newlines and extra spaces
  const cleanText = (text: string): string => {
    if (!text) return "";
    return text
      .replace(/\r\n/g, " ")
      .replace(/\n/g, " ")
      .replace(/\r/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  };

  /**
   * Wraps text across multiple lines based on column width
   * Returns array of text lines that fit within the specified width
   * @param {string} text - Text to wrap
   * @param {number} fontSize - Font size in pt (affects character width)
   * @param {number} width - Maximum width in mm for each line
   * @returns {string[]} Array of text lines
   */
  // Text wrapping - returns array of lines
  const wrapLines = (text: string, fontSize: number, width: number): string[] => {
    const cleaned = cleanText(text);
    if (!cleaned) return [];
    pdf.setFontSize(fontSize);
    const words = cleaned.split(" ");
    const lines: string[] = [];
    let line = "";
    for (const w of words) {
      const test = line ? `${line} ${w}` : w;
      if (pdf.getTextWidth(test) > width && line) {
        lines.push(line);
        line = w;
      } else {
        line = test;
      }
    }
    if (line) lines.push(line);
    return lines;
  };

  /**
   * Maps claim status to color code
   * @param {string} s - Status: "verified", "uncertain", or "hallucinated"
   * @returns {number[]} RGB color array [r, g, b]
   */
  // Get status color
  const statusCol = (s: string) => {
    if (s === "verified") return green;
    if (s === "uncertain") return yellow;
    return red;
  };

  /**
   * Maps trust score to color code
   * Green (70+): High confidence
   * Yellow (40-69): Moderate confidence
   * Red (0-39): Low confidence / Review needed
   * @param {number} s - Score 0-100
   * @returns {number[]} RGB color array [r, g, b]
   */
  // Score color
  const scoreCol = (s: number) => {
    if (s >= 70) return green;
    if (s >= 40) return yellow;
    return red;
  };

  // ========================================================================
  // PAGE 1: HEADER & SUMMARY
  // ========================================================================
  
  /**
   * Title section with TrustLayer branding and report metadata
   */
  // ===== START =====
  fillPage();

  // Header - Logo
  pdf.setFillColor(purple[0], purple[1], purple[2]);
  pdf.roundedRect(margin, y, 16, 16, 4, 4, "F");
  pdf.setFontSize(22);
  pdf.setTextColor(white[0], white[1], white[2]);
  pdf.text("T", margin + 5, y + 11);

  // Header - Title
  pdf.setFontSize(26);
  pdf.setTextColor(white[0], white[1], white[2]);
  pdf.text("TrustLayer", margin + 22, y + 9);
  pdf.setTextColor(purple[0], purple[1], purple[2]);
  pdf.text("AI", margin + 67, y + 9);

  pdf.setFontSize(11);
  pdf.setTextColor(gray[0], gray[1], gray[2]);
  pdf.text("AI Verification Report", margin + 22, y + 15);

  y += 26;

  // Meta info box
  pdf.setFillColor(cardBg[0], cardBg[1], cardBg[2]);
  pdf.roundedRect(margin, y, maxW, 22, 4, 4, "F");

  // Report ID
  pdf.setFontSize(8);
  pdf.setTextColor(gray[0], gray[1], gray[2]);
  pdf.text("REPORT ID", margin + 6, y + 7);
  pdf.setFontSize(9);
  pdf.setTextColor(white[0], white[1], white[2]);
  pdf.text(reportId.slice(0, 20) + "...", margin + 6, y + 14);

  // Date
  pdf.setFontSize(8);
  pdf.setTextColor(gray[0], gray[1], gray[2]);
  pdf.text("GENERATED", margin + 55, y + 7);
  pdf.setFontSize(9);
  pdf.setTextColor(white[0], white[1], white[2]);
  const dt = new Date(report.createdAt).toLocaleString("en-US", {
    month: "short", day: "numeric", year: "numeric",
    hour: "numeric", minute: "2-digit"
  });
  pdf.text(dt, margin + 55, y + 14);

  // Trust Score
  pdf.setFontSize(8);
  pdf.setTextColor(gray[0], gray[1], gray[2]);
  pdf.text("TRUST SCORE", margin + 110, y + 7);
  const sc = report.score ?? 0;
  const scC = scoreCol(sc);
  pdf.setFontSize(18);
  pdf.setTextColor(scC[0], scC[1], scC[2]);
  pdf.text(`${sc}%`, margin + 110, y + 16);

  // Label (truncated to fit)
  const labelRaw = cleanText(report.label || "").toUpperCase();
  pdf.setFontSize(8);
  const labelLine = pdf.splitTextToSize(labelRaw, 40)[0] || "";
  pdf.text(labelLine, margin + 130, y + 16);

  y += 30;

  // ========================================================================
  // VERIFICATION SUMMARY SECTION
  // ========================================================================
  
  /**
   * Executive summary of verification results
   */
  // ===== SUMMARY SECTION =====
  checkY(25);
  pdf.setFillColor(purple[0], purple[1], purple[2]);
  pdf.roundedRect(margin, y, maxW, 9, 3, 3, "F");
  pdf.setFontSize(10);
  pdf.setTextColor(white[0], white[1], white[2]);
  pdf.text("VERIFICATION SUMMARY", margin + 5, y + 6);
  y += 14;

  const summary = report.summary || "No summary available.";
  // Sanitize summary: remove control characters and invalid UTF-8
  const sanitizedSummary = summary
    .replace(/[\x00-\x1F\x7F]/g, "") // Remove control characters
    .replace(/[^\x20-\x7E\n\r]/g, " ") // Keep only printable ASCII + newlines
    .slice(0, 1000); // Limit to 1000 chars
  
  const sumLines = wrapLines(sanitizedSummary, 10, maxW - 10);
  pdf.setFontSize(10);
  pdf.setTextColor(white[0], white[1], white[2]);
  for (const line of sumLines) {
    checkY(6.2);
    pdf.text(line, margin + 5, y);
    y += 6.2;
  }
  y += 8;

  // ========================================================================
  // ORIGINAL TEXT SECTION
  // ========================================================================
  
  /**
   * The original input text analyzed, displayed with quotation marks
   */
  // ===== ORIGINAL TEXT =====
  checkY(25);
  pdf.setFillColor(purple[0], purple[1], purple[2]);
  pdf.roundedRect(margin, y, maxW, 9, 3, 3, "F");
  pdf.setFontSize(10);
  pdf.setTextColor(white[0], white[1], white[2]);
  pdf.text("ORIGINAL TEXT ANALYZED", margin + 5, y + 6);
  y += 14;

  // Limit original text to first 500 chars to prevent overflow
  const origText = cleanText(report.originalText || "No text provided.").slice(0, 500);
  pdf.setFontSize(9);
  const origLines = pdf.splitTextToSize(`"${origText}"`, maxW - 10);
  pdf.setTextColor(gray[0], gray[1], gray[2]);
  const origLineHeight = 6;
  for (const line of origLines) {
    checkY(origLineHeight);
    pdf.text(line, margin + 5, y);
    y += origLineHeight;
  }
  y += 10;

  // ========================================================================
  // CLAIMS ANALYSIS SECTION
  // ========================================================================
  
  /**
   * Detailed analysis of each extracted claim with:
   * - Claim number and status badge
   * - Confidence percentage
   * - Explanation of verdict
   * - Supporting evidence from sources
   */
  // ===== CLAIMS =====
  const claims = report.claims || [];
  checkY(20);
  pdf.setFillColor(purple[0], purple[1], purple[2]);
  pdf.roundedRect(margin, y, maxW, 9, 3, 3, "F");
  pdf.setFontSize(10);
  pdf.setTextColor(white[0], white[1], white[2]);
  pdf.text(`CLAIMS ANALYSIS (${claims.length} claims)`, margin + 5, y + 6);
  y += 16;

  for (let i = 0; i < claims.length; i++) {
    const claim = claims[i];
    const status = claim.status || "uncertain";
    const col = statusCol(status);
    const conf = claim.confidence ?? 0;
    const confDisp = conf <= 1 ? Math.round(conf * 100) : Math.round(conf);
    const evidence = claim.evidence || [];

    // Pre-calculate card height with cleaned text
    const claimText = cleanText(claim.claim || "").slice(0, 300);
    const explainText = cleanText(claim.explanation || "").slice(0, 400);
    
    const claimLines = wrapLines(claimText, 10, maxW - 24);
    const explLines = wrapLines(explainText, 8, maxW - 24);
    const evidenceCount = Math.min(evidence.length, 4); // Limit evidence items
    const cardH = 24 + claimLines.length * 5 + explLines.length * 4 + (evidenceCount > 0 ? 8 + evidenceCount * 4 : 0);

    checkY(cardH + 8);

    // Card background
    pdf.setFillColor(cardBg[0], cardBg[1], cardBg[2]);
    pdf.roundedRect(margin, y, maxW, cardH, 4, 4, "F");

    // Left accent
    pdf.setFillColor(col[0], col[1], col[2]);
    pdf.rect(margin, y + 4, 4, cardH - 8, "F");

    let cy = y + 8;

    // Claim number badge
    pdf.setFillColor(col[0], col[1], col[2]);
    pdf.roundedRect(margin + 10, cy - 3, 14, 7, 2, 2, "F");
    pdf.setFontSize(9);
    pdf.setTextColor(white[0], white[1], white[2]);
    pdf.text(`#${i + 1}`, margin + 13, cy + 2);

    // Status badge (explicit fill to avoid white)
    pdf.setFillColor(col[0], col[1], col[2]);
    pdf.roundedRect(margin + 28, cy - 3, 26, 7, 2, 2, "F");
    pdf.setFontSize(7);
    pdf.setTextColor(white[0], white[1], white[2]);
    pdf.text(status.toUpperCase(), margin + 30, cy + 2);

    // Confidence
    pdf.setFontSize(8);
    pdf.setTextColor(gray[0], gray[1], gray[2]);
    pdf.text(`Confidence: ${confDisp}%`, margin + 56, cy + 2);

    cy += 10;

    // Claim text
    pdf.setFontSize(10);
    pdf.setTextColor(white[0], white[1], white[2]);
    for (const line of claimLines) {
      pdf.text(line, margin + 12, cy);
      cy += 5;
    }

    cy += 3;

    // Explanation
    pdf.setFontSize(8);
    pdf.setTextColor(gray[0], gray[1], gray[2]);
    for (const line of explLines) {
      pdf.text(line, margin + 12, cy);
      cy += 4;
    }

    // Evidence (limited to 4 items)
    if (evidenceCount > 0) {
      cy += 4;
      pdf.setFontSize(8);
      pdf.setTextColor(purple[0], purple[1], purple[2]);
      pdf.text("Evidence:", margin + 12, cy);
      cy += 4;

      pdf.setFontSize(7);
      pdf.setTextColor(gray[0], gray[1], gray[2]);
      for (let e = 0; e < evidenceCount; e++) {
        const ev = evidence[e];
        const src = cleanText(ev.source || "Source").slice(0, 25);
        const verdict = cleanText(ev.verdict || "Retrieved").slice(0, 20);
        pdf.text(`• ${src}: ${verdict}`, margin + 14, cy);
        cy += 4;
      }
    }

    y += cardH + 6;
  }

  y += 6;

  // ========================================================================
  // SOURCES SECTION
  // ========================================================================
  
  /**
   * List of all Wikipedia and web search sources used as evidence
   * Displays title and verification status (green dot = verified, red = contradicts)
   */
  // ===== SOURCES =====
  const sources = report.sources || [];
  if (sources.length > 0) {
    checkY(20);
    pdf.setFillColor(purple[0], purple[1], purple[2]);
    pdf.roundedRect(margin, y, maxW, 9, 3, 3, "F");
    pdf.setFontSize(10);
    pdf.setTextColor(white[0], white[1], white[2]);
    pdf.text(`SOURCES (${sources.length})`, margin + 5, y + 6);
    y += 14;

    // Limit to 10 sources
    const maxSources = Math.min(sources.length, 10);
    for (let i = 0; i < maxSources; i++) {
      checkY(12);
      const src = sources[i];
      pdf.setFillColor(cardBg[0], cardBg[1], cardBg[2]);
      pdf.roundedRect(margin, y, maxW, 10, 3, 3, "F");

      pdf.setFontSize(9);
      pdf.setTextColor(white[0], white[1], white[2]);
      const title = cleanText(src.title || "Unknown").slice(0, 50);
      pdf.text(`${i + 1}. ${title}`, margin + 5, y + 6.5);

      // Status dot
      const dotCol = src.verified ? green : src.suspicious ? red : gray;
      pdf.setFillColor(dotCol[0], dotCol[1], dotCol[2]);
      pdf.circle(margin + maxW - 8, y + 5, 2.5, "F");

      y += 12;
    }
  }

  y += 12;

  // ========================================================================
  // FOOTER SECTION
  // ========================================================================
  
  /**
   * Footer with:
   * - Legal/attribution text
   * - Copyright notice
   * - Contact information
   */
  // ===== FOOTER =====
  checkY(30);
  pdf.setDrawColor(cardBg[0], cardBg[1], cardBg[2]);
  pdf.setLineWidth(0.5);
  pdf.line(margin, y, margin + maxW, y);
  y += 8;

  pdf.setFontSize(9);
  pdf.setTextColor(gray[0], gray[1], gray[2]);
  pdf.text("This report was generated by TrustLayer AI verification engine.", margin, y);
  y += 5;
  pdf.text("For questions about this verification, contact support@trustlayer.ai", margin, y);
  y += 8;

  pdf.setTextColor(purple[0], purple[1], purple[2]);
  pdf.text(`© ${new Date().getFullYear()} TrustLayer AI - ByteQuest 2025 Hackathon`, margin, y);

  // ========================================================================
  // PDF GENERATION & DOWNLOAD
  // ========================================================================
  
  /**
   * Generates filename with report ID and date
   * Downloads PDF to user's default download folder
   */
  // Save
  const filename = `TrustLayer_Report_${reportId.slice(0, 8)}_${new Date().toISOString().slice(0, 10)}.pdf`;
  pdf.save(filename);
}
