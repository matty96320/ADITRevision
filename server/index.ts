import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import path from 'path';

// Load environment variables from parent directory or current
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const API_KEY = process.env.GEMINI_API_KEY || process.env.API_KEY;

if (!API_KEY) {
  console.warn("Warning: GEMINI_API_KEY or API_KEY not found in environment variables.");
}

app.post('/api/generate', async (req, res) => {
  if (!API_KEY) {
    console.error("Missing GEMINI_API_KEY environment variable");
    return res.status(500).json({ error: "Server configuration error: Missing API Key" });
  }

  try {
    const { chapterTitle, difficulty, difficultyDescription } = req.body;

    if (!chapterTitle || !difficulty) {
      return res.status(400).json({ error: "Missing required fields: chapterTitle or difficulty" });
    }

    const genAI = new GoogleGenAI({ apiKey: API_KEY });
    const modelName = "gemini-2.5-flash";

    const systemInstruction = `
      You are an expert exam setter for the OECD Transfer Pricing Guidelines 2022.
      
      RULES:
      1. All questions MUST be based strictly on the 2022 edition of the OECD TP Guidelines.
      2. Do NOT ask questions about Annexes or Appendices. Strictly stick to the core Chapters.
      3. Provide clear, distinct options.
      4. Ensure the explanation cites the logic from the guidelines.
    `;

    const prompt = `
      Generate a multiple-choice question for: ${chapterTitle}.
      Difficulty Level: ${difficulty}.
      
      Guidance for Difficulty: ${difficultyDescription || 'Standard difficulty'}
      
      Output must be a valid JSON object.
    `;

    const result = await genAI.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            questionText: { type: Type.STRING, description: "The question stem." },
            options: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "4 distinct options."
            },
            correctOptionIndex: {
              type: Type.INTEGER,
              description: "Zero-based index of the correct option (0-3)."
            },
            explanation: {
              type: Type.STRING,
              description: "Detailed explanation citing the logic from the 2022 Guidelines."
            },
          },
          required: ["questionText", "options", "correctOptionIndex", "explanation"]
        },
      },
    });

    const jsonText = result.text;
    if (!jsonText) {
      throw new Error("Empty response from Gemini");
    }

    res.json(JSON.parse(jsonText));

  } catch (error: any) {
    console.error("Error generating question:", error);

    let status = 500;
    let message = "Internal Server Error";

    if (error.message?.includes('429') || error.toString().includes('Quota')) {
      status = 429;
      message = "API Limit Exceeded";
    }

    res.status(status).json({ error: message, details: error.message });
  }
});

// Serve static files from client/dist in production
if (process.env.NODE_ENV === 'production') {
  // In production, we assume the server is running from the 'server' directory (process.cwd())
  // and the client build is in '../client/dist' relative to that.
  const clientDistPath = path.resolve(process.cwd(), '../client/dist');

  console.log(`Serving static files from: ${clientDistPath}`);

  app.use(express.static(clientDistPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
