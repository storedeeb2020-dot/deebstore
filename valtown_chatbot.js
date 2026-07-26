// ================================================
// 🤖 VAL.TOWN CHATBOT ENDPOINT (DEEP STORE)
// ================================================
// 📍 منصة التشغيل: https://www.val.town/
// 📌 النوع: HTTP Val
// 🔑 المتغيرات المطلوبة في Val.town:
//    - GEMINI_API_KEY (مفتاح API الخاص بـ Google Gemini)

import { GoogleGenerativeAI } from "npm:@google/generative-ai";

export default async function handler(req: Request): Promise<Response> {
  // CORS Headers
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message } = await req.json();

    if (!message) {
      return Response.json({ reply: "يرجى كتابة رسالة." }, { headers: corsHeaders });
    }

    const apiKey = Deno.env.get("GEMINI_API_KEY");
    if (!apiKey) {
      return Response.json({ reply: "المساعد غير مهيأ حالياً (مفتاح API مفقود)." }, { headers: corsHeaders });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const systemPrompt = `
أنت مساعد ذكي ولطيف لمتجر "ELDEEB STORE" (ديب ستور) لملابس الستريت وير الفاخرة باللغة العربية.

معلومات عن المتجر:
- الاسم: ELDEEB STORE (متجر الديب)
- المنتجات: هوديز، تيشيرتات أوفراسايز، بناطيل كارجو، جاكيتات جلد، وتشكيلة ذهبية مخملية محدودة.
- الألوان: أسود ملكي، ذهبي، أبيض عاجي، زيتي غامق.
- الشحن: متاح لكل محافظات مصر (القاهرة والجيزة 40 ج، باقي المحافظات 60 ج)، الشحن مجاني للطلبات أكثر من 2000 جنيه.
- الدفع: الدفع عند الاستلام (COD).
- للتواصل المباشر والواتساب: عبر زر "فتح واتساب" في أسفل الموقع.

تعليمات الرد:
1. أجب باللغة العربية بطريقة عصرية وودودة ومختصرة.
2. إذا سأل العميل عن منتج معين، رحب به واقترح عليه تصفح تشكيلة المنتجات أو التواصل عبر واتساب.
3. إذا سأل عن حالة طلب، اطلب منه رقم الطلب للاستعلام من الإدارة.
    `;

    const result = await model.generateContent([
      { text: systemPrompt },
      { text: `سؤال العميل: ${message}` }
    ]);

    const reply = result.response.text();

    return Response.json({ reply }, { headers: corsHeaders });

  } catch (error) {
    console.error("Chatbot error:", error);
    return Response.json({
      reply: "عذراً، حدث خطأ أثناء معالجة طلبك. يمكنك التواصل معنا مباشرة على واتساب!"
    }, { headers: corsHeaders });
  }
}
