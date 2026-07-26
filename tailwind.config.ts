import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./features/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        gray: {
          50: "var(--gray-50)",
          100: "var(--gray-100)",
          200: "var(--gray-200)",
          300: "#E0E0E0",
          400: "#BDBDBD",
          500: "#9E9E9E",
          600: "#757575",
          700: "#616161",
          800: "#424242",
          900: "#212121",
        },
        accent: "var(--accent)",
        muted: "var(--muted)",
      },
      fontFamily: {
        sans: ["var(--font-outfit)", "var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-outfit)", "system-ui", "sans-serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.6s ease forwards",
        "fade-up": "fadeUp 0.7s ease forwards",
        "slide-in-right": "slideInRight 0.4s ease forwards",
        "slide-in-left": "slideInLeft 0.4s ease forwards",
        "scale-in": "scaleIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards",
        "spin-slow": "spin 8s linear infinite",
        shimmer: "shimmer 2s infinite",
        "ring-3d-1": "ring3D1 6s linear infinite",
        "ring-3d-2": "ring3D2 8s linear infinite reverse",
        "ring-3d-3": "ring3D3 10s linear infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(30px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideInRight: {
          "0%": { opacity: "0", transform: "translateX(20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        slideInLeft: {
          "0%": { opacity: "0", transform: "translateX(-20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.9)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        ring3D1: {
          "0%": { transform: "rotateX(70deg) rotateZ(0deg)" },
          "100%": { transform: "rotateX(70deg) rotateZ(360deg)" },
        },
        ring3D2: {
          "0%": { transform: "rotateX(60deg) rotateY(30deg) rotateZ(0deg)" },
          "100%": { transform: "rotateX(60deg) rotateY(30deg) rotateZ(360deg)" },
        },
        ring3D3: {
          "0%": { transform: "rotateX(50deg) rotateY(-20deg) rotateZ(0deg)" },
          "100%": { transform: "rotateX(50deg) rotateY(-20deg) rotateZ(360deg)" },
        },
      },
      backdropBlur: {
        xs: "2px",
      },
      screens: {
        xs: "475px",
      },
    },
  },
  plugins: [],
};

export default config;
