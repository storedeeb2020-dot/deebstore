import React from "react";

/**
 * 1. Official Vodafone Cash Logo Image (User provided official logo)
 */
export function VodafoneCashIcon({ className = "w-8 h-8", size = 32 }: { className?: string; size?: number }) {
  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-xl overflow-hidden border border-red-500/30 shadow-md shadow-red-600/30 shrink-0 bg-[#E60000] ${className}`}
      style={{ width: size, height: size }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/vodafone-cash-official.jpg"
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).src = "/الدفع عن طريق فودافون كاش من مصر.jpg";
        }}
        alt="فودافون كاش"
        className="w-full h-full object-cover"
      />
    </div>
  );
}

/**
 * 2. Official InstaPay Egypt Logo Image (User provided official logo)
 */
export function InstaPayIcon({ className = "w-8 h-8", size = 32 }: { className?: string; size?: number }) {
  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-xl overflow-hidden border border-purple-300 dark:border-purple-800/50 shadow-md shadow-purple-950/40 shrink-0 bg-white ${className}`}
      style={{ width: size, height: size }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/instapay-official.jpg"
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).src = "/انستا باي.jpg";
        }}
        alt="انستاباي InstaPay"
        className="w-full h-full object-cover"
      />
    </div>
  );
}

/**
 * 3. Official Cash on Delivery Icon (User provided image)
 */
export function CashOnDeliveryIcon({ className = "w-8 h-8", size = 32 }: { className?: string; size?: number }) {
  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-xl overflow-hidden border border-emerald-300 dark:border-emerald-800/50 shadow-md shadow-emerald-700/30 shrink-0 bg-white ${className}`}
      style={{ width: size, height: size }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/cod-official.jpg"
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).src = "/دفع عند استلام.jpg";
        }}
        alt="الدفع عند الاستلام"
        className="w-full h-full object-cover"
      />
    </div>
  );
}

/**
 * 4. Official Online Payment Transfer Icon (User provided image)
 */
export function OnlineTransferIcon({ className = "w-8 h-8", size = 32 }: { className?: string; size?: number }) {
  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-xl overflow-hidden border border-amber-300 dark:border-amber-800/50 shadow-md shadow-amber-600/30 shrink-0 bg-white ${className}`}
      style={{ width: size, height: size }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/online-payment-official.jpg"
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).src = "/دفع اون لاين. Mobile banking sign business concept_";
        }}
        alt="دفع أونلاين"
        className="w-full h-full object-cover"
      />
    </div>
  );
}

/**
 * 5. Official Payment Header Shield Icon
 */
export function PaymentHeaderIcon({ className = "w-10 h-10", size = 40 }: { className?: string; size?: number }) {
  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-2xl bg-[#FF274B]/15 border border-[#FF274B]/40 p-2 shadow-md shadow-[#FF274B]/20 shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        {/* Security Shield */}
        <path
          d="M50 12L82 23V46C82 65.5 69.2 83 50 88C30.8 83 18 65.5 18 46V23L50 12Z"
          fill="#FF274B"
          fillOpacity="0.25"
          stroke="#FF274B"
          strokeWidth="5"
          strokeLinejoin="round"
        />
        {/* Verified Credit Card */}
        <rect x="33" y="38" width="34" height="24" rx="4" fill="#FF274B" stroke="white" strokeWidth="2" />
        <rect x="33" y="44" width="34" height="6" fill="white" />
        <circle cx="58" cy="55" r="3.5" fill="#F59E0B" />
      </svg>
    </div>
  );
}
