import { getConfigValue, setConfigValue, incrementStat } from "../db.js";
import pool from "../db.js";
import { isAdmin } from "../core/adminAuth.js";

// Command definitions
const commands = {
  help: {
    description: "Show available commands",
    execute: async () => {
      const commandList = Object.entries(commands)
        .map(([cmd, info]) => `/${cmd}: ${info.description}`)
        .join("\n");
      return `Available commands:\n${commandList}`;
    },
  },
  reset: {
    description: "Reset the conversation",
    execute: async () => {
      return "Conversation reset. Each message is now self-contained.";
    },
  },
  model: {
    description: "Change AI model (gpt-3.5-turbo, gpt-4, gpt-4-turbo)",
    execute: async (userId, args, adminToken) => {
      if (!isAdmin(userId, adminToken)) {
        return "Access denied. Admin authentication required.";
      }
      if (!args || !args[0]) {
        const currentModel =
          (await getConfigValue("gpt_model")) || "gpt-3.5-turbo";
        return `Current model: ${currentModel}\nUsage: /model <model-name>`;
      }

      const model = args[0].toLowerCase();
      const validModels = ["gpt-3.5-turbo", "gpt-4", "gpt-4-turbo"];

      if (!validModels.includes(model)) {
        return `Invalid model. Available models: ${validModels.join(", ")}`;
      }

      await setConfigValue("gpt_model", model);
      return `Model changed to ${model}`;
    },
  },
  stats: {
    description: "Show usage statistics",
    execute: async (userId, args, adminToken) => {
      if (!isAdmin(userId, adminToken)) {
        return "Access denied. Admin authentication required.";
      }
      const result = await pool.query(`
        SELECT model, SUM(tokens) AS total_tokens
        FROM user_logs
        GROUP BY model
      `);
      const messageCount = await pool.query(`
        SELECT value FROM bot_stats WHERE stat_key = 'messages_sent'
      `);

      const stats = [
        `Total messages: ${messageCount.rows[0]?.value || 0}`,
        "Token usage by model:",
        ...result.rows.map(
          (row) => `- ${row.model}: ${row.total_tokens} tokens`
        ),
      ].join("\n");

      return stats;
    },
  },
  about: {
    description: "Show information about WALL-E",
    execute: async () => {
      return `WALL-E is an AI-powered chatbot with knowledge base integration.
Features:
- Vector-based knowledge search
- Automatic knowledge updates
- Multiple AI models
- Usage statistics

For more information, visit: https://github.com/reinisvaravs/WEB-WALL-E`;
    },
  },
};

// Command handler
export async function handleCommand(
  command,
  userId,
  args = [],
  adminToken = null
) {
  const cmd = command.toLowerCase();

  if (!commands[cmd]) {
    return `Unknown command: ${cmd}\nUse /help to see available commands.`;
  }

  try {
    const response = await commands[cmd].execute(userId, args, adminToken);
    await incrementStat("commands_used");
    return response;
  } catch (error) {
    console.error(`Error executing command ${cmd}:`, error);
    return `Error executing command: ${error.message}`;
  }
}

// Check if a message is a command
export function isCommand(message) {
  return message.startsWith("/");
}

// Parse a command message
export function parseCommand(message) {
  const parts = message.slice(1).split(" ");
  return {
    command: parts[0],
    args: parts.slice(1),
  };
}
