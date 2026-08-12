"use client";

import { useEffect } from "react";
import { createSystemErrorLog } from "@/lib/firebase/firestore";

export function ErrorTrackerProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Print System Logger Initialized banner in Console
    console.log(
      "%c 🚀 NXT Store Error Logger Active & Reporting ",
      "background: #000; color: #00ffcc; font-weight: bold; font-size: 11px; padding: 4px 8px; border-radius: 6px;"
    );

    const handleGlobalError = (event: ErrorEvent) => {
      const msg = event.message || "";
      if (
        msg.includes("permission-denied") ||
        msg.includes("insufficient permissions") ||
        msg.includes("Missing or insufficient permissions")
      ) {
        return;
      }

      const stack = event.error?.stack || `${event.filename}:${event.lineno}:${event.colno}`;

      // 1. Detailed Console Output for Developers & Debugging
      console.group(
        "%c ❌ [NXT SYSTEM ERROR] ",
        "background: #dc2626; color: #ffffff; font-weight: bold; font-size: 11px; padding: 3px 6px; border-radius: 4px;"
      );
      console.error("Message:", msg);
      console.info("Location:", window.location.href);
      if (stack) console.error("Stack:", stack);
      console.groupEnd();

      // 2. Save to Firestore Error Logs
      createSystemErrorLog({
        message: msg || "Global Unhandled Error",
        stack,
        url: window.location.href,
        context: "Global Unhandled Error",
      }).catch(() => {});
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      const message =
        typeof reason === "string"
          ? reason
          : reason?.message || "Unhandled Promise Rejection";

      if (
        message.includes("permission-denied") ||
        message.includes("insufficient permissions") ||
        message.includes("Missing or insufficient permissions") ||
        reason?.code === "permission-denied"
      ) {
        return;
      }

      const stack = reason?.stack || "";

      // 1. Detailed Console Output for Promise Rejections
      console.group(
        "%c ⚠️ [NXT UNHANDLED REJECTION] ",
        "background: #f59e0b; color: #000000; font-weight: bold; font-size: 11px; padding: 3px 6px; border-radius: 4px;"
      );
      console.error("Reason:", message);
      console.info("Location:", window.location.href);
      if (stack) console.error("Stack:", stack);
      console.groupEnd();

      // 2. Save to Firestore Error Logs
      createSystemErrorLog({
        message,
        stack,
        url: window.location.href,
        context: "Unhandled Promise Rejection",
      }).catch(() => {});
    };

    window.addEventListener("error", handleGlobalError);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    return () => {
      window.removeEventListener("error", handleGlobalError);
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
    };
  }, []);

  return <>{children}</>;
}
