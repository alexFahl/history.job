import {
  STATUS_ORDER,
  STATUS_LABELS,
  STATUS_COLORS,
} from "../../utils/constants";

/**
 * StatusDropdown
 *
 * A select input to let the user change the global status
 *
 * Props:
 *   value    : current status code
 *   onChange : function(newStatusCode) — called immediately on change
 */
function StatusDropdown({ value, onChange }) {
  return (
    <div className="relative inline-flex items-center">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`text-sm font-semibold pl-3 pr-8 py-1.5 rounded-full appearance-none cursor-pointer
                    border-0 ring-1 ring-inset ring-white/10 focus:outline-none focus:ring-2 focus:ring-primary/50
                    transition-shadow ${STATUS_COLORS[value]}`}
      >
        {STATUS_ORDER.map((code) => (
          <option key={code} value={code} className="bg-[#0d1528] text-text">
            {STATUS_LABELS[code]}
          </option>
        ))}
      </select>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
        className="pointer-events-none absolute right-2.5 h-3.5 w-3.5 opacity-70"
      >
        <path
          fillRule="evenodd"
          d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
          clipRule="evenodd"
        />
      </svg>
    </div>
  );
}

export default StatusDropdown;
