"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X, Send, Bot, User, ExternalLink, ShoppingBag, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getProducts } from "@/lib/firebase/firestore";
import { useCart } from "@/features/cart/CartProvider";
import { db } from "@/lib/firebase/config";
import { doc, setDoc, arrayUnion, serverTimestamp } from "firebase/firestore";
import type { Product } from "@/types/product";

interface SuggestedProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  salePrice?: number;
  mainImage: string;
  category: string;
  bestSeller?: boolean;
  isNewArrival?: boolean;
  variants?: { colorName: string; colorHex: string; sizes: { size: string; stock: number }[] }[];
}

interface ChatMessage {
  id: string;
  sender: "bot" | "user";
  text: string;
  suggestedProducts?: SuggestedProduct[];
  suggestedReplies?: string[];
  intent?: string;
}

// Subcomponent for rich product cards with instant Add to Cart
function ChatProductCard({
  product,
  onCloseChat,
}: {
  product: SuggestedProduct;
  onCloseChat: () => void;
}) {
  const { addItem, openCart } = useCart();
  const [added, setAdded] = useState(false);

  const variants = product.variants && product.variants.length > 0 ? product.variants : [
    { colorName: "أسود", colorHex: "#000000", sizes: [{ size: "M", stock: 10 }, { size: "L", stock: 10 }, { size: "XL", stock: 10 }] }
  ];

  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0);
  const currentVariant = variants[selectedVariantIdx] || variants[0];
  
  const availableSizes = currentVariant.sizes?.map((s) => s.size) || ["S", "M", "L", "XL"];
  const [selectedSize, setSelectedSize] = useState<string>(availableSizes[0] || "M");

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const fullProduct: Product = {
      id: product.id,
      name: product.name,
      slug: product.slug,
      sku: `DEEP-${product.id.slice(0, 6)}`,
      description: "",
      price: product.price,
      salePrice: product.salePrice,
      category: product.category,
      brand: "DEEP STORE",
      mainImage: product.mainImage,
      variants: [],
      featured: false,
      bestSeller: false,
      createdAt: new Date(),
    };

    addItem(
      fullProduct,
      1,
      selectedSize,
      {
        name: currentVariant.colorName || "افتراضي",
        hex: currentVariant.colorHex || "#000000",
        image: product.mainImage || "",
      }
    );

    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      onCloseChat();
      openCart();
    }, 800);
  };

  return (
    <div className="flex flex-col gap-2 p-2.5 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-amber-500/40 transition-all shadow-md">
      <div className="flex items-center gap-2.5">
        {product.mainImage && (
          <img
            src={product.mainImage}
            alt={product.name}
            className="w-14 h-14 rounded-xl object-cover flex-shrink-0 border border-zinc-700/80"
          />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1 mb-0.5">
            <p className="font-bold text-zinc-100 text-xs truncate flex-1">{product.name}</p>
            {product.bestSeller && <span className="text-[8px] bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded px-1 flex-shrink-0">⭐ مبيعاً</span>}
          </div>
          <p className="text-[10px] text-zinc-400">{product.category}</p>
          <p className="text-xs font-extrabold text-amber-400 mt-0.5">
            {product.salePrice ? (
              <>
                <span>{product.salePrice} ج.م</span>
                <span className="line-through text-zinc-600 mr-1 font-normal">{product.price}</span>
              </>
            ) : (
              <span>{product.price} ج.م</span>
            )}
          </p>
        </div>
        <Link
          href={`/products/${product.slug}`}
          onClick={onCloseChat}
          className="p-1.5 text-zinc-500 hover:text-amber-400 transition-colors"
          title="عرض التفاصيل"
        >
          <ExternalLink size={14} />
        </Link>
      </div>

      {/* Color selection */}
      {variants.length > 0 && (
        <div className="flex items-center gap-1.5 pt-1 border-t border-zinc-800/60">
          <span className="text-[10px] text-zinc-400 font-semibold">اللون:</span>
          <div className="flex gap-1 flex-wrap">
            {variants.map((v, vi) => (
              <button
                key={vi}
                type="button"
                onClick={() => {
                  setSelectedVariantIdx(vi);
                  if (v.sizes && v.sizes.length > 0) {
                    setSelectedSize(v.sizes[0].size);
                  }
                }}
                title={v.colorName}
                className={`w-4 h-4 rounded-full border transition-all cursor-pointer ${
                  selectedVariantIdx === vi ? "border-amber-400 scale-110 shadow-sm shadow-amber-400/40" : "border-zinc-700 opacity-70"
                }`}
                style={{ backgroundColor: v.colorHex || "#555" }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Size selection & Add to Cart button */}
      <div className="flex items-center justify-between gap-2 pt-1">
        <div className="flex gap-1 flex-wrap">
          {availableSizes.slice(0, 5).map((sz) => (
            <button
              key={sz}
              type="button"
              onClick={() => setSelectedSize(sz)}
              className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                selectedSize === sz
                  ? "bg-amber-500 text-black border-amber-400 shadow-sm"
                  : "bg-zinc-800 text-zinc-300 border-zinc-700 hover:border-zinc-600"
              }`}
            >
              {sz}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={handleAddToCart}
          disabled={added}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer shadow-md flex-shrink-0 ${
            added
              ? "bg-emerald-600 text-white"
              : "bg-gradient-to-r from-amber-500 to-amber-400 text-black hover:from-amber-400 hover:to-yellow-300"
          }`}
        >
          {added ? (
            <>
              <Check size={13} className="stroke-[3]" />
              <span>تمت الإضافة</span>
            </>
          ) : (
            <>
              <ShoppingBag size={13} />
              <span>أضف للسلة</span>
            </>
          )}
        </button>
      </div>

      {/* Direct WhatsApp Quick Order Button */}
      <WhatsAppOrderButton
        productName={product.name}
        size={selectedSize}
        color={currentVariant.colorName || "افتراضي"}
        price={product.salePrice || product.price}
      />
    </div>
  );
}

// Subcomponent for direct WhatsApp Order button generator
function WhatsAppOrderButton({
  productName,
  size,
  color,
  price,
  phone = "201020451206",
}: {
  productName: string;
  size: string;
  color: string;
  price: number;
  phone?: string;
}) {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const [showForm, setShowForm] = useState(false);

  const cleanPhone = phone.replace(/\D/g, "");

  const handleSendWhatsApp = (e: React.FormEvent) => {
    e.preventDefault();
    const message = `👋 مرحباً DEEP STORE! أريد تأكيد طلب جديد من خلال مساعد وولف 🐺:
- **المنتج:** ${productName}
- **اللون:** ${color}
- **المقاس:** ${size}
- **السعر:** ${price} ج.م
- **اسم العميل:** ${name || "غير محدد"}
- **رقم الهاتف:** ${userPhone || "غير محدد"}
- **العنوان:** ${address || "غير محدد"}`;

    const encoded = encodeURIComponent(message);
    const waUrl = `https://wa.me/${cleanPhone}?text=${encoded}`;
    window.open(waUrl, "_blank");
  };

  if (!showForm) {
    return (
      <button
        type="button"
        onClick={() => setShowForm(true)}
        className="w-full mt-2 flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
      >
        <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
        <span>إتمام طلب (${productName}) عبر الواتساب 💬</span>
      </button>
    );
  }

  return (
    <form onSubmit={handleSendWhatsApp} className="mt-2.5 p-3 rounded-2xl bg-zinc-950 border border-emerald-500/40 text-xs space-y-2 dir-rtl text-right">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-1.5 mb-2">
        <span className="font-extrabold text-emerald-400">تأكيد طلب الواتساب المباشر 💬</span>
        <button type="button" onClick={() => setShowForm(false)} className="text-zinc-500 hover:text-white text-[10px]">إلغاء</button>
      </div>
      <div>
        <label className="text-[10px] text-zinc-400 block mb-0.5">الاسم بالكامل *</label>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="أدخل اسمك الكريم"
          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-white placeholder-zinc-600 text-xs focus:outline-none focus:border-emerald-500"
        />
      </div>
      <div>
        <label className="text-[10px] text-zinc-400 block mb-0.5">رقم الموبايل *</label>
        <input
          type="tel"
          required
          value={userPhone}
          onChange={(e) => setUserPhone(e.target.value)}
          placeholder="010xxxxxxx"
          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-white placeholder-zinc-600 text-xs focus:outline-none focus:border-emerald-500"
        />
      </div>
      <div>
        <label className="text-[10px] text-zinc-400 block mb-0.5">المحافظة والعنوان بالتفصيل *</label>
        <input
          type="text"
          required
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="المحافظة - الحي - الشارع"
          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-white placeholder-zinc-600 text-xs focus:outline-none focus:border-emerald-500"
        />
      </div>
      <button
        type="submit"
        className="w-full mt-1.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-black font-extrabold text-xs shadow-lg hover:from-emerald-400 hover:to-teal-300 transition-all cursor-pointer flex items-center justify-center gap-1.5"
      >
        <span>إرسال تفاصيل الطلب للواتساب الآن 🚀</span>
      </button>
    </form>
  );
}

// Component to render clickable product links inside chatbot messages
function FormattedMessageText({
  text,
  onCloseChat,
}: {
  text: string;
  onCloseChat: () => void;
}) {
  const parts: Array<{ type: "text" | "link"; content?: string; title?: string; url?: string }> = [];
  const regex = /\[([^\]]+)\]\(([^)]+)\)/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: "text", content: text.substring(lastIndex, match.index) });
    }
    parts.push({ type: "link", title: match[1], url: match[2] });
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push({ type: "text", content: text.substring(lastIndex) });
  }

  if (parts.length === 0) {
    return <span className="whitespace-pre-line">{text}</span>;
  }

  return (
    <span className="whitespace-pre-line leading-relaxed">
      {parts.map((p, index) => {
        if (p.type === "text") {
          return <span key={index}>{p.content}</span>;
        } else {
          return (
            <Link
              key={index}
              href={p.url!}
              onClick={onCloseChat}
              className="inline-flex items-center gap-0.5 mx-1 px-1.5 py-0.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/50 text-amber-300 hover:text-amber-200 transition-all font-bold cursor-pointer"
            >
              <span>{p.title}</span>
              <ExternalLink size={11} className="text-amber-400 inline" />
            </Link>
          );
        }
      })}
    </span>
  );
}

export function ChatBot() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      sender: "bot",
      text: "أهلاً بك في DEEP STORE 🐺🔥!\nأنا **وولف**، مساعدك الشخصي ومستشارك للأزياء والمقاسات.\n\nقولي بتدور على إيه النهاردة؟ أو اكتب طولك ووزنك وهقترح عليك المقاس والقطع المناسبة فوراً!",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Generate or retrieve session ID for chat analytics
  useEffect(() => {
    let currentSessionId = sessionStorage.getItem("deep_chat_session_id");
    if (!currentSessionId) {
      currentSessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      sessionStorage.setItem("deep_chat_session_id", currentSessionId);
    }
    setSessionId(currentSessionId);
  }, []);

  // Log messages to Firestore for admin analytics
  const logMessageToFirestore = async (sender: "user" | "bot", text: string) => {
    if (!sessionId) return;
    try {
      const chatDocRef = doc(db, "chat_logs", sessionId);
      const logData: any = {
        messages: arrayUnion({
          sender,
          text,
          timestamp: new Date().toISOString(),
        }),
        updatedAt: serverTimestamp(),
        deviceInfo: typeof navigator !== "undefined" ? navigator.userAgent : "Unknown",
      };
      // For the first user message, record it as a preview and set first created time
      if (sender === "user" && messages.length <= 1) {
        logData.firstMessage = text;
        logData.createdAt = serverTimestamp();
      }
      await setDoc(chatDocRef, logData, { merge: true });
    } catch (err) {
      console.error("Error logging chat message to Firestore:", err);
    }
  };

  // Load live store products when ChatBot opens
  useEffect(() => {
    if (isOpen && products.length === 0) {
      getProducts()
        .then((data) => {
          if (Array.isArray(data)) setProducts(data);
        })
        .catch((err) => console.error("ChatBot product fetch error:", err));
    }
  }, [isOpen, products.length]);

  // Lock background page scrolling when ChatBot is open
  useEffect(() => {
    if (isOpen) {
      const origBodyOverflow = document.body.style.overflow;
      const origHtmlOverflow = document.documentElement.style.overflow;
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";

      return () => {
        document.body.style.overflow = origBodyOverflow;
        document.documentElement.style.overflow = origHtmlOverflow;
      };
    }
  }, [isOpen]);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Construct a detailed text summary of products currently in store including description and correct URLs
  const productsCatalog = useMemo(() => {
    if (!products || products.length === 0) return "";
    return products
      .map((p) => {
        const colors = p.variants?.map((v) => v.colorName).filter(Boolean).join("، ") || "افتراضي";
        const sizes = p.variants?.[0]?.sizes?.map((s) => `${s.size} (${s.stock > 0 ? "متوفر" : "نفد"})`).join(", ") || "S, M, L, XL, XXL";
        const price = p.salePrice ? `${p.salePrice} ج.م (خصم من ${p.price} ج.م)` : `${p.price} ج.م`;
        const description = p.description ? p.description.replace(/\n/g, " ") : "لا يوجد وصف";
        return `- **${p.name}** | الوصف: ${description} | الماركة: ${p.brand || "DEEP STORE"} | السعر: ${price} | الألوان: ${colors} | المقاسات: ${sizes} | الرابط المباشر: [/products/${p.slug}](/products/${p.slug})`;
      })
      .join("\n");
  }, [products]);

  const handleSend = async (customText?: string) => {
    const textToSend = customText || input;
    if (!textToSend.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: "user",
      text: textToSend,
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customText) setInput("");
    setLoading(true);

    await logMessageToFirestore("user", textToSend);

    try {
      // Send full conversation history for context
      const historyForApi = messages
        .filter((m) => m.id !== "welcome")
        .map((m) => ({ role: m.sender === "user" ? "user" : "bot", text: m.text }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userMessage: textToSend,
          history: historyForApi,
          catalogText: productsCatalog,
          sessionId: sessionId || "anon_session",
        }),
      });

      if (!res.ok) throw new Error("Chat request failed");

      const data = await res.json();
      const botReply = data.reply || "عذراً، حدث خطأ أثناء الاتصال. حاول مرة أخرى.";
      const suggestedProducts = data.suggestedProducts || [];
      const suggestedReplies = data.suggestedReplies || [];

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: "bot",
          text: botReply,
          suggestedProducts,
          suggestedReplies,
        },
      ]);

      await logMessageToFirestore("bot", botReply);
    } catch (err) {
      console.error("ChatBot send error:", err);
      const fallbackText = "أهلاً بك في ديب ستور! يمكنك الاطلاع على المنتجات المتاحة فوراً عبر [صفحة المتجر](/shop).";
      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), sender: "bot", text: fallbackText },
      ]);
      await logMessageToFirestore("bot", fallbackText);
    } finally {
      setLoading(false);
    }
  };

  if (pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <>
      {/* Draggable Smooth Floating Trigger Button */}
      <motion.div
        drag
        dragMomentum={false}
        whileDrag={{ scale: 1.1 }}
        className="fixed bottom-6 right-6 z-50 cursor-grab active:cursor-grabbing touch-none select-none"
      >
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsOpen(!isOpen)}
          className="relative flex items-center justify-center w-16 h-16 focus:outline-none cursor-pointer p-0 bg-transparent border-0 drop-shadow-[0_10px_25px_rgba(245,158,11,0.6)]"
          aria-label="مساعد ملابس الديب ستور"
        >
          {isOpen ? (
            <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-400 text-black flex items-center justify-center shadow-2xl border-2 border-amber-300">
              <X className="w-7 h-7 text-black font-black" />
            </div>
          ) : (
            <div className="relative flex items-center justify-center w-full h-full">
              {/* Direct Transparent Wolf Image Icon */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/api/wolf-icon"
                alt="DEEP STORE Wolf Assistant"
                className="w-full h-full object-contain filter drop-shadow-[0_4px_16px_rgba(251,191,36,0.8)] dark:drop-shadow-[0_4px_16px_rgba(255,255,255,0.4)] hover:scale-105 transition-transform"
              />
              <span className="absolute top-0 right-0 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-400 border border-black"></span>
              </span>
            </div>
          )}
        </motion.button>
      </motion.div>

      {/* Chatbot Drawer Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className="fixed bottom-24 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[400px] h-[540px] max-h-[82vh] bg-white dark:bg-zinc-950 border border-amber-500/40 rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.25)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.9)] flex flex-col overflow-hidden text-zinc-900 dark:text-white font-sans dir-rtl relative transition-colors"
            dir="rtl"
          >
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-amber-50 via-zinc-100 to-white dark:from-zinc-900 dark:via-zinc-950 dark:to-black border-b border-amber-500/20 flex items-center justify-between z-10 relative">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center shadow-lg shadow-amber-500/20 p-1">
                  <img src="/api/wolf-icon" alt="Wolf" className="w-8 h-8 object-contain" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                    مساعد ملابس الديب ستور <img src="/api/wolf-icon" alt="Wolf" className="w-4 h-4 object-contain dark:invert" />
                  </h3>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">حاسبة المقاسات واقتراح التشكيلات المناسبة</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-full bg-zinc-200/60 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Background Wolf Watermark inside Chat */}
            <div className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center opacity-15 dark:opacity-30">
              <img src="/api/wolf-icon" alt="Wolf Watermark" className="w-72 h-72 object-contain filter drop-shadow-[0_0_20px_rgba(245,158,11,0.2)] dark:invert" />
            </div>

            {/* Messages Container with Strict Scroll Isolation */}
            <div 
              ref={chatContainerRef}
              className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-zinc-50/90 dark:bg-black/60 backdrop-blur-sm scrollbar-thin scrollbar-thumb-amber-500/30 overscroll-contain touch-pan-y z-10 relative"
              onWheel={(e) => e.stopPropagation()}
              onTouchMove={(e) => e.stopPropagation()}
            >
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2.5 ${
                    msg.sender === "user" ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs flex-shrink-0 ${
                      msg.sender === "user"
                        ? "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                        : "bg-amber-500/20 border border-amber-500/30 text-amber-600 dark:text-amber-400"
                    }`}
                  >
                    {msg.sender === "user" ? <User size={14} /> : <Bot size={14} />}
                  </div>

                  <div
                    className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed ${
                      msg.sender === "user"
                        ? "bg-gradient-to-r from-amber-500 to-amber-400 text-black font-semibold rounded-tr-none shadow-md"
                        : "bg-white text-zinc-900 border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-200 rounded-tl-none shadow-sm"
                    }`}
                  >
                    <FormattedMessageText text={msg.text} onCloseChat={() => setIsOpen(false)} />
                    
                    {/* Rich Product Cards with Direct Add to Cart */}
                    {msg.suggestedProducts && msg.suggestedProducts.length > 0 && (
                      <div className="mt-2 flex flex-col gap-2">
                        {msg.suggestedProducts
                          .filter((p) => p.name && p.name.trim().length >= 3 && p.slug && p.price > 0 && p.price < 50000)
                          .map((p) => (
                            <ChatProductCard key={p.id} product={p} onCloseChat={() => setIsOpen(false)} />
                          ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 text-xs py-2 font-bold">
                  <Bot size={16} className="animate-spin text-amber-500" />
                  <span>جاري حساب المقاس واقتراح المنتجات المناسبة...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="p-3 bg-white dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-900 flex items-center gap-2 z-10 relative"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="اكتب طولك ووزنك أو استفسارك..."
                className="flex-1 bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none transition-colors"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="p-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 text-black font-bold disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <Send size={15} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
