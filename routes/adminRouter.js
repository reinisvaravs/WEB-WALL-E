import express from "express";
import { getFormattedHistory, resetHistory } from "../core/messageMemory.js";
import { getConfigValue, setConfigValue } from "../db.js";
import pool from "../db.js";

const router = express.Router();

router.get("/memory/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const memory = await getFormattedHistory(userId);
    res.json({ success: true, memory });
  } catch (err) {
    console.error("Failed to get memory for user:", userId, err);
    res.status(500).json({ success: false, message: "Error loading memory" });
  }
});

router.post("/memory/:userId/reset", async (req, res) => {
  const { userId } = req.params;

  try {
    await resetHistory(userId);
    res.json({ success: true, message: `Memory reset for user ${userId}` });
  } catch (err) {
    console.error("Error resetting memory for user:", userId, err);
    res
      .status(500)
      .json({ success: false, message: "Failed to reset memory." });
  }
});

router.get("/logs", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT user_id, model, tokens, created_at
       FROM user_logs
       ORDER BY created_at DESC
       LIMIT 100`
    );
    res.json({ success: true, logs: result.rows });
  } catch (err) {
    console.error("Error fetching usage logs:", err);
    res.status(500).json({ success: false, message: "Failed to fetch logs" });
  }
});

router.get("/usage-summary", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT model, SUM(tokens) AS total_tokens
      FROM user_logs
      GROUP BY model
    `);
    const messageCount = await pool.query(`
      SELECT value FROM bot_stats WHERE stat_key = 'messages_sent'
    `);

    res.json({
      success: true,
      totalMessages: messageCount.rows[0]?.value || 0,
      tokenUsageByModel: result.rows,
    });
  } catch (err) {
    console.error("❌ Failed to get usage summary:", err);
    res.status(500).json({ success: false });
  }
});

// Get current model configuration
router.get("/config/model", async (req, res) => {
  try {
    const model = (await getConfigValue("gpt_model")) || "gpt-3.5-turbo";
    res.json({ success: true, model });
  } catch (err) {
    console.error("Error fetching model configuration:", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch model configuration" });
  }
});

// Update model configuration
router.post("/config/model", async (req, res) => {
  try {
    const { model } = req.body;

    if (!model) {
      return res
        .status(400)
        .json({ success: false, message: "Model is required" });
    }

    // Validate model name
    const validModels = ["gpt-3.5-turbo", "gpt-4", "gpt-4-turbo"];
    if (!validModels.includes(model)) {
      return res.status(400).json({
        success: false,
        message: "Invalid model. Must be one of: " + validModels.join(", "),
      });
    }

    await setConfigValue("gpt_model", model);
    res.json({ success: true, message: `Model updated to ${model}` });
  } catch (err) {
    console.error("Error updating model configuration:", err);
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to update model configuration",
      });
  }
});

export default router;
