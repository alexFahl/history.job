/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Core canvas
        text: "#eef0fb",
        background: "#08060f",
        // Elevated surfaces (cards, modals, dropdown options)
        surface: "#141122",
        "surface-2": "#1d1930",
        // Brand palette — electric violet primary, coral-rose accent
        primary: "#7c5cff",
        secondary: "#a9a3cf",
        accent: "#fb7185",
        // Semantic status hues
        success: "#34d399",
        warning: "#facc15",
        danger: "#f87171",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
        display: ["Space Grotesk", "Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
      borderRadius: {
        "4xl": "2rem",
      },
      boxShadow: {
        glow: "0 0 40px -8px rgba(124, 92, 255, 0.45)",
        "glow-sm": "0 0 24px -6px rgba(124, 92, 255, 0.4)",
        card: "0 24px 60px -30px rgba(0, 0, 0, 0.85)",
      },
      backgroundImage: {
        "brand-gradient":
          "linear-gradient(135deg, #7c5cff 0%, #b06bff 50%, #fb7185 100%)",
        "brand-radial":
          "radial-gradient(circle at 30% 20%, rgba(124,92,255,0.18), transparent 60%)",
      },
      keyframes: {
        aurora: {
          "0%, 100%": { transform: "translate3d(0, 0, 0) scale(1)" },
          "50%": { transform: "translate3d(30px, -40px, 0) scale(1.15)" },
        },
        "aurora-alt": {
          "0%, 100%": { transform: "translate3d(0, 0, 0) scale(1.1)" },
          "50%": { transform: "translate3d(-40px, 30px, 0) scale(1)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        "gradient-pan": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        aurora: "aurora 14s ease-in-out infinite",
        "aurora-alt": "aurora-alt 18s ease-in-out infinite",
        float: "float 6s ease-in-out infinite",
        "gradient-pan": "gradient-pan 8s ease infinite",
        shimmer: "shimmer 2.5s infinite",
      },
    },
  },
  plugins: [],
};
