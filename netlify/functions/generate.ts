import { Context } from "@netlify/functions";
import { GoogleGenAI, Type } from "@google/genai";

const API_KEY = process.env.GEMINI_API_KEY || process.env.API_KEY;

export default async (req: Request, context: Context) => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  if (!API_KEY) {
    console.error("Missing GEMINI_API_KEY environment variable");
    return new Response(JSON.stringify({ error: "Server configuration error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json();
    const { chapterTitle, difficulty, difficultyDescription } = body as any;

    if (!chapterTitle || !difficulty) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
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
      
      Guidance for Difficulty: ${difficultyDescription}
      
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

    return new Response(jsonText, {
      headers: { "Content-Type": "application/json" },
    });

  } catch (error: any) {
    console.error("Error generating question:", error);

    let status = 500;
    let message = "Internal Server Error";

    if (error.message?.includes('429') || error.toString().includes('Quota')) {
      status = 429;
      message = "API Limit Exceeded";
    }

    return new Response(JSON.stringify({ error: message }), {
      status: status,
      headers: { "Content-Type": "application/json" },
    });
  }
};
