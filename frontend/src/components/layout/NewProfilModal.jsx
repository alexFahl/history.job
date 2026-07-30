import { useState } from "react";
import Modal from "../common/Modal";
import Button from "../common/Button";
import { Field, TextInput, Select } from "../common/Field";
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
        <Field label="Profile name" htmlFor="profileName">
          <TextInput
            id="profileName"
            type="text"
            value={profileName}
            onChange={(e) => setProfileName(e.target.value)}
            placeholder="e.g. Web Developer"
          />
        </Field>

        <Field label="Country" htmlFor="country">
          <Select
            id="country"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
          >
            <option value="">Select a country…</option>
            {COUNTRIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
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
          disabled={createProfileMutation.isPending}
        >
          {createProfileMutation.isPending ? "Creating…" : "Create profile"}
        </Button>
      </form>
    </Modal>
  );
}

export default NewProfileModal;
