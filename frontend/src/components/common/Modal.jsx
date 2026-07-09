import { useEffect } from "react";

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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-[#0d1528] border border-white/10 rounded-2xl p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()} // Prevent backdrop click from closing when clicking inside
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-text">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="text-secondary hover:text-text transition-colors duration-150 text-xl leading-none"
          >
            &times;
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}

export default Modal;
