import { NextResponse } from "next/server";
import { getProducts, getSiteSettings, getShippingRates } from "@/lib/firebase/firestore";
import type { Product } from "@/types/product";

// ─── Products & Settings Cache (3 min TTL) ──────────────────────────────────
let _productsCache: Product[] = [];
let _cacheTimestamp = 0;
const CACHE_TTL = 3 * 60 * 1000;

async function getCachedProducts(): Promise<Product[]> {
  if (Date.now() - _cacheTimestamp < CACHE_TTL && _productsCache.length > 0) {
    return _productsCache;
  }
  try {
    _productsCache = await getProducts();
    _cacheTimestamp = Date.now();
  } catch (e) {
    console.error("Products fetch error in Chat API:", e);
  }
  return _productsCache;
}

function isValidProduct(p: Product): boolean {
  return !!(
    p.name && p.name.trim().length >= 2 &&
    p.slug &&
    typeof p.price === "number" && p.price > 0
  );
}

function getSuggestedReplies(intent: string): string[] {
  const map: Record<string, string[]> = {
    greeting:      ["🛍️ المنتجات المتاحة", "📏 احسب مقاسي", "🚚 تفاصيل الشحن"],
    shipping:      ["📦 تتبع الطلب", "💳 طرق الدفع", "🛍️ تصفح المنتجات"],
    city_shipping: ["📦 تتبع الطلب", "💳 طرق الدفع", "🛍️ كل المنتجات"],
    intl_shipping: ["🛍️ كل المنتجات", "📏 احسب مقاسي", "💳 طرق الدفع"],
    payment:       ["🚚 تفاصيل الشحن", "🔄 سياسة التبديل", "🛍️ المتجر"],
    return:        ["🚚 الشحن", "💳 الدفع", "🛍️ المنتجات"],
    size:          ["🛍️ عرض المنتجات", "💰 الأسعار"],
    products:      ["📏 احسب مقاسي", "💰 الأسعار", "🚚 الشحن"],
    price:         ["🛍️ كل المنتجات", "⭐ الأكثر مبيعاً"],
    unknown:       ["🛍️ تصفح المنتجات", "📏 المقاسات", "🚚 الشحن"],
  };
  return map[intent] ?? map.unknown;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const message: string = body.userMessage || body.message || "";
    const history: { role: string; text: string }[] = body.history || [];

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "الرجاء إدخال رسالة صحيحة." }, { status: 400 });
    }

    // 1. Fetch Real Live Data Simultaneously from Firestore
    const [productsList, siteSettings, shippingRates] = await Promise.all([
      getCachedProducts(),
      getSiteSettings().catch(() => null),
      getShippingRates().catch(() => [])
    ]);

    const validProducts = productsList.filter(isValidProduct);

    // Dynamic Live Settings
    const storeName = siteSettings?.storeName || "DEEP STORE";
    const storePhone = siteSettings?.storePhone || siteSettings?.whatsappNumber || "المتاح بصفحة التواصل";
    const vodafoneNumber = siteSettings?.vodafoneCash || "المتاح بصفحة الدفع";
    const instapayTag = siteSettings?.instapayUsername || "المتاح بصفحة الدفع";
    const announcement = siteSettings?.announcementEnabled ? siteSettings.announcementText : "";

    // 2. Format Real Governorate Shipping Rates from Database
    const shippingText = shippingRates.length > 0
      ? shippingRates
          .filter(r => r.active)
          .map(r => `• ${r.nameAr} (${r.nameEn}): ${r.price} ج.م`)
          .join("\n")
      : "القاهرة والجيزة: 50 ج.م، الإسكندرية والدلتا: 60 ج.م، القناة والبحيرة: 65 ج.م، الصعيد: 75-85 ج.م";

    // 3. Format Real Product Catalog
    const catalogLines = validProducts.map((p) => {
      const priceText = p.salePrice ? `${p.salePrice} ج.م (خصم من ${p.price} ج.م)` : `${p.price} ج.م`;
      const colors = p.variants?.map((v) => v.colorName).filter(Boolean).join("، ") || "متعدد";
      const sizes = p.variants?.[0]?.sizes?.map((s) => `${s.size}(${s.stock > 0 ? "متوفر" : "غير متوفر"})`).join(" ") || "S M L XL XXL";
      const desc = p.description ? p.description.replace(/\n/g, " ") : "خامة ستريت وير قطن فاخرة";
      return `[${p.id}] ${p.name} | السعر: ${priceText} | القسم: ${p.category} | الألوان: ${colors} | المقاسات: ${sizes} | الوصف: ${desc} | الرابط: /products/${p.slug}`;
    });
    const catalogText = catalogLines.length > 0 ? catalogLines.join("\n") : "لا توجد منتجات مسجلة حالياً.";

    const apiKey = process.env.GEMINI_API_KEY;
    let replyText = "";
    let suggestedProductIds: string[] = [];
    let detectedIntent = "unknown";

    // 4. Build Professional Persona Prompt Grounded in Firestore
    const systemInstruction = `أنت "وولف" 🐺 — مساعد الموضة والأزياء الذكي والتفاعلي لمتجر ${storeName}.

شخصيتك وقواعد الحوار:
- تتحدث بعفوية وذكاء عالي وسلاسة باللهجة المصرية الودودة المحترمة ("يا فنان"، "صديقي"، "منور ديب ستور").
- تجيب العميل بأسلوب حواري طبيعي ممتع دون تكرار رسائل قالبية أو خيارات مللت العميل.
- تفهم سياق وتاريخ المحادثة السابقة بالكامل وتتذكر كل ما تم الحديث عنه.

بيانات المتجر الحية المأخوذة مباشرة من قاعدة البيانات (Firestore):
- اسم المتجر: ${storeName}
- واتساب / هاتف التواصل: ${storePhone}
- فودافون كاش: ${vodafoneNumber} | انستاباي: ${instapayTag}
- الإعلانات والخصومات الحالية: ${announcement || "شحن سريع لجميع المحافظات"}
- طرق الدفع المتاحة: ${siteSettings?.codEnabled !== false ? "الدفع عند الاستلام 🚪، " : ""}${siteSettings?.vodafoneCashEnabled !== false ? `فودافون كاش 📱، ` : ""}${siteSettings?.instapayEnabled !== false ? `انستاباي 💳` : ""}

جدول أسعار الشحن الحقيقي والمباشر للمحافظات من قاعدة البيانات:
${shippingText}

كتالوج المنتجات الحقيقي والفعلي المسجل في المتجر:
${catalogText}

تعليمات الهيكلة والرد:
1. عند سؤال العميل عن أسعار الشحن لمحافظة أو مدينة معينة، استخرج السعر بالضبط من قائمة أسعار الشحن أعلاه واذكره له بوضوح.
2. عند التوصية بمنتج، اذكر اسمه ورابطه بالشكل: [اسم المنتج](/products/slug).
3. في السطر الأخير تماماً من ردك (بدون أن يراها العميل كجزء من النص)، أضف التنسيق التالي:
PRODUCT_IDS:id1,id2
INTENT:intent_name`;

    if (apiKey) {
      try {
        const contents = [
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
            body: JSON.stringify({
              systemInstruction: {
                parts: [{ text: systemInstruction }]
              },
              contents: contents
            }),
          }
        );

        const data = await response.json();
        const rawText: string = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

        const idMatch = rawText.match(/PRODUCT_IDS:([^\n]*)/);
        if (idMatch) {
          suggestedProductIds = idMatch[1]
            .split(",")
            .map((id: string) => id.trim())
            .filter((id: string) => id.length > 0 && validProducts.some((p) => p.id === id));
        }

        const intentMatch = rawText.match(/INTENT:([^\n]*)/);
        if (intentMatch) {
          detectedIntent = intentMatch[1].trim();
        }

        replyText = rawText
          .replace(/PRODUCT_IDS:[^\n]*/g, "")
          .replace(/INTENT:[^\n]*/g, "")
          .trim();
      } catch (err) {
        console.error("Gemini AI Call Error:", err);
      }
    }

    // 5. Intelligent Native Natural Language Fallback (If AI Key offline)
    if (!replyText) {
      const lower = message.toLowerCase();
      const isShipping = lower.includes("شحن") || lower.includes("توصيل") || lower.includes("محافظ");
      const isPrice = lower.includes("سعر") || lower.includes("بكام") || lower.includes("كام") || lower.includes("اسعار");
      const isGreeting = lower.includes("ازيك") || lower.includes("سلام") || lower.includes("اهلا") || lower.includes("أهلا") || lower.includes("هاي") || lower.includes("مرحبا");

      if (isShipping) {
        detectedIntent = "shipping";
        // Find if user mentioned a specific governorate
        const matchedRate = shippingRates.find(r => lower.includes(r.nameAr.toLowerCase()) || lower.includes(r.nameEn.toLowerCase()));
        if (matchedRate) {
          replyText = `سعر الشحن لـ **${matchedRate.nameAr}** هو **${matchedRate.price} ج.م** واستلام الطلب خلال 2-4 أيام عمل 🚚.`;
        } else {
          replyText = `الشحن متوفر لكل المحافظات 🚚!\n- القاهرة والجيزة: 50ج\n- الإسكندرية والدلتا: 60ج\n- باقي المحافظات والصعيد: 65-85ج.`;
        }
      } else if (isGreeting) {
        detectedIntent = "greeting";
        replyText = `أهلاً بيك يا فنان في ${storeName} 🐺✨! أنا وولف، مستشارك الخاص للأزياء والمقاسات. قولي بتدور على إيه النهاردة؟`;
        suggestedProductIds = validProducts.slice(0, 3).map(p => p.id);
      } else {
        const matched = validProducts.filter(p => lower.includes(p.name.toLowerCase()) || (p.category && lower.includes(p.category.toLowerCase())));
        if (matched.length > 0) {
          detectedIntent = "products";
          suggestedProductIds = matched.map(p => p.id);
          replyText = `إليك التفاصيل والقطع المتاحة 🐺✨:`;
        } else {
          detectedIntent = "unknown";
          replyText = `أنا معاك يا فنان 🐺! اسألني عن المنتجات المتاحة، أسعار الشحن لمحافظتك، أو احسب مقاسك المضبوط وطولك ووزنك.`;
          suggestedProductIds = validProducts.slice(0, 2).map(p => p.id);
        }
      }
    }

    const suggestedProducts = suggestedProductIds
      .map((id) => validProducts.find((p) => p.id === id))
      .filter(Boolean) as Product[];

    return NextResponse.json({
      reply: replyText,
      intent: detectedIntent,
      suggestedReplies: getSuggestedReplies(detectedIntent),
      suggestedProducts: suggestedProducts.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        price: p.price,
        salePrice: p.salePrice,
        mainImage: p.mainImage,
        category: p.category,
        bestSeller: p.bestSeller,
        isNewArrival: p.isNewArrival,
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
