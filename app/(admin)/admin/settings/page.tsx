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
    heroMediaType: "video",
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
      toast.success("تم حفظ إعدادات الموقع ونصوص وصفحات الشروط والخصوصية بنجاح 👑");
    } catch (err) {
      console.error(err);
      toast.error("فشل حفظ الإعدادات");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex items-center justify-center text-amber-400">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl pb-16 font-sans dir-rtl text-white" dir="rtl">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400 mb-1">
          <Sliders size={14} />
          مركز التحكم وإعدادات الموقع (CMS)
        </div>
        <h1 className="text-3xl font-black tracking-tight text-white">
          إعدادات الهوية ونصوص المتجر
        </h1>
        <p className="text-zinc-400 text-xs mt-1">
          إدارة وسائط الهيرو، روابط التواصل، طرق الدفع، نصوص صفحة من نحن، وشروط الخدمة والخصوصية.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* SECTION 1: HOMEPAGE HERO MEDIA */}
        <div className="bg-zinc-950 rounded-2xl border border-zinc-800 p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-amber-400" />
              <h2 className="font-black text-sm text-amber-400 uppercase tracking-wider">
                إعدادات البانر وفيديو الهيرو بالصفحة الرئيسية
              </h2>
            </div>
            <span className="text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 px-3 py-1 rounded-full uppercase tracking-wider">
              مباشر ومباشر
            </span>
          </div>

          {/* Media Type Toggle */}
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
                عرض الصور (Banner / Slideshow)
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
                عرض الفيديو السينمائي (Cloudinary / MP4)
              </button>
            </div>
          </div>

          {/* Video Settings */}
          {settings.heroMediaType === "video" && (
            <div className="space-y-4 pt-2 border-t border-zinc-800">
              <div>
                <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-2">
                  رابط فيديو الخلفية Muted Video (.mp4)
                </label>
                <input
                  type="text"
                  placeholder="https://res.cloudinary.com/aqszlz7k/video/upload/12_zsnepl.mp4"
                  value={settings.heroVideoUrlDark || ""}
                  onChange={(e) => setSettings({ ...settings, heroVideoUrlDark: e.target.value, heroVideoUrlLight: e.target.value })}
                  className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* SECTION 2: BRAND IDENTITY & TEXT COPY */}
        <div className="bg-zinc-950 rounded-2xl border border-zinc-800 p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="flex items-center gap-2 border-b border-zinc-800 pb-4">
            <Type size={18} className="text-amber-400" />
            <h2 className="font-black text-sm text-amber-400 uppercase tracking-wider">
              نصوص وشعارات البراند (Brand Text Copy)
            </h2>
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
              rows={2}
              value={settings.footerDescription || ""}
              onChange={(e) => setSettings({ ...settings, footerDescription: e.target.value })}
              className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 resize-none"
            />
          </div>
        </div>

        {/* SECTION 3: PAYMENTS & CONTACT INFO */}
        <div className="bg-zinc-950 rounded-2xl border border-zinc-800 p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="flex items-center gap-2 border-b border-zinc-800 pb-4">
            <CreditCard size={18} className="text-amber-400" />
            <h2 className="font-black text-sm text-amber-400 uppercase tracking-wider">
              وسائل الدفع ومعلومات التواصل
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1.5">البريد الإلكتروني للشكاوى</label>
              <input
                type="email"
                value={settings.storeEmail || "storedeeb2020@gmail.com"}
                onChange={(e) => setSettings({ ...settings, storeEmail: e.target.value })}
                className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1.5">رقم فودافون كاش للمبيعات</label>
              <input
                type="text"
                value={settings.vodafoneCash || "01012345678"}
                onChange={(e) => setSettings({ ...settings, vodafoneCash: e.target.value })}
                className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1.5">معرف انستاباي InstaPay Username</label>
              <input
                type="text"
                value={settings.instapayUsername || "@deepstore"}
                onChange={(e) => setSettings({ ...settings, instapayUsername: e.target.value })}
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

        {/* SECTION 4: LEGAL & PRIVACY POLICY CONTENT */}
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
              rows={5}
              value={settings.privacyPolicyText || ""}
              onChange={(e) => setSettings({ ...settings, privacyPolicyText: e.target.value })}
              className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-300 mb-1.5">الشروط والأحكام (Terms of Service)</label>
            <textarea
              rows={5}
              value={settings.termsOfServiceText || ""}
              onChange={(e) => setSettings({ ...settings, termsOfServiceText: e.target.value })}
              className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Floating Save Bar */}
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
