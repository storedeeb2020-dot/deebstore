import React from "react";

// 1. Official Vodafone Cash Logo Icon (Vodafone speech mark on official red background)
export function VodafoneCashIcon({ className = "w-8 h-8", size = 32 }: { className?: string; size?: number }) {
  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-xl bg-[#E60000] p-1.5 shadow-md shadow-red-600/40 shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        {/* Vodafone Red Circle with iconic White Quote */}
        <circle cx="50" cy="50" r="45" fill="#E60000" />
        <path
          d="M50 15C30.67 15 15 30.67 15 50C15 69.33 30.67 85 50 85C69.33 85 85 69.33 85 50C85 30.67 69.33 15 50 15ZM50 73C37.3 73 27 62.7 27 50C27 37.3 37.3 27 50 27C62.7 27 73 37.3 73 50C73 62.7 62.7 73 50 73Z"
          fill="white"
        />
        {/* Inner Speech Mark Teardrop Quote */}
        <path
          d="M57 32C47.06 32 39 40.06 39 50C39 59.94 47.06 68 57 68C66.94 68 75 59.94 75 50C75 40.06 66.94 32 57 32ZM57 60C51.48 60 47 55.52 47 50C47 44.48 51.48 40 57 40C62.52 40 67 44.48 67 50C67 55.52 62.52 60 57 60Z"
          fill="white"
        />
        <path
          d="M57 40C51.48 40 47 44.48 47 50H39C39 40.06 47.06 32 57 32V40Z"
          fill="white"
        />
      </svg>
    </div>
  );
}

// 2. Official InstaPay Egypt Logo Icon (Official EBC InstaPay cyan/white dual arrow on purple)
export function InstaPayIcon({ className = "w-8 h-8", size = 32 }: { className?: string; size?: number }) {
  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-xl bg-gradient-to-br from-[#4A154B] via-[#3F0E40] to-[#2E0735] p-1.5 shadow-md shadow-purple-950/60 shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        {/* InstaPay Dual Arrow Logo Mark */}
        <path
          d="M20 58L50 28L80 58"
          stroke="#00D2FF"
          strokeWidth="11"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M20 42L50 72L80 42"
          stroke="white"
          strokeWidth="11"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="50" cy="50" r="8" fill="#00D2FF" />
      </svg>
    </div>
  );
}

// 3. Official Cash on Delivery Icon (Banknote & EGP currency symbol)
export function CashOnDeliveryIcon({ className = "w-8 h-8", size = 32 }: { className?: string; size?: number }) {
  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-xl bg-gradient-to-br from-[#059669] to-[#10B981] p-1.5 shadow-md shadow-emerald-700/40 shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <rect x="12" y="25" width="76" height="50" rx="10" fill="white" fillOpacity="0.25" stroke="white" strokeWidth="5" />
        <rect x="20" y="32" width="60" height="36" rx="6" stroke="white" strokeWidth="3" strokeDasharray="5 3" />
        <circle cx="50" cy="50" r="12" fill="white" />
        <text x="50" y="56" textAnchor="middle" fill="#059669" fontSize="16" fontWeight="900" fontFamily="sans-serif">
          EGP
        </text>
      </svg>
    </div>
  );
}

// 4. Official Online Payment Transfer Icon (Mobile to card instant transfer)
export function OnlineTransferIcon({ className = "w-8 h-8", size = 32 }: { className?: string; size?: number }) {
  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-xl bg-gradient-to-br from-[#FF274B] to-[#D97706] p-1.5 shadow-md shadow-red-600/40 shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        {/* Smartphone */}
        <rect x="15" y="25" width="32" height="55" rx="7" fill="white" fillOpacity="0.2" stroke="white" strokeWidth="4" />
        <circle cx="31" cy="73" r="2.5" fill="white" />
        {/* Card */}
        <rect x="45" y="20" width="40" height="28" rx="5" fill="white" />
        <rect x="45" y="27" width="40" height="7" fill="#E11D48" />
        <rect x="50" y="37" width="10" height="5" rx="1" fill="#F59E0B" />
        {/* Transfer Arrow */}
        <path
          d="M32 45C32 45 42 56 58 53M58 53L50 48M58 53L50 58"
          stroke="white"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

// 5. Official Payment Header Shield Icon (Verified Payment Security Shield)
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
