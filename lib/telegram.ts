import { getSiteSettings } from "./firebase/firestore";
import { formatPrice } from "./utils";
import type { Order } from "@/types/order";

/**
 * Formats an order object into a luxury HTML message for Telegram Bot API
 */
export function formatOrderTelegramMessage(order: Order): string {
  const shortId = (order.id || "").slice(0, 8).toUpperCase();
  const dateStr = order.createdAt
    ? new Date(
        typeof (order.createdAt as any)?.toDate === "function"
          ? (order.createdAt as any).toDate()
          : (order.createdAt as any)
      ).toLocaleString("ar-EG", { timeZone: "Africa/Cairo" })
    : new Date().toLocaleString("ar-EG", { timeZone: "Africa/Cairo" });

  const rawPhone = order.phone || order.customerPhone || "";
  const waPhone = (order.whatsappPhone || rawPhone).replace(/[^0-9]/g, "");
  const formattedWa = waPhone.startsWith("0") ? `20${waPhone.slice(1)}` : waPhone;
  const whatsappUrl = `https://wa.me/${formattedWa}`;

  // Payment method label
  let paymentLabel = "دفع عند الاستلام (COD) 💵";
  if (order.paymentMethod === "vodafone_cash") {
    paymentLabel = "فودافون كاش 📱";
  } else if (order.paymentMethod === "instapay") {
    paymentLabel = "انستاباي 💳";
  }

  // Items list formatting
  const itemsList = order.items
    .map((item, idx) => {
      const skuText = item.sku ? ` <code>[${item.sku}]</code>` : "";
      const colorText = item.selectedColor?.name || "افتراضي";
      const sizeText = item.selectedSize || "قياسي";
      const itemTotal = formatPrice(item.price * item.quantity);

      return `  <b>${idx + 1}. ${item.productName}</b>${skuText}\n     • المقاس: ${sizeText} | اللون: ${colorText}\n     • العدد: ${item.quantity} × ${formatPrice(item.price)} = <b>${itemTotal}</b>`;
    })
    .join("\n\n");

  let transferSection = "";
  if (order.paymentMethod !== "cash_on_delivery") {
    transferSection = `\n📱 <b>رقم المحفظة المُحوّل منها:</b> <code>${order.transferPhone || "غير محدد"}</code>`;
    if (order.transferScreenshot) {
      transferSection += `\n🖼️ <b>إيصال التحويل:</b> <a href="${order.transferScreenshot}">عرض الإيصال المرفق</a>`;
    }
  }

  let notesSection = "";
  if (order.notes && order.notes.trim()) {
    notesSection = `\n📝 <b>ملاحظات العميل:</b> <i>${order.notes.trim()}</i>`;
  }

  return `🚨 <b>طلب جديد في DEEB STORE!</b> 🚨
━━━━━━━━━━━━━━━━━━━
🆔 <b>رقم الطلب:</b> <code>#${shortId}</code>
👤 <b>اسم العميل:</b> ${order.customerName}
📱 <b>الهاتف:</b> <code>${rawPhone}</code> (<a href="${whatsappUrl}">تواصل عبر واتساب</a>)
📍 <b>المحافظة:</b> ${order.governorate || "غير محدد"} (${order.city || ""})
🏠 <b>العنوان:</b> ${order.address}

🛍️ <b>تفاصيل المنتجات:</b>
${itemsList}

💳 <b>طريقة الدفع:</b> ${paymentLabel}${transferSection}${notesSection}

🚚 <b>تكلفة الشحن:</b> ${formatPrice(order.shippingCost || 0)}
💰 <b>الإجمالي النهائي:</b> <b>${formatPrice(order.total)}</b>
━━━━━━━━━━━━━━━━━━━
⏰ <b>التاريخ:</b> ${dateStr}`;
}

/**
 * Sends a raw text message to a specified Telegram Chat via Bot API
 */
export async function sendTelegramNotification(
  message: string,
  botToken: string,
  chatId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const cleanToken = botToken.trim();
    if (!cleanToken || !chatId) {
      return { success: false, error: "Token أو Chat ID غير مكتمل" };
    }

    // Support multiple Chat IDs split by commas, semicolons, or whitespace
    const targetChatIds = chatId
      .split(/[\s,;]+/)
      .map((id) => id.trim())
      .filter(Boolean);

    if (targetChatIds.length === 0) {
      return { success: false, error: "لم يتم تحديد أي Chat ID صالحة" };
    }

    const url = `https://api.telegram.org/bot${cleanToken}/sendMessage`;
    const sendPromises = targetChatIds.map(async (targetId) => {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: targetId,
          text: message,
          parse_mode: "HTML",
          disable_web_page_preview: false,
        }),
      });
      const data = await response.json();
      return { ok: response.ok && data.ok, description: data.description };
    });

    const results = await Promise.all(sendPromises);
    const failed = results.find((r) => !r.ok);

    if (failed) {
      return { success: false, error: failed.description || "فشل الإرسال لبعض الحسابات المصرح لها" };
    }

    return { success: true };
  } catch (err: any) {
    console.error("Telegram API fetch error:", err);
    return { success: false, error: err?.message || "خطأ في الشبكة أثناء الاتصال بتليجرام" };
  }
}

/**
 * Automatically checks site settings and triggers order alert if Telegram is enabled
 */
export async function sendOrderTelegramAlert(order: Order): Promise<boolean> {
  try {
    const settings = await getSiteSettings();
    if (
      !settings ||
      !settings.telegramEnabled ||
      !settings.telegramBotToken ||
      !settings.telegramChatId
    ) {
      return false;
    }

    const message = formatOrderTelegramMessage(order);
    const result = await sendTelegramNotification(
      message,
      settings.telegramBotToken,
      settings.telegramChatId
    );

    return result.success;
  } catch (err) {
    console.error("Failed to send automatic Telegram order alert:", err);
    return false;
  }
}
