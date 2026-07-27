import { NextResponse } from "next/server";
import { getProducts } from "@/lib/firebase/firestore";
import type { Product } from "@/types/product";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const message: string = body.userMessage || body.message || "";
    const history: { role: string; text: string }[] = body.history || [];

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "الرجاء إدخال رسالة نصية صحيحة." },
        { status: 400 }
      );
    }

    // 1. Fetch actual products from Firestore database
    let productsList: Product[] = [];
    try {
      productsList = await getProducts();
    } catch (e) {
      console.error("Error fetching products inside chatbot API:", e);
    }

    // 2. Build rich structured catalog for the AI (with product IDs)
    // Filter out corrupt/test products first
    const validProductsForCatalog = productsList.filter((p) =>
      p.name && p.name.trim().length >= 3 &&
      p.slug && p.slug.trim().length >= 2 &&
      typeof p.price === "number" && p.price > 0 && p.price < 50000
    );

    const catalogLines = validProductsForCatalog.map((p) => {
      const priceText = p.salePrice
        ? `${p.salePrice} ج.م (بدلاً من ${p.price} ج.م)`
        : `${p.price} ج.م`;
      const colors = p.variants?.map((v) => v.colorName).filter(Boolean).join("، ") || "متعدد";
      const sizes = p.variants?.[0]?.sizes?.map((s) => `${s.size}(${s.stock > 0 ? "متوفر" : "نفد"})`).join(" ") || "S M L XL XXL";
      const desc = (p.description || "").slice(0, 120).replace(/\n/g, " ");
      return `[${p.id}] ${p.name} | سعر: ${priceText} | تصنيف: ${p.category} | ألوان: ${colors} | مقاسات: ${sizes} | وصف: ${desc} | رابط: /products/${p.slug}`;
    });
    const catalogText = catalogLines.length > 0
      ? catalogLines.join("\n")
      : "لا توجد منتجات متاحة حالياً.";

    const apiKey = process.env.GEMINI_API_KEY;

    const systemInstruction = `أنت "وولف" المساعد الذكي الفاخر لمتجر DEEP STORE للملابس الستريت وير والأزياء الأسود والذهبي في مصر.

قواعد الشخصية:
- تتكلم بالعربية المصرية الودية والراقية.
- أنت خبير أزياء وستريت وير ومقاسات متخصص.
- دائماً استخدم أسماء المنتجات الحقيقية من القائمة. لا تخترع منتجات.
- عند اقتراح أي منتج اذكر اسمه الحقيقي ورابطه: [اسم المنتج](/products/slug).
- كن قصيراً ومباشراً ومفيداً.

قائمة المنتجات المتوفرة حالياً في قاعدة البيانات:
${catalogText}

جدول المقاسات:
- طول أقل من 165سم / وزن أقل من 60كجم -> S
- طول 165-175سم / وزن 60-72كجم -> M
- طول 175-182سم / وزن 72-84كجم -> L
- طول 182-190سم / وزن 84-95كجم -> XL
- طول أكتر من 190سم / وزن أكتر من 95كجم -> XXL

في نهاية ردك أضف سطراً واحداً بالتنسيق التالي (IDs فقط من القائمة):
PRODUCT_IDS:id1,id2`;

    let replyText = "";
    let suggestedProductIds: string[] = [];

    // 3. Try Gemini AI with full conversation history
    if (apiKey) {
      try {
        const contents = [
          { role: "user", parts: [{ text: systemInstruction }] },
          { role: "model", parts: [{ text: "حاضر! أنا وولف، مساعد DEEP STORE. جاهز لمساعدتك في اختيار أفضل القطع والمقاسات." }] },
          ...history.map((h: { role: string; text: string }) => ({
            role: h.role === "user" ? "user" : "model",
            parts: [{ text: h.text }]
          })),
          { role: "user", parts: [{ text: message }] }
        ];

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contents }),
          }
        );

        const data = await response.json();
        const rawText: string = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

        const idLineMatch = rawText.match(/PRODUCT_IDS:([^\n]*)/);
        if (idLineMatch) {
          suggestedProductIds = idLineMatch[1]
            .split(",")
            .map((id: string) => id.trim())
            .filter((id: string) => id.length > 0 && productsList.some((p) => p.id === id));
          replyText = rawText.replace(/PRODUCT_IDS:[^\n]*/g, "").trim();
        } else {
          replyText = rawText.trim();
        }
      } catch (err) {
        console.error("Gemini API error:", err);
      }
    }

    // 4. Smart local fallback with full product awareness
    if (!replyText) {
      const lower = message.toLowerCase();

      // Filter out corrupt/test products before anything else
      const validProducts = productsList.filter((p) =>
        p.name &&
        p.name.trim().length >= 3 &&
        p.slug &&
        p.slug.trim().length >= 2 &&
        typeof p.price === "number" &&
        p.price > 0 &&
        p.price < 50000
      );

      // === Priority 1: Non-product intents (handle BEFORE any product search) ===

      if (lower.includes("ازيك") || lower.includes("سلام") || lower.includes("اهلا") || lower.includes("أهلا") || lower.includes("مرحبا") || lower.includes("هاي") || lower.includes("hi") || lower.includes("hello")) {
        replyText = `أهلاً بيك في DEEP STORE 🐺✨\n\nأنا وولف، مساعدك الشخصي! قولي إيه اللي بتدور عليه:\n- اكتب طولك ووزنك وهقولك مقاسك 📏\n- اسأل عن أي منتج وهعرضهولك 👕\n- أي سؤال عن الأسعار أو الشحن أو الألوان 🚚`;
        suggestedProductIds = validProducts.slice(0, 3).map((p) => p.id);
      } else if (lower.includes("شحن") || lower.includes("توصيل") || lower.includes("يوصل") || lower.includes("محافظ") || lower.includes("قاهره") || lower.includes("اسكندري")) {
        replyText = `الشحن متاح لكل محافظات مصر 🚚\n\nيوصلك خلال 2-4 أيام عمل من تأكيد الطلب. تكلفة الشحن تتحدد حسب المحافظة عند إتمام الطلب على الموقع.`;
      } else if (lower.includes("دفع") || lower.includes("فودافون") || lower.includes("انستا") || lower.includes("كاش") || lower.includes("بيتاش") || lower.includes("اونلاين")) {
        replyText = `طرق الدفع المتاحة 💳\n- الدفع عند الاستلام 🚪\n- فودافون كاش 📱\n- انستاباي 💳\n\nكل الطرق متاحة عند إتمام الطلب.`;
      } else if (lower.includes("مقاس") || lower.includes("حجم") || lower.includes("size") || (lower.includes("طول") && !lower.includes("طول") && lower.includes("وزن"))) {
        replyText = `اكتبلي طولك بالسم ووزنك بالكيلو في نفس الرسالة\nمثال: طولي 178 ووزني 75 وهحسبلك المقاس فوراً 📏`;
      } else {
        // === Priority 2: Size detection from numbers ===
        const nums = message.match(/\d+/g)?.map(Number) || [];
        if (nums.length >= 2) {
          const height = Math.max(...nums);
          const weight = Math.min(...nums);
          if (height >= 140 && height <= 220 && weight >= 40 && weight <= 150) {
            let size = "M";
            if (height < 165 || weight < 60) size = "S";
            else if (height <= 175 && weight <= 72) size = "M";
            else if (height <= 182 && weight <= 84) size = "L";
            else if (height <= 190 && weight <= 95) size = "XL";
            else size = "XXL";
            replyText = `بناءً على طولك (${height}سم) ووزنك (${weight}كجم)، مقاسك المضبوط هو **${size}** 🎯\n\nإليك أفضل قطعنا المتاحة:`;
            suggestedProductIds = validProducts.slice(0, 3).map((p) => p.id);
          }
        }

        if (!replyText) {
          // === Priority 3: Price-range search ===
          const priceNums = message.match(/\d+/g)?.map(Number) || [];
          const isAskingPrice = lower.includes("سعر") || lower.includes("بكام") || lower.includes("تمن") || lower.includes("فلوس") || lower.includes("كام") || lower.includes("جنيه") || lower.includes("ج.م");
          if (isAskingPrice && priceNums.length > 0) {
            const maxPrice = Math.max(...priceNums);
            const affordable = validProducts.filter((p) => (p.salePrice || p.price) <= maxPrice * 1.2);
            if (affordable.length > 0) {
              suggestedProductIds = affordable.map((p) => p.id);
              replyText = `دول المنتجات اللي تقدر تلاقي في نطاق ميزانيتك 💰:`;
            } else {
              replyText = `مش عندنا منتجات في نطاق السعر ده. أقل أسعارنا هي:\n${validProducts.slice(0, 2).map((p) => `- ${p.name}: ${p.salePrice || p.price} ج.م`).join("\n")}`;
            }
          }
        }

        if (!replyText) {
          // === Priority 4: Explicit product/catalog requests ===
          const isProductRequest = lower.includes("منتج") || lower.includes("عندك") || lower.includes("متوفر") || lower.includes("تشكيل") || lower.includes("موجود") || lower.includes("products") || lower.includes("shop") || lower.includes("عرض") || lower.includes("اشتر");
          const isColorRequest = lower.includes("لون") || lower.includes("الوان") || lower.includes("ألوان") || lower.includes("color");
          const isPriceRequest = lower.includes("سعر") || lower.includes("بكام") || lower.includes("تمن") || lower.includes("كام");

          if (isProductRequest || isColorRequest || isPriceRequest) {
            suggestedProductIds = validProducts.map((p) => p.id);
            if (isColorRequest) replyText = `دول المنتجات المتاحة بكل ألوانها 🎨:`;
            else if (isPriceRequest) replyText = `دي قائمة منتجاتنا بالأسعار الكاملة 💰:`;
            else replyText = `دي كل تشكيلة DEEP STORE المتاحة دلوقتي 🐺🔥:`;
          }
        }

        if (!replyText) {
          // === Priority 5: Keyword search in product data ===
          const words = lower.split(/\s+/).filter((w) => w.length > 2);
          const matched = validProducts.filter((p) => {
            const name = (p.name || "").toLowerCase();
            const cat = (p.category || "").toLowerCase();
            const desc = (p.description || "").toLowerCase();
            return words.some((w) => name.includes(w) || cat.includes(w) || desc.includes(w));
          });

          if (matched.length > 0) {
            suggestedProductIds = matched.map((p) => p.id);
            replyText = `وجدت ${matched.length} منتج يناسب بحثك 👕:`;
          } else {
            replyText = `مش فاهم كويس 😅\nقولي أكتر — بتدور على نوع معين من الملابس؟ ولا عايز تعرف مقاسك؟`;
          }
        }
      }
    }

    // 5. Build final matched product objects
    const suggestedProducts = suggestedProductIds
      .map((id) => productsList.find((p) => p.id === id))
      .filter(Boolean) as Product[];

    return NextResponse.json({
      reply: replyText,
      suggestedProducts: suggestedProducts.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        price: p.price,
        salePrice: p.salePrice,
        mainImage: p.mainImage,
        category: p.category,
        variants: p.variants?.map((v) => ({
          colorName: v.colorName,
          colorHex: v.colorHex,
          sizes: v.sizes,
        })),
      })),
      status: "success",
    });
  } catch (error: any) {
    console.error("Chatbot Route Error:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء معالجة الطلب." },
      { status: 500 }
    );
  }
}
