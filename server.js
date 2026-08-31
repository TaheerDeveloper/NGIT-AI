const express = require("express");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

const PHP_API_BASE = "https://nipssmuslim.com.ng/ngitAI";
const API_KEY = process.env.API_KEY;

app.use(express.json({ limit: "1mb" }));
app.use(express.static(path.join(__dirname)));

/* =========================================================
   CONFIG CHECK
========================================================= */

if (!API_KEY) {
  console.warn(
    "Warning: API_KEY is not set. Create a .env file with API_KEY=your_key"
  );
}

/* =========================================================
   HELPER: CALL PHP API
========================================================= */

async function callPHP(endpoint, data) {
  const response = await fetch(`${PHP_API_BASE}/${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(data),
  });

  const text = await response.text();

  let result;

  try {
    result = JSON.parse(text);
  } catch {
    result = {
      success: false,
      message: "Invalid response from PHP backend",
      raw: text,
    };
  }

  return {
    status: response.status,
    ok: response.ok,
    data: result,
  };
}

/* =========================================================
   LOGIN
   POST /api/auth/login
========================================================= */

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email = "", password = "" } = req.body || {};

    if (!email.trim() || !password.trim()) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const result = await callPHP("login.php", {
      email: email.trim().toLowerCase(),
      password: password.trim(),
    });

    return res.status(result.status).json(result.data);
  } catch (error) {
    console.error("LOGIN ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to connect to authentication server",
    });
  }
});

/* =========================================================
   REGISTER
   POST /api/auth/register
========================================================= */

app.post("/api/auth/register", async (req, res) => {
  try {
    const {
      full_name = "",
      email = "",
      password = "",
      gender = "",
    } = req.body || {};

    if (
      !full_name.trim() ||
      !email.trim() ||
      !password.trim() ||
      !gender.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const result = await callPHP("register.php", {
      full_name: full_name.trim(),
      email: email.trim().toLowerCase(),
      password: password.trim(),
      gender: gender.trim(),
    });

    return res.status(result.status).json(result.data);
  } catch (error) {
    console.error("REGISTER ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to connect to registration server",
    });
  }
});

/* =========================================================
   AI GENERATE
   POST /api/generate
========================================================= */

app.post("/api/generate", async (req, res) => {
  try {
    const {
      conversationHistory = [],
      userPrompt = "",
      userName = "",
      companyData = "",
    } = req.body || {};

    if (!userPrompt.trim()) {
      return res.status(400).json({
        success: false,
        error: "userPrompt required",
      });
    }

    if (!API_KEY) {
      return res.status(500).json({
        success: false,
        error: "AI service is not configured",
      });
    }

    const endpoint =
      `https://generativelanguage.googleapis.com/v1beta/models/` +
      `gemini-2.5-flash:generateContent?key=${API_KEY}`;

    const contents = conversationHistory.map((item) => ({
      role: item.role,
      parts: [
        {
          text: item.text,
        },
      ],
    }));

    contents.push({
      role: "user",
      parts: [
        {
          text: userPrompt,
        },
      ],
    });

    const systemInstructionText = `
You are the official NGIT AI Mentor, a friendly and expert learning assistant for NGIT Software Solutions.

Your identity is strictly NGIT AI Mentor and Assistant.

Never mention Google, Gemini, or any API provider.
Never say you are ChatGPT or powered by Google.

Always use the user's name ${userName} naturally when appropriate.

Company facts:
${companyData}

Important rules:

1. If the user speaks Hausa, answer in clear Hausa.
2. If the user speaks English, answer in English.
3. Always prioritize NGIT courses, pricing, durations, location, staff, and core values when relevant.
4. If the user asks about the CEO or staff, mention Abubakar Abdullahi as CEO and the other listed team members accurately.
5. If the user asks about your identity or the technology powering you, say you are the NGIT AI Mentor and Assistant.
6. Do not mention Google, Gemini, or APIs.
7. Keep replies concise, helpful, and professional.
`;

    const body = {
      contents,
      systemInstruction: {
        parts: [
          {
            text: systemInstructionText,
          },
        ],
      },
    };

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");

      console.error("AI ERROR:", errorText);

      return res.status(response.status).json({
        success: false,
        error: errorText || `AI request failed: ${response.status}`,
      });
    }

    const data = await response.json();

    const replyText =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "I'm here to help with NGIT and technology questions.";

    return res.json({
      success: true,
      reply: replyText,
    });
  } catch (error) {
    console.error("GENERATE ERROR:", error);

    return res.status(500).json({
      success: false,
      error: "AI server error",
    });
  }
});

/* =========================================================
   HEALTH CHECK
========================================================= */

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "NGIT AI Mentor server is running",
  });
});

/* =========================================================
   SERVER
========================================================= */

app.listen(PORT, () => {
  console.log(
    `NGIT AI Mentor server running at http://localhost:${PORT}`
  );
});