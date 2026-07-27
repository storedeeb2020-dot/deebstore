"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import { signInAdmin } from "@/lib/firebase/auth";
import { toast } from "sonner";

const loginSchema = z.object({
  email: z.string().email("الرجاء إدخال بريد إلكتروني صحيح"),
  password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function AdminLoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    try {
      await signInAdmin(data.email, data.password);
      toast.success("مرحباً بك في لوحة تحكم ديب ستور 🐺");
      router.push("/admin");
    } catch (err: any) {
      console.error("Admin Login Error:", err);

      let message = "بيانات الدخول غير صحيحة";
      if (err?.code === "auth/unauthorized-domain") {
        message = "الدومين غير مصرح له في Firebase Console (Authorized Domains).";
      } else if (err?.code === "auth/invalid-credential" || err?.code === "auth/user-not-found" || err?.code === "auth/wrong-password") {
        message = "البريد الإلكتروني أو كلمة المرور غير صحيحة.";
      } else if (err instanceof Error && err.message) {
        message = err.message;
      }
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 font-sans dir-rtl text-white" dir="rtl">
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Logo */}
        <div className="text-center mb-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="DEEB STORE Logo" className="h-14 w-auto mx-auto object-contain drop-shadow-[0_0_15px_rgba(212,175,55,0.6)] mb-3" />
          <h1 className="text-2xl font-black text-amber-400 tracking-wider">DEEB STORE 🐺</h1>
          <p className="text-zinc-400 text-xs mt-1">سجّل دخولك للتحكم الكامل في المتجر الإداري</p>
        </div>

        {/* Card */}
        <div className="bg-zinc-950 border border-zinc-800 text-white rounded-3xl p-8 shadow-2xl space-y-6">
          <h2 className="text-base font-extrabold text-amber-400 text-center border-b border-zinc-900 pb-3">
            تسجيل دخول المشرف العام
          </h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                البريد الإلكتروني للمشرف
              </label>
              <input
                type="email"
                placeholder="storedeeb2020@gmail.com"
                className="w-full px-4 py-3 border border-zinc-800 rounded-xl text-xs focus:outline-none focus:border-amber-500 bg-zinc-900 text-white"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                كلمة المرور
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 border border-zinc-800 rounded-xl text-xs focus:outline-none focus:border-amber-500 bg-zinc-900 text-white pl-10"
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-400 text-black font-black text-sm rounded-xl hover:scale-105 transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-4 cursor-pointer shadow-lg shadow-amber-500/20"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                "تسجيل الدخول الآن 🐺"
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
