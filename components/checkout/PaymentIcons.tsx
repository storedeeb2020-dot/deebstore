import React from "react";

/**
 * 1. Vodafone Cash Logo Icon (Martz90 Red Circle Glossy Style)
 */
export function VodafoneCashIcon({ className = "w-8 h-8", size = 32 }: { className?: string; size?: number }) {
  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-full overflow-hidden shadow-lg shadow-red-600/40 shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <defs>
          <linearGradient id="vodafoneMartzGrad" x1="50" y1="0" x2="50" y2="100" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FF1E1E" />
            <stop offset="100%" stopColor="#B30000" />
          </linearGradient>
        </defs>

        {/* Martz90 Circle Red Background */}
        <circle cx="50" cy="50" r="48" fill="url(#vodafoneMartzGrad)" />

        {/* Top Rim Gloss */}
        <circle cx="50" cy="50" r="46" stroke="white" strokeOpacity="0.25" strokeWidth="2" fill="none" />

        {/* Vodafone Speech Mark Teardrop (Official Logo) */}
        {/* Outer Ring */}
        <circle cx="50" cy="50" r="28" stroke="white" strokeWidth="9" fill="none" />

        {/* Filled Teardrop Quote inside right */}
        <path
          d="M57 31C46.5 31 38 39.5 38 50C38 60.5 46.5 69 57 69C67.5 69 76 60.5 76 50C76 39.5 67.5 31 57 31ZM57 60C51.5 60 47 55.5 47 50C47 44.5 51.5 40 57 40C62.5 40 67 44.5 67 50C67 55.5 62.5 60 57 60Z"
          fill="white"
        />
        <path
          d="M57 40C51.5 40 47 44.5 47 50H38C38 39.5 46.5 31 57 31V40Z"
          fill="white"
        />
      </svg>
    </div>
  );
}

/**
 * 2. Official InstaPay Egypt Logo Icon (Purple Badge with Cyan & White Chevron Arrow)
 */
export function InstaPayIcon({ className = "w-8 h-8", size = 32 }: { className?: string; size?: number }) {
  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-xl bg-gradient-to-br from-[#4A154B] via-[#3B0764] to-[#2E0735] p-1.5 shadow-lg shadow-purple-950/60 shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        {/* InstaPay Dual Arrow Logo Mark */}
        <path
          d="M22 58L50 28L78 58"
          stroke="#00D2FF"
          strokeWidth="12"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M22 42L50 72L78 42"
          stroke="white"
          strokeWidth="12"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="50" cy="50" r="9" fill="#00D2FF" />
      </svg>
    </div>
  );
}

/**
 * 3. Official Cash on Delivery Icon
 */
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

/**
 * 4. Official Online Payment Transfer Icon
 */
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
        <rect x="45" y="20" width="40" height="28" rx="5" fill="white" stroke="none" />
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
