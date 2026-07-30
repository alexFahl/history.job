import { useState, useEffect, useRef } from "react";

/**
 * NotesSection
 *
 * Free-text field for the application where the user can type anything they want
 * Uses a auto-save: we wait 800ms after the user stops typing before calling onSave.
 *
 * Props:
 *   value       : current text string
 *   onSave      : function(newText) — called after the debounce delay
 *   isSaving    : boolean — shows a small "Saving…" indicator
 *   title       : optional, section heading (default: "Notes")
 *   placeholder : optional, textarea placeholder text
 */
function NotesSection({
  value,
  onSave,
  isSaving,
  title = "Notes",
  placeholder = "Interview prep, company research, questions to ask…",
  rows = 8,
  grow = false,
}) {
  const [text, setText] = useState(value ?? "");
  const debounceRef = useRef(null);

  // Keep local state in sync if the application data refetches externally
  useEffect(() => {
    setText(value ?? "");
  }, [value]);

  const handleChange = (e) => {
    const newText = e.target.value;
    setText(newText);

    // Debounce: cancel the previous pending save, schedule a new one
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onSave(newText);
    }, 800);
  };

  return (
    <section
      className={`group rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 transition-all duration-300 hover:border-white/[0.14] hover:bg-white/[0.03] ${
        grow ? "flex flex-1 flex-col" : ""
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-text">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-white/[0.06] text-secondary">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-3.5 w-3.5"
            >
              <path d="M2.695 14.763l-1.262 3.154a.5.5 0 0 0 .65.65l3.155-1.262a4 4 0 0 0 1.343-.885L17.5 5.5a2.121 2.121 0 0 0-3-3L3.58 13.42a4 4 0 0 0-.885 1.343Z" />
            </svg>
          </span>
          {title}
        </h3>
        {isSaving && <span className="text-white/30 text-xs">Saving…</span>}
      </div>

      <textarea
        value={text}
        onChange={handleChange}
        placeholder={placeholder}
        rows={rows}
        className={`w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3
                   text-text placeholder-white/20 text-sm resize-none leading-relaxed
                   focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary
                   transition-colors duration-200 ${grow ? "flex-1 min-h-0" : ""}`}
      />
    </section>
  );
}

export default NotesSection;
