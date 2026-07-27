import { GoogleGenerativeAI } from "@google/generative-ai";

export interface IntentAnalysisResult {
  intent: "greeting" | "shipping" | "size" | "products" | "price" | "payment" | "return" | "unknown";
  suggestedProductIds: string[];
  replyText?: string;
}

export async function analyzeIntentAndStream(
  apiKey: string,
  systemInstruction: string,
  history: { role: string; text: string }[],
  message: string
) {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    systemInstruction,
  });

  const contents = [
    ...history.map((h) => ({
      role: h.role === "user" ? "user" : "model",
      parts: [{ text: h.text }],
    })),
    { role: "user", parts: [{ text: message }] },
  ];

  // Return real streaming result
  const resultStream = await model.generateContentStream({
    contents,
  });

  return resultStream;
}

export async function callValTownStreamProxy(
  message: string,
  catalogText: string,
  storeName: string
): Promise<string> {
  try {
    const valTownRes = await fetch("https://yousefeldeeb-chatgai.web.val.run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        catalogText,
        storeName,
      }),
    });

    if (valTownRes.ok) {
      const data = await valTownRes.json();
      return data.reply || data.text || "";
    }
  } catch (err) {
    console.error("Val.town Proxy Call Error:", err);
  }
  return "";
}
