"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Instagram, Send } from "lucide-react";
import { toast } from "sonner";
import { getSiteSettings, createContactMessage, type SiteSettings } from "@/lib/firebase/firestore";
import { Spinner } from "@/components/ui/Spinner";

export default function ContactPage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  const [name, setName] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getSiteSettings()
      .then((data) => {
        if (data) setSettings(data);
      })
      .catch(console.error);
  }, []);

  const storeEmail = settings?.storeEmail || "storedeeb2020@gmail.com";
  const storePhone = settings?.storePhone || "+20 101 234 5678";
  const instagramUrl =
    settings?.instagramUrl ||
    "https://www.instagram.com/eldeeb_st0re?igsh=MTh3dDBheWJ1MjNneg==";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Please enter your name");
      return;
    }
    if (!emailInput.trim() || !emailInput.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }
    if (!message.trim()) {
      toast.error("Please write your message");
      return;
    }

    setSubmitting(true);
    try {
      await createContactMessage({
        name: name.trim(),
        email: emailInput.trim(),
        message: message.trim(),
      });
      toast.success("Your message has been received! Our team will respond shortly.");
      setName("");
      setEmailInput("");
      setMessage("");
    } catch (err) {
      console.error(err);
      toast.error("Failed to send message. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pt-20 min-h-screen bg-white dark:bg-black text-foreground">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <p className="text-xs font-semibold tracking-widest uppercase text-gray-400 mb-2">
            Get in Touch
          </p>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
            Contact Us
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-3 text-lg">
            We&apos;re here to help. Reach out anytime.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {[
              {
                icon: Mail,
                label: "Email",
                value: storeEmail,
                href: `mailto:${storeEmail}`,
              },
              {
                icon: Phone,
                label: "Phone / WhatsApp",
                value: storePhone,
                href: `tel:${storePhone.replace(/\s+/g, "")}`,
              },
              {
                icon: Instagram,
                label: "Instagram",
                value: "@eldeeb_st0re",
                href: instagramUrl,
              },
              {
                icon: MapPin,
                label: "Location",
                value: "Cairo, Egypt",
                href: null,
              },
            ].map(({ icon: Icon, label, value, href }) => (
              <div key={label} className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gray-100 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Icon size={20} />
                </div>
                <div>
                  <p className="text-sm text-gray-400 font-medium">{label}</p>
                  {href ? (
                    <a
                      href={href}
                      target={href.startsWith("http") ? "_blank" : undefined}
                      rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                      className="font-semibold hover:opacity-60 transition-opacity"
                    >
                      {value}
                    </a>
                  ) : (
                    <p className="font-semibold">{value}</p>
                  )}
                </div>
              </div>
            ))}
          </motion.div>

          {/* Contact Form */}
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="w-full px-4 py-3 border border-gray-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white bg-white dark:bg-zinc-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Email
              </label>
              <input
                type="email"
                required
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="your@email.com"
                className="w-full px-4 py-3 border border-gray-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white bg-white dark:bg-zinc-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Message
              </label>
              <textarea
                rows={5}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="How can we help you?"
                className="w-full px-4 py-3 border border-gray-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white resize-none bg-white dark:bg-zinc-900"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 bg-black text-white dark:bg-white dark:text-black rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {submitting ? (
                <Spinner size="sm" className="border-white dark:border-black border-t-transparent" />
              ) : (
                <>
                  <Send size={16} />
                  Send Message
                </>
              )}
            </button>
          </motion.form>
        </div>
      </div>
    </div>
  );
}
