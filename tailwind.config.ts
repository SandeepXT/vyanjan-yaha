import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#0A0A0A",
          50: "#141414",
          100: "#1A1A1A",
          200: "#222222",
        },
        parchment: {
          DEFAULT: "#F8F5F0",
          50: "#FAF8F4",
          100: "#F0EBE3",
          200: "#E5DDD3",
        },
        emerald: {
          400: "#34D399",
          500: "#10B981",
          600: "#059669",
          700: "#047857",
        },
        saffron: {
          DEFAULT: "#F59E0B",
          light: "#FCD34D",
          dark: "#D97706",
        },
        crimson: {
          DEFAULT: "#DC2626",
          light: "#FCA5A5",
        },
      },
      fontFamily: {
        display: ["var(--font-playfair)", "Georgia", "serif"],
        body: ["var(--font-dm-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-dm-mono)", "monospace"],
      },
      animation: {
        "fade-up": "fadeUp 0.6s ease forwards",
        "fade-in": "fadeIn 0.4s ease forwards",
        "slide-right": "slideRight 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards",
        "pulse-soft": "pulseSoft 2s ease-in-out infinite",
        "spin-slow": "spin 8s linear infinite",
        "bounce-subtle": "bounceSubtle 0.5s cubic-bezier(0.34,1.56,0.64,1)",
        "status-progress": "statusProgress 1.5s ease-in-out infinite",
        "cart-shake": "cartShake 0.4s cubic-bezier(0.36,0.07,0.19,0.97)",
        "grain": "grain 8s steps(10) infinite",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideRight: {
          "0%": { opacity: "0", transform: "translateX(-20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
        bounceSubtle: {
          "0%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.25)" },
          "100%": { transform: "scale(1)" },
        },
        statusProgress: {
          "0%": { width: "0%" },
          "100%": { width: "100%" },
        },
        cartShake: {
          "0%, 100%": { transform: "rotate(0deg)" },
          "20%": { transform: "rotate(-8deg)" },
          "40%": { transform: "rotate(8deg)" },
          "60%": { transform: "rotate(-5deg)" },
          "80%": { transform: "rotate(5deg)" },
        },
        grain: {
          "0%, 100%": { transform: "translate(0, 0)" },
          "10%": { transform: "translate(-2%, -3%)" },
          "20%": { transform: "translate(3%, 2%)" },
          "30%": { transform: "translate(-1%, 4%)" },
          "40%": { transform: "translate(4%, -1%)" },
          "50%": { transform: "translate(-3%, 1%)" },
          "60%": { transform: "translate(2%, 3%)" },
          "70%": { transform: "translate(-4%, -2%)" },
          "80%": { transform: "translate(1%, -4%)" },
          "90%": { transform: "translate(-2%, 2%)" },
        },
      },
      backgroundImage: {
        "grid-ink": "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
        "noise": "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.4'/%3E%3C/svg%3E\")",
      },
      backgroundSize: {
        "grid": "40px 40px",
      },
      boxShadow: {
        "emerald-glow": "0 0 30px rgba(16, 185, 129, 0.3)",
        "card-dark": "0 4px 24px rgba(0,0,0,0.6)",
        "card-lift": "0 12px 40px rgba(0,0,0,0.8)",
        "inner-glow": "inset 0 1px 0 rgba(255,255,255,0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
