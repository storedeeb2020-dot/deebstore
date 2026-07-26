"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import Link from "next/link";
import { MessageSquare, X, Send, Bot, User, Sparkles, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getProducts } from "@/lib/firebase/firestore";
import type { Product } from "@/types/product";

interface ChatMessage {
  id: string;
  sender: "bot" | "user";
  text: string;
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

  const links = parts.filter((p) => p.type === "link");

  if (links.length === 0) {
    return <span className="whitespace-pre-line">{text}</span>;
  }

  return (
    <div className="space-y-2">
      <div className="whitespace-pre-line">
        {parts.map((p, idx) => (p.type === "text" ? p.content : null))}
      </div>
      <div className="flex flex-wrap gap-2 pt-1">
        {links.map((link, idx) => (
          <Link
            key={idx}
            href={link.url!}
            onClick={onCloseChat}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/60 text-amber-300 hover:text-amber-200 text-xs font-extrabold transition-all hover:scale-105 active:scale-95 shadow-md cursor-pointer"
          >
            <span>{link.title}</span>
            <ExternalLink size={12} className="text-amber-400" />
          </Link>
        ))}
      </div>
    </div>
  );
}

export function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      sender: "bot",
      text: "أهلاً بك في DEEP STORE 👑! أنا مساعدك الذكي لاختيار أفضل المقاسات والمنتجات حسب طولك ووزنك، وتزويدك بروابط المنتجات المباشرة مع ترشيح قطع مكملة لإطلالتك الستريت وير.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
    "اقترح لي تيشيرت أوفرسايز أسود ورابط الشراء",
    "عايز طقم كامل هودي وبنطال كارجو مع الروابط",
    "ما هي طرق الدفع المتاحة ومواعيد الشحن؟",
  ];

  // Construct a clear text summary of products currently in store with direct URLs
  const productsCatalog = useMemo(() => {
    if (!products || products.length === 0) return "";
    return products
      .map((p) => {
        const colors = p.variants?.map((v) => v.colorName).filter(Boolean).join("، ") || "افتراضي";
        const sizes = p.variants?.[0]?.sizes?.map((s) => `${s.size} (${s.stock > 0 ? "متوفر" : "نفد"})`).join(", ") || "S, M, L, XL, XXL";
        const price = p.salePrice ? `${p.salePrice} ج.م (خصم من ${p.price} ج.م)` : `${p.price} ج.م`;
        const link = `/product/${p.slug || p.id}`;
        return `- ${p.name} | السعر: ${price} | الألوان: ${colors} | المقاسات: ${sizes} | رابط المنتج المباشر: ${link}`;
      })
      .join("\n");
  }, [products]);

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input.trim();
    if (!query || loading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: "user",
      text: query,
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: query,
          productsCatalog: productsCatalog,
        }),
      });

      let botReply = "";

      if (res.ok) {
        const data = await res.json().catch(() => null);
        if (data && data.reply) {
          botReply = data.reply;
        }
      }

      // Smart client fallback if API route returns error or non-JSON
      if (!botReply) {
        const numbers = query.match(/\d+/g)?.map(Number) || [];
        if (numbers.length >= 2) {
          const [n1, n2] = numbers;
          const height = Math.max(n1, n2);
          const weight = Math.min(n1, n2);
          let recSize = "L";
          if (height < 165 || weight < 60) recSize = "S";
          else if (height <= 175 && weight <= 72) recSize = "M";
          else if (height <= 182 && weight <= 84) recSize = "L";
          else if (height <= 190 && weight <= 95) recSize = "XL";
          else recSize = "XXL";

          botReply = `بناءً على قياساتك (طول ${height} سم ووزن ${weight} كجم)، ننصحك بمقاس (${recSize})!\n\nإليك اقتراحاتنا المتميزة لإكمال إطلالتك:\n- [تيشيرت أوفرسايز ديب أسود](/shop)\n- [بنطال كارجو ستريت وير أسود](/shop)`;
        } else {
          botReply = "أهلاً بك في DEEP STORE 👑! يمكنك تصفح التشكيلة الكاملة ورؤية المنتجات عبر [صفحة المتجر الرئيسية](/shop). اكتب لنا طولك ووزنك لاقتراح قطع مكملة مناسبة مع روابط الشراء المباشرة!";
        }
      }

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: "bot",
          text: botReply,
        },
      ]);
    } catch (err) {
      console.error("ChatBot send error:", err);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: "bot",
          text: "أهلاً بك في ديب ستور! يمكنك الاطلاع على المنتجات المتاحة فوراً عبر [صفحة المتجر](/shop).",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
          className="relative flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-600 text-black shadow-2xl shadow-amber-500/30 border border-amber-300/40 focus:outline-none cursor-pointer"
          aria-label="المساعد الذكي"
        >
          {isOpen ? (
            <X className="w-6 h-6 text-black" />
          ) : (
            <>
              <Bot className="w-7 h-7 text-black" />
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-amber-300"></span>
              </span>
            </>
          )}
        </motion.button>
      </div>

      {/* Chatbot Modal / Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className="fixed bottom-24 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[390px] h-[530px] max-h-[80vh] bg-zinc-950 border border-amber-500/30 rounded-3xl shadow-2xl shadow-black flex flex-col overflow-hidden text-white font-sans dir-rtl"
            dir="rtl"
          >
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-zinc-900 via-zinc-950 to-black border-b border-amber-500/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-amber-400 flex items-center gap-1.5">
                    DEEP AI Stylist & Direct Links
                  </h3>
                  <p className="text-[11px] text-zinc-400">مساعد المقاسات وروابط الشراء المباشرة 👑</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages Container */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-black/60 scrollbar-thin scrollbar-thumb-zinc-800">
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
                        ? "bg-gradient-to-r from-amber-500 to-amber-400 text-black font-semibold rounded-tr-none"
                        : "bg-zinc-900 border border-zinc-800 text-zinc-200 rounded-tl-none"
                    }`}
                  >
                    <FormattedMessageText text={msg.text} onCloseChat={() => setIsOpen(false)} />
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex items-center gap-2 text-amber-400 text-xs py-2">
                  <Bot size={16} className="animate-spin text-amber-400" />
                  <span>جاري تجهيز روابط المنتجات واقتراح التشكيلة...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Suggestions */}
            {messages.length < 4 && (
              <div className="px-3 py-2 bg-zinc-950 border-t border-zinc-900 flex flex-wrap gap-1.5">
                {quickQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(q)}
                    className="text-[11px] px-2.5 py-1 rounded-full bg-zinc-900 hover:bg-amber-500/10 hover:border-amber-500/30 border border-zinc-800 text-zinc-300 hover:text-amber-300 transition-colors text-right cursor-pointer"
                  >
                    {q}
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
                placeholder="اكتب استفسارك، أو اطلب رابط منتج محدد..."
                className="flex-1 bg-zinc-900 border border-zinc-800 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none transition-colors"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="p-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
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
