import { NextResponse } from "next/server";
import { getProducts } from "@/lib/firebase/firestore";
import type { Product } from "@/types/product";

// ─── Products Cache (5 min TTL) ───────────────────────────────────────────────
let _productsCache: Product[] = [];
let _cacheTimestamp = 0;
const CACHE_TTL = 5 * 60 * 1000;

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

// ─── Egyptian Governorates & City Mapping ──────────────────────────────────
interface GovernorateInfo {
  name: string;
  price: number;
  deliveryDays: string;
  cities: string[];
}

const EGYPT_GOVERNORATES: GovernorateInfo[] = [
  { name: "القاهرة والجيزة", price: 50, deliveryDays: "1-2 أيام", cities: ["قاهره", "القاهرة", "قاهرة", "جيزه", "الجيزة", "جيزة", "مدينة نصر", "التجمع", "المعادي", "أكتوبر", "الشيخ زايد", "حلوان", "شبرا"] },
  { name: "الدقهلية", price: 60, deliveryDays: "2-3 أيام", cities: ["منصوره", "المنصورة", "منصورة", "طلخا", "ميت غمر", "دكرنس", "بلقاس", "شربين", "منية النصر"] },
  { name: "الإسكندرية", price: 60, deliveryDays: "2-3 أيام", cities: ["اسكندريه", "اسكندرية", "الاسكندرية", "المنتزه", "سموحة", "العجمي", "برج العرب"] },
  { name: "الغربية والشرقية والمنوفية والقليوبية", price: 60, deliveryDays: "2-3 أيام", cities: ["طنطا", "المحلة", "محله", "محلة", "الزقازيق", "زقازيق", "شبين", "بنها", "قليوبية", "قليوبيه", "منوفية", "منوفيه"] },
  { name: "البحيرة ودمياط وكفر الشيخ", price: 65, deliveryDays: "2-3 أيام", cities: ["دمنهور", "كفر الشيخ", "كفر شيخ", "دمياط", "رأس البر"] },
  { name: "القناة (بورسعيد والسويس والإسماعيلية)", price: 65, deliveryDays: "2-3 أيام", cities: ["بورسعيد", "السويس", "سويس", "الاسماعيلية", "اسماعيليه", "اسماعيلية"] },
  { name: "الصعيد (الفيوم وبني سويف والمنيا وأسيوط وسوهاج)", price: 75, deliveryDays: "3-4 أيام", cities: ["الفيوم", "فيوم", "بني سويف", "بنى سويف", "المنيا", "منيا", "اسيوط", "أسيوط", "سوهاج"] },
  { name: "أقصى الصعيد (قنا والأقصر وأسوان)", price: 85, deliveryDays: "3-5 أيام", cities: ["قنا", "الأقصر", "الاقصر", "اقصر", "أسوان", "اسوان"] },
  { name: "المحافظات الحدودية (مطروح والبحر الأحمر وسيناء)", price: 90, deliveryDays: "3-5 أيام", cities: ["مرسى مطروح", "مطروح", "الغردقة", "الغردقه", "شرم", "شرم الشيخ", "العريش", "تور سيناء", "دهب"] }
];

function findGovernorate(query: string): { gov: GovernorateInfo; matchedCity: string } | null {
  const lower = query.toLowerCase();
  for (const gov of EGYPT_GOVERNORATES) {
    for (const city of gov.cities) {
      if (lower.includes(city)) {
        return { gov, matchedCity: city };
      }
    }
  }
  return null;
}

const INTERNATIONAL_KEYWORDS = [
  "برا مصر", "خارج مصر", "دول تانية", "دول اخرى", "دول أخرى",
  "abroad", "international", "outside egypt", "خارج", "بره مصر",
  "السعودية", "الامارات", "الإمارات", "الكويت", "قطر", "البحرين",
  "الاردن", "الأردن", "لبنان", "ليبيا", "تونس", "المغرب", "العراق", "اليمن"
];

const STORE_POLICIES = {
  returns: "سياسة الإرجاع 🔄\n- الإرجاع مقبول خلال 7 أيام من الاستلام بشرط المعاينة وسلامة القطعة.\n- التبديل بالمقاس متاح خلال 14 يوم.",
  shipping: "تفاصيل الشحن 🚚\n- متاح لكل محافظات مصر في 2-4 أيام عمل.\n- تكلفة الشحن تحدد بالدقة عند صفحة الدفع.",
  payment: "طرق الدفع 💳\n- دفع عند الاستلام 🚪\n- فودافون كاش 📱\n- انستاباي 💳"
};

