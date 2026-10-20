import { Router, type IRouter } from "express";
import { authMiddleware } from "../middlewares/auth.js";

const router: IRouter = Router();

router.post("/ai/chat", authMiddleware(), async (req, res): Promise<void> => {
  const apiKey = process.env["OPENAI_API_KEY"];
  if (!apiKey) {
    res.status(503).json({ error: "AI is not configured. Add OPENAI_API_KEY to your environment." });
    return;
  }

  const incoming = Array.isArray(req.body?.messages) ? req.body.messages : [];
  const messages = incoming
    .filter((message: any) => message && ["user", "assistant"].includes(message.role) && typeof message.content === "string")
    .slice(-12)
    .map((message: any) => ({ role: message.role, content: message.content.slice(0, 4000) }));

  if (!messages.length) {
    res.status(400).json({ error: "At least one message is required." });
    return;
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env["OPENAI_MODEL"] || "gpt-4o-mini",
        max_tokens: 700,
        messages: [
          {
            role: "system",
            content: `You are the helpful college assistant for BIET ERP. The logged-in user's role is ${req.user?.role || "user"}.
Answer clearly and briefly. Help with college portal navigation, attendance, assignments, results, fees, notices, library, admissions, and website information.
Never invent private records or claim an action was completed if you cannot do it. If a request requires an admin, explain which portal section to use.`,
          },
          ...messages,
        ],
      }),
    });

    const data = await response.json() as any;
    if (!response.ok) {
      res.status(502).json({ error: data?.error?.message || "The AI service returned an error." });
      return;
    }

    const content = data?.choices?.[0]?.message?.content;
    if (!content) {
      res.status(502).json({ error: "The AI service returned an empty response." });
      return;
    }
    res.json({ content });
  } catch {
    res.status(502).json({ error: "Unable to reach the AI service right now." });
  }
});

export default router;