"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X, Send, Bot, User, Sparkles, ExternalLink, Shirt } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getProducts } from "@/lib/firebase/firestore";
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
      text: "أهلاً بك في ديب ستور 🐺! أنا مساعد ملابس الديب ستور. اكتب لي طولك ووزنك أو نوع القطعة التي تبحث عنها، وسأقترح عليك المقاس المضبوط والمنتجات المناسبة فوراً مع روابط الشراء المباشرة.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
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
          if (data && data.length > 0) {
            setProducts(data);
          }
        })
        .catch((err) => console.error("ChatBot product fetch error:", err));
    }
  }, [isOpen, products.length]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const quickQuestions = [
    "طولي 178 سم ووزني 75 كجم، ابعتلي لينك المقاس والمنتج المناسب",
    "اقترح لي تيشيرت أوفرسايز ورابط الشراء المباشر",
    "عايز طقم كامل هودي وبنطال كارجو مع الروابط",
    "ما هي طرق الدفع المتاحة ومواعيد التوصيل؟",
  ];

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
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={() => setIsOpen(!isOpen)}
          className="relative flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-tr from-amber-600 via-amber-400 to-yellow-300 text-black shadow-[0_0_25px_rgba(255,215,0,0.5)] border-2 border-amber-200 focus:outline-none cursor-pointer"
          aria-label="مساعد ملابس الديب ستور"
        >
          {isOpen ? (
            <X className="w-6 h-6 text-black font-black" />
          ) : (
            <div className="relative flex items-center justify-center p-1">
              <img src="/api/wolf-icon" alt="Wolf" className="w-7 h-7 object-contain drop-shadow-md mix-blend-multiply" />
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-amber-300"></span>
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
            className="fixed bottom-24 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[400px] h-[540px] max-h-[82vh] bg-zinc-950 border border-amber-500/40 rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.9)] flex flex-col overflow-hidden text-white font-sans dir-rtl"
            dir="rtl"
          >
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-zinc-900 via-zinc-950 to-black border-b border-amber-500/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center shadow-lg shadow-amber-500/20 p-1.5">
                  <img src="/api/wolf-icon" alt="Wolf" className="w-6 h-6 object-contain mix-blend-multiply" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-amber-400 flex items-center gap-1.5">
                    مساعد ملابس الديب ستور <img src="/api/wolf-icon" alt="Wolf" className="w-4 h-4 object-contain invert mix-blend-screen" />
                  </h3>
                  <p className="text-[11px] text-zinc-400">حاسبة المقاسات واقتراح التشكيلات المناسبة</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages Container */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-black/80 scrollbar-thin scrollbar-thumb-zinc-800">
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
                        ? "bg-zinc-800 text-zinc-300"
                        : "bg-amber-500/20 border border-amber-500/30 text-amber-400"
                    }`}
                  >
                    {msg.sender === "user" ? <User size={14} /> : <Bot size={14} />}
                  </div>

                  <div
                    className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed ${
                      msg.sender === "user"
                        ? "bg-gradient-to-r from-amber-500 to-amber-400 text-black font-semibold rounded-tr-none shadow-md"
                        : "bg-zinc-900 border border-zinc-800 text-zinc-200 rounded-tl-none"
                    }`}
                  >
                    <FormattedMessageText text={msg.text} onCloseChat={() => setIsOpen(false)} />
                    {/* Rich Product Cards */}
                    {msg.suggestedProducts && msg.suggestedProducts.length > 0 && (
                      <div className="mt-2 flex flex-col gap-2">
                        {msg.suggestedProducts
                          .filter((p) => p.name && p.name.trim().length >= 3 && p.slug && p.price > 0 && p.price < 50000)
                          .map((p) => (
                          <Link
                            key={p.id}
                            href={`/products/${p.slug}`}
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-2.5 p-2 rounded-xl bg-zinc-800/80 hover:bg-zinc-800 border border-zinc-700/60 hover:border-amber-500/50 transition-all group"
                          >
                            {p.mainImage && (
                              <img
                                src={p.mainImage}
                                alt={p.name}
                                className="w-12 h-12 rounded-lg object-cover flex-shrink-0 border border-zinc-700"
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1 mb-0.5">
                                <p className="font-bold text-zinc-100 text-xs truncate group-hover:text-amber-300 transition-colors flex-1">{p.name}</p>
                                {p.bestSeller && <span className="text-[8px] bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded px-1 flex-shrink-0">⭐ مبيعاً</span>}
                                {p.isNewArrival && <span className="text-[8px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded px-1 flex-shrink-0">جديد</span>}
                              </div>
                              <p className="text-[10px] text-zinc-500">{p.category}</p>
                              <p className="text-xs font-extrabold text-amber-400 mt-0.5">
                                {p.salePrice ? (
                                  <>
                                    <span>{p.salePrice} ج.م</span>
                                    <span className="line-through text-zinc-600 mr-1 font-normal">{p.price}</span>
                                  </>
                                ) : (
                                  <span>{p.price} ج.م</span>
                                )}
                              </p>
                              {p.variants && p.variants.length > 0 && (
                                <div className="flex gap-1 mt-1 flex-wrap">
                                  {p.variants.slice(0, 4).map((v, vi) => (
                                    <span
                                      key={vi}
                                      title={v.colorName}
                                      className="w-3 h-3 rounded-full border border-zinc-600 flex-shrink-0"
                                      style={{ backgroundColor: v.colorHex || "#555" }}
                                    />
                                  ))}
                                </div>
                              )}
                            </div>
                            <ExternalLink size={12} className="text-zinc-600 group-hover:text-amber-400 transition-colors flex-shrink-0" />
                          </Link>
                        ))}
                      </div>
                    )}

                    {/* Quick Replies below Bot Messages */}
                    {msg.sender === "bot" && msg.suggestedReplies && msg.suggestedReplies.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1 pt-1.5 border-t border-zinc-800/60">
                        {msg.suggestedReplies.map((replyText) => (
                          <button
                            key={replyText}
                            type="button"
                            onClick={() => handleSend(replyText)}
                            className="text-[10px] px-2 py-1 rounded-full bg-zinc-800 hover:bg-amber-500/20 border border-zinc-700 hover:border-amber-400/50 text-zinc-300 hover:text-amber-300 transition-all font-medium cursor-pointer"
                          >
                            {replyText}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex items-center gap-2 text-amber-400 text-xs py-2">
                  <Bot size={16} className="animate-spin text-amber-400" />
                  <span>جاري حساب المقاس واقتراح المنتجات المناسبة...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>


            {/* Quick Action Chips */}
            {messages.length <= 1 && !loading && (
              <div className="px-3 pb-2 flex flex-wrap gap-1.5">
                {[
                  { label: "🛍️ كل المنتجات", text: "ايه كل المنتجات المتاحة عندك؟" },
                  { label: "📏 احسب مقاسي", text: "عايز احسب مقاسي" },
                  { label: "🚚 الشحن والتوصيل", text: "ايه تفاصيل الشحن والتوصيل؟" },
                  { label: "💳 طرق الدفع", text: "ايه طرق الدفع المتاحة؟" },
                ].map((chip) => (
                  <button
                    key={chip.label}
                    type="button"
                    onClick={() => handleSend(chip.text)}
                    className="text-[10px] px-2.5 py-1.5 rounded-full bg-zinc-800 hover:bg-amber-500/20 border border-zinc-700 hover:border-amber-400/60 text-zinc-300 hover:text-amber-300 transition-all font-semibold cursor-pointer"
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            )}

            {/* Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="p-3 bg-zinc-950 border-t border-zinc-900 flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="اكتب طولك ووزنك أو استفسارك..."
                className="flex-1 bg-zinc-900 border border-zinc-800 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none transition-colors"
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
