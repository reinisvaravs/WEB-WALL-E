import { loadAndEmbedKnowledge } from "../knowledgeEmbedder.js";
import { refreshSystemPrompt } from "./systemPromptCache.js";

export async function initializeBotData(safeMode) {
  console.log("🔄 Initializing bot data...");

  // Load system prompt and knowledge base
  await refreshSystemPrompt();
  await loadAndEmbedKnowledge();

  console.log("✅ Bot data initialized successfully");

  // Auto-refresh knowledge + prompt every 10 minutes
  setInterval(async () => {
    console.log("🔄 Auto-refreshing knowledge base + system prompt...");
    await loadAndEmbedKnowledge();
    await refreshSystemPrompt();
  }, 10 * 60 * 1000); // 10 minutes
}
