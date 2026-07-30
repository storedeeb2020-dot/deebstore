import React from "react";

// 1. Vodafone Cash Official Branding Icon
export function VodafoneCashIcon({ className = "w-8 h-8", size = 32 }: { className?: string; size?: number }) {
  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-xl bg-gradient-to-br from-[#E60000] to-[#B30000] p-1.5 shadow-md shadow-red-600/30 overflow-hidden shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        {/* Vodafone Speech Mark Logo */}
        <path
          d="M20 5C11.716 5 5 11.716 5 20C5 24.58 7.06 28.68 10.3 31.4L8 35L13.1 33.1C15.2 34.3 17.5 35 20 35C28.284 35 35 28.284 35 20C35 11.716 28.284 5 20 5Z"
          fill="white"
          fillOpacity="0.15"
        />
        {/* Speech droplet shape */}
        <path
          d="M20 11C15.03 11 11 15.03 11 20C11 24.97 15.03 29 20 29C24.97 29 29 24.97 29 20C29 15.03 24.97 11 20 11ZM20 26.5C16.41 26.5 13.5 23.59 13.5 20C13.5 16.41 16.41 13.5 20 13.5C23.59 13.5 26.5 16.41 26.5 20C26.5 23.59 23.59 26.5 20 26.5Z"
          fill="white"
        />
        <path
          d="M22 15C20.34 15 19 16.34 19 18C19 18.83 19.34 19.58 19.89 20.12L16.03 23.98C15.42 23.37 15.05 22.53 15.05 21.6C15.05 19.74 16.56 18.23 18.42 18.23C18.86 18.23 19.28 18.32 19.67 18.47L21.1 17.04C20.27 16.59 19.37 16.36 18.42 16.36C15.53 16.36 13.18 18.71 13.18 21.6C13.18 24.49 15.53 26.84 18.42 26.84C21.31 26.84 23.66 24.49 23.66 21.6C23.66 20.7 23.43 19.83 23.01 19.04L24.44 17.61C25.07 18.83 25.53 20.18 25.53 21.6C25.53 25.53 22.35 28.71 18.42 28.71C14.49 28.71 11.31 25.53 11.31 21.6C11.31 17.67 14.49 14.49 18.42 14.49C19.63 14.49 20.84 14.79 22 15.39V15Z"
          fill="white"
        />
        {/* "CASH" text banner */}
        <rect x="11" y="24" width="18" height="7" rx="2" fill="#E60000" stroke="white" strokeWidth="0.8" />
        <text x="20" y="29.2" textAnchor="middle" fill="white" fontSize="5.5" fontWeight="900" fontFamily="sans-serif">
          CASH
        </text>
      </svg>
    </div>
  );
}

// 2. InstaPay Official Branding Icon (Egypt EBC InstaPay)
export function InstaPayIcon({ className = "w-8 h-8", size = 32 }: { className?: string; size?: number }) {
  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-xl bg-gradient-to-br from-[#3B0764] via-[#581C87] to-[#7E22CE] p-1.5 shadow-md shadow-purple-900/40 overflow-hidden shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        {/* InstaPay Dual Arrow Logo */}
        <path
          d="M9 22.5L19 12.5L29 22.5"
          stroke="#06B6D4"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M11 17.5L21 27.5L31 17.5"
          stroke="white"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* InstaPay glowing cyan center node */}
        <circle cx="20" cy="20" r="3.5" fill="#22D3EE" />
      </svg>
    </div>
  );
}

// 3. Cash on Delivery (الدفع عند الاستلام) Official Visual Icon
export function CashOnDeliveryIcon({ className = "w-8 h-8", size = 32 }: { className?: string; size?: number }) {
  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-xl bg-gradient-to-br from-[#065F46] via-[#047857] to-[#10B981] p-1.5 shadow-md shadow-emerald-700/30 overflow-hidden shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        {/* Banknote */}
        <rect x="5" y="10" width="30" height="20" rx="4" fill="white" fillOpacity="0.25" stroke="white" strokeWidth="1.8" />
        <rect x="8" y="13" width="24" height="14" rx="2" stroke="white" strokeWidth="1" strokeDasharray="2 1.5" />
        {/* Currency emblem */}
        <circle cx="20" cy="20" r="4.5" fill="white" />
        <text x="20" y="22.2" textAnchor="middle" fill="#047857" fontSize="6.5" fontWeight="900" fontFamily="sans-serif">
          EGP
        </text>
        {/* Hand cash wave accents */}
        <path d="M10 26L13 23M30 26L27 23" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    </div>
  );
}

// 4. Online Payment Transfer (دفع أونلاين - تحويل) Official Visual Icon
export function OnlineTransferIcon({ className = "w-8 h-8", size = 32 }: { className?: string; size?: number }) {
  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-xl bg-gradient-to-br from-[#FF274B] via-[#E11D48] to-[#F59E0B] p-1.5 shadow-md shadow-red-500/30 overflow-hidden shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        {/* Phone mockup */}
        <rect x="6" y="10" width="13" height="22" rx="3" fill="white" fillOpacity="0.2" stroke="white" strokeWidth="1.5" />
        <circle cx="12.5" cy="28.5" r="1" fill="white" />
        {/* Credit Card mockup */}
        <rect x="18" y="8" width="16" height="11" rx="2.5" fill="white" />
        <rect x="18" y="11" width="16" height="3" fill="#E11D48" />
        <rect x="20" y="15" width="4" height="2" rx="0.5" fill="#F59E0B" />
        {/* Instant Transfer glowing Arrow */}
        <path
          d="M13 18C13 18 17 23 23 22M23 22L20 20M23 22L20 24"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

// 5. Payment Section Header Icon (طريقة الدفع)
export function PaymentHeaderIcon({ className = "w-10 h-10", size = 40 }: { className?: string; size?: number }) {
  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-2xl bg-gradient-to-br from-[#FF274B]/20 via-[#FF274B]/10 to-amber-500/10 border border-[#FF274B]/30 p-2 shadow-md shadow-[#FF274B]/10 overflow-hidden shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        {/* Security Shield */}
        <path
          d="M20 5L32 9.5V19C32 26.8 26.9 33.8 20 35.5C13.1 33.8 8 26.8 8 19V9.5L20 5Z"
          fill="#FF274B"
          fillOpacity="0.15"
          stroke="#FF274B"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        {/* Verified Credit Card */}
        <rect x="13" y="15" width="14" height="10" rx="2" fill="#FF274B" />
        <rect x="13" y="17.5" width="14" height="2.5" fill="white" fillOpacity="0.7" />
        <circle cx="23" cy="22" r="1.5" fill="#F59E0B" />
      </svg>
    </div>
  );
}
