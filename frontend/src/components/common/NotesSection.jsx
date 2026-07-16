import { useState, useEffect, useRef } from "react";

/**
 * NotesSection
 *
 * Free-text notes field for the application where the user can type anything they want
 * Uses a auto-save: we wait 800ms after the user stops typing before calling onSave.
 *
 * Props:
 *   value    : current notes string
 *   onSave   : function(newNotes) — called after the debounce delay
 *   isSaving : boolean — shows a small "Saving…" indicator
 */
function NotesSection({ value, onSave, isSaving }) {
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
    <section className="bg-white/[0.03] border border-white/10 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-text font-semibold text-sm">Notes</h3>
        {isSaving && <span className="text-white/30 text-xs">Saving…</span>}
      </div>

      <textarea
        value={text}
        onChange={handleChange}
        placeholder="Interview prep, company research, questions to ask…"
        rows={8}
        className="w-full bg-white/[0.06] border border-white/10 rounded-lg px-4 py-3
                   text-text placeholder-white/20 text-sm resize-none
                   focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary
                   transition-colors duration-200"
      />
    </section>
  );
}

export default NotesSection;
