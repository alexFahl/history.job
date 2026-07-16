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
    <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5">
      <div className="flex items-start justify-between gap-4 mb-1">
        {!isEditing ? (
          <div>
            <h1 className="text-xl font-bold text-text">
              {application.companyName}
            </h1>
            <p className="text-secondary text-sm mt-0.5">
              {application.jobTitle}
            </p>
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

      <hr className="border-white/10 my-4" />

      <h3 className="text-text font-semibold text-sm mb-3">Information</h3>

      {!isEditing ? (
        <>
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <InfoRow label="Location" value={application.location || "—"} />
            <InfoRow
              label="Job type"
              value={
                application.jobType ? JOB_TYPE_LABELS[application.jobType] : "—"
              }
            />
            <InfoRow
              label="Salary expected"
              value={
                application.salaryExpected
                  ? `${application.salaryExpected} ${application.currency ?? ""}`
                  : "—"
              }
            />
            <InfoRow
              label="Applied on"
              value={formatDate(application.appliedDate)}
            />
          </dl>

          {application.jobAdUrl && (
            <a
              href={application.jobAdUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-4 text-primary text-sm underline hover:text-primary/80"
            >
              View original job ad ↗
            </a>
          )}
        </>
      ) : (
        <div className="space-y-4">
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
                  className={inputClasses}
                />
                <input
                  type="text"
                  value={draft.currency}
                  onChange={updateDraft("currency")}
                  placeholder="€"
                  className={`${inputClasses} w-11 text-center shrink-0`}
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
 * InfoRow
 * Small presentational helper for the read-mode label/value pairs.
 */
function InfoRow({ label, value }) {
  return (
    <div>
      <dt className="text-secondary text-xs">{label}</dt>
      <dd className="text-text mt-0.5">{value}</dd>
    </div>
  );
}

export default EditableInfoSection;
