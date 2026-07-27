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
} from "lucide-react";
import { useCart } from "@/features/cart/CartProvider";
import { createOrder, getShippingRates, getSiteSettings } from "@/lib/firebase/firestore";
import { formatPrice } from "@/lib/utils";
import { checkoutSchema, type CheckoutFormData } from "@/lib/validations/checkout.schema";
import { Input } from "@/components/ui/Input";
import { Spinner } from "@/components/ui/Spinner";
import type { PaymentMethod, OrderItem, CreateOrderInput } from "@/types/order";
import { TruckSubmitButton } from "@/components/checkout/TruckSubmitButton";
import type { GovernorateRate } from "@/constants/governorates";

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
    // Load shipping rates
    getShippingRates()
      .then((data) => {
        setShippingRates(data);
        if (data.length > 0) {
          const def = data.find((r) => r.active) || data[0];
          setValue("governorate", def.nameAr);
        }
      })
      .catch(console.error);
    // Load site settings for payment numbers
    getSiteSettings()
      .then((s) => {
        if (s?.storePhone) setVodafoneNumber(s.storePhone);
        if (s?.instapayUsername) setInstapayUsername(s.instapayUsername);
        if (s?.onlinePaymentEnabled !== undefined) {
          setOnlinePaymentEnabled(s.onlinePaymentEnabled);
          if (!s.onlinePaymentEnabled) {
            setPaymentCategory("cash");
          }
        }
      })
      .catch(() => {});
  }, [items, router, setValue]);

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
      <div className="pt-20 min-h-screen flex items-center justify-center">
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
    <div className="pt-20 min-h-screen font-sans" dir="rtl">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.h1
          className="text-3xl font-black tracking-tight mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          إتمام الطلب
        </motion.h1>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
            {/* ── LEFT: Form ── */}
            <div className="lg:col-span-3 space-y-6">

              {/* ── Section 1: Customer Info ── */}
              <motion.section
                className="bg-zinc-900/90 rounded-2xl p-6 sm:p-8 space-y-5 border border-amber-500/20 shadow-xl shadow-black/40 text-zinc-100"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
              >
                <h2 className="font-bold text-lg flex items-center gap-2 text-amber-400">
                  <MapPin size={20} className="text-amber-400" />
                  بيانات الشحن
                </h2>

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
                    <label className="block text-xs font-bold text-amber-300 uppercase tracking-wider mb-1.5">
                      المحافظة *
                    </label>
                    <select
                      {...register("governorate")}
                      className="w-full px-4 py-3 border border-amber-500/30 bg-zinc-800 text-amber-100 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer shadow-sm"
                    >
                      {shippingRates.map((rate) => (
                        <option key={rate.id} value={rate.nameAr} className="bg-zinc-900 text-amber-100">
                          {rate.nameAr} — شحن {rate.price} ج.م
                        </option>
                      ))}
                    </select>
                    {errors.governorate && (
                      <p className="text-red-400 text-xs font-bold mt-1.5">{errors.governorate.message}</p>
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
                  <label className="block text-xs font-bold text-amber-300 uppercase tracking-wider mb-1.5">
                    العنوان بالتفصيل *
                  </label>
                  <textarea
                    className="w-full px-4 py-3 border border-amber-500/30 bg-zinc-800 text-amber-100 placeholder:text-zinc-500 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none shadow-sm"
                    rows={3}
                    placeholder="الشارع، رقم العمارة، الدور، رقم الشقة..."
                    {...register("address")}
                  />
                  {errors.address && (
                    <p className="text-red-400 text-xs font-bold mt-1.5">{errors.address.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-amber-300 uppercase tracking-wider mb-1.5">
                    ملاحظات (اختياري)
                  </label>
                  <textarea
                    className="w-full px-4 py-3 border border-amber-500/30 bg-zinc-800 text-amber-100 placeholder:text-zinc-500 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none shadow-sm"
                    rows={2}
                    placeholder="أي تعليمات للمندوب..."
                    {...register("notes")}
                  />
                </div>
              </motion.section>

              {/* ── Section 2: Payment Method ── */}
              <motion.section
                className="bg-zinc-900/90 rounded-2xl p-6 sm:p-8 border border-amber-500/20 shadow-xl shadow-black/40 space-y-5 text-zinc-100"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12 }}
              >
                <h2 className="font-bold text-lg flex items-center gap-2 text-amber-400">
                  💳 طريقة الدفع
                </h2>

                {/* Category: Cash or Online */}
                <div className={`grid ${onlinePaymentEnabled ? "grid-cols-2" : "grid-cols-1"} gap-3`}>
                  <button
                    type="button"
                    onClick={() => setPaymentCategory("cash")}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                      paymentCategory === "cash"
                        ? "border-amber-400 bg-amber-500/10 text-amber-300 shadow-lg shadow-amber-500/10"
                        : "border-zinc-800 hover:border-zinc-700 bg-zinc-800/80 text-zinc-400"
                    }`}
                  >
                    <Banknote size={22} className={paymentCategory === "cash" ? "text-amber-400" : ""} />
                    <span className="text-xs font-black">الدفع عند الاستلام</span>
                  </button>

                  {onlinePaymentEnabled && (
                    <button
                      type="button"
                      onClick={() => setPaymentCategory("online")}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                        paymentCategory === "online"
                          ? "border-amber-400 bg-amber-500/10 text-amber-300 shadow-lg shadow-amber-500/10"
                          : "border-zinc-800 hover:border-zinc-700 bg-zinc-800/80 text-zinc-400"
                      }`}
                    >
                      <CreditCard size={22} className={paymentCategory === "online" ? "text-amber-400" : ""} />
                      <span className="text-xs font-black">دفع أونلاين</span>
                    </button>
                  )}
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
                      <div className="flex items-center gap-3 bg-amber-950/30 border border-amber-500/30 rounded-xl p-4">
                        <CheckCircle2 size={20} className="text-amber-400 flex-shrink-0" />
                        <p className="text-xs font-semibold text-amber-300">
                          سيتم الدفع نقداً عند استلام الطلب. المندوب سيتواصل معك قبل التوصيل.
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
                          className={`flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all ${
                            onlineMethod === "vodafone_cash"
                              ? "border-red-500 bg-red-50 dark:bg-red-950/30"
                              : "border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                          }`}
                        >
                          <Smartphone size={18} className={onlineMethod === "vodafone_cash" ? "text-red-500" : ""} />
                          <div className="text-right">
                            <p className="text-xs font-black">فودافون كاش</p>
                            <p className="text-[10px] text-gray-500 font-mono">{vodafoneNumber}</p>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => setOnlineMethod("instapay")}
                          className={`flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all ${
                            onlineMethod === "instapay"
                              ? "border-purple-500 bg-purple-50 dark:bg-purple-950/30"
                              : "border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                          }`}
                        >
                          <CreditCard size={18} className={onlineMethod === "instapay" ? "text-purple-500" : ""} />
                          <div className="text-right">
                            <p className="text-xs font-black">انستاباي</p>
                            <p className="text-[10px] text-gray-500 font-mono">{instapayUsername}</p>
                          </div>
                        </button>
                      </div>

                      {/* Transfer instructions */}
                      <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-4 space-y-1.5">
                        <p className="text-xs font-black text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                          <ChevronRight size={14} />
                          خطوات الدفع:
                        </p>
                        <ol className="text-xs text-amber-800 dark:text-amber-400 space-y-1 list-decimal list-inside font-medium">
                          <li>حوّل المبلغ ({formatPrice(finalOrderTotal)}) على: <span className="font-black font-mono">{onlineNumberDisplay}</span></li>
                          <li>اكتب رقم هاتفك اللي حوّلت منه</li>
                          <li>ارفع صورة إيصال التحويل</li>
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
                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
                          صورة إيصال التحويل *
                        </label>
                        {!screenshotPreview ? (
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full border-2 border-dashed border-gray-300 dark:border-zinc-600 rounded-xl p-6 flex flex-col items-center gap-3 hover:border-gray-400 transition-colors cursor-pointer"
                          >
                            <Upload size={24} className="text-gray-400" />
                            <span className="text-xs font-semibold text-gray-500">
                              اضغط لرفع صورة الإيصال
                            </span>
                            <span className="text-[10px] text-gray-400">PNG, JPG, WEBP</span>
                          </button>
                        ) : (
                          <div className="relative">
                            <img
                              src={screenshotPreview}
                              alt="إيصال التحويل"
                              className="w-full max-h-52 object-contain rounded-xl border border-gray-200 dark:border-zinc-700"
                            />
                            <button
                              type="button"
                              onClick={removeScreenshot}
                              className="absolute top-2 left-2 bg-red-500 text-white rounded-full p-1 shadow-lg hover:scale-110 transition-transform"
                            >
                              <X size={14} />
                            </button>
                            <div className="mt-2 flex items-center gap-1.5 text-green-600 dark:text-green-400">
                              <CheckCircle2 size={14} />
                              <span className="text-xs font-semibold">تم اختيار الصورة</span>
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
              <div className="bg-zinc-900/90 rounded-2xl p-6 sm:p-8 sticky top-24 border border-amber-500/20 shadow-2xl shadow-black/60 space-y-6 text-zinc-100">
                <h2 className="font-bold text-lg text-amber-400 border-b border-zinc-800 pb-3">ملخص الطلب</h2>

                {/* Items */}
                <div className="space-y-3 max-h-72 overflow-y-auto pl-1">
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
                      <div key={key} className="flex items-center gap-3 p-2.5 bg-zinc-800/80 rounded-xl border border-zinc-700/60">
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-zinc-900 flex-shrink-0 border border-zinc-700">
                          <Image
                            src={pImage}
                            alt={pName}
                            width={48}
                            height={48}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-zinc-200 truncate">{pName}</p>
                          <p className="text-[10px] text-amber-400/80 font-medium">
                            {pColorName} / {pSize} × {qty}
                          </p>
                        </div>
                        <span className="text-xs font-black text-amber-300">{formatPrice(price * qty)}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Totals */}
                <div className="border-t border-zinc-800 pt-4 space-y-2.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-zinc-400">المجموع الفرعي</span>
                    <span className="font-bold text-zinc-200">{formatPrice(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400 flex items-center gap-1">
                      <Truck size={13} className="text-amber-400" />
                      الشحن ({selectedGovernorate || "—"})
                    </span>
                    <span className="font-bold text-amber-400">{formatPrice(currentShippingCost)}</span>
                  </div>
                </div>

                <div className="border-t border-zinc-800 pt-4 flex justify-between font-black text-lg text-amber-300">
                  <span>الإجمالي</span>
                  <span className="text-amber-400 font-mono">{formatPrice(finalOrderTotal)}</span>
                </div>

                {/* Submit Button */}
                <div className="pt-1">
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
