import dotenv from "dotenv";
// Load environment variables FIRST before any other imports
dotenv.config();

import mongoose from "mongoose";
import app from "./app";

const PORT = process.env.PORT || 4000;

mongoose
  .connect(process.env.MONGO_URI!)
  .then(() => {
    console.log("MongoDB connected");
    console.log(`GEMINI_API_KEY loaded: ${process.env.GEMINI_API_KEY ? 'Yes (' + process.env.GEMINI_API_KEY.slice(0,10) + '...)' : 'No'}`);
    console.log(`SERP_API_KEY loaded: ${process.env.SERP_API_KEY ? 'Yes' : 'No'}`);
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => console.error("MongoDB connection error:", err));
