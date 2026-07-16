import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";
import useUiStore from "../store/uiStore";
import {
  useProfiles,
  useCreateProfile,
  useDeleteProfile,
} from "../hooks/useProfiles";
import { profileSchema } from "../schemas/profileSchema";
import { getCountryList, getTimezoneForCountry } from "../utils/timezones";
import Modal from "../components/common/Modal";
import LiveClock from "../components/common/LiveClock";

// Precompute the country list once at module load because it never changes
const COUNTRIES = getCountryList();

/**
 * ProfileSelector
 *
 * The hub the user lands on right after logging in
 * Displays every "country profile" as a card with a live local clock
 * Clicking a card selects it and goes to the Dashboard
 *
 * Also provides an "Add new profile" button that opens a Modal with a small form: profile name + country dropdown
 */
function ProfileSelector() {
  const navigate = useNavigate();
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const user = useAuthStore((state) => state.user);
  const setSelectedProfile = useUiStore((state) => state.setSelectedProfile);
  const selectedProfile = useUiStore((state) => state.selectedProfile);
  const clearSelectedProfile = useUiStore(
    (state) => state.clearSelectedProfile,
  );

  const { data: profiles, isLoading, isError } = useProfiles();
  const createProfileMutation = useCreateProfile();
  const deleteProfileMutation = useDeleteProfile();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [country, setCountry] = useState("");
  const [formError, setFormError] = useState("");

  const [profileToDelete, setProfileToDelete] = useState(null);
  const [deleteError, setDeleteError] = useState("");

  const handleSelectProfile = (profile) => {
    setSelectedProfile(profile);
    navigate("/dashboard");
  };

  const handleLogout = () => {
    clearAuth();
    navigate("/auth");
  };

  const resetForm = () => {
    setProfileName("");
    setCountry("");
    setFormError("");
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const handleRequestDelete = (e, profile) => {
    e.stopPropagation();
    setDeleteError("");
    setProfileToDelete(profile);
  };

  const handleCancelDelete = () => {
    setProfileToDelete(null);
    setDeleteError("");
  };

  const handleConfirmDelete = async () => {
    if (!profileToDelete) return;
    setDeleteError("");

    try {
      await deleteProfileMutation.mutateAsync(profileToDelete._id);
      // Clear the selected profile if it's the one that was just deleted,
      // so the Dashboard doesn't keep pointing at a profile that no longer exists
      if (selectedProfile?._id === profileToDelete._id) {
        clearSelectedProfile();
      }
      setProfileToDelete(null);
    } catch (err) {
      setDeleteError(
        err.response?.data?.message ||
          "Failed to delete profile. Please try again.",
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    // Derive the timezone automatically from the selected country
    const timezone = getTimezoneForCountry(country);

    // Validate on the front-end before sending the request (Zod)
    const result = profileSchema.safeParse({ profileName, country, timezone });
    if (!result.success) {
      setFormError(result.error.issues[0].message);
      return;
    }

    try {
      await createProfileMutation.mutateAsync(result.data);
      handleCloseModal();
    } catch (err) {
      setFormError(
        err.response?.data?.errors?.[0]?.message ||
          err.response?.data?.message ||
          "Failed to create profile. Please try again.",
      );
    }
  };

  return (
    <div className="min-h-screen bg-background px-6 py-10">
      {/* Header */}
      <div className="max-w-5xl mx-auto flex items-center justify-between mb-10">
        <div>
          <h1 className="text-2xl font-bold text-text">
            Welcome back, <span className="text-primary">{user?.username}</span>
          </h1>
          <p className="text-secondary text-sm mt-1">
            Choose a profile to continue, or create a new one.
          </p>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="text-sm text-secondary hover:text-accent transition-colors duration-150"
        >
          Log out
        </button>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto">
        {isLoading && (
          <p className="text-secondary text-center mt-20">Loading profiles…</p>
        )}

        {isError && (
          <p className="text-accent text-center mt-20">
            Failed to load profiles. Please refresh the page.
          </p>
        )}

        {!isLoading && !isError && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Existing profile cards */}
            {profiles.map((profile) => (
              <div
                key={profile._id}
                role="button"
                tabIndex={0}
                onClick={() => handleSelectProfile(profile)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSelectProfile(profile);
                }}
                className="relative text-left bg-white/[0.04] hover:bg-white/[0.08] border border-white/10
                           hover:border-primary/50 rounded-2xl p-6 transition-all duration-200
                           group cursor-pointer"
              >
                <button
                  type="button"
                  onClick={(e) => handleRequestDelete(e, profile)}
                  aria-label={`Delete profile ${profile.profileName}`}
                  className="absolute top-4 right-4 text-secondary hover:text-accent
                             transition-colors duration-150 p-1 rounded-lg hover:bg-white/[0.06]"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="w-4 h-4"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.75 1a.75.75 0 0 0-.75.75V2h-3.5a.75.75 0 0 0 0 1.5h.564l.62 10.548A2.75 2.75 0 0 0 8.427 17h3.146a2.75 2.75 0 0 0 2.743-2.952l.62-10.548h.564a.75.75 0 0 0 0-1.5h-3.5v-.25a.75.75 0 0 0-.75-.75h-2.5ZM8.5 6.75a.75.75 0 0 1 1.5 0v6.5a.75.75 0 0 1-1.5 0v-6.5Zm3.75-.75a.75.75 0 0 0-.75.75v6.5a.75.75 0 0 0 1.5 0v-6.5a.75.75 0 0 0-.75-.75Z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>

                <div className="flex items-start justify-between mb-4 pr-6">
                  <div>
                    <h3 className="text-lg font-semibold text-text group-hover:text-primary transition-colors">
                      {profile.profileName}
                    </h3>
                    <p className="text-secondary text-sm mt-0.5">
                      {profile.country}
                    </p>
                  </div>
                  {!profile.isActive && (
                    <span className="text-xs bg-white/10 text-secondary px-2 py-0.5 rounded-full">
                      Archived
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-secondary text-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <LiveClock timezone={profile.timezone} />
                  <span className="text-white/30">·</span>
                  <span className="text-xs">{profile.timezone}</span>
                </div>
              </div>
            ))}

            {/* Add new profile card */}
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="flex flex-col items-center justify-center gap-2 border-2 border-dashed
                         border-white/10 hover:border-primary/50 rounded-2xl p-6 min-h-[132px]
                         text-secondary hover:text-primary transition-all duration-200"
            >
              <span className="text-3xl leading-none">+</span>
              <span className="text-sm font-medium">Add new profile</span>
            </button>
          </div>
        )}
      </div>

      {/* Add Profile Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="Add a new profile"
      >
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

          {formError && (
            <p className="text-accent text-sm bg-accent/10 border border-accent/20 rounded-lg px-4 py-2.5">
              {formError}
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

      {/* Delete Profile confirmation Modal */}
      <Modal
        isOpen={!!profileToDelete}
        onClose={handleCancelDelete}
        title="Delete profile"
      >
        <div className="space-y-4">
          <p className="text-sm text-text">
            Are you sure you want to delete{" "}
            <span className="font-semibold">
              {profileToDelete?.profileName}
            </span>
            ?
          </p>

          <p className="text-accent text-sm bg-accent/10 border border-accent/20 rounded-lg px-4 py-2.5">
            Warning: all applications for this profile will also be deleted,
            including any uploaded CVs and cover letters. This action cannot be
            undone.
          </p>

          {deleteError && (
            <p className="text-accent text-sm bg-accent/10 border border-accent/20 rounded-lg px-4 py-2.5">
              {deleteError}
            </p>
          )}

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleCancelDelete}
              className="flex-1 bg-white/[0.06] hover:bg-white/[0.1] text-text text-sm
                         font-semibold py-2.5 rounded-lg transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmDelete}
              disabled={deleteProfileMutation.isPending}
              className="flex-1 bg-accent hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed
                         text-white font-semibold py-2.5 rounded-lg text-sm
                         transition-all duration-200"
            >
              {deleteProfileMutation.isPending ? "Deleting…" : "Delete profile"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default ProfileSelector;
