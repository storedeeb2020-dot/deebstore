"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Trash2, Video, Image as ImageIcon, Save, Sparkles, Sliders, Type, CreditCard, Share2, Info, FileText, Shield } from "lucide-react";
import { getSiteSettings, updateSiteSettings, type SiteSettings } from "@/lib/firebase/firestore";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { Spinner } from "@/components/ui/Spinner";

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [settings, setSettings] = useState<SiteSettings>({
    storeName: "DEEP STORE",
    heroTagline: "ديب ستور — عالم الموضة والستريت وير الفاخر 👑",
    heroButtonText: "تسوق الآن — SHOP NOW",
    heroMediaType: "image",
    heroVideoUrlLight: "",
    heroVideoUrlDark: "",
    heroImagesLight: ["/banner_light.png"],
    heroImagesDark: ["/banner.png"],
    featuredTitle: "التشكيلات العصرية",
    featuredSubtitle: "مصممة بعناية لتناسب أسلوب حياتك",
    introTagline: "DEEP STORE ROYAL STREETWEAR",
    footerDescription: "متجر ديب ستور الفاخر لملابس الستريت وير والموضة العصرية في مصر والوطن العربي.",
    storeEmail: "storedeeb2020@gmail.com",
    storePhone: "+20 101 234 5678",
    vodafoneCash: "01012345678",
    instapayUsername: "@deepstore",
    instagramUrl: "https://www.instagram.com/eldeeb_st0re?igsh=MTh3dDBheWJ1MjNneg==",
    facebookUrl: "https://www.facebook.com/share/1BeVGnopec/",
    tiktokUrl: "https://www.tiktok.com/@eldeeb_st0re",
    currency: "EGP",
    aboutTitle: "عن ديب ستور — About DEEP STORE",
    aboutSubtitle: "نحدد أسلوب الأناقة العصرية من خلال الموضة الفاخرة وخامات الستريت وير الممتازة والتصاميم الاستثنائية.",
    aboutSection1Title: "الرقي والبساطة العصرية",
    aboutSection1Text: "في ديب ستور DEEP STORE، نؤمن بأن الأسلوب هو انعكاس للهوية. نصمم ملابس تبرز خطوط الأناقة وتعتمد على الخامات الفاخرة التي تدوم طويلاً وتمنحك التميز المطلق.",
    aboutSection1Image: "",
    aboutSection2Title: "جودة بدون مساومة",
    aboutSection2Text: "نختار أجود أنواع الأقمشة لضمان أقصى درجات الراحة والمتانة مع كل قطعة ترتديها.",
    aboutSection2Image: "",
    privacyPolicyText: `Information We Collect
We collect information you provide directly to us, such as your name, phone number, delivery address, and payment method when you place an order. We also collect information about how you use our website.

How We Use Your Information
We use the information we collect to process orders, communicate with you about your orders, and improve our services. We do not sell your personal information to third parties.

Data Security
We take reasonable measures to protect your information from unauthorized access or disclosure. Your payment information is never stored on our servers.

Contact Us
If you have questions about this Privacy Policy, please contact us at storedeeb2020@gmail.com`,
    termsOfServiceText: `Acceptance of Terms
By using DEEP STORE, you agree to these Terms of Service. If you do not agree, please do not use our website or services.

Orders & Payments
All orders are subject to availability. Payment must be completed via Cash on Delivery, Vodafone Cash, or InstaPay. We reserve the right to cancel orders that are not paid or verified.

Shipping & Delivery
We aim to ship all orders within 1–2 business days. Delivery takes 2–5 business days depending on your governorate. Shipping fees apply based on your location.

Returns & Exchanges
We accept returns within 7 days of delivery for unused items in original condition. Items must not be washed or damaged. Contact us at storedeeb2020@gmail.com to initiate a return.

Limitation of Liability
DEEP STORE is not responsible for delays caused by courier services or events beyond our control. We are not liable for any indirect or consequential damages.`,
  });

  useEffect(() => {
    getSiteSettings()
      .then((data) => {
        if (data) {
          setSettings((prev) => ({
            ...prev,
            ...data,
            heroImagesLight: data.heroImagesLight?.length ? data.heroImagesLight : ["/banner_light.png"],
            heroImagesDark: data.heroImagesDark?.length ? data.heroImagesDark : ["/banner.png"],
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
      toast.success("Site settings, About Page, Legal & Privacy policy content saved successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const removeImageLight = (index: number) => {
    setSettings((prev) => ({
      ...prev,
      heroImagesLight: prev.heroImagesLight?.filter((_, i) => i !== index),
    }));
  };

  const removeImageDark = (index: number) => {
    setSettings((prev) => ({
      ...prev,
      heroImagesDark: prev.heroImagesDark?.filter((_, i) => i !== index),
    }));
  };

  if (loading) {
    return (
      <div className="py-20 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl pb-16">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">
          <Sliders size={14} />
          CMS & Site Control Center
        </div>
        <h1 className="text-3xl font-black tracking-tight text-zinc-900">
          Website Settings & Copy Editor
        </h1>
        <p className="text-zinc-500 text-xs mt-1">
          Manage homepage hero media, customize website text, edit the About Us page, update Privacy Policy & Terms of Service, and configure payment options.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* SECTION 1: HOMEPAGE HERO MEDIA */}
        <div className="bg-white rounded-2xl border border-zinc-100 p-6 sm:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.015)] space-y-6">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-amber-500" />
              <h2 className="font-black text-sm text-zinc-900 uppercase tracking-wider">
                Home Hero Banner & Video Settings
              </h2>
            </div>
            <span className="text-[10px] font-bold bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full uppercase tracking-wider">
              Live Customizer
            </span>
          </div>

          {/* Media Type Toggle */}
          <div>
            <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-2">
              Hero Media Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSettings({ ...settings, heroMediaType: "image" })}
                className={`flex items-center justify-center gap-2 p-3.5 rounded-xl border text-xs font-bold transition-all ${
                  settings.heroMediaType === "image"
                    ? "bg-zinc-900 text-white border-zinc-900 shadow-md"
                    : "bg-zinc-50 text-zinc-600 border-zinc-200 hover:bg-zinc-100"
                }`}
              >
                <ImageIcon size={16} />
                Image Banner / Slideshow
              </button>
              <button
                type="button"
                onClick={() => setSettings({ ...settings, heroMediaType: "video" })}
                className={`flex items-center justify-center gap-2 p-3.5 rounded-xl border text-xs font-bold transition-all ${
                  settings.heroMediaType === "video"
                    ? "bg-zinc-900 text-white border-zinc-900 shadow-md"
                    : "bg-zinc-50 text-zinc-600 border-zinc-200 hover:bg-zinc-100"
                }`}
              >
                <Video size={16} />
                Video Banner (mp4 / WebM)
              </button>
            </div>
          </div>

          {/* Video Settings */}
          {settings.heroMediaType === "video" && (
            <div className="space-y-4 pt-2 border-t border-zinc-100">
              <div>
                <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-2">
                  Light Mode Video URL (.mp4)
                </label>
                <input
                  type="text"
                  placeholder="https://example.com/hero-video-light.mp4"
                  value={settings.heroVideoUrlLight || ""}
                  onChange={(e) => setSettings({ ...settings, heroVideoUrlLight: e.target.value })}
                  className="w-full px-4 py-3 border border-zinc-200 rounded-xl text-xs font-medium focus:outline-none focus:border-zinc-900"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-2">
                  Dark Mode Video URL (.mp4)
                </label>
                <input
                  type="text"
                  placeholder="https://example.com/hero-video-dark.mp4"
                  value={settings.heroVideoUrlDark || ""}
                  onChange={(e) => setSettings({ ...settings, heroVideoUrlDark: e.target.value })}
                  className="w-full px-4 py-3 border border-zinc-200 rounded-xl text-xs font-medium focus:outline-none focus:border-zinc-900"
                />
              </div>
            </div>
          )}

          {/* Image Settings */}
          {settings.heroMediaType === "image" && (
            <div className="space-y-6 pt-2 border-t border-zinc-100">
              {/* Light Mode Images */}
              <div>
                <label className="block text-[11px] font-bold text-zinc-700 uppercase tracking-wider mb-3">
                  Light Mode Banner Images (White Mode)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                  {settings.heroImagesLight?.map((img, i) => (
                    <div key={i} className="relative aspect-video rounded-xl overflow-hidden border border-zinc-200 group bg-zinc-50">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img} alt={`Light Banner ${i + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImageLight(i)}
                        className="absolute top-1.5 right-1.5 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Delete image"
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

              {/* Dark Mode Images */}
              <div>
                <label className="block text-[11px] font-bold text-zinc-700 uppercase tracking-wider mb-3">
                  Dark Mode Banner Images (Dark Mode)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                  {settings.heroImagesDark?.map((img, i) => (
                    <div key={i} className="relative aspect-video rounded-xl overflow-hidden border border-zinc-200 group bg-zinc-900">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img} alt={`Dark Banner ${i + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImageDark(i)}
                        className="absolute top-1.5 right-1.5 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Delete image"
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
            </div>
          )}

          {/* DEDICATED INTRO SCREEN PHOTOS CMS */}
          <div className="pt-4 border-t border-zinc-100 space-y-3">
            <label className="block text-xs font-bold text-zinc-900 uppercase tracking-wider">
              Dedicated Intro Background Photos (صور الإنترو الخاصة)
            </label>
            <p className="text-xs text-zinc-500">
              ارفع صوراً خاصة بعرض الإنترو السينمائي (ستظهر بدلاً من صور الهيرو في خلفية الإنترو)
            </p>
            <ImageUploader
              id="intro-background-images-uploader"
              multiple={true}
              images={settings.introImages || []}
              onChange={(newImgs) => setSettings((prev) => ({ ...prev, introImages: newImgs }))}
            />
          </div>
        </div>

        {/* SECTION 2: ABOUT US PAGE CONTENT & IMAGES */}
        <div className="bg-white rounded-2xl border border-zinc-100 p-6 sm:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.015)] space-y-6">
          <div className="flex items-center gap-2 border-b border-zinc-100 pb-4">
            <Info size={18} className="text-zinc-900" />
            <h2 className="font-black text-sm text-zinc-900 uppercase tracking-wider">
              About Us Page Content & Images
            </h2>
          </div>

          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                  About Page Title
                </label>
                <input
                  type="text"
                  value={settings.aboutTitle || ""}
                  onChange={(e) => setSettings({ ...settings, aboutTitle: e.target.value })}
                  className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-zinc-900"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                  About Page Subtitle / Tagline
                </label>
                <input
                  type="text"
                  value={settings.aboutSubtitle || ""}
                  onChange={(e) => setSettings({ ...settings, aboutSubtitle: e.target.value })}
                  className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-zinc-900"
                />
              </div>
            </div>

            {/* Section 1 Edit */}
            <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-200/60 space-y-3">
              <h3 className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Section 1: Modern Minimalism</h3>
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                  Section 1 Title
                </label>
                <input
                  type="text"
                  value={settings.aboutSection1Title || ""}
                  onChange={(e) => setSettings({ ...settings, aboutSection1Title: e.target.value })}
                  className="w-full px-4 py-2 border border-zinc-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-zinc-900 bg-white"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                  Section 1 Description Paragraph
                </label>
                <textarea
                  rows={3}
                  value={settings.aboutSection1Text || ""}
                  onChange={(e) => setSettings({ ...settings, aboutSection1Text: e.target.value })}
                  className="w-full px-4 py-2 border border-zinc-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-zinc-900 bg-white"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                  Section 1 Image URL / Upload
                </label>
                <ImageUploader
                  id="about-section-1-image-uploader"
                  multiple={false}
                  images={settings.aboutSection1Image ? [settings.aboutSection1Image] : []}
                  onChange={(imgs) => setSettings((prev) => ({ ...prev, aboutSection1Image: imgs[imgs.length - 1] || "" }))}
                />
              </div>
            </div>

            {/* Section 2 Edit */}
            <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-200/60 space-y-3">
              <h3 className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Section 2: Uncompromising Quality</h3>
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                  Section 2 Title
                </label>
                <input
                  type="text"
                  value={settings.aboutSection2Title || ""}
                  onChange={(e) => setSettings({ ...settings, aboutSection2Title: e.target.value })}
                  className="w-full px-4 py-2 border border-zinc-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-zinc-900 bg-white"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                  Section 2 Description Paragraph
                </label>
                <textarea
                  rows={3}
                  value={settings.aboutSection2Text || ""}
                  onChange={(e) => setSettings({ ...settings, aboutSection2Text: e.target.value })}
                  className="w-full px-4 py-2 border border-zinc-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-zinc-900 bg-white"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                  Section 2 Image URL / Upload
                </label>
                <ImageUploader
                  id="about-section-2-image-uploader"
                  multiple={false}
                  images={settings.aboutSection2Image ? [settings.aboutSection2Image] : []}
                  onChange={(imgs) => setSettings((prev) => ({ ...prev, aboutSection2Image: imgs[imgs.length - 1] || "" }))}
                />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3: PRIVACY POLICY & TERMS OF SERVICE CMS */}
        <div className="bg-white rounded-2xl border border-zinc-100 p-6 sm:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.015)] space-y-6">
          <div className="flex items-center gap-2 border-b border-zinc-100 pb-4">
            <Shield size={18} className="text-zinc-900" />
            <h2 className="font-black text-sm text-zinc-900 uppercase tracking-wider">
              Privacy Policy & Terms of Service CMS
            </h2>
          </div>

          <div className="space-y-6">
            <div>
              <label className="flex items-center gap-2 text-xs font-bold text-zinc-800 uppercase tracking-wider mb-2">
                <FileText size={14} />
                Privacy Policy Text Content
              </label>
              <textarea
                rows={8}
                value={settings.privacyPolicyText || ""}
                onChange={(e) => setSettings({ ...settings, privacyPolicyText: e.target.value })}
                placeholder="Enter custom privacy policy content..."
                className="w-full px-4 py-3 border border-zinc-200 rounded-xl text-xs font-medium focus:outline-none focus:border-zinc-900 leading-relaxed font-mono"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-xs font-bold text-zinc-800 uppercase tracking-wider mb-2">
                <FileText size={14} />
                Terms of Service Text Content
              </label>
              <textarea
                rows={8}
                value={settings.termsOfServiceText || ""}
                onChange={(e) => setSettings({ ...settings, termsOfServiceText: e.target.value })}
                placeholder="Enter custom terms of service content..."
                className="w-full px-4 py-3 border border-zinc-200 rounded-xl text-xs font-medium focus:outline-none focus:border-zinc-900 leading-relaxed font-mono"
              />
            </div>
          </div>
        </div>

        {/* SECTION 4: LIVE WEBSITE TEXT & COPY CMS */}
        <div className="bg-white rounded-2xl border border-zinc-100 p-6 sm:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.015)] space-y-6">
          <div className="flex items-center gap-2 border-b border-zinc-100 pb-4">
            <Type size={18} className="text-zinc-900" />
            <h2 className="font-black text-sm text-zinc-900 uppercase tracking-wider">
              Website Copy Control
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                Store Name
              </label>
              <input
                type="text"
                value={settings.storeName || ""}
                onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-zinc-900"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                Currency Symbol
              </label>
              <input
                type="text"
                value={settings.currency || "EGP"}
                onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-zinc-900"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                Home Hero Subtitle / Tagline
              </label>
              <input
                type="text"
                value={settings.heroTagline || ""}
                onChange={(e) => setSettings({ ...settings, heroTagline: e.target.value })}
                className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-zinc-900"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                Home Hero Button Text
              </label>
              <input
                type="text"
                value={settings.heroButtonText || ""}
                onChange={(e) => setSettings({ ...settings, heroButtonText: e.target.value })}
                className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-zinc-900"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                Catalog Section Title
              </label>
              <input
                type="text"
                value={settings.featuredTitle || ""}
                onChange={(e) => setSettings({ ...settings, featuredTitle: e.target.value })}
                className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-zinc-900"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                Catalog Section Subtitle
              </label>
              <input
                type="text"
                value={settings.featuredSubtitle || ""}
                onChange={(e) => setSettings({ ...settings, featuredSubtitle: e.target.value })}
                className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-zinc-900"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                Intro Screen Animated Tagline
              </label>
              <input
                type="text"
                value={settings.introTagline || ""}
                onChange={(e) => setSettings({ ...settings, introTagline: e.target.value })}
                className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-zinc-900"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                Footer Description Paragraph
              </label>
              <textarea
                rows={3}
                value={settings.footerDescription || ""}
                onChange={(e) => setSettings({ ...settings, footerDescription: e.target.value })}
                className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-zinc-900"
              />
            </div>
          </div>
        </div>

        {/* SECTION 5: STORE CONTACT & PAYMENT METHODS */}
        <div className="bg-white rounded-2xl border border-zinc-100 p-6 sm:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.015)] space-y-6">
          <div className="flex items-center gap-2 border-b border-zinc-100 pb-4">
            <CreditCard size={18} className="text-zinc-900" />
            <h2 className="font-black text-sm text-zinc-900 uppercase tracking-wider">
              Contact & Payment Details
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                Vodafone Cash Number
              </label>
              <input
                type="text"
                value={settings.vodafoneCash || ""}
                onChange={(e) => setSettings({ ...settings, vodafoneCash: e.target.value })}
                className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-zinc-900"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                InstaPay Handle / Username
              </label>
              <input
                type="text"
                value={settings.instapayUsername || ""}
                onChange={(e) => setSettings({ ...settings, instapayUsername: e.target.value })}
                className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-zinc-900"
              />
            </div>

            {/* Online Payment Toggle */}
            <div className="sm:col-span-2">
              <div className={`flex items-center justify-between p-5 rounded-2xl border-2 transition-all duration-300 ${
                settings.onlinePaymentEnabled
                  ? "border-green-300 bg-green-50"
                  : "border-red-200 bg-red-50"
              }`}>
                <div>
                  <p className="text-sm font-black text-zinc-900">
                    {settings.onlinePaymentEnabled ? "✅ الدفع الأونلاين مفعّل" : "🔴 الدفع الأونلاين معطّل"}
                  </p>
                  <p className="text-[11px] text-zinc-500 mt-0.5">
                    {settings.onlinePaymentEnabled
                      ? "العملاء يقدرون يدفعوا بفودافون كاش أو انستاباي"
                      : "الدفع عند الاستلام فقط — الأونلاين مخفي تماماً"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSettings({ ...settings, onlinePaymentEnabled: !settings.onlinePaymentEnabled })}
                  className={`relative w-14 h-7 rounded-full transition-all duration-300 focus:outline-none shadow-inner ${
                    settings.onlinePaymentEnabled ? "bg-green-500" : "bg-zinc-300"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-all duration-300 ${
                      settings.onlinePaymentEnabled ? "right-0.5" : "left-0.5"
                    }`}
                  />
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                Support Email Address
              </label>
              <input
                type="email"
                value={settings.storeEmail || ""}
                onChange={(e) => setSettings({ ...settings, storeEmail: e.target.value })}
                className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-zinc-900"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                Support Phone Number
              </label>
              <input
                type="text"
                value={settings.storePhone || ""}
                onChange={(e) => setSettings({ ...settings, storePhone: e.target.value })}
                className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-zinc-900"
              />
            </div>
          </div>
        </div>

        {/* SECTION 6: SOCIAL MEDIA LINKS */}
        <div className="bg-white rounded-2xl border border-zinc-100 p-6 sm:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.015)] space-y-6">
          <div className="flex items-center gap-2 border-b border-zinc-100 pb-4">
            <Share2 size={18} className="text-zinc-900" />
            <h2 className="font-black text-sm text-zinc-900 uppercase tracking-wider">
              Social Media Links
            </h2>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                Instagram Profile Link
              </label>
              <input
                type="text"
                value={settings.instagramUrl || ""}
                onChange={(e) => setSettings({ ...settings, instagramUrl: e.target.value })}
                className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-zinc-900"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                Facebook Page Link
              </label>
              <input
                type="text"
                value={settings.facebookUrl || ""}
                onChange={(e) => setSettings({ ...settings, facebookUrl: e.target.value })}
                className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-zinc-900"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                TikTok Profile Link
              </label>
              <input
                type="text"
                value={settings.tiktokUrl || ""}
                onChange={(e) => setSettings({ ...settings, tiktokUrl: e.target.value })}
                className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-zinc-900"
              />
            </div>
          </div>
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 bg-zinc-900 text-white px-8 py-4 rounded-xl font-bold text-xs hover:bg-zinc-800 transition-all duration-300 shadow-xl shadow-zinc-900/10 disabled:opacity-50"
        >
          {saving ? <Spinner size="sm" className="border-white border-t-transparent" /> : <Save size={16} />}
          Save All Settings & Website Legal Copy
        </button>
      </form>
    </div>
  );
}
