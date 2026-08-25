import { useEffect } from "react";
import { CloseIcon } from "./icons";

/**
 * Modal
 *
 * A reusable overlay dialog component opened in the center of the screen
 *
 * Props:
 *   isOpen  : boolean — whether the modal is visible
 *   onClose : function — called to close the modal
 *   title   : string — the title shown at the top of the modal
 *   children: ReactNode — the content of the modal
 */
function Modal({ isOpen, onClose, title, children }) {
  // Close on Escape key press
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md px-4 py-6"
      onClick={onClose}
    >
      <div
        className="animate-pop-in relative flex max-h-[90dvh] w-full max-w-md flex-col overflow-hidden rounded-3xl
                   border border-white/10 bg-surface/95 shadow-card ring-1 ring-white/5"
        onClick={(e) => e.stopPropagation()} // Prevent backdrop click from closing when clicking inside
      >
        {/* Ambient brand glow in the corner */}
        <div className="pointer-events-none absolute -top-16 -right-12 h-40 w-40 rounded-full bg-primary/20 blur-3xl" />

        <div className="relative flex shrink-0 items-center justify-between px-6 pt-6 pb-4">
          <h2 className="text-lg font-semibold tracking-tight text-text">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-secondary
                       transition-colors duration-150 hover:bg-white/[0.06] hover:text-text"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="relative overflow-y-auto px-6 pb-6">{children}</div>
      </div>
    </div>
  );
}

export default Modal;
