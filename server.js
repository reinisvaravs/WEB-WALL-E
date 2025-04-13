import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { OpenAI } from "openai";

import { initializeBotData } from "./core/initializeBotData.js";
import { statusRouter } from "./routes/statusRouter.js";
import adminRouter from "./routes/adminRouter.js";
import chatRouter from "./routes/chatRouter.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Determine environment mode
const safeMode = process.env.RENDER ? "prod" : "dev";

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://discord-openai-bot-0vmd.onrender.com",
      "https://reinisvaravs.com",
      "http://localhost:5173",
    ],
  })
);
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// OpenAI setup
const openai = new OpenAI({
  apiKey: process.env.OPENAI_KEY,
});

// Make OpenAI client available to routes
app.locals.openai = openai;

// Start the server
app.listen(PORT, async () => {
  console.log(`[port: ${PORT}]`);
  await initializeBotData(safeMode);
  console.log("✅ Server started successfully");
});

// Status route
app.use(
  "/status",
  statusRouter({
    safeMode,
  })
);

// Admin routes
app.use("/api/admin", adminRouter);

// Chat routes
app.use("/api", chatRouter);
