import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const message = body.userMessage || body.message;
    const productsCatalog = body.catalog || body.productsCatalog;

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "الرجاء إدخال رسالة نصية صحيحة." },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;

    const catalogText = productsCatalog
      ? `قائمة المنتجات المتوفرة حالياً في المتجر مع روابطها المباشرة:\n${productsCatalog}`
      : "المنتجات المتوفرة: هوديز أوفر سايز، تيشيرتات قطن فاخرة، بناطيل كارجو ستريت وير، وجاكيتات جلد سوداء وذهبية بمقاسات (S, M, L, XL, XXL).";

    const systemPrompt = `أنت خبير الموضة والمساعد الذكي لمتجر "ديب ستور" (DEEP STORE) للأزياء والملابس الفاخرة باللون الأسود والذهبي في مصر.

مهمتك الأساسية:
1. قراءة استفسار العميل وفهم احتياجه (النوع، اللون، المقاس، الطول والوزن).
2. اقتراح المنتجات المناسبة تماماً من القائمة التالية فقط:
${catalogText}

3. تحديد المقاس الأنسب للعميل بناءً على الطول والوزن:
   - أقل من 165 سم / أقل من 60 كجم ➔ مقاس (Small - S)
   - من 165 إلى 175 سم / من 60 إلى 72 كجم ➔ مقاس (Medium - M)
   - من 175 إلى 182 سم / من 72 إلى 84 كجم ➔ مقاس (Large - L)
   - من 182 إلى 190 سم / من 84 إلى 95 كجم ➔ مقاس (X-Large - XL)
   - أطول من 190 سم / أكتر من 95 كجم ➔ مقاس (XX-Large - XXL)

4. مهم جداً: عند اقتراح أي منتج، يجب تضمين الرابط المباشر للمنتج بالشكل التالي: [اسم المنتج](/product/slug) حتى يستطيع العميل الضغط عليه والانتقال للمنتج فوراً!

5. اقتراح قطع ملابس مكملة للإطلالة (Cross-Selling):
   إذا سأل العميل عن هودي أو تيشيرت، اقترح عليه بنطال كارجو أو جاكيت مناسب لإكمال الإطلالة الستريت وير مع إضافة رابطه المباشر أيضاً!

6. التحدث بلغة عربية احترافية، راقية ومرحبة تناسب فخامة البراند.
7. توضيح أن الشحن متاح لكافة المحافظات، وتأكيد الطلب يتم مباشرة عبر الموقع مع إمكانية الدفع عند الاستلام 🚪 أو فودافون كاش 📱 أو انستاباي 💳.`;

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
        replyText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
      } catch (err) {
        console.error("Gemini API direct call error:", err);
      }
    }

    // Smart Fallback Recommendation Engine with links if API key is not configured locally
    if (!replyText) {
      const lowerMsg = message.toLowerCase();
      
      // Match height & weight numbers if provided in user message
      const numbers = message.match(/\d+/g)?.map(Number) || [];
      let sizeAdvice = "";
      if (numbers.length >= 2) {
        const [num1, num2] = numbers;
        const height = Math.max(num1, num2);
        const weight = Math.min(num1, num2);
        if (height >= 140 && height <= 220 && weight >= 40 && weight <= 150) {
          if (height < 165 || weight < 60) sizeAdvice = "بناءً على قياساتك (طول " + height + " سم ووزن " + weight + " كجم)، ننصحك بمقاس (Small - S).";
          else if (height <= 175 && weight <= 72) sizeAdvice = "بناءً على قياساتك (طول " + height + " سم ووزن " + weight + " كجم)، ننصحك بمقاس (Medium - M).";
          else if (height <= 182 && weight <= 84) sizeAdvice = "بناءً على قياساتك (طول " + height + " سم ووزن " + weight + " كجم)، ننصحك بمقاس (Large - L).";
          else if (height <= 190 && weight <= 95) sizeAdvice = "بناءً على قياساتك (طول " + height + " سم ووزن " + weight + " كجم)، ننصحك بمقاس (X-Large - XL).";
          else sizeAdvice = "بناءً على قياساتك (طول " + height + " سم ووزن " + weight + " كجم)، ننصحك بمقاس (XX-Large - XXL).";
        }
      }

      if (sizeAdvice) {
        replyText = `${sizeAdvice}\n\nإليك اقتراحاتنا المميزة لإكمال إطلالتك:\n- [تيشيرت أوفرسايز ديب أسود فاخر](/shop)\n- [بنطال كارجو ستريت وير أسود](/shop)`;
      } else if (lowerMsg.includes("ازيك") || lowerMsg.includes("سلام") || lowerMsg.includes("مرحبا") || lowerMsg.includes("أهلا") || lowerMsg.includes("اهلا") || lowerMsg.includes("hi") || lowerMsg.includes("hello")) {
        replyText = "أهلاً بك يا فنان في DEEP STORE 🐺! أنا مساعدك الشخصي للمقاسات وتنسيق الملابس. اكتب لي طولك ووزنك وسأرشح لك المقاس المضبوط والقطع المناسبة فوراً!";
      } else if (lowerMsg.includes("منتج") || lowerMsg.includes("عندك") || lowerMsg.includes("متوفر") || lowerMsg.includes("تبيع") || lowerMsg.includes("تشكيلة") || lowerMsg.includes("shop") || lowerMsg.includes("products")) {
        replyText = "نوفر لك في DEEP STORE 🐺 تشكيلة ملابس ستريت وير فاخرة (تيشيرتات أوفرسايز، هوديز، وبناطيل كارجو).\n\nتصفح كافة المنتجات المتاحة مع أسعارها وروابطها المباشرة عبر [صفحة المتجر](/shop).";
      } else if (lowerMsg.includes("مقاس") || lowerMsg.includes("حجم") || lowerMsg.includes("طول") || lowerMsg.includes("وزن") || lowerMsg.includes("size")) {
        replyText = "لمعرفة مقاسك المناسب، يرجى كتابة طولك بالسم (مثال: 175) ووزنك بالكجم (مثال: 70) معاً في رسالة واحدة، وسأقوم بحساب مقاسك واقتراح المنتجات المناسبة لك.";
      } else if (lowerMsg.includes("شحن") || lowerMsg.includes("توصيل") || lowerMsg.includes("محافظ")) {
        replyText = "أهلاً بك في ديب ستور! نوفر خدمة الشحن السريع لكافة محافظات مصر. يمكنك معرفة تكلفة الشحن واختيار المحافظة عند الشراء.";
      } else if (lowerMsg.includes("دفع") || lowerMsg.includes("فودافون") || lowerMsg.includes("انستا")) {
        replyText = "نوفر لك طرق دفع آمنة ومتنوعة: الدفع عند الاستلام 🚪، أو التحويل عبر فودافون كاش 📱 أو انستاباي 💳 في صفحة إتمام الطلب.";
      } else {
        replyText = "أهلاً بك في DEEP STORE 🐺! يمكنك تصفح أحدث التشكيلات مباشرة عبر [صفحة المتجر](/shop) أو تزويدنا بطولك ووزنك لاقتراح المقاس والقطع المكملة أنيقة!";
      }
    }

    return NextResponse.json({ reply: replyText, status: "success" });
  } catch (error: any) {
    console.error("Chatbot Route Error:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء معالجة الطلب." },
      { status: 500 }
    );
  }
}