function isValidProduct(p: Product): boolean {
  return !!(
    p.name && p.name.trim().length >= 3 &&
    p.slug && p.slug.trim().length >= 2 &&
    typeof p.price === "number" && p.price > 0 && p.price < 50000
  );
}

function getSuggestedReplies(intent: string): string[] {
  const map: Record<string, string[]> = {
    greeting:      ["🛍️ كل المنتجات", "📏 احسب مقاسي", "🚚 الشحن والتوصيل", "💳 طرق الدفع"],
    shipping:      ["📦 تتبع طلب", "💳 طرق الدفع", "🛍️ تصفح المنتجات"],
    city_shipping: ["📦 تتبع طلب", "💳 طرق الدفع", "🛍️ كل المنتجات"],
    intl_shipping: ["🛍️ كل المنتجات", "📏 احسب مقاسي", "💳 طرق الدفع"],
    payment:       ["🚚 الشحن والتوصيل", "🔄 الإرجاع والتبديل", "🛍️ تصفح المنتجات"],
    return:        ["🚚 الشحن والتوصيل", "💳 طرق الدفع", "🛍️ كل المنتجات"],
    size:          ["🛍️ عرض المنتجات", "💰 الأسعار", "🎨 الألوان"],
    products:      ["📏 احسب مقاسي", "💰 الأسعار", "🎨 الألوان المتاحة"],
    price:         ["🛍️ كل المنتجات", "📏 احسب مقاسي", "⭐ الأكثر مبيعاً"],
    unknown:       ["🛍️ كل المنتجات", "📏 احسب مقاسي", "🚚 الشحن"],
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

    // 1. Fetch & Filter Products
    const productsList = await getCachedProducts();
    const validProducts = productsList.filter(isValidProduct);

    const catalogLines = validProducts.map((p) => {
      const priceText = p.salePrice ? `${p.salePrice} ج.م (بدلاً من ${p.price} ج.م)` : `${p.price} ج.م`;
      const colors = p.variants?.map((v) => v.colorName).filter(Boolean).join("، ") || "متعدد";
      const sizes = p.variants?.[0]?.sizes?.map((s) => `${s.size}(${s.stock > 0 ? "✓" : "✗"})`).join(" ") || "S M L XL XXL";
      return `[${p.id}] ${p.name} | سعر: ${priceText} | تصنيف: ${p.category} | ألوان: ${colors} | مقاسات: ${sizes} | رابط: /products/${p.slug}`;
    });
    const catalogText = catalogLines.length > 0 ? catalogLines.join("\n") : "لا توجد منتجات حالياً.";

    const apiKey = process.env.GEMINI_API_KEY;
    let replyText = "";
    let suggestedProductIds: string[] = [];
    let detectedIntent = "unknown";

    // Build Wolf System Persona
    const systemInstruction = `أنت "وولف" 🐺 — منسق الأزياء الفاخر والمساعد الذكي لـ DEEP STORE باللون الأسود والذهبي في مصر.

نبرتك:
- مصري عصري وثاق وخشن ودود (Streetwear & Luxury style).
- نادِ العميل بـ "يا فنان" أو "صديقي".
- لا تبتكر منتجات ولا توعد بخصومات غير موجودة في الكتالوج.
- التحدث باللهجة المصرية دائماً بدون فصحى جافة.

معلومات المتجر والسياسات:
- الشحن لمحافظات مصر فقط (2-4 أيام عمل). لا يوجد شحن دولي خارج مصر حالياً.
- طرق الدفع: دفع عند الاستلام 🚪، فودافون كاش 📱، انستاباي 💳.
- الإرجاع خلال 7 أيام والتبديل خلال 14 يوم.

قائمة المنتجات الحالية:
${catalogText}

جدول المقاسات:
- <165سم / <60كجم -> S
- 165-175سم / 60-72كجم -> M
- 175-182سم / 72-84كجم -> L
- 182-190سم / 84-95كجم -> XL
- >190سم / >95كجم -> XXL

طريقة الإجابة:
1. أجِب بأسلوبك الذكي.
2. إذا اقترحت منتجات، اذكر اسمها ورابطها: [اسم المنتج](/products/slug).
3. في نهاية الرد تماماً أضف سطراً واحداً بالتنسيق:
PRODUCT_IDS:id1,id2
INTENT:intent_name`;

    if (apiKey) {
      try {
        const contents = [
          { role: "user", parts: [{ text: systemInstruction }] },
          { role: "model", parts: [{ text: "جاهز يا فنان! أنا وولف 🐺 مساعدك في DEEP STORE." }] },
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

    // Smart Local Fallback Engine if AI key is missing or fails
    if (!replyText) {
      const lower = message.toLowerCase();

      const isIntl = INTERNATIONAL_KEYWORDS.some((k) => lower.includes(k));
      const govResult = findGovernorate(lower);
      const isShipping = lower.includes("شحن") || lower.includes("توصيل") || lower.includes("يوصل");
      const isPayment = lower.includes("دفع") || lower.includes("فودافون") || lower.includes("انستا") || lower.includes("كاش");
      const isReturn = lower.includes("ارجاع") || lower.includes("إرجاع") || lower.includes("تبديل") || lower.includes("استرجاع");
      const isGreeting = lower.includes("ازيك") || lower.includes("سلام") || lower.includes("اهلا") || lower.includes("أهلا") || lower.includes("مرحبا") || lower.includes("هاي") || lower.includes("hi");
      const isPriceQuery = lower.includes("سعر") || lower.includes("بكام") || lower.includes("بكام") || lower.includes("تمن") || lower.includes("كام") || lower.includes("فلوس") || lower.includes("اسعار") || lower.includes("أسعار");

      if (isIntl) {
        detectedIntent = "intl_shipping";
        replyText = `للأسف يا فنان، DEEP STORE بيشحن داخل جمهورية مصر العربية فقط حالياً 🇪🇬.\n\nلو عندك عنوان داخل مصر نتشرف بتوصيل طلبك فوراً!`;
      } else if (govResult) {
        detectedIntent = "city_shipping";
        replyText = `الشحن لـ **${govResult.matchedCity}** (محافظة ${govResult.gov.name}) متاح وسريع 🚚!\n- تكلفة الشحن: **${govResult.gov.price} ج.م**\n- التوصيل خلال: **${govResult.gov.deliveryDays}** من تأكيد الطلب.`;
      } else if (isShipping) {
        detectedIntent = "shipping";
        replyText = STORE_POLICIES.shipping;
      } else if (isPayment) {
        detectedIntent = "payment";
        replyText = STORE_POLICIES.payment;
      } else if (isReturn) {
        detectedIntent = "return";
        replyText = STORE_POLICIES.returns;
      } else if (isGreeting) {
        detectedIntent = "greeting";
        replyText = `أهلاً بيك يا فنان في DEEP STORE 🐺✨!\n\nأنا وولف، مستشارك الخاص للأزياء والمقاسات. قول لي بتدور على إيه أو اكتب طولك ووزنك وهظبطك فوراً!`;
        suggestedProductIds = validProducts.slice(0, 3).map((p) => p.id);
      } else {
        // Size Number Check
        const nums = message.match(/\d+/g)?.map(Number) || [];
        if (nums.length >= 2) {
          const height = Math.max(...nums);
          const weight = Math.min(...nums);
          if (height >= 140 && height <= 220 && weight >= 40 && weight <= 150) {
            detectedIntent = "size";
            let size = "M";
            if (height < 165 || weight < 60) size = "S";
            else if (height <= 175 && weight <= 72) size = "M";
            else if (height <= 182 && weight <= 84) size = "L";
            else if (height <= 190 && weight <= 95) size = "XL";
            else size = "XXL";
            replyText = `قياسك المضبوط في تشكيلة ديب هو **${size}** 🎯 (طول ${height}سم ووزن ${weight}كجم).\n\nشوف القطع المترشحة ليك بمقاسك:`;
            suggestedProductIds = validProducts.slice(0, 3).map((p) => p.id);
          }
        }

        if (!replyText) {
          const isProductReq = lower.includes("منتج") || lower.includes("عندك") || lower.includes("تشكيل") || lower.includes("عرض") || lower.includes("شوف") || lower.includes("كل المنتجات");
          if (isPriceQuery || isProductReq) {
            detectedIntent = "products";
            suggestedProductIds = validProducts.map((p) => p.id);
            replyText = isPriceQuery 
              ? `دي قائمة منتجاتنا الفاخرة بالأسعار الكاملة 💰:` 
              : `دي كل تشكيلة DEEP STORE المتاحة دلوقتي 🐺🔥:`;
          } else {
            // General conversational response using Wolf persona
            detectedIntent = "unknown";
            replyText = `أنا معاك وفاهمك يا فنان 🐺! قولي إيه اللي محتاجه بالظبط:\n- عايز تعرف **سعر منتج معين** أو تشوف الكتالوج؟\n- حابب تعرف **مقاسك المضبوط** (اكتب طولك ووزنك)؟\n- ولا بتسأل عن **تفاصيل الشحن والدفع** لمدينتك؟`;
            suggestedProductIds = validProducts.slice(0, 2).map((p) => p.id);
          }
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
