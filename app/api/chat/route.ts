import { NextResponse } from "next/server";
import { getProducts, getSiteSettings } from "@/lib/firebase/firestore";
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

const INTERNATIONAL_KEYWORDS = [
  "برا مصر", "خارج مصر", "دول تانية", "دول اخرى", "دول أخرى",
  "abroad", "international", "outside egypt", "خارج", "بره مصر",
  "السعودية", "الامارات", "الإمارات", "الكويت", "قطر", "البحرين",
  "الاردن", "الأردن", "لبنان", "ليبيا", "تونس", "المغرب", "العراق", "اليمن"
];

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

    // 1. Fetch Products and Settings dynamically from Firestore Database
    const [productsList, siteSettings] = await Promise.all([
      getCachedProducts(),
      getSiteSettings().catch(() => null)
    ]);
    const validProducts = productsList.filter(isValidProduct);

    // Dynamic Live Store Data from Database
    const storePhone = siteSettings?.storePhone || siteSettings?.whatsappNumber || "المتاح بصفحة التواصل";
    const vodafoneNumber = siteSettings?.vodafoneCash || "المتاح بصفحة الدفع";
    const instapayTag = siteSettings?.instapayUsername || "المتاح بصفحة الدفع";
    const announcement = siteSettings?.announcementEnabled ? siteSettings.announcementText : "";

    const catalogLines = validProducts.map((p) => {
      const priceText = p.salePrice ? `${p.salePrice} ج.م (خصم من ${p.price} ج.م)` : `${p.price} ج.م`;
      const colors = p.variants?.map((v) => v.colorName).filter(Boolean).join("، ") || "متعدد";
      const sizes = p.variants?.[0]?.sizes?.map((s) => `${s.size}(${s.stock > 0 ? "✓" : "✗"})`).join(" ") || "S M L XL XXL";
      const desc = p.description ? p.description.replace(/\n/g, " ") : "قطن فاخر ستريت وير عالية الجودة";
      return `[${p.id}] ${p.name} | سعر: ${priceText} | تصنيف: ${p.category} | ألوان: ${colors} | مقاسات: ${sizes} | وصف: ${desc} | رابط: /products/${p.slug}`;
    });
    const catalogText = catalogLines.length > 0 ? catalogLines.join("\n") : "لا توجد منتجات حالياً.";

    const apiKey = process.env.GEMINI_API_KEY;
    let replyText = "";
    let suggestedProductIds: string[] = [];
    let detectedIntent = "unknown";

    // Dynamic Prompt with 100% Firestore Database values & strict Persona guidelines
    const systemInstruction = `أنت "وولف" 🐺 — مساعد الأزياء الفاخر والمنسق الذكي المباشر لمتجر ${siteSettings?.storeName || "DEEP STORE"}.

مهمتك:
- الإجابة التلقائية والسلسة والذكية جداً على كل أسئلة الزوار (بالعربية المصرية العصرية الودية: "يا فنان"، "صديقي").
- فهم قصد العميل من أول مرة وسياق الكلام دون تكرار نفس السؤال أو الإجابة.
- إذا سأل العميل عن الشحن لأي محافظة أو مدينة (مثل القاهرة، المنصورة، طنطا، أسوان، الإسكندرية...)، وضح له أن الشحن متوفر لكل المحافظات في 2-4 أيام عمل وتتحدد التكلفة الدقيقة بالجنيه في صفحة الشراء، أو قدم له السعر التقريبي.
- إذا سأل عن منتج أو سعر أو مقاس، استخرج البيانات بدقة من الكتالوج التالي بدون أي تخمين أو اختراع.

معلومات متجر ${siteSettings?.storeName || "DEEP STORE"} من قواعد البيانات:
- التواصل والواتساب: ${storePhone}
- فودافون كاش: ${vodafoneNumber} | انستاباي: ${instapayTag}
- الإعلانات المفعّلة: ${announcement || "شحن وتوصيل لجميع المحافظات"}
- طرق الدفع: ${siteSettings?.codEnabled !== false ? "الدفع عند الاستلام 🚪، " : ""}${siteSettings?.vodafoneCashEnabled !== false ? `فودافون كاش 📱، ` : ""}${siteSettings?.instapayEnabled !== false ? `انستاباي 💳` : ""}

كتالوج المنتجات الحقيقي والفعلي المسجل في قاعدة البيانات (Firestore):
${catalogText}

قواعد الإجابة:
1. كن ذكياً ومباشراً ولا تكرر خيارات القائمة إلا إذا طلب العميل ذلك.
2. حدد المقاس الأنسب للعميل بناءً على طوله ووزنه بذكائك كخبير موضة وأزياء دون التزام بجداول صلبة.
3. إذا اقترحت منتجاً، اذكر اسمه ورابطه بالشكل: [اسم المنتج](/products/slug).
4. في نهاية الرد أضف سطراً واحداً بالتنسيق:
PRODUCT_IDS:id1,id2
INTENT:intent_name`;

    if (apiKey) {
      try {
        // Build proper Gemini contents array from history
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

    // Smart Local Fallback Engine (Runs ONLY if Gemini API network call fails or key missing)
    if (!replyText) {
      const lower = message.toLowerCase();

      const isIntl = INTERNATIONAL_KEYWORDS.some((k) => lower.includes(k));
      const isShipping = lower.includes("شحن") || lower.includes("توصيل") || lower.includes("يوصل");
      const isPayment = lower.includes("دفع") || lower.includes("فودافون") || lower.includes("انستا") || lower.includes("كاش");
      const isReturn = lower.includes("ارجاع") || lower.includes("إرجاع") || lower.includes("تبديل") || lower.includes("استرجاع");
      const isGreeting = lower.includes("ازيك") || lower.includes("سلام") || lower.includes("اهلا") || lower.includes("أهلا") || lower.includes("مرحبا") || lower.includes("هاي") || lower.includes("hi");
      const isPriceQuery = lower.includes("سعر") || lower.includes("بكام") || lower.includes("تمن") || lower.includes("كام") || lower.includes("فلوس") || lower.includes("اسعار") || lower.includes("أسعار");
      const isSpecsQuery = lower.includes("مواصفات") || lower.includes("موصفات") || lower.includes("خامة") || lower.includes("خامه") || lower.includes("تفاصيل") || lower.includes("وصف");
      const isSummerBeach = lower.includes("بحر") || lower.includes("ساحل") || lower.includes("شورت") || lower.includes("صيف");

      if (isIntl) {
        detectedIntent = "intl_shipping";
        replyText = `للأسف يا فنان، DEEP STORE بيشحن داخل جمهورية مصر العربية فقط حالياً 🇪🇬.\n\nلو عندك عنوان داخل مصر نتشرف بتوصيل طلبك فوراً!`;
      } else if (isShipping) {
        detectedIntent = "shipping";
        replyText = `الشحن متاح لكل المحافظات في 2-4 أيام عمل 🚚 (القاهرة 50ج، الدلتا والإسكندرية 60ج، القناة 65ج، الصعيد 75-85ج).`;
      } else if (isPayment) {
        detectedIntent = "payment";
        replyText = `طرق الدفع المتاحة 💳\n${siteSettings?.codEnabled !== false ? "• الدفع عند الاستلام 🚪\n" : ""}${siteSettings?.vodafoneCashEnabled !== false ? `• فودافون كاش 📱 (${vodafoneNumber})\n` : ""}${siteSettings?.instapayEnabled !== false ? `• انستاباي 💳 (${instapayTag})\n` : ""}`;
      } else if (isReturn) {
        detectedIntent = "return";
        replyText = `سياسة الإرجاع والتبديل 🔄\n- الإرجاع مقبول خلال 7 أيام من الاستلام مع الحفاظ على سلامة المنتج.\n- التبديل بالمقاس متاح خلال 14 يوم.`;
      } else if (isGreeting) {
        detectedIntent = "greeting";
        replyText = `أهلاً بيك يا فنان في DEEP STORE 🐺✨!\nأنا وولف، مستشارك الخاص للأزياء والمقاسات. قول لي إيه القطعة اللي بتدور عليها أو اكتب طولك ووزنك!`;
        suggestedProductIds = validProducts.slice(0, 3).map((p) => p.id);
      } else if (isSummerBeach) {
        detectedIntent = "products";
        const beachItems = validProducts.filter(p => p.name.includes("شورت") || p.category.includes("شورت") || p.description?.includes("بحر") || p.description?.includes("شورت"));
        suggestedProductIds = (beachItems.length > 0 ? beachItems : validProducts).map(p => p.id);
        replyText = `تشكيلة البحر والساحل الفاخرة من DEEP STORE 🏖️🔥:`;
      } else if (isSpecsQuery) {
        detectedIntent = "products";
        suggestedProductIds = validProducts.slice(0, 2).map((p) => p.id);
        const p1 = validProducts[0];
        const descText = p1 ? `\n• **${p1.name}**: ${p1.description || "خامة ستريت وير قطن فاخر عالية الجودة ومعالجة ضد الانكماش"}` : "";
        replyText = `مواصفات وخامات تشكيلة DEEP STORE 🐺🧵:\n- خامات قطنية فاخرة 100% ناعمة ومريحة.\n- تقفيل وترزية ستريت وير عالي الجودة.${descText}`;
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
            replyText = `قياسك المضبوط في تشكيلة ديب هو **${size}** 🎯 (طول ${height}سم ووزن ${weight}كجم).\nشوف القطع المترشحة ليك بمقاسك:`;
            suggestedProductIds = validProducts.slice(0, 3).map((p) => p.id);
          }
        }

        if (!replyText) {
          // Direct Product Search Match by Words
          const words = lower.split(/\s+/).filter(w => w.length > 2);
          const matched = validProducts.filter(p => {
            const name = p.name.toLowerCase();
            const cat = (p.category || "").toLowerCase();
            const desc = (p.description || "").toLowerCase();
            return words.some(w => name.includes(w) || cat.includes(w) || desc.includes(w));
          });

          if (matched.length > 0) {
            detectedIntent = "products";
            suggestedProductIds = matched.map(p => p.id);
            replyText = `إليك القطع المتطابقة مع بحثك 🐺✨:`;
          } else {
            const isProductReq = lower.includes("منتج") || lower.includes("عندك") || lower.includes("تشكيل") || lower.includes("عرض") || lower.includes("شوف") || lower.includes("كل المنتجات");
            if (isPriceQuery || isProductReq) {
              detectedIntent = "products";
              suggestedProductIds = validProducts.map((p) => p.id);
              replyText = isPriceQuery 
                ? `دي قائمة منتجاتنا بالأسعار الكاملة 💰:` 
                : `دي كل تشكيلة DEEP STORE المتاحة دلوقتي 🐺🔥:`;
            } else {
              detectedIntent = "unknown";
              replyText = `تحت أمرك يا فنان 🐺! اسألني عن أي منتج، مواصفاته، مقاسك، أو أسعار الشحن.`;
              suggestedProductIds = validProducts.slice(0, 2).map((p) => p.id);
            }
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
