"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  MapPin,
  Truck,
  Banknote,
  Smartphone,
  CreditCard,
  Upload,
  X,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  ShoppingBag,
} from "lucide-react";
import { useCart } from "@/features/cart/CartProvider";
import { createOrder, getShippingRates, getSiteSettings, subscribeToShippingRates, subscribeToSiteSettings } from "@/lib/firebase/firestore";
import { formatPrice } from "@/lib/utils";
import { checkoutSchema, type CheckoutFormData } from "@/lib/validations/checkout.schema";
import { Input } from "@/components/ui/Input";
import { Spinner } from "@/components/ui/Spinner";
import { TruckSubmitButton } from "@/components/checkout/TruckSubmitButton";
import type { GovernorateRate } from "@/constants/governorates";
import {
  VodafoneCashIcon,
  InstaPayIcon,
  CashOnDeliveryIcon,
  OnlineTransferIcon,
  PaymentHeaderIcon,
} from "@/components/checkout/PaymentIcons";

type PaymentCategory = "cash" | "online";
type OnlineMethod = "vodafone_cash" | "instapay";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalPrice, clearCart } = useCart();
  const [submitting, setSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Payment state
  const [paymentCategory, setPaymentCategory] = useState<PaymentCategory>("cash");
  const [onlineMethod, setOnlineMethod] = useState<OnlineMethod>("vodafone_cash");

  // Screenshot upload state
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [uploadingScreenshot, setUploadingScreenshot] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Shipping & settings
  const [shippingRates, setShippingRates] = useState<GovernorateRate[]>([]);
  const [vodafoneNumber, setVodafoneNumber] = useState("01000000000");
  const [instapayUsername, setInstapayUsername] = useState("@deepstore");
  const [onlinePaymentEnabled, setOnlinePaymentEnabled] = useState<boolean>(true);
  const [orderSuccess, setOrderSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { paymentMethod: "cash_on_delivery" },
  });

  const selectedGovernorate = watch("governorate");
  const watchedName = watch("customerName");
  const watchedPhone = watch("phone");
  const watchedCity = watch("city");
  const watchedAddress = watch("address");
  const watchedTransferPhone = watch("transferPhone");

  const isEgyptianPhone = (val?: string) =>
    !!val && /^(\+20|0)?1[0-2,5]{1}[0-9]{8}$/.test(val.trim());

  const isFormValid =
    !!watchedName &&
    watchedName.trim().length >= 2 &&
    isEgyptianPhone(watchedPhone) &&
    !!selectedGovernorate &&
    !!watchedCity &&
    watchedCity.trim().length >= 2 &&
    !!watchedAddress &&
    watchedAddress.trim().length >= 8 &&
    (paymentCategory === "cash" ||
      (isEgyptianPhone(watchedTransferPhone) && !!screenshotFile));

  useEffect(() => {
    setMounted(true);
    if (items.length === 0) {
      setIsRedirecting(true);
      router.replace("/");
    }

    // Subscribe to shipping rates in real-time
    const unsubscribeShipping = subscribeToShippingRates((data) => {
      setShippingRates(data);
      if (data.length > 0) {
        const def = data.find((r) => r.active) || data[0];
        const currentGov = watch("governorate");
        if (!currentGov) {
          setValue("governorate", def.nameAr);
        }
      }
    });

    // Subscribe to site settings in real-time (Vodafone Cash & InstaPay & payment toggles)
    const unsubscribeSettings = subscribeToSiteSettings((s) => {
      if (s) {
        if (s.vodafoneCash !== undefined) {
          setVodafoneNumber(s.vodafoneCash || s.storePhone || "");
        } else if (s.storePhone) {
          setVodafoneNumber(s.storePhone);
        }

        if (s.instapayUsername !== undefined) {
          setInstapayUsername(s.instapayUsername || "");
        }

        if (s.onlinePaymentEnabled !== undefined) {
          setOnlinePaymentEnabled(s.onlinePaymentEnabled);
          if (!s.onlinePaymentEnabled) {
            setPaymentCategory("cash");
          }
        }
      }
    });

    return () => {
      unsubscribeShipping();
      unsubscribeSettings();
    };
  }, [items, router, setValue, watch]);

  // Sync paymentMethod field with category/method state
  useEffect(() => {
    if (paymentCategory === "cash") {
      setValue("paymentMethod", "cash_on_delivery");
    } else {
      setValue("paymentMethod", onlineMethod);
    }
  }, [paymentCategory, onlineMethod, setValue]);

  const activeRateObj = shippingRates.find(
    (r) => r.nameAr === selectedGovernorate || r.nameEn === selectedGovernorate
  );
  const currentShippingCost = activeRateObj?.price ?? 50;
  const finalOrderTotal = totalPrice + currentShippingCost;

  // Handle screenshot selection
  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setScreenshotFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setScreenshotPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const removeScreenshot = () => {
    setScreenshotFile(null);
    setScreenshotPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Upload screenshot to Cloudinary
  const uploadScreenshot = async (): Promise<string | null> => {
    if (!screenshotFile) return null;
    setUploadingScreenshot(true);
    try {
      const formData = new FormData();
      formData.append("file", screenshotFile);
      formData.append("upload_preset", "nxt_transfers");
      formData.append("folder", "transfer_screenshots");
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: "POST", body: formData }
      );
      const json = await res.json();
      return json.secure_url ?? null;
    } catch {
      return null;
    } finally {
      setUploadingScreenshot(false);
    }
  };

  if (!mounted || items.length === 0 || isRedirecting) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center bg-zinc-50/70 dark:bg-[#050505]">
        <Spinner size="lg" />
      </div>
    );
  }

  const onSubmit = async (data: CheckoutFormData) => {
    // Extra guard: if online, require screenshot
    if (paymentCategory === "online" && !screenshotFile) {
      toast.error("من فضلك ارفع صورة إيصال التحويل");
      return;
    }
    setSubmitting(true);
    try {
      let screenshotUrl: string | null = null;
      if (paymentCategory === "online" && screenshotFile) {
        screenshotUrl = await uploadScreenshot();
        if (!screenshotUrl) {
          toast.error("فشل رفع صورة التحويل — حاول مرة أخرى");
          setSubmitting(false);
          return;
        }
      }

      const orderItems: OrderItem[] = items.map((item) => ({
        productId: item.product.id,
        productName: item.product.name,
        sku: item.product.sku || "",
        productImage: item.selectedColor.image || item.product.mainImage || "",
        price: item.product.salePrice ?? item.product.price,
        quantity: item.quantity,
        selectedSize: item.selectedSize,
        selectedColor: item.selectedColor,
      }));

      const orderPayload: CreateOrderInput = {
        customerName: data.customerName.trim(),
        phone: data.phone.trim(),
        whatsappPhone: data.whatsappPhone?.trim() || data.phone.trim(),
        governorate: data.governorate.trim(),
        city: data.city.trim(),
        address: data.address.trim(),
        notes: data.notes?.trim() || "",
        paymentMethod: data.paymentMethod as PaymentMethod,
        items: orderItems,
        subtotal: totalPrice,
        shippingCost: currentShippingCost,
        total: finalOrderTotal,
      };

      if (data.transferPhone?.trim()) {
        orderPayload.transferPhone = data.transferPhone.trim();
      }

      if (screenshotUrl) {
        orderPayload.transferScreenshot = screenshotUrl;
      }

      const orderId = await createOrder(orderPayload);

      setOrderSuccess(true);
      clearCart();
      setTimeout(() => {
        router.push(`/order-success?orderId=${orderId}`);
      }, 1500);
    } catch (err) {
      console.error(err);
      toast.error("حدث خطأ — حاول مرة أخرى");
      setSubmitting(false);
    }
  };

  const onlineNumberDisplay =
    onlineMethod === "vodafone_cash" ? vodafoneNumber : instapayUsername;

  return (
    <div className="pt-24 min-h-screen bg-zinc-50/70 dark:bg-[#050505] text-zinc-900 dark:text-white font-['Tajawal',sans-serif] transition-colors duration-200" dir="rtl">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">

        {/* ── Page Header ── */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FF274B]/10 border border-[#FF274B]/20 text-[#FF274B] text-xs font-black mb-3">
            <ShieldCheck size={14} />
            <span>دفع آمن 100% وشحن سريع</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900 dark:text-white">
            إتمام الطلب والتوصيل
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1 font-medium">
            يرجى إدخال بيانات التوصيل واختيار طريقة الدفع المناسبة لإكمال طلبك.
          </p>
        </motion.div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-10">

            {/* ── LEFT: Form ── */}
            <div className="lg:col-span-3 space-y-6">

              {/* ── Section 1: Customer Info ── */}
              <motion.section
                className="bg-white dark:bg-[#0E0E10] rounded-3xl p-6 sm:p-8 space-y-6 border border-zinc-200/80 dark:border-white/[0.08] shadow-xl shadow-zinc-200/40 dark:shadow-black/60 transition-all text-zinc-900 dark:text-white"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
              >
                <div className="flex items-center gap-3 border-b border-zinc-100 dark:border-zinc-800/80 pb-4">
                  <div className="w-10 h-10 rounded-2xl bg-[#FF274B]/10 border border-[#FF274B]/20 flex items-center justify-center text-[#FF274B] shrink-0">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <h2 className="font-black text-base sm:text-lg text-zinc-900 dark:text-white">
                      بيانات الشحن والعنوان
                    </h2>
                    <p className="text-xs text-zinc-400 font-semibold">تأكد من كتابة العنوان ورقم الهاتف بدقة</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    id="customerName"
                    label="الاسم بالكامل *"
                    placeholder="أحمد محمد"
                    error={errors.customerName?.message}
                    {...register("customerName")}
                  />
                  <Input
                    id="phone"
                    label="رقم الهاتف *"
                    placeholder="01012345678"
                    error={errors.phone?.message}
                    {...register("phone")}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    id="whatsappPhone"
                    label="رقم الواتساب (اختياري)"
                    placeholder="01012345678"
                    error={errors.whatsappPhone?.message}
                    {...register("whatsappPhone")}
                  />

                  {/* Governorate */}
                  <div>
                    <label className="block text-xs font-extrabold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider mb-1.5">
                      المحافظة *
                    </label>
                    <select
                      {...register("governorate")}
                      className="w-full px-4 py-3 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/80 text-zinc-900 dark:text-white rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#FF274B]/20 focus:border-[#FF274B] cursor-pointer shadow-sm transition-all"
                    >
                      {shippingRates.map((rate) => (
                        <option key={rate.id} value={rate.nameAr} className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white">
                          {rate.nameAr} — شحن {rate.price} ج.م
                        </option>
                      ))}
                    </select>
                    {errors.governorate && (
                      <p className="text-red-500 dark:text-red-400 text-xs font-bold mt-1.5">{errors.governorate.message}</p>
                    )}
                  </div>
                </div>

                <Input
                  id="city"
                  label="المنطقة / الحي *"
                  placeholder="مثال: المعادي / مدينة نصر / سموحة"
                  error={errors.city?.message}
                  {...register("city")}
                />

                <div>
                  <label className="block text-xs font-extrabold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider mb-1.5">
                    العنوان بالتفصيل *
                  </label>
                  <textarea
                    className="w-full px-4 py-3 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/80 text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#FF274B]/20 focus:border-[#FF274B] resize-none shadow-sm transition-all"
                    rows={3}
                    placeholder="الشارع، رقم العمارة، الدور، رقم الشقة..."
                    {...register("address")}
                  />
                  {errors.address && (
                    <p className="text-red-500 dark:text-red-400 text-xs font-bold mt-1.5">{errors.address.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider mb-1.5">
                    ملاحظات (اختياري)
                  </label>
                  <textarea
                    className="w-full px-4 py-3 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/80 text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#FF274B]/20 focus:border-[#FF274B] resize-none shadow-sm transition-all"
                    rows={2}
                    placeholder="أي تعليمات خاصة للمندوب..."
                    {...register("notes")}
                  />
                </div>
              </motion.section>

              {/* ── Section 2: Payment Method ── */}
              <motion.section
                className="bg-white dark:bg-[#0E0E10] rounded-3xl p-6 sm:p-8 border border-zinc-200/80 dark:border-white/[0.08] shadow-xl shadow-zinc-200/40 dark:shadow-black/60 space-y-6 text-zinc-900 dark:text-white transition-all"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12 }}
              >
                <div className="flex items-center gap-3 border-b border-zinc-100 dark:border-zinc-800/80 pb-4">
                  <PaymentHeaderIcon size={42} />
                  <div>
                    <h2 className="font-black text-base sm:text-lg text-zinc-900 dark:text-white">
                      طريقة الدفع
                    </h2>
                    <p className="text-xs text-zinc-400 font-semibold">اختر وسيلة الدفع التي تناسبك</p>
                  </div>
                </div>

                {/* Category: Cash or Online */}
                <div className={`grid ${onlinePaymentEnabled ? "grid-cols-2" : "grid-cols-1"} gap-3.5`}>
                  <button
                    type="button"
                    onClick={() => setPaymentCategory("online")}
                    className={`flex flex-col items-center justify-center gap-2.5 p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                      paymentCategory === "online"
                        ? "border-[#FF274B] bg-[#FF274B]/[0.05] dark:bg-[#FF274B]/10 text-[#FF274B] shadow-md shadow-[#FF274B]/10 ring-1 ring-[#FF274B]"
                        : "border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                    }`}
                  >
                    <OnlineTransferIcon size={32} />
                    <span className="text-xs font-black">دفع أونلاين (تحويل)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentCategory("cash")}
                    className={`flex flex-col items-center justify-center gap-2.5 p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                      paymentCategory === "cash"
                        ? "border-[#FF274B] bg-[#FF274B]/[0.05] dark:bg-[#FF274B]/10 text-[#FF274B] shadow-md shadow-[#FF274B]/10 ring-1 ring-[#FF274B]"
                        : "border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                    }`}
                  >
                    <CashOnDeliveryIcon size={32} />
                    <span className="text-xs font-black">الدفع عند الاستلام</span>
                  </button>
                </div>

                {/* Cash confirmation */}
                <AnimatePresence mode="wait">
                  {paymentCategory === "cash" && (
                    <motion.div
                      key="cash"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="flex items-center gap-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl p-4 text-emerald-800 dark:text-emerald-300">
                        <CheckCircle2 size={20} className="text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                        <p className="text-xs font-semibold">
                          سيتم الدفع نقداً عند استلام الطلب. المندوب سيتواصل معك قبل التوصيل مباشرة.
                        </p>
                      </div>
                    </motion.div>
                  )}

                  {/* Online payment sub-options */}
                  {paymentCategory === "online" && (
                    <motion.div
                      key="online"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden space-y-4"
                    >
                      {/* Vodafone / InstaPay choice */}
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setOnlineMethod("vodafone_cash")}
                          className={`flex items-center gap-3 p-3.5 rounded-2xl border-2 transition-all cursor-pointer ${
                            onlineMethod === "vodafone_cash"
                              ? "border-red-500 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 shadow-sm"
                              : "border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 text-zinc-700 dark:text-zinc-300"
                          }`}
                        >
                          <VodafoneCashIcon size={32} />
                          <div className="text-right flex-1 min-w-0">
                            <p className="text-xs font-black">فودافون كاش</p>
                            <p className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400 dir-ltr inline-block" dir="ltr">{vodafoneNumber}</p>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => setOnlineMethod("instapay")}
                          className={`flex items-center gap-3 p-3.5 rounded-2xl border-2 transition-all cursor-pointer ${
                            onlineMethod === "instapay"
                              ? "border-purple-500 bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300 shadow-sm"
                              : "border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 text-zinc-700 dark:text-zinc-300"
                          }`}
                        >
                          <InstaPayIcon size={32} />
                          <div className="text-right flex-1 min-w-0">
                            <p className="text-xs font-black">انستاباي</p>
                            <p className="text-[10px] font-mono text-purple-600 dark:text-purple-300 font-bold dir-ltr inline-block truncate" dir="ltr">{instapayUsername}</p>
                          </div>
                        </button>
                      </div>

                      {/* Transfer instructions */}
                      <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-2xl p-4 space-y-1.5 text-amber-900 dark:text-amber-300">
                        <p className="text-xs font-black flex items-center gap-1.5">
                          <ChevronRight size={14} className="text-amber-600 dark:text-amber-400" />
                          خطوات التحويل:
                        </p>
                        <ol className="text-xs space-y-1 list-decimal list-inside font-medium text-amber-800 dark:text-amber-300">
                          <li>حوّل المبلغ ({formatPrice(finalOrderTotal)}) على: <span className="font-black font-mono dir-ltr inline-block px-1 text-[#FF274B]" dir="ltr">{onlineNumberDisplay}</span></li>
                          <li>اكتب رقم هاتفك الذي قمت بالتحويل منه</li>
                          <li>ارفع صورة إيصال التحويل للتأكيد</li>
                        </ol>
                      </div>

                      {/* Transfer phone number */}
                      <Input
                        id="transferPhone"
                        label="رقم الهاتف اللي حوّلت منه *"
                        placeholder="01012345678"
                        error={errors.transferPhone?.message}
                        {...register("transferPhone")}
                      />

                      {/* Screenshot upload */}
                      <div>
                        <label className="block text-xs font-extrabold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider mb-2">
                          صورة إيصال التحويل *
                        </label>
                        {!screenshotPreview ? (
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full border-2 border-dashed border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl p-6 flex flex-col items-center gap-3 hover:border-[#FF274B] dark:hover:border-[#FF274B] transition-colors cursor-pointer text-zinc-600 dark:text-zinc-400"
                          >
                            <Upload size={24} className="text-[#FF274B]" />
                            <span className="text-xs font-extrabold text-zinc-800 dark:text-zinc-200">
                              اضغط هنا لرفع صورة الإيصال
                            </span>
                            <span className="text-[10px] text-zinc-400">PNG, JPG, WEBP</span>
                          </button>
                        ) : (
                          <div className="relative">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={screenshotPreview}
                              alt="إيصال التحويل"
                              className="w-full max-h-52 object-contain rounded-2xl border border-zinc-200 dark:border-zinc-700"
                            />
                            <button
                              type="button"
                              onClick={removeScreenshot}
                              className="absolute top-2 left-2 bg-red-500 text-white rounded-full p-1.5 shadow-lg hover:scale-110 transition-transform cursor-pointer"
                            >
                              <X size={14} />
                            </button>
                            <div className="mt-2 flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                              <CheckCircle2 size={15} />
                              <span className="text-xs font-extrabold">تم اختيار وتأكيد صورة الإيصال</span>
                            </div>
                          </div>
                        )}
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleScreenshotChange}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.section>
            </div>

            {/* ── RIGHT: Order Summary ── */}
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-[#0E0E10] rounded-3xl p-6 sm:p-8 sticky top-24 border border-zinc-200/80 dark:border-white/[0.08] shadow-2xl shadow-zinc-200/40 dark:shadow-black/60 space-y-6 text-zinc-900 dark:text-white transition-all">
                <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800/80 pb-4">
                  <div className="flex items-center gap-2">
                    <ShoppingBag size={20} className="text-[#FF274B]" />
                    <h2 className="font-black text-lg text-zinc-900 dark:text-white">ملخص الطلب</h2>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 font-bold">
                    {items.length} {items.length === 1 ? "منتج" : "منتجات"}
                  </span>
                </div>

                {/* Items */}
                <div className="space-y-3 max-h-72 overflow-y-auto pl-1 scrollbar-none">
                  {items.map((item, idx) => {
                    const pId = item.product?.id || `item-${idx}`;
                    const pSize = item.selectedSize || "قياسي";
                    const pColorHex = item.selectedColor?.hex || "#000000";
                    const pColorName = item.selectedColor?.name || "افتراضي";
                    const pImage = item.selectedColor?.image || item.product?.mainImage || "/placeholder.jpg";
                    const pName = item.product?.name || "منتج ديب ستور";
                    const price = item.product?.salePrice ?? item.product?.price ?? 0;
                    const qty = item.quantity || 1;
                    const key = `${pId}-${pSize}-${pColorHex}`;

                    return (
                      <div key={key} className="flex items-center gap-3.5 p-3 bg-zinc-50 dark:bg-zinc-900/70 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all">
                        <div className="w-14 h-14 rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 shrink-0 border border-zinc-200 dark:border-zinc-700/80">
                          <Image
                            src={pImage}
                            alt={pName}
                            width={56}
                            height={56}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-black text-zinc-900 dark:text-zinc-100 truncate">{pName}</p>
                          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium mt-0.5">
                            {pColorName} / {pSize} × {qty}
                          </p>
                        </div>
                        <span className="text-xs font-black text-[#FF274B]">{formatPrice(price * qty)}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Totals */}
                <div className="border-t border-zinc-100 dark:border-zinc-800/80 pt-4 space-y-3 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-500 dark:text-zinc-400 font-semibold">المجموع الفرعي</span>
                    <span className="font-bold text-zinc-900 dark:text-zinc-100">{formatPrice(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-500 dark:text-zinc-400 font-semibold flex items-center gap-1.5">
                      <Truck size={14} className="text-[#FF274B]" />
                      الشحن ({selectedGovernorate || "—"})
                    </span>
                    <span className="font-bold text-[#FF274B]">{formatPrice(currentShippingCost)}</span>
                  </div>
                </div>

                <div className="border-t border-zinc-100 dark:border-zinc-800/80 pt-4 flex justify-between items-center">
                  <span className="text-base font-black text-zinc-900 dark:text-white">الإجمالي النهائي</span>
                  <span className="text-xl font-black text-[#FF274B] font-mono tracking-tight">{formatPrice(finalOrderTotal)}</span>
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <TruckSubmitButton
                    isSubmitting={submitting || uploadingScreenshot}
                    isSuccess={orderSuccess}
                    disabled={!isFormValid}
                    totalText={formatPrice(finalOrderTotal)}
                  />
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
