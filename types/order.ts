import { Timestamp } from "firebase/firestore";

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "shipping"
  | "delivered"
  | "cancelled";

export type PaymentMethod = "cash_on_delivery" | "vodafone_cash" | "instapay";

export interface OrderItem {
  productId: string;
  productName: string;
  productImage: string;
  price: number;
  quantity: number;
  selectedSize: string;
  selectedColor: {
    name: string;
    hex: string;
    image: string;
  };
}

export interface Order {
  id: string;
  customerName: string;
  phone: string;
  customerPhone?: string;
  whatsappPhone?: string;
  governorate?: string;
  city: string;
  address: string;
  notes?: string;
  paymentMethod: PaymentMethod;
  transferPhone?: string;       // رقم اللي حوّل منه (للدفع الأونلاين)
  transferScreenshot?: string;  // Cloudinary URL لصورة إيصال التحويل
  items: OrderItem[];
  subtotal: number;
  shippingCost?: number;
  total: number;
  status: OrderStatus;
  createdAt: Timestamp | Date;
}

export interface CreateOrderInput {
  customerName: string;
  phone: string;
  whatsappPhone?: string;
  governorate?: string;
  city: string;
  address: string;
  notes?: string;
  paymentMethod: PaymentMethod;
  transferPhone?: string;
  transferScreenshot?: string;
  items: OrderItem[];
  subtotal: number;
  shippingCost?: number;
  total: number;
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "في الانتظار",
  confirmed: "مؤكد",
  shipping: "جارٍ الشحن",
  delivered: "تم التسليم",
  cancelled: "ملغي",
};

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  shipping: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cash_on_delivery: "🚪 الدفع عند الاستلام",
  vodafone_cash: "📱 فودافون كاش",
  instapay: "💳 انستاباي",
};
