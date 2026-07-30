import { useState } from "react";
import { JOB_TYPE_LABELS } from "../../utils/constants";
import { formatDate } from "../../utils/formatDate";

/**
 * EditableInfoSection
 *
 * Combines the application's informations that can be toggled between a read-only view and an editable form
 *
 * Props:
 *   application : the full Application document
 *   onSave      : function(partialData) — called with the updated fields on Confirm
 *   isSaving    : boolean — disables the Confirm button while the request is in flight
 *   statusSlot  : optional JSX — rendered next to the edit button in read mode
 *                 (used by ApplicationDetail to place the StatusDropdown there)
 */
function EditableInfoSection({ application, onSave, isSaving, statusSlot }) {
  const [isEditing, setIsEditing] = useState(false);

  const buildDraftFromApplication = () => ({
    companyName: application.companyName ?? "",
    jobTitle: application.jobTitle ?? "",
    location: application.location ?? "",
    jobType: application.jobType ?? "",
    salaryExpected: application.salaryExpected ?? "",
    currency: application.currency ?? "€",
    jobAdUrl: application.jobAdUrl ?? "",
    // <input type="date"> requires "YYYY-MM-DD" — slice the ISO string down to that.
    appliedDate: application.appliedDate
      ? new Date(application.appliedDate).toISOString().slice(0, 10)
      : "",
  });

  const [draft, setDraft] = useState(buildDraftFromApplication);

  const handleEdit = () => {
    setDraft(buildDraftFromApplication());
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleConfirm = () => {
    onSave({
      companyName: draft.companyName,
      jobTitle: draft.jobTitle,
      location: draft.location || undefined,
      jobType: draft.jobType || undefined,
      salaryExpected: draft.salaryExpected || undefined,
      currency: draft.currency || undefined,
      jobAdUrl: draft.jobAdUrl || undefined,
      appliedDate: draft.appliedDate || undefined,
    });
    setIsEditing(false);
  };

  const updateDraft = (field) => (e) => {
    setDraft((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const inputClasses =
    "w-full bg-white/[0.06] border border-white/10 rounded-lg px-3 py-2 text-text text-sm " +
    "placeholder-white/20 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary " +
    "transition-colors duration-200";

  return (
    <div className="relative overflow-hidden rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/[0.14] via-white/[0.03] to-transparent p-6 shadow-[0_0_0_1px_rgba(48,103,253,0.05)]">
      {/* Decorative corner glow — reinforces the "featured" hero feel */}
      <div className="pointer-events-none absolute -top-16 -right-10 h-40 w-40 rounded-full bg-primary/20 blur-3xl" />

      <div className="relative flex items-start justify-between gap-4 mb-1">
        {!isEditing ? (
          <div className="flex items-center gap-4 min-w-0">
            <div
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl
                         bg-gradient-to-br from-primary to-primary/50 text-2xl font-bold text-white
                         shadow-lg shadow-primary/30 ring-1 ring-white/10"
            >
              {application.companyName?.charAt(0)?.toUpperCase() || "?"}
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-2xl font-bold tracking-tight text-text">
                {application.companyName}
              </h1>
              <p className="truncate text-secondary text-sm mt-0.5">
                {application.jobTitle}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex-1 space-y-2">
            <input
              type="text"
              value={draft.companyName}
              onChange={updateDraft("companyName")}
              placeholder="Company name"
              className={`${inputClasses} font-semibold`}
            />
            <input
              type="text"
              value={draft.jobTitle}
              onChange={updateDraft("jobTitle")}
              placeholder="Job title"
              className={inputClasses}
            />
          </div>
        )}

        {/* Edit toggle button — a simple pencil icon (SVG, no extra dependency) */}
        {!isEditing && (
          <div className="flex items-center gap-2 shrink-0">
            {statusSlot}
            <button
              type="button"
              onClick={handleEdit}
              aria-label="Edit application details"
              className="text-secondary hover:text-primary transition-colors duration-150 p-1.5
                         rounded-lg hover:bg-white/[0.06]"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-4 h-4"
              >
                <path d="M13.586 3.586a2 2 0 1 1 2.828 2.828l-.793.793-2.828-2.828.793-.793ZM11.379 5.793 3 14.172V17h2.828l8.38-8.379-2.83-2.828Z" />
              </svg>
            </button>
          </div>
        )}
      </div>

      <hr className="relative border-white/10 my-5" />

      {!isEditing ? (
        <div className="relative">
          <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-secondary/70">
            Key information
          </h3>
          <dl className="grid grid-cols-2 gap-3">
            <InfoTile
              label="Location"
              value={application.location || "—"}
              icon={ICONS.location}
            />
            <InfoTile
              label="Job type"
              value={
                application.jobType ? JOB_TYPE_LABELS[application.jobType] : "—"
              }
              icon={ICONS.jobType}
            />
            <InfoTile
              label="Salary expected"
              value={
                application.salaryExpected
                  ? `${application.salaryExpected} ${application.currency ?? ""}`
                  : "—"
              }
              icon={ICONS.salary}
            />
            <InfoTile
              label="Applied on"
              value={formatDate(application.appliedDate)}
              icon={ICONS.calendar}
            />
          </dl>

          {application.jobAdUrl && (
            <a
              href={application.jobAdUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-primary/30
                         bg-primary/10 px-3.5 py-2 text-sm font-medium text-primary
                         transition-colors duration-200 hover:bg-primary/20"
            >
              View original job ad
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-3.5 w-3.5"
              >
                <path
                  fillRule="evenodd"
                  d="M4.25 5.5a.75.75 0 0 0-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 0 0 .75-.75v-4a.75.75 0 0 1 1.5 0v4A2.25 2.25 0 0 1 12.75 17h-8.5A2.25 2.25 0 0 1 2 14.75v-8.5A2.25 2.25 0 0 1 4.25 4h5a.75.75 0 0 1 0 1.5h-5Z"
                  clipRule="evenodd"
                />
                <path
                  fillRule="evenodd"
                  d="M6.194 12.753a.75.75 0 0 0 1.06.053L16.5 4.44v2.81a.75.75 0 0 0 1.5 0v-4.5a.75.75 0 0 0-.75-.75h-4.5a.75.75 0 0 0 0 1.5h2.553l-9.056 8.194a.75.75 0 0 0-.053 1.06Z"
                  clipRule="evenodd"
                />
              </svg>
            </a>
          )}
        </div>
      ) : (
        <div className="relative space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-secondary text-xs mb-1">
                Location
              </label>
              <input
                type="text"
                value={draft.location}
                onChange={updateDraft("location")}
                placeholder="e.g. Paris, France"
                className={inputClasses}
              />
            </div>

            <div>
              <label className="block text-secondary text-xs mb-1">
                Job type
              </label>
              <select
                value={draft.jobType}
                onChange={updateDraft("jobType")}
                className={`${inputClasses} appearance-none`}
              >
                <option value="" className="bg-[#0d1528]">
                  None
                </option>
                <option value="C" className="bg-[#0d1528]">
                  City
                </option>
                <option value="H" className="bg-[#0d1528]">
                  Hybrid
                </option>
                <option value="R" className="bg-[#0d1528]">
                  Remote
                </option>
              </select>
            </div>

            <div>
              <label className="block text-secondary text-xs mb-1">
                Salary expected
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={draft.salaryExpected}
                  onChange={updateDraft("salaryExpected")}
                  placeholder="e.g. 55000"
                  className={`${inputClasses} flex-1 min-w-0`}
                />
                <input
                  type="text"
                  value={draft.currency}
                  onChange={updateDraft("currency")}
                  placeholder="€"
                  className="w-12 shrink-0 text-center bg-white/[0.06] border border-white/10 rounded-lg px-2 py-2
                             text-text text-sm placeholder-white/20 focus:outline-none focus:border-primary
                             focus:ring-1 focus:ring-primary transition-colors duration-200"
                />
              </div>
            </div>

            <div>
              <label className="block text-secondary text-xs mb-1">
                Applied on
              </label>
              <input
                type="date"
                value={draft.appliedDate}
                onChange={updateDraft("appliedDate")}
                className={inputClasses}
              />
            </div>
          </div>

          <div>
            <label className="block text-secondary text-xs mb-1">
              Job ad URL
            </label>
            <input
              type="url"
              value={draft.jobAdUrl}
              onChange={updateDraft("jobAdUrl")}
              placeholder="https://..."
              className={inputClasses}
            />
          </div>

          {/* Cancel / Confirm */}
          <div className="flex items-center gap-3 pt-1">
            <button
              type="button"
              onClick={handleConfirm}
              disabled={isSaving}
              className="bg-primary hover:bg-primary/90 disabled:opacity-50 text-white text-sm
                         font-semibold px-4 py-2 rounded-lg transition-colors duration-200"
            >
              {isSaving ? "Saving…" : "Confirm"}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={isSaving}
              className="text-secondary hover:text-text text-sm transition-colors duration-150"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * InfoTile
 * Presentational helper for the read-mode info: an icon chip + label/value.
 */
function InfoTile({ label, value, icon }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
        {icon}
      </span>
      <div className="min-w-0">
        <dt className="text-[11px] uppercase tracking-wide text-secondary/70">
          {label}
        </dt>
        <dd className="mt-0.5 truncate text-sm font-medium text-text">
          {value}
        </dd>
      </div>
    </div>
  );
}

/**
 * ICONS
 * Inline 20×20 SVG icons (no extra dependency) used by the info tiles.
 */
const iconClass = "h-4 w-4";
const ICONS = {
  location: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={iconClass}
    >
      <path
        fillRule="evenodd"
        d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 0 0 .281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 1 0 3 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 0 0 2.273 1.765 11.842 11.842 0 0 0 .976.544l.062.029.018.008.006.003ZM10 11.25a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5Z"
        clipRule="evenodd"
      />
    </svg>
  ),
  jobType: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={iconClass}
    >
      <path
        fillRule="evenodd"
        d="M4 16.5v-13h-.25a.75.75 0 0 1 0-1.5h12.5a.75.75 0 0 1 0 1.5H16v13h.25a.75.75 0 0 1 0 1.5h-3.5a.75.75 0 0 1-.75-.75v-2.5a.75.75 0 0 0-.75-.75h-2.5a.75.75 0 0 0-.75.75v2.5a.75.75 0 0 1-.75.75h-3.5a.75.75 0 0 1 0-1.5H4Zm3-11a.75.75 0 0 1 .75-.75h.5a.75.75 0 0 1 0 1.5h-.5A.75.75 0 0 1 7 5.5Zm.75 2.75a.75.75 0 0 0 0 1.5h.5a.75.75 0 0 0 0-1.5h-.5ZM11 5.5a.75.75 0 0 1 .75-.75h.5a.75.75 0 0 1 0 1.5h-.5a.75.75 0 0 1-.75-.75Zm.75 2.75a.75.75 0 0 0 0 1.5h.5a.75.75 0 0 0 0-1.5h-.5Z"
        clipRule="evenodd"
      />
    </svg>
  ),
  salary: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={iconClass}
    >
      <path d="M1 4.25C1 3.007 2.007 2 3.25 2h13.5C17.993 2 19 3.007 19 4.25v8.5A2.25 2.25 0 0 1 16.75 15H3.25A2.25 2.25 0 0 1 1 12.75v-8.5ZM3.25 3.5a.75.75 0 0 0-.75.75v.75c.966 0 1.75-.784 1.75-1.75V3.5h-1Zm13.5 0h-1v.5c0 .966.784 1.75 1.75 1.75v-.75a.75.75 0 0 0-.75-.75ZM10 6a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5ZM2.5 12.75c.966 0 1.75.784 1.75 1.75h-1a.75.75 0 0 1-.75-.75v-1Zm15 0v1a.75.75 0 0 1-.75.75h-1c0-.966.784-1.75 1.75-1.75Z" />
    </svg>
  ),
  calendar: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={iconClass}
    >
      <path
        fillRule="evenodd"
        d="M5.75 2a.75.75 0 0 1 .75.75V4h7V2.75a.75.75 0 0 1 1.5 0V4h.25A2.75 2.75 0 0 1 18 6.75v8.5A2.75 2.75 0 0 1 15.25 18H4.75A2.75 2.75 0 0 1 2 15.25v-8.5A2.75 2.75 0 0 1 4.75 4H5V2.75A.75.75 0 0 1 5.75 2Zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75Z"
        clipRule="evenodd"
      />
    </svg>
  ),
};

export default EditableInfoSection;
