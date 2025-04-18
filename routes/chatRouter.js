import express from "express";
import { getRelevantChunksForMessage } from "../knowledgeEmbedder.js";
import { buildSystemPrompt } from "../ai/buildSystemPrompt.js";
import { fetchOpenAIResponse } from "../ai/fetchOpenAIResponse.js";
import { getConfigValue, incrementStat, logUserTokenUsage } from "../db.js";
import {
  handleCommand,
  isCommand,
  parseCommand,
} from "../commands/commandHandler.js";

const router = express.Router();

// Helper function to sanitize names for OpenAI API
function sanitizeName(name) {
  // Replace spaces and special characters with underscores
  return name.replace(/[\s<|\\/>]/g, "_");
}

router.post("/chat", async (req, res) => {
  try {
    const { message, conversationHistory = [], adminToken } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    // Handle commands
    if (isCommand(message)) {
      const { command, args } = parseCommand(message);
      const response = await handleCommand(
        command,
        "web-user",
        args,
        adminToken
      );

      return res.json({
        response,
      });
    }

    // Get relevant chunks based on message length
    const msgLength = message.trim().length;
    let topK = 2;
    if (msgLength > 30) topK = 4;
    if (msgLength > 100) topK = 6;
    if (msgLength > 200) topK = 8;
    if (msgLength > 300) topK = 12;

    const relevantChunks = await getRelevantChunksForMessage(message, topK);
    const systemPrompt = buildSystemPrompt(relevantChunks);

    // Use client-provided conversation history
    const conversation = [
      { role: "system", content: systemPrompt },
      ...conversationHistory,
      { role: "user", content: message },
    ];

    // Get model configuration
    const selectedModel =
      (await getConfigValue("gpt_model")) || "gpt-3.5-turbo";

    // Get AI response
    const response = await fetchOpenAIResponse(
      req.app.locals.openai,
      conversation,
      selectedModel
    );

    if (!response) {
      return res.status(500).json({ error: "Failed to get response from AI" });
    }

    // Log token usage
    if (response?.usage?.total_tokens) {
      await logUserTokenUsage(
        "web-user",
        selectedModel,
        response.usage.total_tokens
      );
    }

    await incrementStat("messages_sent");

    let responseMessage = response.choices[0].message.content;

    // Clean up response message
    responseMessage = responseMessage
      .split("\n")
      .filter((line, index) => !line.startsWith("WALL-E:") || index === 0)
      .join("\n");

    if (responseMessage.startsWith("WALL-E:")) {
      responseMessage = responseMessage.replace(/^WALL-E:\s*/, "");
    }

    return res.json({
      response: responseMessage,
    });
  } catch (error) {
    console.error("Chat error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
