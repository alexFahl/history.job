/**
 * Form field primitives.
 *
 * Centralizes the input / textarea / select styling that was previously
 * duplicated across every form (modals, contacts, profile creation…).
 *
 * - Field    : label + control wrapper
 * - TextInput: styled <input>
 * - TextArea : styled <textarea>
 * - Select   : styled <select> (children are <option>s)
 *
 * All controls forward their props to the native element and accept a
 * `className` that is appended last (so callers can tweak per-usage).
 */

const CONTROL_BASE =
  "w-full rounded-lg border border-white/10 bg-white/[0.06] px-4 py-2.5 text-sm text-text " +
  "placeholder-white/20 transition-colors duration-200 " +
  "focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary";

const cx = (...classes) => classes.filter(Boolean).join(" ");

export function Field({ label, htmlFor, children, className = "" }) {
  return (
    <div className={className}>
      {label && (
        <label
          htmlFor={htmlFor}
          className="mb-1.5 block text-sm font-medium text-secondary"
        >
          {label}
        </label>
      )}
      {children}
    </div>
  );
}

export function TextInput({ className = "", ...props }) {
  return <input className={cx(CONTROL_BASE, className)} {...props} />;
}

export function TextArea({ className = "", ...props }) {
  return (
    <textarea
      className={cx(CONTROL_BASE, "resize-none leading-relaxed", className)}
      {...props}
    />
  );
}

export function Select({ className = "", children, ...props }) {
  return (
    <select
      className={cx(CONTROL_BASE, "appearance-none", className)}
      {...props}
    >
      {children}
    </select>
  );
}
