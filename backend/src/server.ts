/**
 * TrustLayer AI - Server Entry Point
 * 
 * Initializes environment variables, MongoDB connection, and starts Express server.
 * All microservices (Gemini, Groq, OpenRouter, Wikipedia, SerpAPI) are initialized
 * in their respective service files.
 */

import dotenv from "dotenv";
// Load environment variables FIRST before any other imports
dotenv.config();

import mongoose from "mongoose";
import app from "./app";

const PORT = process.env.PORT || 4000;

/**
 * MongoDB Connection & Server Startup
 * Connects to MongoDB Atlas and starts Express server on configured port.
 * Logs connection status and API key availability for debugging.
 */
mongoose
  .connect(process.env.MONGO_URI!)
  .then(() => {
    console.log("✓ Database connected");
    console.log(`✓ Server running on http://localhost:${PORT}`);
    console.log("✓ All services initialized and ready");
    app.listen(PORT);
  })
  .catch((err) => console.error("✗ Database connection error:", err.message));
