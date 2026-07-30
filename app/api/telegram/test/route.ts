import { NextResponse } from "next/server";
import { sendTelegramNotification } from "@/lib/telegram";

export async function POST(req: Request) {
  try {
    const { botToken, chatId } = await req.json();

    if (!botToken || !chatId) {
      return NextResponse.json(
        { success: false, error: "يرجى كتابة Bot Token و Chat ID أولاً" },
        { status: 400 }
      );
    }

    const testMessage = `🤖 <b>اختبار ربط بوت إشعارات DEEB STORE!</b> 🐺
━━━━━━━━━━━━━━━━━━━
✅ <b>تم الاتصال وتفعيل الإشعارات بنجاح!</b>

سيتلقى هذا الشات جميع الطلبات الجديدة المباشرة فور إتمامها على المتجر مع كافة التفاصيل والأسعار وأكواد الـ SKU.

⏰ <b>التاريخ:</b> ${new Date().toLocaleString("ar-EG")}`;

    const result = await sendTelegramNotification(testMessage, botToken, chatId);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "حدث خطأ غير متوقع" },
      { status: 500 }
    );
  }
}
