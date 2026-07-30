import { useState } from "react";
import Modal from "../common/Modal";
import Button from "../common/Button";
import { Field, TextInput, TextArea, Select } from "../common/Field";
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
  const [description, setDescription] = useState("");
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
    setDescription("");
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
      description: description || undefined,
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
        <Field label="Company name" htmlFor="companyName">
          <TextInput
            id="companyName"
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="e.g. Acme Corp"
          />
        </Field>

        <Field label="Job title" htmlFor="jobTitle">
          <TextInput
            id="jobTitle"
            type="text"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            placeholder="e.g. Frontend Developer"
          />
        </Field>

        <Field label="Location" htmlFor="location">
          <TextInput
            id="location"
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Paris, France"
          />
        </Field>

        <Field label="Job ad URL" htmlFor="jobAdUrl">
          <TextInput
            id="jobAdUrl"
            type="url"
            value={jobAdUrl}
            onChange={(e) => setJobAdUrl(e.target.value)}
            placeholder="https://..."
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Salary expected" htmlFor="salaryExpected">
            <div className="flex gap-2">
              <TextInput
                id="salaryExpected"
                type="text"
                value={salaryExpected}
                onChange={(e) => setSalaryExpected(e.target.value)}
                placeholder="e.g. 55000"
                className="min-w-0 flex-1"
              />
              <TextInput
                type="text"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                placeholder="€"
                aria-label="Currency"
                className="!w-14 shrink-0 !px-2 text-center"
              />
            </div>
          </Field>

          <Field label="Applied on" htmlFor="appliedDate">
            <TextInput
              id="appliedDate"
              type="date"
              value={appliedDate}
              onChange={(e) => setAppliedDate(e.target.value)}
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Job type" htmlFor="jobType">
            <Select
              id="jobType"
              value={jobType}
              onChange={(e) => setJobType(e.target.value)}
            >
              <option value="">None</option>
              <option value="C">City</option>
              <option value="H">Hybrid</option>
              <option value="R">Remote</option>
            </Select>
          </Field>

          <Field label="Status" htmlFor="status">
            <Select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="T">To Apply</option>
              <option value="A">Applied</option>
              <option value="I">Interviewing</option>
              <option value="R">Rejected</option>
              <option value="O">Offer</option>
            </Select>
          </Field>
        </div>

        <Field label="Description" htmlFor="description">
          <TextArea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Paste or type the job description here…"
            rows={6}
          />
        </Field>

        {error && (
          <p className="text-accent text-sm bg-accent/10 border border-accent/20 rounded-lg px-4 py-2.5">
            {error}
          </p>
        )}

        <Button
          type="submit"
          variant="gradient"
          fullWidth
          disabled={createApplicationMutation.isPending}
        >
          {createApplicationMutation.isPending ? "Adding…" : "Add application"}
        </Button>
      </form>
    </Modal>
  );
}

export default NewApplicationModal;
