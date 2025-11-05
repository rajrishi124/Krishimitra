// chatbot.js
const express = require("express");
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");

// ---------------- Configure Gemini ----------------
const GEMINI_API_KEY = process.env.GEMINI_API_KEY?.trim();
if (!GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY not set in .env");
}~

const ai = new GoogleGenerativeAI({ apiKey: GEMINI_API_KEY });

// ---------------- Chat History ----------------
const chatHistory = [];

// ---------------- Helper: basic replies ----------------
const basicReplies = {
  hello: {
    hi: "नमस्ते! मैं एग्रोबॉट हूँ। खेती से संबंधित सवाल पूछें।",
    en: "Hello! I am AgroBot. Ask me any questions about farming.",
  },
  "thank you": {
    hi: "खुशी है कि मैं मदद कर सका।",
    en: "You're welcome! Happy to help.",
  },
  ok: { hi: "ठीक है।", en: "Okay." },
  bye: { hi: "अलविदा! शुभकामनाएँ।", en: "Goodbye! Take care." },
};

// ---------------- POST /api/chat ----------------
router.post("/", async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({
        reply_hi: "⚠ कृपया संदेश भेजें।",
        reply_en: "⚠ Please send a valid message.",
      });
    }

    // Check basic replies first
    const lower = message.toLowerCase();
    for (let key in basicReplies) {
      if (lower.includes(key)) {
        return res.json(basicReplies[key]);
      }
    }

    // Check government scheme guidance
    if (lower.includes("scheme")) {
      const knownSchemes = ["pm kisan", "soil health card", "kisan credit card"];
      if (!knownSchemes.some((k) => lower.includes(k))) {
        return res.json({
          reply_hi: "कृपया बताएं कि आप किस योजना के बारे में जानना चाहते हैं?",
          reply_en:
            "Please specify which government scheme you want information about (e.g., PM Kisan, Soil Health Card).",
        });
      }
    }

    // Add user message to chat history (optional: limit last 20 messages)
    chatHistory.push({ role: "user", content: message });
    if (chatHistory.length > 20) chatHistory.splice(0, chatHistory.length - 20);

    // ---------------- Gemini AI ----------------
    const systemPrompt = `
You are "AgroBot", an expert agricultural assistant for Indian farmers.
Respond in both Hindi and English. Keep responses short, friendly, and actionable.
Current Date: ${new Date().toLocaleDateString()}.
`;

    const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent({
      contents: chatHistory.map((m) => ({ role: m.role, text: m.content })),
      generationConfig: { maxOutputTokens: 500 },
      systemInstruction: systemPrompt,
    });

    const botText =
      result.response?.text?.() || result.output?.[0]?.content?.[0]?.text || "⚠ AI से उत्तर नहीं मिला।";

    chatHistory.push({ role: "assistant", content: botText });

    res.json({ reply_hi: botText, reply_en: botText });
  } catch (err) {
    console.error("Chat error:", err);
    res.status(500).json({ reply_hi: "⚠ AI से उत्तर नहीं मिला।", reply_en: "⚠ Could not generate response." });
  }
});

// ---------------- POST /api/chat/clear ----------------
router.post("/clear", (req, res) => {
  chatHistory.length = 0;
  res.json({ success: true });
});

module.exports = router;