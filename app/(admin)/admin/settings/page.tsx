"use client";

import { useEffect, useState } from "react";
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
} from "lucide-react";
import { getSiteSettings, updateSiteSettings, type SiteSettings, type GlobalSizeChart } from "@/lib/firebase/firestore";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { Spinner } from "@/components/ui/Spinner";
import { ToggleSwitch } from "@/components/ui/ToggleSwitch";

type SettingsTab = "hero" | "brand" | "payments" | "sizeCharts" | "contact" | "about" | "legal";

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<SettingsTab>("payments");

  // New size chart creator state
  const [newSizeChartName, setNewSizeChartName] = useState("");
  const [newSizeChartImage, setNewSizeChartImage] = useState("");

  const [settings, setSettings] = useState<SiteSettings>({
    storeName: "DEEP STORE",
    logoUrl: "/logo.png",
    heroTagline: "ديب ستور — عالم الموضة والستريت وير الفاخر 👑",
    heroButtonText: "تسوق الآن — SHOP NOW",
    heroMediaType: "image",
    heroVideoUrlLight: "https://res.cloudinary.com/aqszlz7k/video/upload/12_zsnepl.mp4",
    heroVideoUrlDark: "https://res.cloudinary.com/aqszlz7k/video/upload/12_zsnepl.mp4",
    heroImagesLight: [],
    heroImagesDark: [],
    featuredTitle: "التشكيلات العصرية",
    featuredSubtitle: "مصممة بعناية لتناسب أسلوب حياتك",
    introTagline: "DEEP STORE ROYAL STREETWEAR 👑",
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
    aboutTitle: "عن ديب ستور — About DEEP STORE",
    aboutSubtitle: "نحدد أسلوب الأناقة العصرية من خلال الموضة الفاخرة وخامات الستريت وير الممتازة والتصاميم الاستثنائية.",
    aboutSection1Title: "الرقي والبساطة العصرية",
    aboutSection1Text: "في ديب ستور DEEP STORE، نؤمن بأن الأسلوب هو انعكاس للهوية. نصمم ملابس تبرز خطوط الأناقة وتعتمد على الخامات الفاخرة التي تدوم طويلاً وتمنحك التميز المطلق.",
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
استخدامك لمتجر ديب ستور DEEP STORE يعني موافقتك الكاملة على هذه الشروط والأحكام.

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
      toast.success("تم حفظ إعدادات المتجر وتحديث جداول المقاسات ولوجو المحل بنجاح 👑");
    } catch (err) {
      console.error(err);
      toast.error("فشل حفظ الإعدادات");
    } finally {
      setSaving(false);
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
    toast.success("تمت إضافة جدول المقاسات الجديد بالقائمة 👑");
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
      <div className="py-20 flex flex-col items-center justify-center text-amber-400 space-y-3">
        <Spinner size="lg" />
        <p className="text-xs text-amber-400 font-bold uppercase tracking-widest">جاري تحميل لوحة الإعدادات...</p>
      </div>
    );
  }

  const tabs = [
    { id: "payments", label: "وسائل الدفع والتفعيل", icon: CreditCard },
    { id: "sizeCharts", label: "جدول المقاسات العامة", icon: Ruler },
    { id: "brand", label: "لوجو الهوية والنصوص", icon: Type },
    { id: "hero", label: "وسائط وصور الهيرو", icon: Sparkles },
    { id: "contact", label: "التواصل والسوشيال ميديا", icon: Phone },
    { id: "about", label: "صفحة من نحن", icon: Info },
    { id: "legal", label: "الشروط والخصوصية", icon: Shield },
  ];

  return (
    <div className="space-y-8 max-w-5xl pb-16 font-sans dir-rtl text-white" dir="rtl">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400 mb-1">
          <Sliders size={14} />
          مركز التحكم وإعدادات المتجر المقسمة (CMS)
        </div>
        <h1 className="text-3xl font-black tracking-tight text-white">
          إعدادات المتجر، اللوجو، وجداول المقاسات
        </h1>
        <p className="text-zinc-400 text-xs mt-1">
          قم برفع وجدولة جداول المقاسات العامة، تغيير لوجو المتجر الرسمي، وتفعيل خيارات الدفع والبانرات.
        </p>
      </div>

      {/* Separated Navigation Tabs Bar */}
      <div className="flex overflow-x-auto gap-2 bg-zinc-950 p-2 rounded-2xl border border-zinc-800 scrollbar-none">
        {tabs.map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id as SettingsTab)}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? "bg-gradient-to-r from-amber-500 to-amber-400 text-black font-black shadow-lg shadow-amber-500/20"
                  : "bg-zinc-900/60 text-zinc-400 hover:bg-zinc-900 hover:text-white border border-zinc-800/80"
              }`}
            >
              <Icon size={16} className={isActive ? "text-black" : "text-amber-400"} />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* TAB 1: GLOBAL SIZE CHARTS CMS */}
        {activeTab === "sizeCharts" && (
          <div className="bg-zinc-950 rounded-2xl border border-zinc-800 p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div className="flex items-center gap-2">
                <Ruler size={20} className="text-amber-400" />
                <h2 className="font-black text-base text-amber-400">
                  إدارة ورَفْع جداول المقاسات العامة للمنتجات
                </h2>
              </div>
              <span className="text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 px-3 py-1 rounded-full">
                جداول مخصصة
              </span>
            </div>

            {/* Add New Size Chart Box */}
            <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
              <h3 className="text-xs font-bold text-white">إضافة جدول مقاسات عام جديد</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-zinc-300 mb-1.5">اسم جدول المقاسات</label>
                  <input
                    type="text"
                    placeholder="مثال: جدول مقاسات التيشيرتات والأوفرسايز"
                    value={newSizeChartName}
                    onChange={(e) => setNewSizeChartName(e.target.value)}
                    className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-zinc-300 mb-1.5">صورة جدول المقاسات</label>
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
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs rounded-xl transition-all shadow-md cursor-pointer"
              >
                <Plus size={16} />
                حفظ جدول المقاسات للقائمة
              </button>
            </div>

            {/* Uploaded Size Charts Grid */}
            <div className="pt-4 border-t border-zinc-800 space-y-3">
              <h3 className="text-xs font-bold text-zinc-300">جداول المقاسات المتاحة حالياً بالمتجر:</h3>
              {(!settings.sizeCharts || settings.sizeCharts.length === 0) ? (
                <p className="text-xs text-zinc-500 py-4">لم يتم إضافة جداول مقاسات عامة بعد.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {settings.sizeCharts.map((item) => (
                    <div key={item.id} className="relative bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-3 group">
                      <div className="aspect-video w-full rounded-xl overflow-hidden bg-black border border-zinc-800">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-contain p-1" />
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-white truncate">{item.name}</p>
                        <button
                          type="button"
                          onClick={() => removeSizeChart(item.id)}
                          className="p-1.5 text-zinc-400 hover:text-red-400 transition-colors cursor-pointer"
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
          <div className="bg-zinc-950 rounded-2xl border border-zinc-800 p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center gap-2 border-b border-zinc-800 pb-4">
              <Type size={18} className="text-amber-400" />
              <h2 className="font-black text-sm text-amber-400 uppercase tracking-wider">
                شعار المتجر ونصوص الهوية (Store Logo & Brand Copy)
              </h2>
            </div>

            {/* Logo Image Uploader */}
            <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3">
              <label className="block text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
                تغيير لوجو المحل الرسمي (Logo Upload CMS)
              </label>
              <p className="text-xs text-zinc-400 mb-3">
                رفع صورة لوجو المحل الجديد (تظهر في الهيدر، الفوتر، لوحة الإدارة، والإنترو).
              </p>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-2xl bg-black border border-zinc-800 p-2 flex items-center justify-center overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={settings.logoUrl || "/logo.png"} alt="Store Logo" className="max-h-full max-w-full object-contain" />
                </div>
                <div className="flex-1">
                  <ImageUploader
                    id="logo-image-uploader"
                    multiple={false}
                    images={settings.logoUrl ? [settings.logoUrl] : []}
                    onChange={(newImgs) => setSettings((prev) => ({ ...prev, logoUrl: newImgs[0] || "/logo.png" }))}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1.5">اسم المتجر</label>
                <input
                  type="text"
                  value={settings.storeName || "DEEP STORE"}
                  onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                  className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1.5">شعار الهيرو الفرعي (Hero Tagline)</label>
                <input
                  type="text"
                  value={settings.heroTagline || "ديب ستور — عالم الموضة والستريت وير الفاخر 👑"}
                  onChange={(e) => setSettings({ ...settings, heroTagline: e.target.value })}
                  className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1.5">نص زر الهيرو (CTA Button)</label>
                <input
                  type="text"
                  value={settings.heroButtonText || "تسوق الآن — SHOP NOW"}
                  onChange={(e) => setSettings({ ...settings, heroButtonText: e.target.value })}
                  className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1.5">عنوان قسم التشكيلات الفاخرة</label>
                <input
                  type="text"
                  value={settings.featuredTitle || "التشكيلات العصرية"}
                  onChange={(e) => setSettings({ ...settings, featuredTitle: e.target.value })}
                  className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1.5">الوصف المختصر بالفوتر</label>
              <textarea
                rows={3}
                value={settings.footerDescription || ""}
                onChange={(e) => setSettings({ ...settings, footerDescription: e.target.value })}
                className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 resize-none"
              />
            </div>
          </div>
        )}

        {/* TAB 3: PAYMENT GATEWAYS & CONTROLS */}
        {activeTab === "payments" && (
          <div className="bg-zinc-950 rounded-2xl border border-zinc-800 p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div className="flex items-center gap-2">
                <CreditCard size={20} className="text-amber-400" />
                <h2 className="font-black text-base text-amber-400">
                  لوحة التحكم في تفعيل وسائل الدفع الإلكتروني والدفع عند الاستلام
                </h2>
              </div>
              <span className="text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 px-3 py-1 rounded-full">
                تحكم فوري مباشر
              </span>
            </div>

            {/* Main Switch 1: Online Payments Overall Toggle */}
            <div className="p-5 rounded-2xl bg-zinc-900/80 border border-amber-500/30 space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-sm text-white">تفعيل خيار الدفع أونلاين بالكامل (Online Payment Master)</h3>
                    {settings.onlinePaymentEnabled ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        مفعل حالياً
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-red-500/20 text-red-400 border border-red-500/30">
                        معطل حالياً
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-400">
                    عند إيقاف هذا الخيار، سيتم تعطيل خيارات التحويل الإلكتروني بالكامل في صفحة إنهاء الطلب وسيعمل الدفع عند الاستلام فقط.
                  </p>
                </div>

                <ToggleSwitch
                  checked={!!settings.onlinePaymentEnabled}
                  onChange={(val) => setSettings({ ...settings, onlinePaymentEnabled: val })}
                  size="lg"
                />
              </div>
            </div>

            {/* Individual Sub Payment Methods */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              {/* Vodafone Cash */}
              <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-amber-400">فودافون كاش (Vodafone Cash)</span>
                  <ToggleSwitch
                    checked={!!settings.vodafoneCashEnabled}
                    onChange={(val) => setSettings({ ...settings, vodafoneCashEnabled: val })}
                    size="sm"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-zinc-400 mb-1">رقم محفظة فودافون كاش</label>
                  <input
                    type="text"
                    value={settings.vodafoneCash || "01012345678"}
                    onChange={(e) => setSettings({ ...settings, vodafoneCash: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* InstaPay */}
              <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-amber-400">انستاباي (InstaPay)</span>
                  <ToggleSwitch
                    checked={!!settings.instapayEnabled}
                    onChange={(val) => setSettings({ ...settings, instapayEnabled: val })}
                    size="sm"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-zinc-400 mb-1">معرف انستاباي IPA</label>
                  <input
                    type="text"
                    value={settings.instapayUsername || "@deepstore"}
                    onChange={(e) => setSettings({ ...settings, instapayUsername: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Cash on Delivery */}
              <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-amber-400">الدفع عند الاستلام (COD)</span>
                  <ToggleSwitch
                    checked={!!settings.codEnabled}
                    onChange={(val) => setSettings({ ...settings, codEnabled: val })}
                    size="sm"
                  />
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed pt-2">
                  تمكين العملاء من دفع قيمة الطلب نقداً للمندوب عند استلام الشحنة.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: HERO BANNERS & MEDIA */}
        {activeTab === "hero" && (
          <div className="bg-zinc-950 rounded-2xl border border-zinc-800 p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center gap-2 border-b border-zinc-800 pb-4">
              <Sparkles size={18} className="text-amber-400" />
              <h2 className="font-black text-sm text-amber-400 uppercase tracking-wider">
                وسائط وصور الهيرو والواجهة الرئيسية
              </h2>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2">
                نوع وسائط واجهة الهيرو
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSettings({ ...settings, heroMediaType: "image" })}
                  className={`flex items-center justify-center gap-2 p-3.5 rounded-xl border text-xs font-bold transition-all ${
                    settings.heroMediaType === "image"
                      ? "bg-amber-500 text-black border-amber-400 font-black shadow-lg shadow-amber-500/20"
                      : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:bg-zinc-800"
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
                      ? "bg-amber-500 text-black border-amber-400 font-black shadow-lg shadow-amber-500/20"
                      : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:bg-zinc-800"
                  }`}
                >
                  <Video size={16} />
                  عرض الفيديو السينمائي (.mp4)
                </button>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-zinc-800">
              <label className="block text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
                رفع صور بانرات الهيرو بالصفحة الرئيسية
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                {settings.heroImagesDark?.map((img, i) => (
                  <div key={i} className="relative aspect-video rounded-xl overflow-hidden border border-zinc-800 group bg-zinc-900">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img} alt={`Banner ${i + 1}`} className="w-full h-full object-cover" />
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
                id="hero-images-uploader-tab"
                multiple={true}
                images={settings.heroImagesDark || []}
                onChange={(newImgs) => setSettings((prev) => ({ ...prev, heroImagesDark: newImgs, heroImagesLight: newImgs }))}
              />
            </div>
          </div>
        )}

        {/* TAB 5: CONTACT & SOCIALS */}
        {activeTab === "contact" && (
          <div className="bg-zinc-950 rounded-2xl border border-zinc-800 p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center gap-2 border-b border-zinc-800 pb-4">
              <Phone size={18} className="text-amber-400" />
              <h2 className="font-black text-sm text-amber-400 uppercase tracking-wider">
                معلومات التواصل وحسابات السوشيال ميديا
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1.5">البريد الإلكتروني للشكاوى والدعم</label>
                <input
                  type="email"
                  value={settings.storeEmail || "storedeeb2020@gmail.com"}
                  onChange={(e) => setSettings({ ...settings, storeEmail: e.target.value })}
                  className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1.5">رقم تليفون المبيعات والدعم</label>
                <input
                  type="text"
                  value={settings.storePhone || "+20 101 234 5678"}
                  onChange={(e) => setSettings({ ...settings, storePhone: e.target.value })}
                  className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1.5">رابط حساب انستجرام Instagram</label>
                <input
                  type="url"
                  value={settings.instagramUrl || ""}
                  onChange={(e) => setSettings({ ...settings, instagramUrl: e.target.value })}
                  className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1.5">رابط فيسبوك Facebook</label>
                <input
                  type="url"
                  value={settings.facebookUrl || ""}
                  onChange={(e) => setSettings({ ...settings, facebookUrl: e.target.value })}
                  className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1.5">رابط تيك توك TikTok</label>
                <input
                  type="url"
                  value={settings.tiktokUrl || ""}
                  onChange={(e) => setSettings({ ...settings, tiktokUrl: e.target.value })}
                  className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: ABOUT US PAGE */}
        {activeTab === "about" && (
          <div className="bg-zinc-950 rounded-2xl border border-zinc-800 p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center gap-2 border-b border-zinc-800 pb-4">
              <Info size={18} className="text-amber-400" />
              <h2 className="font-black text-sm text-amber-400 uppercase tracking-wider">
                محتوى صفحة عن المتجر (About Us CMS)
              </h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1.5">العنوان الرئيسي للصفحة</label>
                <input
                  type="text"
                  value={settings.aboutTitle || "عن ديب ستور — About DEEP STORE"}
                  onChange={(e) => setSettings({ ...settings, aboutTitle: e.target.value })}
                  className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1.5">الوصف الفرعي للصفحة</label>
                <textarea
                  rows={3}
                  value={settings.aboutSubtitle || ""}
                  onChange={(e) => setSettings({ ...settings, aboutSubtitle: e.target.value })}
                  className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: LEGAL & PRIVACY POLICY */}
        {activeTab === "legal" && (
          <div className="bg-zinc-950 rounded-2xl border border-zinc-800 p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center gap-2 border-b border-zinc-800 pb-4">
              <Shield size={18} className="text-amber-400" />
              <h2 className="font-black text-sm text-amber-400 uppercase tracking-wider">
                نصوص الشروط والأحكام وسياسة الخصوصية باللغة العربية
              </h2>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1.5">سياسة الخصوصية (Privacy Policy)</label>
              <textarea
                rows={6}
                value={settings.privacyPolicyText || ""}
                onChange={(e) => setSettings({ ...settings, privacyPolicyText: e.target.value })}
                className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1.5">الشروط والأحكام (Terms of Service)</label>
              <textarea
                rows={6}
                value={settings.termsOfServiceText || ""}
                onChange={(e) => setSettings({ ...settings, termsOfServiceText: e.target.value })}
                className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        )}

        {/* Floating Save Button Bar */}
        <div className="sticky bottom-6 z-20 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-3 px-10 py-4 rounded-full bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-black font-black text-sm tracking-wider uppercase shadow-2xl border border-amber-300/60 hover:scale-105 active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
          >
            <Save size={18} />
            <span>{saving ? "جاري حفظ الإعدادات..." : "حفظ التغييرات الآن"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
