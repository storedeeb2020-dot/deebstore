import { NextResponse } from "next/server";
import { getProducts, getSiteSettings, getShippingRates } from "@/lib/firebase/firestore";
import { updateSessionData, extractEntitiesFromMessage } from "@/lib/chat/sessionMemory";
import { callGeminiRestAPI, callValTownStreamProxy } from "@/lib/chat/gemini";
import type { Product } from "@/types/product";

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
    const sessionId: string = body.sessionId || "default_session";

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "الرجاء إدخال رسالة صحيحة." }, { status: 400 });
    }

    // 1. Update Session Memory from user message
    const extractedEntities = extractEntitiesFromMessage(message);
    const session = updateSessionData(sessionId, extractedEntities);

    // 2. Fetch Firestore Live Data (Products, Site Settings, Governorate Rates)
    const [productsList, siteSettings, shippingRates] = await Promise.all([
      getCachedProducts(),
      getSiteSettings().catch(() => null),
      getShippingRates().catch(() => [])
    ]);

    const validProducts = productsList.filter(isValidProduct);

    const storeName = siteSettings?.storeName || "DEEP STORE";
    const storePhone = siteSettings?.storePhone || siteSettings?.whatsappNumber || "المتاح بصفحة التواصل";
    const vodafoneNumber = siteSettings?.vodafoneCash || "المتاح بصفحة الدفع";
    const instapayTag = siteSettings?.instapayUsername || "المتاح بصفحة الدفع";
    const announcement = siteSettings?.announcementEnabled ? siteSettings.announcementText : "";

    // 3. Format Real Governorate Shipping Rates from Firestore
    const shippingText = shippingRates.length > 0
      ? shippingRates
          .filter(r => r.active)
          .map(r => `• ${r.nameAr} (${r.nameEn}): ${r.price} ج.م`)
          .join("\n")
      : "القاهرة والجيزة: 50 ج.م، الإسكندرية والدلتا: 60 ج.م، القناة والبحيرة: 65 ج.م، الصعيد: 75-85 ج.م";

    // 4. Format Real Product Catalog from Firestore
    const catalogLines = validProducts.map((p) => {
      const priceText = p.salePrice ? `${p.salePrice} ج.م (خصم من ${p.price} ج.م)` : `${p.price} ج.م`;
      const colors = p.variants?.map((v) => v.colorName).filter(Boolean).join("، ") || "متعدد";
      const sizes = p.variants?.[0]?.sizes?.map((s) => `${s.size}(${s.stock > 0 ? "متوفر" : "غير متوفر"})`).join(" ") || "S M L XL XXL";
      const desc = p.description ? p.description.replace(/\n/g, " ") : "خامة ستريت وير قطن فاخرة";
      return `[${p.id}] ${p.name} | السعر: ${priceText} | القسم: ${p.category} | الألوان: ${colors} | المقاسات: ${sizes} | الوصف: ${desc} | الرابط: /products/${p.slug}`;
    });
    const catalogText = catalogLines.length > 0 ? catalogLines.join("\n") : "لا توجد منتجات مسجلة حالياً.";

    // Session Memory Context String
    const sessionMemoryText = `
بيانات ذاكرة العميل الحالية لهذه الجلسة:
- مقاس العميل المحسوب: ${session.size || "لم يحدد بعد"}
- محافظة/مدينة العميل: ${session.city || session.governorate || "لم تحدد بعد"}
- القسم المفضل للعميل: ${session.preferredCategory || "لم يحدد بعد"}`;

    const apiKey = process.env.GEMINI_API_KEY;
    let replyText = "";
    let suggestedProductIds: string[] = [];
    let detectedIntent = "unknown";

    // 5. System Prompt Grounded 100% in Firestore & Session Memory
    const systemInstruction = `أنت "وولف" 🐺 — مساعد الموضة والأزياء الذكي لمتجر ${storeName}.

شخصيتك:
- تتحدث بعفوية وذكاء عالي وسلاسة باللهجة المصرية الودودة ("يا فنان"، "صديقي"، "منور ديب ستور").
- تجيب العميل بأسلوب حواري ممتع دون تكرار أي رسائل قالبية.
- تفهم سياق الذاكرة وتاريخ المحادثة بالكامل.

${sessionMemoryText}

بيانات المتجر الحية المأخوذة مباشرة من قاعدة البيانات (Firestore):
- اسم المتجر: ${storeName}
- واتساب / هاتف التواصل: ${storePhone}
- فودافون كاش: ${vodafoneNumber} | انستاباي: ${instapayTag}
- الإعلانات والخصومات: ${announcement || "شحن سريع لجميع المحافظات"}
- طرق الدفع المتاحة: ${siteSettings?.codEnabled !== false ? "الدفع عند الاستلام 🚪، " : ""}${siteSettings?.vodafoneCashEnabled !== false ? `فودافون كاش 📱، ` : ""}${siteSettings?.instapayEnabled !== false ? `انستاباي 💳` : ""}

جدول أسعار الشحن المباشر للمحافظات من قاعدة البيانات:
${shippingText}

كتالوج المنتجات الحقيقي والفعلي من قاعدة البيانات:
${catalogText}

تعليمات الهيكلة والرد:
1. استخرج أسعار الشحن بدقة للمحافظة عند سؤال العميل عن الشحن.
2. إذا كان مقاس العميل معروفاً من الذاكرة (${session.size || "S/M/L"}), اقترح المنتجات المتوفرة بمقاسه.
3. عند التوصية بمنتج اذكر اسمه ورابطه بالشكل: [اسم المنتج](/products/slug).
4. في السطر الأخير تماماً أضف:
PRODUCT_IDS:id1,id2
INTENT:intent_name`;

    // Try Direct Gemini REST API
    if (apiKey) {
      try {
        const rawText = await callGeminiRestAPI(apiKey, systemInstruction, history, message);

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
        console.error("Gemini Direct REST Error:", err);
      }
    }

    // Try Val.town AI Server Proxy if Direct Key wasn't active or failed
    if (!replyText) {
      const valTownReply = await callValTownStreamProxy(message, catalogText, storeName);
      if (valTownReply) {
        const idMatch = valTownReply.match(/PRODUCT_IDS:([^\n]*)/);
        if (idMatch) {
          suggestedProductIds = idMatch[1]
            .split(",")
            .map((id: string) => id.trim())
            .filter((id: string) => id.length > 0 && validProducts.some((p) => p.id === id));
        }
        replyText = valTownReply
          .replace(/PRODUCT_IDS:[^\n]*/g, "")
          .replace(/INTENT:[^\n]*/g, "")
          .trim();
      }
    }

    // 6. Intelligent Fallback with Session Memory
    if (!replyText) {
      const lower = message.toLowerCase();
      const isShipping = lower.includes("شحن") || lower.includes("توصيل") || lower.includes("محافظ");
      const isGreeting = lower.includes("ازيك") || lower.includes("سلام") || lower.includes("اهلا") || lower.includes("أهلا") || lower.includes("هاي") || lower.includes("مرحبا");

      if (isShipping) {
        detectedIntent = "shipping";
        const matchedRate = shippingRates.find(r => 
          lower.includes(r.nameAr.toLowerCase()) || 
          lower.includes(r.nameEn.toLowerCase()) ||
          (r.nameAr.includes("القاهرة") && (lower.includes("قاهره") || lower.includes("قاهرة") || lower.includes("جيزة") || lower.includes("جيزه"))) ||
          (r.nameAr.includes("الدقهلية") && (lower.includes("منصورة") || lower.includes("منصوره")))
        );

        if (matchedRate) {
          replyText = `سعر الشحن لـ **${matchedRate.nameAr}** هو **${matchedRate.price} ج.م** واستلام الطلب خلال 2-4 أيام عمل 🚚.`;
        } else {
          replyText = `الشحن متوفر لجميع المحافظات 🚚 وتحدد التكلفة بدقة في صفحة الشراء حسب عنوانك.`;
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
          replyText = `تفضل يا فنان، هذه هي التشكيلة المتطابقة مع طلبك 🐺✨:`;
        } else {
          detectedIntent = "unknown";
          replyText = `أهلاً بك! أنا وولف 🐺 مستشارك للأزياء في ${storeName}. يسعدني مساعدتك في اختيار المقاس أو الإجابة على أي استفسار!`;
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
      session,
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
