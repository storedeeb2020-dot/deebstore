"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  Video,
  Image as ImageIcon,
  Save,
  Sparkles,
  Sliders,
  Type,
  CreditCard,
  Shield,
  Trash2,
  Phone,
  Info,
  Ruler,
  Plus,
  Megaphone,
  Bot,
  Sun,
  Moon,
  Send,
  Lock,
  KeyRound,
  UserCheck,
  UserPlus,
  X,
  Package,
} from "lucide-react";
import { getSiteSettings, updateSiteSettings, type SiteSettings, type GlobalSizeChart } from "@/lib/firebase/firestore";
import { changeAdminPassword, signOut } from "@/lib/firebase/auth";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { uploadVideoToCloudinary } from "@/lib/cloudinary";
import { Spinner } from "@/components/ui/Spinner";
import { ToggleSwitch } from "@/components/ui/ToggleSwitch";
import { db } from "@/lib/firebase/config";
import { collection, query, orderBy, getDocs, limit, deleteDoc, doc } from "firebase/firestore";

type SettingsTab = "hero" | "brand" | "payments" | "gomla" | "sizeCharts" | "contact" | "about" | "legal" | "announcement" | "chatAnalytics" | "telegram" | "security";

export default function AdminSettingsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab") as SettingsTab | null;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<SettingsTab>("payments");

  useEffect(() => {
    if (tabParam && ["hero", "brand", "payments", "gomla", "sizeCharts", "contact", "about", "legal", "announcement", "chatAnalytics", "telegram", "security"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const [uploadingVideo, setUploadingVideo] = useState(false);

  // New size chart creator state
  const [newSizeChartName, setNewSizeChartName] = useState("");
  const [newSizeChartImage, setNewSizeChartImage] = useState("");

  // ChatBot Analytics states
  const [chatLogs, setChatLogs] = useState<any[]>([]);
  const [loadingChats, setLoadingChats] = useState(false);
  const [selectedChat, setSelectedChat] = useState<any | null>(null);

  // Telegram test and multi-user manager state
  const [testingTelegram, setTestingTelegram] = useState(false);
  const [newAuthorizedId, setNewAuthorizedId] = useState("");

  const addAuthorizedId = async () => {
    const cleanId = newAuthorizedId.trim();
    if (!cleanId) {
      toast.error("يرجى كتابة رقم الـ Chat ID أولاً");
      return;
    }
    const currentIds = (settings.telegramChatId || "")
      .split(/[\s,;]+/)
      .map((id) => id.trim())
      .filter(Boolean);

    if (currentIds.includes(cleanId)) {
      toast.error("هذا الـ Chat ID مضاف بالفعل في القائمة");
      return;
    }

    const updatedIds = [...currentIds, cleanId].join(", ");
    setSettings((prev) => ({ ...prev, telegramChatId: updatedIds }));
    setNewAuthorizedId("");

    try {
      await updateSiteSettings({ telegramChatId: updatedIds });
      toast.success(`تمت إضافة الـ ID (${cleanId}) وحفظه بنجاح 📲`);
    } catch (err) {
      console.error("Failed to save authorized ID to Firestore:", err);
      toast.error("فشل حفظ الـ ID الجديد في قاعدة البيانات");
    }
  };

  const removeAuthorizedId = async (idToRemove: string) => {
    const currentIds = (settings.telegramChatId || "")
      .split(/[\s,;]+/)
      .map((id) => id.trim())
      .filter(Boolean);

    const updatedIds = currentIds.filter((id) => id !== idToRemove).join(", ");
    setSettings((prev) => ({ ...prev, telegramChatId: updatedIds }));

    try {
      await updateSiteSettings({ telegramChatId: updatedIds });
      toast.success(`تم حذف الـ ID (${idToRemove}) وحفظ التعديل 🗑️`);
    } catch (err) {
      console.error("Failed to update authorized IDs in Firestore:", err);
      toast.error("فشل تعديل القائمة في قاعدة البيانات");
    }
  };

  const handleTestTelegram = async () => {
    if (!settings.telegramBotToken?.trim() || !settings.telegramChatId?.trim()) {
      toast.error("يرجى كتابة Bot Token و Chat ID أولاً");
      return;
    }
    setTestingTelegram(true);
    const toastId = toast.loading("جاري إرسال الإشعار الاختباري إلى تليجرام...");
    try {
      const res = await fetch("/api/telegram/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          botToken: settings.telegramBotToken,
          chatId: settings.telegramChatId,
        }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("تم إرسال إشعار الاختبار بنجاح على تليجرام! 📲", { id: toastId });
      } else {
        toast.error(json.error || "فشل إرسال الإشعار الاختباري", { id: toastId });
      }
    } catch {
      toast.error("فشل الاتصال بخدمة الاختبار", { id: toastId });
    } finally {
      setTestingTelegram(false);
    }
  };

  // Change Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      toast.error("يرجى إدخال كلمة المرور الحالية أولاً");
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      toast.error("كلمة المرور الجديدة يجب أن تتكون من 6 أحرف على الأقل");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("كلمة المرور الجديدة وتأكيدها غير متطابقين");
      return;
    }

    setChangingPassword(true);
    const toastId = toast.loading("جاري التحقق من كلمة المرور الحالية وتحديثها...");
    try {
      await changeAdminPassword(currentPassword, newPassword);
      toast.success("تم تغيير كلمة مرور الأدمن بنجاح! سيتم تسجيل الخروج فوراً للتحقق الأمني 🔐", { id: toastId });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      // Force sign out and redirect to login page
      setTimeout(async () => {
        await signOut();
        router.push("/admin/login");
      }, 1500);
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "فشل تغيير كلمة المرور — تأكد من كلمة المرور الحالية", { id: toastId });
    } finally {
      setChangingPassword(false);
    }
  };

  const [settings, setSettings] = useState<SiteSettings>({
    storeName: "DEEB STORE",
    logoUrl: "/logo.png",
    heroTagline: "ديب ستور — عالم الموضة والستريت وير الفاخر 🐺",
    heroButtonText: "تسوق الآن — SHOP NOW",
    heroMediaType: "image",
    heroVideoUrlLight: "https://res.cloudinary.com/aqszlz7k/video/upload/12_zsnepl.mp4",
    heroVideoUrlDark: "https://res.cloudinary.com/aqszlz7k/video/upload/12_zsnepl.mp4",
    heroImagesLight: [],
    heroImagesDark: [],
    featuredTitle: "التشكيلات العصرية",
    featuredSubtitle: "مصممة بعناية لتناسب أسلوب حياتك",
    introTagline: "DEEB STORE ROYAL STREETWEAR 🐺",
    footerDescription: "متجر ديب ستور الفاخر لملابس الستريت وير والموضة العصرية في مصر والوطن العربي.",
    storeEmail: "storedeeb2020@gmail.com",
    storePhone: "+20 101 234 5678",
    vodafoneCash: "01012345678",
    instapayUsername: "@deepstore",
    onlinePaymentEnabled: true,
    vodafoneCashEnabled: true,
    instapayEnabled: true,
    codEnabled: true,
    sizeCharts: [],
    instagramUrl: "https://www.instagram.com/eldeeb_st0re?igsh=MTh3dDBheWJ1MjNneg==",
    facebookUrl: "https://www.facebook.com/share/1BeVGnopec/",
    tiktokUrl: "https://www.tiktok.com/@eldeeb.stoer?_r=1&_t=ZS-98MVHwLnOtM",
    currency: "EGP",
    whatsappNumber: "201012345678",
    announcementEnabled: false,
    announcementText: "🔥 شحن مجاني على جميع الطلبات فوق 500 جنيه!",
    announcementColor: "#F59E0B",
    announcementLink: "",
    freeShippingEnabled: true,
    freeShippingThreshold: 500,
    telegramEnabled: false,
    telegramBotToken: "",
    telegramChatId: "",
    aboutTitle: "عن ديب ستور — About DEEB STORE",
    aboutSubtitle: "نحدد أسلوب الأناقة العصرية من خلال الموضة الفاخرة وخامات الستريت وير الممتازة والتصاميم الاستثنائية.",
    aboutSection1Title: "الرقي والبساطة العصرية",
    aboutSection1Text: "في ديب ستور DEEB STORE، نؤمن بأن الأسلوب هو انعكاس للهوية. نصمم ملابس تبرز خطوط الأناقة وتعتمد على الخامات الفاخرة التي تدوم طويلاً وتمنحك التميز المطلق.",
    aboutSection1Image: "",
    aboutSection2Title: "جودة بدون مساومة",
    aboutSection2Text: "نختار أجود أنواع الأقمشة لضمان أقصى درجات الراحة والمتانة مع كل قطعة ترتديها.",
    aboutSection2Image: "",
    privacyPolicyText: `المعلومات التي نجمعها:
نجمع البيانات التي تزودنا بها عند تقديم الطلب مثل الاسم، رقم الهاتف، عنوان التوصيل، وطريقة الدفع. نحن نحافظ على سرية بياناتك بالكامل ولا يتم مشاركتها أو بيعها لأي جهة خارجية.

كيفية استخدام البيانات:
نستخدم المعلومات لمعالجة الطلبات والتواصل معك بشأن الشحن وتقديم أفضل خدمة تسوق.

حماية البيانات:
نطبق أعلى معايير الأمان لحماية بياناتك الشخصية من أي وصول غير مصرح به.

للتواصل معنا بشأن الخصوصية: storedeeb2020@gmail.com`,
    termsOfServiceText: `الموافقة على الشروط:
استخدامك لمتجر ديب ستور DEEB STORE يعني موافقتك الكاملة على هذه الشروط والأحكام.

الطلبات والدفع:
جميع الطلبات تخضع لتوافر المنتج. يتم الدفع عن طريق الدفع عند الاستلام، فودافون كاش، أو انستاباي.

الشحن والتوصيل:
يتم تجهيز الطلبات خلال 1-2 يوم عمل وتصلك خلال 2-5 أيام عمل حسب المحافظة.

الاستبدال والاسترجاع:
يتم الاسترجاع أو الاستبدال خلال 7 أيام من تاريخ الاستلام بشرط عدم استخدام المنتج وحفظه بحالته الأصلية.`,
  });

  useEffect(() => {
    getSiteSettings()
      .then((data) => {
        if (data) {
          setSettings((prev) => ({
            ...prev,
            ...data,
            onlinePaymentEnabled: data.onlinePaymentEnabled ?? true,
            vodafoneCashEnabled: data.vodafoneCashEnabled ?? true,
            instapayEnabled: data.instapayEnabled ?? true,
            codEnabled: data.codEnabled ?? true,
            freeShippingEnabled: data.freeShippingEnabled ?? true,
            freeShippingThreshold: data.freeShippingThreshold ?? 500,
            gomlaEnabled: data.gomlaEnabled ?? true,
            gomlaWhatsappNumber: data.gomlaWhatsappNumber || data.whatsappNumber || "",
            gomlaIntroText: data.gomlaIntroText || "قسم مبيعات الجملة والكميات — أسعار خاصة بالتجار والمحلات 📦⚡",
            sizeCharts: data.sizeCharts || [],
          }));
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateSiteSettings(settings);
      toast.success("تم حفظ إعدادات المتجر وتحديث جداول المقاسات ولوجو المحل بنجاح 🐺");
    } catch (err) {
      console.error(err);
      toast.error("فشل حفظ الإعدادات");
    } finally {
      setSaving(false);
    }
  };

  // Fetch chat logs for analytics
  useEffect(() => {
    if (activeTab === "chatAnalytics") {
      setLoadingChats(true);
      const q = query(collection(db, "chat_logs"), orderBy("updatedAt", "desc"), limit(50));
      getDocs(q)
        .then((snap) => {
          const logs = snap.docs.map((docItem) => ({
            id: docItem.id,
            ...docItem.data(),
          }));
          setChatLogs(logs);
        })
        .catch((err) => {
          console.error("Failed to load chat logs:", err);
          toast.error("فشل تحميل سجلات المحادثات");
        })
        .finally(() => setLoadingChats(false));
    }
  }, [activeTab]);

  const handleDeleteChat = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("هل أنت متأكد من حذف هذا السجل؟")) return;
    try {
      await deleteDoc(doc(db, "chat_logs", id));
      setChatLogs((prev) => prev.filter((c) => c.id !== id));
      if (selectedChat?.id === id) setSelectedChat(null);
      toast.success("تم حذف المحادثة بنجاح");
    } catch (err) {
      console.error("Failed to delete chat log:", err);
      toast.error("فشل حذف المحادثة");
    }
  };

  const addSizeChart = () => {
    if (!newSizeChartName.trim()) {
      toast.error("يرجى كتابة اسم لجدول المقاسات (مثلاً: جدول مقاسات التيشيرتات)");
      return;
    }
    if (!newSizeChartImage) {
      toast.error("يرجى رفع صورة جدول المقاسات أولاً");
      return;
    }

    const newItem: GlobalSizeChart = {
      id: Date.now().toString(),
      name: newSizeChartName.trim(),
      imageUrl: newSizeChartImage,
    };

    setSettings((prev) => ({
      ...prev,
      sizeCharts: [...(prev.sizeCharts || []), newItem],
    }));

    setNewSizeChartName("");
    setNewSizeChartImage("");
    toast.success("تمت إضافة جدول المقاسات الجديد بالقائمة 🐺");
  };

  const removeSizeChart = (id: string) => {
    setSettings((prev) => ({
      ...prev,
      sizeCharts: prev.sizeCharts?.filter((item) => item.id !== id),
    }));
    toast.success("تم حذف جدول المقاسات");
  };

  const removeImageDark = (index: number) => {
    setSettings((prev) => ({
      ...prev,
      heroImagesDark: prev.heroImagesDark?.filter((_, i) => i !== index),
    }));
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-[#FF274B] space-y-3">
        <Spinner size="lg" className="border-[#FF274B] border-t-transparent" />
        <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">جاري تحميل لوحة الإعدادات...</p>
      </div>
    );
  }

  const tabs = [
    { id: "payments", label: "وسائل الدفع والتفعيل", icon: CreditCard },
    { id: "gomla", label: "قسم ومبيعات الجملة 📦", icon: Package },
    { id: "telegram", label: "إشعارات تليجرام 📲", icon: Send },
    { id: "security", label: "تغيير كلمة المرور 🔐", icon: Lock },
    { id: "sizeCharts", label: "جدول المقاسات العامة", icon: Ruler },
    { id: "announcement", label: "شريط الإعلانات", icon: Megaphone },
    { id: "brand", label: "لوجو الهوية والنصوص", icon: Type },
    { id: "hero", label: "وسائط وصور الهيرو", icon: Sparkles },
    { id: "contact", label: "التواصل والسوشيال ميديا", icon: Phone },
    { id: "about", label: "صفحة من نحن", icon: Info },
    { id: "legal", label: "الشروط والخصوصية", icon: Shield },
    { id: "chatAnalytics", label: "تحليلات الشات بوت", icon: Bot },
  ];

  const handleTabChange = (tabId: SettingsTab) => {
    setActiveTab(tabId);
    const newUrl = `/admin/settings?tab=${tabId}`;
    window.history.replaceState({ ...window.history.state, as: newUrl, url: newUrl }, "", newUrl);
  };

  return (
    <div className="space-y-8 w-full max-w-7xl mx-auto pb-16 font-sans dir-rtl text-zinc-900 dark:text-white" dir="rtl">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#FF274B] mb-1">
          <Sliders size={16} />
          مركز الإعدادات والتحكم الشامل (CMS)
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900 dark:text-white">
          إعدادات المتجر الهيكلية، الدفع، وجداول المقاسات
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 text-xs mt-1">
          تخصيص الهوية، الفيديوهات، جداول المقاسات العالمية، شريط التنبيهات، وتحليلات الشات بوت.
        </p>
      </div>

      {/* Separated Navigation Tabs Bar */}
      <div className="flex overflow-x-auto gap-2 bg-white dark:bg-[#0E0E10] p-2 rounded-2xl border border-zinc-200 dark:border-white/[0.06] shadow-sm scrollbar-none">
        {tabs.map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => handleTabChange(t.id as SettingsTab)}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all duration-150 cursor-pointer ${
                isActive
                  ? "bg-gradient-to-r from-[#FF274B] to-amber-500 text-white shadow-md shadow-[#FF274B]/20 scale-[1.02]"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900/60"
              }`}
            >
              <Icon size={16} className={isActive ? "text-white" : "text-[#FF274B]"} />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* TAB 1: GLOBAL SIZE CHARTS CMS */}
        {activeTab === "sizeCharts" && (
          <div className="bg-white dark:bg-[#0E0E10] rounded-3xl border border-zinc-200 dark:border-white/[0.06] p-6 sm:p-8 shadow-sm dark:shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-white/[0.06] pb-4">
              <div className="flex items-center gap-2">
                <Ruler size={20} className="text-[#FF274B]" />
                <h2 className="font-black text-base text-[#FF274B]">
                  إدارة ورَفْع جداول المقاسات العامة للمنتجات
                </h2>
              </div>
              <span className="text-xs font-bold bg-[#FF274B]/10 text-[#FF274B] border border-[#FF274B]/20 px-3 py-1 rounded-full">
                جداول مخصصة
              </span>
            </div>

            {/* Add New Size Chart Box */}
            <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/[0.06] space-y-4">
              <h3 className="text-xs font-bold text-zinc-900 dark:text-white">إضافة جدول مقاسات عام جديد</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">اسم جدول المقاسات</label>
                  <input
                    type="text"
                    placeholder="مثال: جدول مقاسات التيشيرتات والأوفرسايز"
                    value={newSizeChartName}
                    onChange={(e) => setNewSizeChartName(e.target.value)}
                    className="w-full px-4 py-3 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-white/[0.08] rounded-xl text-xs text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-[#FF274B] font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">صورة جدول المقاسات</label>
                  <ImageUploader
                    id="new-size-chart-uploader"
                    multiple={false}
                    images={newSizeChartImage ? [newSizeChartImage] : []}
                    onChange={(newImgs) => setNewSizeChartImage(newImgs[0] || "")}
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={addSizeChart}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#FF274B] hover:bg-[#FF274B]/90 text-white font-extrabold text-xs rounded-xl transition-all shadow-md cursor-pointer"
              >
                <Plus size={16} />
                حفظ جدول المقاسات للقائمة
              </button>
            </div>

            {/* Uploaded Size Charts Grid */}
            <div className="pt-4 border-t border-zinc-200 dark:border-white/[0.06] space-y-3">
              <h3 className="text-xs font-bold text-zinc-700 dark:text-zinc-300">جداول المقاسات المتاحة حالياً بالمتجر:</h3>
              {(!settings.sizeCharts || settings.sizeCharts.length === 0) ? (
                <p className="text-xs text-zinc-500 py-4">لم يتم إضافة جداول مقاسات عامة بعد.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {settings.sizeCharts.map((item) => (
                    <div key={item.id} className="relative bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.06] rounded-2xl p-4 space-y-3 group">
                      <div className="aspect-video w-full rounded-xl overflow-hidden bg-white dark:bg-black border border-zinc-200 dark:border-white/[0.08]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-contain p-1" />
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-zinc-900 dark:text-white truncate">{item.name}</p>
                        <button
                          type="button"
                          onClick={() => removeSizeChart(item.id)}
                          className="p-1.5 text-zinc-400 hover:text-red-500 transition-colors cursor-pointer"
                          title="حذف هذا الجدول"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: BRAND COPY & LOGO */}
        {activeTab === "brand" && (
          <div className="bg-white dark:bg-[#0E0E10] rounded-3xl border border-zinc-200 dark:border-white/[0.06] p-6 sm:p-8 shadow-sm dark:shadow-2xl space-y-6">
            <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-white/[0.06] pb-4">
              <Type size={18} className="text-[#FF274B]" />
              <h2 className="font-black text-sm text-[#FF274B] uppercase tracking-wider">
                شعار المتجر ونصوص الهوية (Store Logo & Brand Copy)
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">اسم المتجر الرسمي</label>
                <input
                  type="text"
                  value={settings.storeName ?? ""}
                  placeholder="DEEB STORE"
                  onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                  className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-white/[0.08] rounded-xl text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-[#FF274B] font-bold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">الشعار الرئيسي (Hero Tagline)</label>
                <input
                  type="text"
                  value={settings.heroTagline ?? ""}
                  placeholder="ديب ستور — عالم الموضة والستريت وير الفاخر 🐺"
                  onChange={(e) => setSettings({ ...settings, heroTagline: e.target.value })}
                  className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-white/[0.08] rounded-xl text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-[#FF274B] font-bold"
                />
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300">لوجو المتجر الرسمي (Logo Upload)</label>
              <ImageUploader
                id="brand-logo-uploader"
                multiple={false}
                images={settings.logoUrl ? [settings.logoUrl] : []}
                onChange={(newImgs) => setSettings((prev) => ({ ...prev, logoUrl: newImgs[0] || "" }))}
              />
            </div>
          </div>
        )}

        {/* TAB: GOMLA WHOLESALE */}
        {activeTab === "gomla" && (
          <div className="bg-white dark:bg-[#0E0E10] rounded-3xl border border-zinc-200 dark:border-white/[0.06] p-6 sm:p-8 shadow-sm dark:shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-white/[0.06] pb-4">
              <div className="flex items-center gap-2">
                <Package size={20} className="text-[#FF274B]" />
                <h2 className="font-black text-base text-zinc-900 dark:text-white">
                  إعدادات مبيعات الجملة ورقم الواتساب الخاص للتجار
                </h2>
              </div>
              <a
                href="/admin/gomla"
                className="text-xs font-bold bg-[#FF274B]/10 text-[#FF274B] border border-[#FF274B]/20 px-3 py-1 rounded-full hover:bg-[#FF274B] hover:text-white transition-all"
              >
                انتقال لإدارة منتجات الجملة ←
              </a>
            </div>

            <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/[0.06] flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  تفعيل قسم الجملة بالموقع
                  {settings.gomlaEnabled ? (
                    <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full font-bold">مُفعل حالياً</span>
                  ) : (
                    <span className="text-[10px] bg-red-500/10 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-full font-bold">معطل حالياً</span>
                  )}
                </h3>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
                  إظهار خيار قسم الجملة في الهيدر والماوس والـ Footer لزوار المتجر.
                </p>
              </div>
              <ToggleSwitch
                checked={!!settings.gomlaEnabled}
                onChange={(val) => setSettings({ ...settings, gomlaEnabled: val })}
                size="md"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                رقم واتساب المبيعات المخصص لطلبات الجملة
              </label>
              <input
                type="text"
                value={settings.gomlaWhatsappNumber ?? ""}
                placeholder="201012345678"
                onChange={(e) => setSettings({ ...settings, gomlaWhatsappNumber: e.target.value })}
                className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.08] rounded-xl text-xs text-zinc-900 dark:text-white font-mono font-bold focus:outline-none focus:border-[#FF274B]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                النص الترحيبي لصفحة الجملة
              </label>
              <input
                type="text"
                value={settings.gomlaIntroText ?? ""}
                placeholder="قسم مبيعات الجملة والكميات — أسعار خاصة بالتجار والمحلات 📦⚡"
                onChange={(e) => setSettings({ ...settings, gomlaIntroText: e.target.value })}
                className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.08] rounded-xl text-xs text-zinc-900 dark:text-white font-bold focus:outline-none focus:border-[#FF274B]"
              />
            </div>
          </div>
        )}
        {activeTab === "payments" && (
          <div className="bg-white dark:bg-[#0E0E10] rounded-3xl border border-zinc-200 dark:border-white/[0.06] p-6 sm:p-8 shadow-sm dark:shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-white/[0.06] pb-4">
              <div className="flex items-center gap-2">
                <CreditCard size={20} className="text-[#FF274B]" />
                <h2 className="font-black text-base text-zinc-900 dark:text-white">
                  لوحة التحكم في تفعيل وسائل الدفع الإلكتروني والدفع عند الاستلام
                </h2>
              </div>
              <span className="text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full">
                تحكم فوري مباشر
              </span>
            </div>

            {/* Master Online Payment Toggle */}
            <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/[0.06] flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  تفعيل خيار الدفع أونلاين بالكامل (Online Payment Master)
                  {settings.onlinePaymentEnabled ? (
                    <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full font-bold">مُفعل حالياً</span>
                  ) : (
                    <span className="text-[10px] bg-red-500/10 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-full font-bold">معطل حالياً</span>
                  )}
                </h3>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
                  عند إيقاف هذا الخيار، سيتم تعطيل خيارات التحويل الإلكتروني بالكامل في صفحة إيفاء الطلب، وسيجعل الدفع عند الاستلام فقط.
                </p>
              </div>
              <ToggleSwitch
                checked={!!settings.onlinePaymentEnabled}
                onChange={(val) => setSettings({ ...settings, onlinePaymentEnabled: val })}
                size="md"
              />
            </div>

            {/* Individual Sub Payment Methods */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              {/* Vodafone Cash */}
              <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/[0.06] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-[#FF274B]">فودافون كاش (Vodafone Cash)</span>
                  <ToggleSwitch
                    checked={!!settings.vodafoneCashEnabled}
                    onChange={(val) => setSettings({ ...settings, vodafoneCashEnabled: val })}
                    size="sm"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 mb-1">رقم محفظة فودافون كاش</label>
                  <input
                    type="text"
                    value={settings.vodafoneCash ?? ""}
                    placeholder="01012345678"
                    onChange={(e) => setSettings({ ...settings, vodafoneCash: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-white/[0.08] rounded-xl text-xs text-zinc-900 dark:text-white focus:border-[#FF274B] focus:outline-none font-bold"
                  />
                </div>
              </div>

              {/* InstaPay */}
              <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/[0.06] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-[#FF274B]">انستاباي (InstaPay)</span>
                  <ToggleSwitch
                    checked={!!settings.instapayEnabled}
                    onChange={(val) => setSettings({ ...settings, instapayEnabled: val })}
                    size="sm"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 mb-1">معرف انستاباي IPA</label>
                  <input
                    type="text"
                    value={settings.instapayUsername ?? ""}
                    placeholder="@deepstore"
                    onChange={(e) => setSettings({ ...settings, instapayUsername: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-white/[0.08] rounded-xl text-xs text-zinc-900 dark:text-white focus:border-[#FF274B] focus:outline-none font-bold"
                  />
                </div>
              </div>

              {/* Cash on Delivery */}
              <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/[0.06] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-[#FF274B]">الدفع عند الاستلام (COD)</span>
                  <ToggleSwitch
                    checked={!!settings.codEnabled}
                    onChange={(val) => setSettings({ ...settings, codEnabled: val })}
                    size="sm"
                  />
                </div>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed pt-2 font-medium">
                  تمكين العملاء من دفع قيمة الطلب نقداً للمندوب عند استلام الشحنة.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB: TELEGRAM BOT NOTIFICATIONS */}
        {activeTab === "telegram" && (
          <div className="bg-white dark:bg-[#0E0E10] rounded-3xl border border-zinc-200 dark:border-white/[0.06] p-6 sm:p-8 shadow-sm dark:shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-white/[0.06] pb-4">
              <div className="flex items-center gap-2">
                <Send size={20} className="text-[#FF274B]" />
                <h2 className="font-black text-base text-zinc-900 dark:text-white">
                  لوحة التحكم في إشعارات تليجرام المباشرة للطلبات (Telegram Bot)
                </h2>
              </div>
              <span className="text-xs font-bold bg-[#FF274B]/10 text-[#FF274B] border border-[#FF274B]/20 px-3 py-1 rounded-full">
                إشعارات تليجرام الفورية
              </span>
            </div>

            {/* Master Enable Toggle */}
            <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/[0.06] flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  تفعيل إشعارات تليجرام للطلبات الجديدة
                  {settings.telegramEnabled ? (
                    <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full font-bold">مُفعل حالياً</span>
                  ) : (
                    <span className="text-[10px] bg-red-500/10 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-full font-bold">معطل حالياً</span>
                  )}
                </h3>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 font-medium">
                  عند التفعيل، سيصلك إشعار فوري كامل بكل الطلبات الجديدة مع كافة التفاصيل وأكواد المنتجات (SKU) مباشرة على تليجرام.
                </p>
              </div>
              <ToggleSwitch
                checked={!!settings.telegramEnabled}
                onChange={(val) => setSettings({ ...settings, telegramEnabled: val })}
                size="md"
              />
            </div>

            {/* Bot Token */}
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Telegram Bot Token *
              </label>
              <input
                type="text"
                placeholder="مثال: 7123456789:AAFxXxXxXxXxXxXxXxXxXxXxXxX"
                value={settings.telegramBotToken || ""}
                onChange={(e) => setSettings({ ...settings, telegramBotToken: e.target.value })}
                className="w-full px-4 py-3 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-white/[0.08] rounded-xl text-xs text-zinc-900 dark:text-white font-mono placeholder-zinc-400 focus:outline-none focus:border-[#FF274B] font-bold"
              />
            </div>

            {/* Multi-User Authorized Telegram IDs Manager */}
            <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/[0.06] space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  <UserCheck size={16} className="text-[#FF274B]" />
                  قائمة الأشخاص المصرح لهم باستلام الإشعارات على تليجرام
                </h3>
                <span className="text-[10px] font-bold bg-[#FF274B]/10 text-[#FF274B] border border-[#FF274B]/20 px-2.5 py-0.5 rounded-full font-mono">
                  {(settings.telegramChatId || "").split(/[\s,;]+/).filter(Boolean).length} حسابات مصرح لها
                </span>
              </div>

              {/* Add New Authorized ID Input Box */}
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <input
                  type="text"
                  placeholder="أدخل رقم الـ Chat ID الجديد (مثال: 7854847724)"
                  value={newAuthorizedId}
                  onChange={(e) => setNewAuthorizedId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-white/[0.08] rounded-xl text-xs text-zinc-900 dark:text-white font-mono placeholder-zinc-400 focus:outline-none focus:border-[#FF274B] font-bold"
                />
                <button
                  type="button"
                  onClick={addAuthorizedId}
                  className="w-full sm:w-auto px-5 py-2.5 bg-[#FF274B] hover:bg-[#FF274B]/90 text-white font-extrabold text-xs rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap"
                >
                  <UserPlus size={15} />
                  <span>إضافة شخص جديد</span>
                </button>
              </div>

              {/* List of Authorized IDs Badges */}
              <div className="pt-2 border-t border-zinc-200 dark:border-white/[0.06]">
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mb-2.5 font-bold">الحسابات المضافة المصرح لها بحرية الرؤية حالياً:</p>
                {!(settings.telegramChatId || "").split(/[\s,;]+/).filter(Boolean).length ? (
                  <p className="text-xs text-zinc-400 italic py-2 font-bold">لم يتم إضافة أي Chat ID بعد.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {(settings.telegramChatId || "")
                      .split(/[\s,;]+/)
                      .filter(Boolean)
                      .map((id) => (
                        <div
                          key={id}
                          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-white/[0.08] text-xs font-bold font-mono text-zinc-800 dark:text-zinc-200 shadow-sm hover:border-[#FF274B]/40 transition-colors"
                        >
                          <UserCheck size={14} className="text-emerald-500" />
                          <span>{id}</span>
                          <button
                            type="button"
                            onClick={() => removeAuthorizedId(id)}
                            className="p-1 text-zinc-400 hover:text-red-500 transition-colors cursor-pointer mr-1"
                            title="حذف هذا الشخص من الإشعارات"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>

            {/* Test Button */}
            <div className="pt-2 flex items-center justify-between border-t border-zinc-200 dark:border-white/[0.06]">
              <p className="text-xs text-zinc-500 font-medium">اضغط للاختبار للتأكد من وصول رسائل تليجرام بنجاح:</p>
              <button
                type="button"
                onClick={handleTestTelegram}
                disabled={testingTelegram}
                className="flex items-center gap-2 px-6 py-2.5 bg-[#FF274B] hover:bg-[#FF274B]/90 text-white font-extrabold text-xs rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                <Send size={15} />
                <span>{testingTelegram ? "جاري الاختبار..." : "إرسال إشعار تجريبي الآن 📲"}</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB: SECURITY & CHANGE PASSWORD */}
        {activeTab === "security" && (
          <div className="bg-white dark:bg-[#0E0E10] rounded-3xl border border-zinc-200 dark:border-white/[0.06] p-6 sm:p-8 shadow-sm dark:shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-white/[0.06] pb-4">
              <div className="flex items-center gap-2">
                <Lock size={20} className="text-[#FF274B]" />
                <h2 className="font-black text-base text-zinc-900 dark:text-white">
                  تغيير كلمة مرور الأدمن وإعدادات الأمان 🔐
                </h2>
              </div>
              <span className="text-xs font-bold bg-[#FF274B]/10 text-[#FF274B] border border-[#FF274B]/20 px-3 py-1 rounded-full">
                حماية الحساب
              </span>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-6 max-w-xl">
              <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/[0.06] space-y-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5 flex items-center gap-1.5">
                    <KeyRound size={15} className="text-[#FF274B]" />
                    كلمة المرور الحالية *
                  </label>
                  <input
                    type="password"
                    placeholder="أدخل كلمة المرور الحالية للتأكيد الأمني"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-white/[0.08] rounded-xl text-xs text-zinc-900 dark:text-white font-mono placeholder-zinc-400 focus:outline-none focus:border-[#FF274B] font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5 flex items-center gap-1.5">
                    <KeyRound size={15} className="text-[#FF274B]" />
                    كلمة المرور الجديدة *
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-white/[0.08] rounded-xl text-xs text-zinc-900 dark:text-white font-mono placeholder-zinc-400 focus:outline-none focus:border-[#FF274B] font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5 flex items-center gap-1.5">
                    <KeyRound size={15} className="text-[#FF274B]" />
                    تأكيد كلمة المرور الجديدة *
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-white/[0.08] rounded-xl text-xs text-zinc-900 dark:text-white font-mono placeholder-zinc-400 focus:outline-none focus:border-[#FF274B] font-bold"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleChangePassword}
                  disabled={changingPassword}
                  className="w-full py-3.5 bg-gradient-to-r from-[#FF274B] to-amber-500 text-white font-black text-xs rounded-xl hover:scale-[1.01] active:scale-[0.99] transition-all shadow-md cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Lock size={15} />
                  <span>{changingPassword ? "جاري التحديث..." : "حفظ وتحديث كلمة المرور الآن 🔐"}</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 4: HERO BANNERS & MEDIA */}
        {activeTab === "hero" && (
          <div className="bg-white dark:bg-[#0E0E10] rounded-3xl border border-zinc-200 dark:border-white/[0.06] p-6 sm:p-8 shadow-sm dark:shadow-2xl space-y-6">
            <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-white/[0.06] pb-4">
              <Sparkles size={18} className="text-[#FF274B]" />
              <h2 className="font-black text-sm text-[#FF274B] uppercase tracking-wider">
                وسائط وصور الهيرو والواجهة الرئيسية
              </h2>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-2">
                نوع وسائط واجهة الهيرو
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSettings({ ...settings, heroMediaType: "image" })}
                  className={`flex items-center justify-center gap-2 p-3.5 rounded-xl border text-xs font-bold transition-all ${
                    settings.heroMediaType === "image"
                      ? "bg-[#FF274B] text-white border-[#FF274B] font-black shadow-lg shadow-[#FF274B]/20"
                      : "bg-zinc-50 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:text-white"
                  }`}
                >
                  <ImageIcon size={16} />
                  عرض الصور والبانرات (Image Banners)
                </button>
                <button
                  type="button"
                  onClick={() => setSettings({ ...settings, heroMediaType: "video" })}
                  className={`flex items-center justify-center gap-2 p-3.5 rounded-xl border text-xs font-bold transition-all ${
                    settings.heroMediaType === "video"
                      ? "bg-[#FF274B] text-white border-[#FF274B] font-black shadow-lg shadow-[#FF274B]/20"
                      : "bg-zinc-50 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:text-white"
                  }`}
                >
                  <Video size={16} />
                  عرض الفيديو السينمائي (.mp4)
                </button>
              </div>
            </div>

            <div className="space-y-6 pt-4 border-t border-zinc-200 dark:border-white/[0.06]">
              {/* Video File Uploader */}
              <div className="space-y-3 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/[0.06]">
                <label className="block text-xs font-bold text-[#FF274B] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Video size={14} /> رفع وتعديل فيديو الهيرو السينمائي (Video Uploader)
                </label>
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium">
                  قم برفع فيديو (.mp4 / .webm) مباشرة من جهازك وسيتم رفعه وتغذيته تلقائياً بالصفحة الرئيسية.
                </p>

                {/* Video Preview */}
                {settings.heroVideoUrlDark && (
                  <div className="relative aspect-video w-full max-w-md rounded-xl overflow-hidden bg-black border border-zinc-200 dark:border-white/[0.08] my-2">
                    <video
                      src={settings.heroVideoUrlDark}
                      controls
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                  <label className="px-5 py-3 bg-[#FF274B] text-white font-extrabold text-xs rounded-xl hover:scale-[1.02] transition-all cursor-pointer inline-flex items-center gap-2 shadow-md">
                    {uploadingVideo ? (
                      <>
                        <Spinner size="sm" className="border-white border-t-transparent" />
                        <span>جاري رفع الفيديو...</span>
                      </>
                    ) : (
                      <>
                        <Video size={16} />
                        <span>رفع فيديو جديد من الجهاز 🎬</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="video/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setUploadingVideo(true);
                        const loadingToast = toast.loading("جاري رفع ملف الفيديو إلى Cloudinary...");
                        try {
                          const url = await uploadVideoToCloudinary(file);
                          setSettings((prev) => ({
                            ...prev,
                            heroMediaType: "video",
                            heroVideoUrlDark: url,
                            heroVideoUrlLight: url,
                          }));
                          toast.success("تم رفع الفيديو وتفعيله للواجهة بنجاح 🐺", { id: loadingToast });
                        } catch (err) {
                          console.error(err);
                          toast.error("فشل رفع الفيديو، يرجى تجربة ملف آخر", { id: loadingToast });
                        } finally {
                          setUploadingVideo(false);
                        }
                      }}
                      disabled={uploadingVideo}
                      className="hidden"
                    />
                  </label>

                  <div className="flex-1 w-full">
                    <input
                      type="text"
                      placeholder="أو أدخل رابط الفيديو يدويًا..."
                      value={settings.heroVideoUrlDark || ""}
                      onChange={(e) => setSettings({ ...settings, heroMediaType: "video", heroVideoUrlDark: e.target.value, heroVideoUrlLight: e.target.value })}
                      className="w-full px-4 py-2.5 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-white/[0.08] rounded-xl text-xs text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-[#FF274B] font-mono font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Mobile Hero Image Banner */}
              <div className="space-y-3 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/[0.06]">
                <label className="block text-xs font-bold text-[#FF274B] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <ImageIcon size={14} /> صورة بانر الموبايل (تظهر أسفل الفيديو في شاشات الموبايل 📱)
                </label>
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mb-2 font-medium">
                  صورة موديلز/منتجات تعليقيه تظهر تحت فيديو العرض في الموبايل تماماً كما في الصورة المرفقة.
                </p>
                <ImageUploader
                  id="hero-mobile-image-uploader"
                  multiple={false}
                  images={settings.heroMobileImageUrl ? [settings.heroMobileImageUrl] : []}
                  onChange={(newImgs) => setSettings((prev) => ({ ...prev, heroMobileImageUrl: newImgs[0] || "" }))}
                />
              </div>

              {/* Dark Mode Banners */}
              <div className="space-y-3 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/[0.06]">
                <label className="block text-xs font-bold text-[#FF274B] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Moon size={14} /> صور بانرات الهيرو (الوضع الليلي / Dark Mode 🌙)
                </label>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                  {settings.heroImagesDark?.map((img, i) => (
                    <div key={i} className="relative aspect-video rounded-xl overflow-hidden border border-zinc-200 dark:border-white/[0.08] group bg-white dark:bg-zinc-950">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img} alt={`Dark Banner ${i + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImageDark(i)}
                        className="absolute top-1.5 right-1.5 p-1.5 bg-red-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        title="حذف الصورة"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>

                <ImageUploader
                  id="hero-images-dark-uploader"
                  multiple={true}
                  images={settings.heroImagesDark || []}
                  onChange={(newImgs) => setSettings((prev) => ({ ...prev, heroImagesDark: newImgs }))}
                />
              </div>

              {/* Light Mode Banners */}
              <div className="space-y-3 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/[0.06]">
                <label className="block text-xs font-bold text-[#FF274B] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Sun size={14} /> صور بانرات الهيرو (الوضع المضيء / Light Mode ☀️)
                </label>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                  {settings.heroImagesLight?.map((img, i) => (
                    <div key={i} className="relative aspect-video rounded-xl overflow-hidden border border-zinc-200 dark:border-white/[0.08] group bg-white dark:bg-zinc-950">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img} alt={`Light Banner ${i + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => {
                          setSettings((prev) => ({
                            ...prev,
                            heroImagesLight: prev.heroImagesLight?.filter((_, idx) => idx !== i),
                          }));
                        }}
                        className="absolute top-1.5 right-1.5 p-1.5 bg-red-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        title="حذف الصورة"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>

                <ImageUploader
                  id="hero-images-light-uploader"
                  multiple={true}
                  images={settings.heroImagesLight || []}
                  onChange={(newImgs) => setSettings((prev) => ({ ...prev, heroImagesLight: newImgs }))}
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: CONTACT & SOCIALS */}
        {activeTab === "contact" && (
          <div className="bg-white dark:bg-[#0E0E10] rounded-3xl border border-zinc-200 dark:border-white/[0.06] p-6 sm:p-8 shadow-sm dark:shadow-2xl space-y-6">
            <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-white/[0.06] pb-4">
              <Phone size={18} className="text-[#FF274B]" />
              <h2 className="font-black text-sm text-[#FF274B] uppercase tracking-wider">
                معلومات التواصل وحسابات السوشيال ميديا
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">البريد الإلكتروني للشكاوى والدعم</label>
                <input
                  type="email"
                  value={settings.storeEmail ?? ""}
                  placeholder="storedeeb2020@gmail.com"
                  onChange={(e) => setSettings({ ...settings, storeEmail: e.target.value })}
                  className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-white/[0.08] rounded-xl text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-[#FF274B] font-bold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">رقم تليفون المبيعات والدعم</label>
                <input
                  type="text"
                  value={settings.storePhone ?? ""}
                  placeholder="+20 101 234 5678"
                  onChange={(e) => setSettings({ ...settings, storePhone: e.target.value })}
                  className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-white/[0.08] rounded-xl text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-[#FF274B] font-bold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">رابط حساب انستجرام Instagram</label>
                <input
                  type="url"
                  value={settings.instagramUrl ?? ""}
                  onChange={(e) => setSettings({ ...settings, instagramUrl: e.target.value })}
                  className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-white/[0.08] rounded-xl text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-[#FF274B] font-bold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">رابط فيسبوك Facebook</label>
                <input
                  type="url"
                  value={settings.facebookUrl ?? ""}
                  onChange={(e) => setSettings({ ...settings, facebookUrl: e.target.value })}
                  className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-white/[0.08] rounded-xl text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-[#FF274B] font-bold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">رابط تيك توك TikTok</label>
                <input
                  type="url"
                  value={settings.tiktokUrl ?? ""}
                  onChange={(e) => setSettings({ ...settings, tiktokUrl: e.target.value })}
                  className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-white/[0.08] rounded-xl text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-[#FF274B] font-bold"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: ABOUT US PAGE */}
        {activeTab === "about" && (
          <div className="bg-white dark:bg-[#0E0E10] rounded-3xl border border-zinc-200 dark:border-white/[0.06] p-6 sm:p-8 shadow-sm dark:shadow-2xl space-y-6">
            <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-white/[0.06] pb-4">
              <Info size={18} className="text-[#FF274B]" />
              <h2 className="font-black text-sm text-[#FF274B] uppercase tracking-wider">
                محتوى صفحة عن المتجر (About Us CMS)
              </h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">العنوان الرئيسي للصفحة</label>
                <input
                  type="text"
                  value={settings.aboutTitle ?? ""}
                  placeholder="عن ديب ستور — About DEEB STORE"
                  onChange={(e) => setSettings({ ...settings, aboutTitle: e.target.value })}
                  className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-white/[0.08] rounded-xl text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-[#FF274B] font-bold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">الوصف الفرعي للصفحة</label>
                <textarea
                  rows={3}
                  value={settings.aboutSubtitle || ""}
                  onChange={(e) => setSettings({ ...settings, aboutSubtitle: e.target.value })}
                  className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-white/[0.08] rounded-xl text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-[#FF274B] resize-none font-bold"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: LEGAL & PRIVACY POLICY */}
        {activeTab === "legal" && (
          <div className="bg-white dark:bg-[#0E0E10] rounded-3xl border border-zinc-200 dark:border-white/[0.06] p-6 sm:p-8 shadow-sm dark:shadow-2xl space-y-6">
            <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-white/[0.06] pb-4">
              <Shield size={18} className="text-[#FF274B]" />
              <h2 className="font-black text-sm text-[#FF274B] uppercase tracking-wider">
                نصوص الشروط والأحكام وسياسة الخصوصية باللغة العربية
              </h2>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">سياسة الخصوصية (Privacy Policy)</label>
              <textarea
                rows={6}
                value={settings.privacyPolicyText || ""}
                onChange={(e) => setSettings({ ...settings, privacyPolicyText: e.target.value })}
                className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-white/[0.08] rounded-xl text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-[#FF274B] font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">الشروط والأحكام (Terms of Service)</label>
              <textarea
                rows={6}
                value={settings.termsOfServiceText || ""}
                onChange={(e) => setSettings({ ...settings, termsOfServiceText: e.target.value })}
                className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-white/[0.08] rounded-xl text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-[#FF274B] font-bold"
              />
            </div>
          </div>
        )}

        {/* TAB 8: ANNOUNCEMENT BAR */}
        {activeTab === "announcement" && (
          <div className="bg-white dark:bg-[#0E0E10] rounded-3xl border border-zinc-200 dark:border-white/[0.06] p-6 sm:p-8 shadow-sm dark:shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-white/[0.06] pb-4">
              <div className="flex items-center gap-2">
                <Megaphone size={20} className="text-[#FF274B]" />
                <h2 className="font-black text-base text-zinc-900 dark:text-white">شريط الإعلانات المتحرك</h2>
              </div>
              <span className="text-xs font-bold bg-[#FF274B]/10 text-[#FF274B] border border-[#FF274B]/20 px-3 py-1 rounded-full">
                يظهر فوق الهيدر
              </span>
            </div>

            {/* Enable toggle */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/[0.06]">
              <div>
                <p className="text-xs font-bold text-zinc-900 dark:text-white">تفعيل شريط الإعلانات</p>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 font-medium">يظهر الشريط فوق الهيدر مع نص الإعلان</p>
              </div>
              <ToggleSwitch
                checked={settings.announcementEnabled ?? false}
                onChange={(v) => setSettings({ ...settings, announcementEnabled: v })}
              />
            </div>

            {/* Announcement text */}
            <div className="space-y-2">
              <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300">نص الإعلان</label>
              <input
                type="text"
                placeholder="مثال: 🔥 شحن مجاني على جميع الطلبات فوق 500 جنيه!"
                value={settings.announcementText || ""}
                onChange={(e) => setSettings({ ...settings, announcementText: e.target.value })}
                className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-white/[0.08] rounded-xl text-xs text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-[#FF274B] font-bold"
              />
            </div>

            {/* Background color */}
            <div className="space-y-2">
              <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300">لون خلفية الشريط</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={settings.announcementColor || "#F59E0B"}
                  onChange={(e) => setSettings({ ...settings, announcementColor: e.target.value })}
                  className="w-12 h-10 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-transparent cursor-pointer"
                />
                <span className="text-xs text-zinc-500 font-mono font-bold">{settings.announcementColor || "#F59E0B"}</span>
                {/* Quick presets */}
                <div className="flex gap-2">
                  {["#F59E0B", "#EF4444", "#10B981", "#3B82F6", "#8B5CF6"].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setSettings({ ...settings, announcementColor: c })}
                      className="w-6 h-6 rounded-full border-2 border-zinc-200 dark:border-zinc-700 hover:scale-110 transition-transform cursor-pointer"
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Optional link */}
            <div className="space-y-2">
              <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300">رابط اختياري (اضغط على الإعلان)</label>
              <input
                type="text"
                placeholder="مثال: /#products أو رابط خارجي"
                value={settings.announcementLink || ""}
                onChange={(e) => setSettings({ ...settings, announcementLink: e.target.value })}
                className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-white/[0.08] rounded-xl text-xs text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-[#FF274B] font-bold"
              />
            </div>

            {/* WhatsApp number */}
            <div className="space-y-2">
              <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300">رقم واتساب الطلبات (بدون + مثال: 201012345678)</label>
              <input
                type="text"
                placeholder="201012345678"
                value={settings.whatsappNumber || ""}
                onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })}
                className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-white/[0.08] rounded-xl text-xs text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-[#FF274B] font-mono font-bold"
              />
              <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium">سيُستخدم في زر &quot;اطلب عبر واتساب&quot; في صفحة كل منتج</p>
            </div>

            {/* Automatic Free Shipping Calculation Controls */}
            <div className="p-5 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-black text-amber-600 dark:text-amber-400 flex items-center gap-2">
                    <Sparkles size={16} />
                    نظام خصم الشحن المجاني التلقائي (Free Shipping Discount Engine)
                  </h3>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 font-medium">
                    عند التفعيل، سيتم تطبيق الشحن المجاني (0 ج.م) تلقائياً في الشيك أوت لكل الطلبات التي تتجاوز القيمة المحددة.
                  </p>
                </div>
                <ToggleSwitch
                  checked={settings.freeShippingEnabled ?? true}
                  onChange={(v) => setSettings({ ...settings, freeShippingEnabled: v })}
                />
              </div>

              {settings.freeShippingEnabled && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-amber-500/20">
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                      الحد الأدنى لمبلغ الطلب للحصول على الشحن المجاني (بالجنيه EGP) *
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        placeholder="500"
                        value={settings.freeShippingThreshold ?? 500}
                        onChange={(e) =>
                          setSettings({ ...settings, freeShippingThreshold: parseFloat(e.target.value) || 0 })
                        }
                        className="w-full px-4 py-2.5 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-white/[0.08] rounded-xl text-xs text-zinc-900 dark:text-white font-mono font-bold focus:outline-none focus:border-[#FF274B]"
                      />
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400">ج.م</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                    <span>🎉 سيتم خصم مصاريف الشحن بالكامل تلقائياً عندما يتجاوز مجموع منتجات السلة ({settings.freeShippingThreshold ?? 500} ج.م)!</span>
                  </div>
                </div>
              )}
            </div>

            {/* Live preview */}
            {settings.announcementText && (
              <div className="space-y-2">
                <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300">معاينة حية لشريط الإعلانات:</label>
                <div
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black text-black"
                  style={{ backgroundColor: settings.announcementColor || "#F59E0B" }}
                >
                  <Megaphone size={12} />
                  <span>{settings.announcementText}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 9: CHATBOT ANALYTICS */}
        {activeTab === "chatAnalytics" && (
          <div className="bg-white dark:bg-[#0E0E10] rounded-3xl border border-zinc-200 dark:border-white/[0.06] p-6 sm:p-8 shadow-sm dark:shadow-2xl space-y-6 text-zinc-900 dark:text-white text-right">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-white/[0.06] pb-4">
              <div className="flex items-center gap-2">
                <Bot size={20} className="text-[#FF274B]" />
                <h2 className="font-black text-base text-zinc-900 dark:text-white">
                  تحليلات وسجلات مساعد الموضة الذكي (ChatBot)
                </h2>
              </div>
              <span className="text-xs font-bold bg-[#FF274B]/10 text-[#FF274B] border border-[#FF274B]/20 px-3 py-1 rounded-full">
                تحليل مباشر لتفاعل العملاء
              </span>
            </div>

            {/* Quick Analytics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/[0.06]">
                <p className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">إجمالي جلسات الشات</p>
                <p className="text-2xl font-black text-[#FF274B] mt-1">{chatLogs.length}</p>
              </div>
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/[0.06]">
                <p className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">إجمالي الرسائل المرسلة</p>
                <p className="text-2xl font-black text-[#FF274B] mt-1">
                  {chatLogs.reduce((acc, curr) => acc + (curr.messages?.length || 0), 0)}
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/[0.06]">
                <p className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">متوسط طول المحادثة</p>
                <p className="text-2xl font-black text-[#FF274B] mt-1">
                  {chatLogs.length > 0
                    ? (chatLogs.reduce((acc, curr) => acc + (curr.messages?.length || 0), 0) / chatLogs.length).toFixed(1)
                    : 0}{" "}
                  رسالة
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-4">
              {/* Left Column: Chat List */}
              <div className="lg:col-span-5 space-y-3">
                <h3 className="text-xs font-black text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-2">أحدث المحادثات النشطة</h3>
                {loadingChats ? (
                  <div className="flex items-center justify-center py-12">
                    <Spinner size="md" className="border-[#FF274B]" />
                  </div>
                ) : chatLogs.length === 0 ? (
                  <div className="text-center py-12 bg-zinc-50 dark:bg-zinc-900/40 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-500 text-xs font-bold">
                    لا توجد سجلات محادثات بعد.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                    {chatLogs.map((log) => {
                      const msgCount = log.messages?.length || 0;
                      const isSelected = selectedChat?.id === log.id;
                      const dateString = log.updatedAt?.seconds
                        ? new Date(log.updatedAt.seconds * 1000).toLocaleString("ar-EG")
                        : "غير معروف";
                      return (
                        <div
                          key={log.id}
                          onClick={() => setSelectedChat(log)}
                          className={`p-3.5 rounded-2xl border transition-all cursor-pointer text-right flex flex-col justify-between gap-1.5 ${
                            isSelected
                              ? "bg-[#FF274B]/10 border-[#FF274B]/50"
                              : "bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 border-zinc-200 dark:border-white/[0.06]"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono font-bold text-zinc-500">{log.id.slice(-8)}</span>
                            <span className="text-[10px] font-bold text-[#FF274B] bg-[#FF274B]/10 px-2 py-0.5 rounded-full">
                              {msgCount} رسائل
                            </span>
                          </div>
                          <p className="text-xs text-zinc-900 dark:text-zinc-200 truncate font-semibold">
                            {log.firstMessage || log.messages?.[0]?.text || "بدون نص معاينة"}
                          </p>
                          <div className="flex items-center justify-between text-[9px] text-zinc-500 dark:text-zinc-400 mt-1 border-t border-zinc-200 dark:border-white/[0.06] pt-1.5">
                            <span>{dateString}</span>
                            <button
                              type="button"
                              onClick={(e) => handleDeleteChat(log.id, e)}
                              className="text-red-500 hover:text-red-600 transition-colors p-1 cursor-pointer"
                              title="حذف السجل"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Right Column: Chat Transcript Details */}
              <div className="lg:col-span-7">
                {selectedChat ? (
                  <div className="bg-zinc-50 dark:bg-zinc-900/60 rounded-2xl border border-zinc-200 dark:border-white/[0.06] p-4 flex flex-col h-[420px]">
                    <div className="flex items-center justify-between border-b border-zinc-200 dark:border-white/[0.06] pb-3 mb-3">
                      <div>
                        <h4 className="text-xs font-black text-[#FF274B] uppercase">تفاصيل الجلسة: {selectedChat.id.slice(-8)}</h4>
                        <p className="text-[9px] text-zinc-500 dark:text-zinc-400 mt-0.5">المتصفح: {selectedChat.deviceInfo?.split(" ")[0] || "غير معروف"}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedChat(null)}
                        className="text-xs font-bold text-zinc-500 hover:text-zinc-900 dark:hover:text-white cursor-pointer"
                      >
                        إغلاق العرض
                      </button>
                    </div>
                    {/* Transcript flow */}
                    <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-right flex flex-col">
                      {selectedChat.messages?.map((msg: any, idx: number) => (
                        <div
                          key={idx}
                          className={`flex flex-col max-w-[85%] rounded-xl p-2.5 text-xs font-bold ${
                            msg.sender === "user"
                              ? "bg-[#FF274B]/10 border border-[#FF274B]/20 text-[#FF274B] self-start"
                              : "bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-200 border border-zinc-200 dark:border-white/[0.06] self-end"
                          }`}
                        >
                          <span className="font-black text-[9px] text-zinc-500 mb-1">
                            {msg.sender === "user" ? "العميل" : "مساعد ملابس الديب"}
                          </span>
                          <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="bg-zinc-50 dark:bg-zinc-900/30 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 h-[420px] flex flex-col items-center justify-center text-center p-6">
                    <Bot size={40} className="text-[#FF274B] animate-pulse mb-3" />
                    <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300">اختر محادثة من القائمة لرؤية سجل الدردشة والتحليل الكامل هنا.</p>
                    <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1 max-w-xs leading-relaxed font-medium">
                      سجلات المحادثات توضح لك أسئلة العملاء، المقاسات التي يبحثون عنها، والمنتجات المقترحة لزيادة المبيعات.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Floating Save Button Bar */}
        {activeTab !== "chatAnalytics" && (
          <div className="sticky bottom-6 z-20 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-3 px-10 py-4 rounded-full bg-gradient-to-r from-[#FF274B] to-amber-500 text-white font-black text-sm tracking-wider uppercase shadow-2xl hover:scale-105 active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
            >
              <Save size={18} />
              <span>{saving ? "جاري حفظ الإعدادات..." : "حفظ التغييرات الآن 🐺"}</span>
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
