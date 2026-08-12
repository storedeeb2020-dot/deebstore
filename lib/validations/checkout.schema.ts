import { z } from "zod";

const egyptPhone = z
  .string()
  .regex(/^(\\+20|0)?1[0-2,5]{1}[0-9]{8}$/, "أدخل رقم هاتف مصري صحيح");

export const checkoutSchema = z
  .object({
    customerName: z.string().min(2, "الاسم يجب أن يكون حرفين على الأقل"),
    phone: egyptPhone,
    whatsappPhone: z
      .string()
      .optional()
      .refine(
        (val) => !val || /^(\+20|0)?1[0-2,5]{1}[0-9]{8}$/.test(val),
        "أدخل رقم واتساب مصري صحيح"
      ),
    governorate: z.string().min(2, "اختر محافظتك"),
    city: z.string().min(2, "المنطقة / الحي مطلوب"),
    address: z.string().min(8, "أدخل العنوان بالتفصيل"),
    notes: z.string().optional(),
    paymentMethod: z.enum(["cash_on_delivery", "vodafone_cash", "instapay"], {
      errorMap: () => ({ message: "اختر طريقة الدفع" }),
    }),
    transferPhone: z.string().optional(),
    transferScreenshot: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    // If online payment, transfer phone is required
    if (
      (data.paymentMethod === "vodafone_cash" ||
        data.paymentMethod === "instapay") &&
      !data.transferPhone
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "أدخل رقم الهاتف الذي حوّلت منه",
        path: ["transferPhone"],
      });
    }
  });

export type CheckoutFormData = z.infer<typeof checkoutSchema>;
