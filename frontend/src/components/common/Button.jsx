/**
 * Button
 *
 * Reusable button with shared visual variants used across the app.
 * Keeps the many gradient / ghost / danger buttons consistent in one place.
 *
 * Props:
 *   variant   : "gradient" | "primary" | "ghost" | "danger" | "danger-soft"
 *   size      : "sm" | "md" | "lg"
 *   rounded   : any Tailwind rounding class (default "rounded-lg")
 *   fullWidth : stretch to the container width
 *   className : extra classes appended last (wins on conflicts)
 *   ...props  : forwarded to the native <button> (type, onClick, disabled…)
 */

const BASE =
  "inline-flex items-center justify-center gap-2 font-semibold " +
  "transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary/40 " +
  "disabled:cursor-not-allowed disabled:opacity-50";

const VARIANTS = {
  gradient:
    "bg-brand-gradient bg-[length:200%_200%] text-white shadow-glow hover:bg-[position:100%_50%] hover:-translate-y-0.5",
  primary:
    "bg-primary text-white shadow-glow-sm hover:bg-primary/90 hover:-translate-y-0.5",
  ghost:
    "border border-white/10 bg-white/[0.04] text-secondary hover:border-white/20 hover:bg-white/[0.08] hover:text-text",
  danger: "bg-danger text-white hover:bg-danger/90 hover:-translate-y-0.5",
  "danger-soft":
    "border border-red-500/40 bg-red-500/10 text-red-400 hover:border-red-500/60 hover:bg-red-500/20 hover:text-red-300",
};

const SIZES = {
  sm: "px-3 py-2 text-xs",
  md: "px-5 py-2.5 text-sm",
  lg: "px-6 py-3.5 text-base",
};

function Button({
  variant = "gradient",
  size = "md",
  rounded = "rounded-lg",
  fullWidth = false,
  type = "button",
  className = "",
  children,
  ...props
}) {
  const classes = [
    BASE,
    VARIANTS[variant] ?? VARIANTS.gradient,
    SIZES[size] ?? SIZES.md,
    rounded,
    fullWidth ? "w-full" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button type={type} className={classes} {...props}>
      {children}
    </button>
  );
}

export default Button;
