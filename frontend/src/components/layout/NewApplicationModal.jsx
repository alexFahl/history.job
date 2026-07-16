import { useState } from "react";
import Modal from "../common/Modal";
import { applicationSchema } from "../../schemas/applicationSchema";
import { useCreateApplication } from "../../hooks/useApplications";

/**
 *
 * Props:
 *   isOpen    : boolean — modal visibility
 *   onClose   : function — called to close the modal
 *   profileId : string — the currently selected profile, attached to the new application
 */
// Returns today's date as "YYYY-MM-DD", the format required by <input type="date">
const getToday = () => new Date().toISOString().slice(0, 10);

function NewApplicationModal({ isOpen, onClose, profileId }) {
  const createApplicationMutation = useCreateApplication(profileId);

  const [companyName, setCompanyName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [location, setLocation] = useState("");
  const [jobAdUrl, setJobAdUrl] = useState("");
  const [jobType, setJobType] = useState("");
  const [salaryExpected, setSalaryExpected] = useState("");
  const [currency, setCurrency] = useState("€");
  const [appliedDate, setAppliedDate] = useState(getToday);
  const [status, setStatus] = useState("T"); // Default to "To Apply"
  const [error, setError] = useState("");

  const resetForm = () => {
    setCompanyName("");
    setJobTitle("");
    setLocation("");
    setJobAdUrl("");
    setJobType("");
    setSalaryExpected("");
    setCurrency("€");
    setAppliedDate(getToday());
    setStatus("T");
    setError("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const payload = {
      profileId,
      companyName,
      jobTitle,
      location: location || undefined,
      jobAdUrl: jobAdUrl || undefined,
      jobType: jobType || undefined,
      salaryExpected: salaryExpected || undefined,
      currency: currency || undefined,
      appliedDate: appliedDate || undefined,
      status,
    };

    const result = applicationSchema.safeParse(payload);
    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }

    try {
      await createApplicationMutation.mutateAsync(result.data);
      handleClose();
    } catch (err) {
      setError(
        err.response?.data?.errors?.[0]?.message ||
          err.response?.data?.message ||
          "Failed to create application. Please try again.",
      );
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add a new application">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="companyName"
            className="block text-sm font-medium text-secondary mb-1.5"
          >
            Company name
          </label>
          <input
            id="companyName"
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="e.g. Acme Corp"
            className="w-full bg-white/[0.06] border border-white/10 rounded-lg px-4 py-2.5
                       text-text placeholder-white/20 text-sm
                       focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary
                       transition-colors duration-200"
          />
        </div>

        <div>
          <label
            htmlFor="jobTitle"
            className="block text-sm font-medium text-secondary mb-1.5"
          >
            Job title
          </label>
          <input
            id="jobTitle"
            type="text"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            placeholder="e.g. Frontend Developer"
            className="w-full bg-white/[0.06] border border-white/10 rounded-lg px-4 py-2.5
                       text-text placeholder-white/20 text-sm
                       focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary
                       transition-colors duration-200"
          />
        </div>

        <div>
          <label
            htmlFor="location"
            className="block text-sm font-medium text-secondary mb-1.5"
          >
            Location
          </label>
          <input
            id="location"
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Paris, France"
            className="w-full bg-white/[0.06] border border-white/10 rounded-lg px-4 py-2.5
                       text-text placeholder-white/20 text-sm
                       focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary
                       transition-colors duration-200"
          />
        </div>

        <div>
          <label
            htmlFor="jobAdUrl"
            className="block text-sm font-medium text-secondary mb-1.5"
          >
            Job ad URL
          </label>
          <input
            id="jobAdUrl"
            type="url"
            value={jobAdUrl}
            onChange={(e) => setJobAdUrl(e.target.value)}
            placeholder="https://..."
            className="w-full bg-white/[0.06] border border-white/10 rounded-lg px-4 py-2.5
                       text-text placeholder-white/20 text-sm
                       focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary
                       transition-colors duration-200"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="salaryExpected"
              className="block text-sm font-medium text-secondary mb-1.5"
            >
              Salary expected
            </label>
            <div className="flex gap-2">
              <input
                id="salaryExpected"
                type="text"
                value={salaryExpected}
                onChange={(e) => setSalaryExpected(e.target.value)}
                placeholder="e.g. 55000"
                className="w-full bg-white/[0.06] border border-white/10 rounded-lg px-4 py-2.5
                           text-text placeholder-white/20 text-sm
                           focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary
                           transition-colors duration-200"
              />
              <input
                type="text"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                placeholder="€"
                aria-label="Currency"
                className="w-14 shrink-0 bg-white/[0.06] border border-white/10 rounded-lg px-2 py-2.5
                           text-text text-center placeholder-white/20 text-sm
                           focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary
                           transition-colors duration-200"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="appliedDate"
              className="block text-sm font-medium text-secondary mb-1.5"
            >
              Applied on
            </label>
            <input
              id="appliedDate"
              type="date"
              value={appliedDate}
              onChange={(e) => setAppliedDate(e.target.value)}
              className="w-full bg-white/[0.06] border border-white/10 rounded-lg px-4 py-2.5
                         text-text text-sm
                         focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary
                         transition-colors duration-200"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="jobType"
              className="block text-sm font-medium text-secondary mb-1.5"
            >
              Job type
            </label>
            <select
              id="jobType"
              value={jobType}
              onChange={(e) => setJobType(e.target.value)}
              className="w-full bg-white/[0.06] border border-white/10 rounded-lg px-4 py-2.5
                         text-text text-sm appearance-none
                         focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary
                         transition-colors duration-200"
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
            <label
              htmlFor="status"
              className="block text-sm font-medium text-secondary mb-1.5"
            >
              Status
            </label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full bg-white/[0.06] border border-white/10 rounded-lg px-4 py-2.5
                         text-text text-sm appearance-none
                         focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary
                         transition-colors duration-200"
            >
              <option value="T" className="bg-[#0d1528]">
                To Apply
              </option>
              <option value="A" className="bg-[#0d1528]">
                Applied
              </option>
              <option value="I" className="bg-[#0d1528]">
                Interviewing
              </option>
              <option value="R" className="bg-[#0d1528]">
                Rejected
              </option>
              <option value="O" className="bg-[#0d1528]">
                Offer
              </option>
            </select>
          </div>
        </div>

        {error && (
          <p className="text-accent text-sm bg-accent/10 border border-accent/20 rounded-lg px-4 py-2.5">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={createApplicationMutation.isPending}
          className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed
                     text-white font-semibold py-2.5 rounded-lg text-sm
                     transition-all duration-200 shadow-lg shadow-primary/20"
        >
          {createApplicationMutation.isPending ? "Adding…" : "Add application"}
        </button>
      </form>
    </Modal>
  );
}

export default NewApplicationModal;
