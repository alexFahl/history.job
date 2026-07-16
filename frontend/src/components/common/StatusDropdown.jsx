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
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`text-sm font-medium px-3 py-1.5 rounded-full appearance-none cursor-pointer
                  border-0 focus:outline-none focus:ring-2 focus:ring-primary/50
                  ${STATUS_COLORS[value]}`}
    >
      {STATUS_ORDER.map((code) => (
        <option key={code} value={code} className="bg-[#0d1528] text-text">
          {STATUS_LABELS[code]}
        </option>
      ))}
    </select>
  );
}

export default StatusDropdown;
