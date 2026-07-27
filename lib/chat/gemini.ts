export async function callGeminiRestAPI(
  apiKey: string,
  systemInstruction: string,
  history: { role: string; text: string }[],
  message: string
): Promise<string> {
  const contents = [
    ...history.map((h) => ({
      role: h.role === "user" ? "user" : "model",
      parts: [{ text: h.text }],
    })),
    { role: "user", parts: [{ text: message }] },
  ];

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: systemInstruction }],
        },
        contents: contents,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Gemini API HTTP Error ${response.status}`);
  }

  const data = await response.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

export async function callValTownStreamProxy(
  message: string,
  catalogText: string,
  storeName: string,
  history: { role: string; text: string }[] = [],
  systemInstruction?: string
): Promise<string> {
  try {
    const valTownRes = await fetch("https://eldeebstore--e222cb10890211f196411607ee4eb77e.web.val.run/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        catalogText,
        storeName,
        history,
        systemInstruction,
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
