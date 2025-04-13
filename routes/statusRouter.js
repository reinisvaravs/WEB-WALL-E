import express from "express";

export function statusRouter(sharedData) {
  const router = express.Router();

  // root /status
  router.get("/", async (req, res) => {
    res.json({
      status: "online",
      model: process.env.OPENAI_MODEL || "gpt-3.5-turbo",
      environment: sharedData.safeMode,
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  });

  return router;
}
