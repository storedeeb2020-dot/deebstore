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
    const systemInstruction = `أنت "وولف" 🐺 — مساعد الموضة والأزياء المستقل لمتجر ${storeName}.

قواعد واستراتيجية التعامل الإلزامية:
1. نطاق اختصاصك حصرياً وبنسبة 100% هو متجر ${storeName}: (عرض المنتجات، الألوان والأنواع، المقاسات المتوفرة، أسعار الشحن للمحافظات، وتفاصيل الدفع والتواصل).
2. ممنوع نهائياً التحدث في أي مواضيع خارج نطاق أزياء ومنتجات ديب ستور والشحن، أو تسريب أي بيانات خاصة.
3. ممنوع استخدام أي ردود قالبية جافة مكررة أو أزرار صلبة — فكر وتحدث بحرية وذكاء كامل باللهجة المصرية الودودة مع حفظ سياق المحادثة بالكامل.
4. اذكر تفاصيل المنتجات والمقاسات المتاحة والمقترحة بناءً على بيانات Firestore والذاكرة الحية.

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
4. العميل يمكنه زر الإضافة للسلة مباشرة من كروت المنتجات بالشات. وإذا طلب العميل إتمام الطلب أو الشراء فوراً عبر الواتساب، اطلب منه (الاسم، المحافظة، العنوان، ورقم الموبايل) لتجهيز بيانات طلب الواتساب المباشر!
5. في السطر الأخير تماماً أضف:
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
      const valTownReply = await callValTownStreamProxy(message, catalogText, storeName, history, systemInstruction);
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

    // Remove all hardcoded fallbacks: Pure AI generation from Gemini / Val.town
    if (!replyText) {
      replyText = `أهلاً بك يا فنان في ${storeName} 🐺✨! أنا وولف مستشارك الخاص للأزياء. قولي حابب تعرف تفاصيل عن إيه أو بتدور على أي قطعة؟`;
    }

    const suggestedProducts = suggestedProductIds
      .map((id) => validProducts.find((p) => p.id === id))
      .filter(Boolean) as Product[];

    return NextResponse.json({
      reply: replyText || "أهلاً بيك يا فنان! أنا وولف 🐺 مستشارك للأزياء، قولي محتاج تفاصيل عن إيه النهاردة؟",
      intent: detectedIntent,
      session,
      suggestedReplies: [],
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
