import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { message, history } = await req.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "الرجاء إدخال رسالة نصية صحيحة." },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;

    const systemPrompt = `أنت المساعد الذكي الخاص ببراند الملابس الفاخر "DEEP STORE" (ديب ستور).
هويتك ومهمتك:
- تجيب زوار المتجر والعملاء بلباقة واحترام باللغة العربية.
- المتجر متخصص في الـ Streetwear الفاخرة (هوديز، تيشيرتات أوفراسايز، بناطيل كارجو، وجاكيتات).
- التصميم يعتمد على الدارك مود الفاخر بالألوان السوداء والذهبية.
- طرق الدفع المتاحة: الدفع عند الاستلام 🚪، فودافون كاش 📱، وانستاباي 💳 (مع إمكانية رفع صورة الإيصال في صفحة الشيك أوت).
- متوفر جدول مقاسات تفصيلي لكل قطعة (تضم S, M, L, XL, XXL).
- التوصيل لكافة محافظات مصر.
- قدم ردوداً مختصرة ومفيدة ومرحبّة بأسلوب راقٍ يناسب براند ديب ستور الفاخر.`;

    let replyText = "";

    if (apiKey) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [
                {
                  role: "user",
                  parts: [
                    {
                      text: `${systemPrompt}\n\nسؤال العميل: ${message}`,
                    },
                  ],
                },
              ],
            }),
          }
        );

        const data = await response.json();
        replyText =
          data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
      } catch (err) {
        console.error("Gemini direct API call error:", err);
      }
    }

    // Fallback automated response if API key is not set or failed
    if (!replyText) {
      const lowerMsg = message.toLowerCase();
      if (lowerMsg.includes("شحن") || lowerMsg.includes("توصيل") || lowerMsg.includes("محافظ")) {
        replyText = "أهلاً بك في ديب ستور! نوفر خدمة الشحن لكافة محافظات مصر. يمكنك معرفة تكلفة الشحن بالضبط عند اختيار محافظتك في صفحة إتمام الطلب.";
      } else if (lowerMsg.includes("دفع") || lowerMsg.includes("فودافون") || lowerMsg.includes("انستا")) {
        replyText = "نوفر لك طرق دفع متنوعة وآمنة: الدفع عند الاستلام 🚪، أو التحويل عبر فودافون كاش 📱 أو انستاباي 💳 مع إمكانية رفع صورة الإيصال مباشرة في صفحة الشيك أوت.";
      } else if (lowerMsg.includes("مقاس") || lowerMsg.includes("size") || lowerMsg.includes("أوفراسايز")) {
        replyText = "تتوفر لدينا جميع المقاسات العالمية (S, M, L, XL, XXL) بتصاميم أوفراسايز عصرية. يمكنك مراجعة جدول المقاسات المرفق في صفحة كل منتج لتحديد المقاس المثالي لك.";
      } else if (lowerMsg.includes("تواصل") || lowerMsg.includes("شكوى") || lowerMsg.includes("عنوان")) {
        replyText = "يمكنك التواصل معنا مباشرة عبر صفحة 'اتصل بنا والشكاوى' أو عبر واتساب المتجر. فريق ديب ستور في خدمتك دائماً!";
      } else {
        replyText = "أهلاً بك في DEEP STORE 👑! كيف يمكنني مساعدتك اليوم في اختيار تشكيلة الـ Streetwear الفاخرة المناسبة لك؟";
      }
    }

    return NextResponse.json({ reply: replyText });
  } catch (error: any) {
    console.error("Chatbot Route Error:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء معالجة الطلب." },
      { status: 500 }
    );
  }
}
