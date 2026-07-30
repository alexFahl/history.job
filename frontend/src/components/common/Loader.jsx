/**
 * Loader
 *
 * A large, centered, animated loading indicator reusable across every page.
 *
 * Props:
 *   label      : optional text shown under the spinner (default: "Loading…")
 *   fullScreen : when true, fills the whole viewport height; otherwise it
 *                takes a comfortable centered area within its parent.
 */
function Loader({ label = "Loading…", fullScreen = false }) {
  return (
    <div
      className={`flex w-full flex-col items-center justify-center gap-6 ${
        fullScreen ? "min-h-screen" : "min-h-[55vh]"
      }`}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="relative h-20 w-20">
        {/* Soft pulsing glow */}
        <div className="absolute inset-0 animate-pulse rounded-full bg-primary/30 blur-2xl" />

        {/* Static track */}
        <div className="absolute inset-0 rounded-full border-4 border-white/10" />

        {/* Outer spinning arc */}
        <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-primary border-r-primary" />

        {/* Inner counter-spinning arc */}
        <div className="absolute inset-2 animate-spin rounded-full border-2 border-transparent border-b-secondary [animation-direction:reverse] [animation-duration:1.2s]" />
      </div>

      {label && (
        <p className="animate-pulse text-sm font-medium text-secondary">
          {label}
        </p>
      )}
    </div>
  );
}

export default Loader;
