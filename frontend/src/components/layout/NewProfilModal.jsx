import { useState } from "react";
import Modal from "../common/Modal";
import { profileSchema } from "../../schemas/profileSchema";
import { useCreateProfile } from "../../hooks/useProfiles";
import { getCountryList, getTimezoneForCountry } from "../../utils/timezones";

// Precompute the country list once at module load because it never changes
const COUNTRIES = getCountryList();

/**
 * NewProfileModal
 *
 * Self-contained modal that creates a new "country profile"
 * (profile name + country; the timezone is derived from the country).
 *
 * Props:
 *   isOpen  : boolean  — modal visibility
 *   onClose : function — called to close the modal
 */
function NewProfileModal({ isOpen, onClose }) {
  const createProfileMutation = useCreateProfile();

  const [profileName, setProfileName] = useState("");
  const [country, setCountry] = useState("");
  const [error, setError] = useState("");

  const resetForm = () => {
    setProfileName("");
    setCountry("");
    setError("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Derive the timezone automatically from the selected country
    const timezone = getTimezoneForCountry(country);

    // Validate on the front-end before sending the request
    const result = profileSchema.safeParse({ profileName, country, timezone });
    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }

    try {
      await createProfileMutation.mutateAsync(result.data);
      handleClose();
    } catch (err) {
      setError(
        err.response?.data?.errors?.[0]?.message ||
          err.response?.data?.message ||
          "Failed to create profile. Please try again.",
      );
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add a new profile">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="profileName"
            className="block text-sm font-medium text-secondary mb-1.5"
          >
            Profile name
          </label>
          <input
            id="profileName"
            type="text"
            value={profileName}
            onChange={(e) => setProfileName(e.target.value)}
            placeholder="e.g. Web Developer"
            className="w-full bg-white/[0.06] border border-white/10 rounded-lg px-4 py-2.5
                       text-text placeholder-white/20 text-sm
                       focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary
                       transition-colors duration-200"
          />
        </div>

        <div>
          <label
            htmlFor="country"
            className="block text-sm font-medium text-secondary mb-1.5"
          >
            Country
          </label>
          <select
            id="country"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="w-full bg-white/[0.06] border border-white/10 rounded-lg px-4 py-2.5
                       text-text text-sm appearance-none
                       focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary
                       transition-colors duration-200"
          >
            <option value="" className="bg-[#0d1528]">
              Select a country…
            </option>
            {COUNTRIES.map((c) => (
              <option key={c.id} value={c.id} className="bg-[#0d1528]">
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {error && (
          <p className="text-accent text-sm bg-accent/10 border border-accent/20 rounded-lg px-4 py-2.5">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={createProfileMutation.isPending}
          className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed
                     text-white font-semibold py-2.5 rounded-lg text-sm
                     transition-all duration-200 shadow-lg shadow-primary/20"
        >
          {createProfileMutation.isPending ? "Creating…" : "Create profile"}
        </button>
      </form>
    </Modal>
  );
}

export default NewProfileModal;
