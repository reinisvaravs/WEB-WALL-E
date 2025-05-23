import { setTimeout as wait } from "node:timers/promises";

export async function fetchOpenAIResponse(openai, messages, selectedModel) {
  let retries = 2;
  let delay = 5000;

  for (let attempt = 1; attempt <= retries + 1; attempt++) {
    try {
      return await openai.chat.completions.create({
        model: selectedModel,
        messages,
      });
    } catch (err) {
      if (err.status === 429 && attempt <= retries) {
        console.warn(
          `⚠️ Rate limit hit (attempt ${attempt}). Retrying in ${
            delay / 1000
          }s...`
        );
        await wait(delay);
        delay *= 2;
      } else {
        console.error("OpenAI Error:\n", err);
        return null;
      }
    }
  }
}
