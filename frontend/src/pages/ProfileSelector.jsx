import { useState, useEffect } from "react";
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

// Fast lookup: ISO country code -> full country name (for card display)
const COUNTRY_NAME_BY_ID = Object.fromEntries(
  COUNTRIES.map((c) => [c.id, c.name]),
);

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

  // Carousel: index of the currently focused (centered) profile card
  const [activeIndex, setActiveIndex] = useState(0);

  const profileCount = profiles?.length ?? 0;

  // Keep activeIndex within bounds when the profile list changes
  // (e.g. after a deletion, or once the profiles finish loading)
  useEffect(() => {
    setActiveIndex((current) => {
      if (profileCount === 0) return 0;
      return Math.min(current, profileCount - 1);
    });
  }, [profileCount]);

  const goToPrev = () =>
    setActiveIndex((i) => (i - 1 + profileCount) % profileCount);
  const goToNext = () => setActiveIndex((i) => (i + 1) % profileCount);

  const handleCarouselKeyDown = (e) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      goToPrev();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      goToNext();
    }
  };

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
    <div className="min-h-screen bg-background flex flex-col px-6 py-8">
      {/* Header */}
      <header className="max-w-6xl w-full mx-auto flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text">
            Welcome back, <span className="text-primary">{user?.username}</span>
          </h1>
          <p className="text-secondary text-sm mt-1">
            Choose a profile to continue, or create a new one.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Dedicated "create profile" action — kept out of the carousel */}
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-primary/90 hover:bg-primary
                       px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/20
                       transition-all duration-200"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-4 h-4"
            >
              <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
            </svg>
            New profile
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="rounded-xl border border-white/10 hover:border-white/20 bg-white/[0.04]
                       hover:bg-white/[0.08] px-4 py-2.5 text-sm text-secondary hover:text-text
                       transition-colors duration-150"
          >
            Log out
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 flex flex-col items-center justify-center py-8">
        {isLoading && (
          <p className="text-secondary text-center">Loading profiles…</p>
        )}

        {isError && (
          <p className="text-accent text-center">
            Failed to load profiles. Please refresh the page.
          </p>
        )}

        {/* Empty state */}
        {!isLoading && !isError && profileCount === 0 && (
          <div className="text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-white/[0.04] border border-white/10">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                className="h-9 w-9 text-secondary"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-text">No profiles yet</h2>
            <p className="mt-2 text-sm text-secondary">
              Create your first profile to start tracking applications.
            </p>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary hover:bg-primary/90
                         px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/20
                         transition-all duration-200"
            >
              Create a profile
            </button>
          </div>
        )}

        {/* Carousel */}
        {!isLoading && !isError && profileCount > 0 && (
          <div
            className="w-full outline-none"
            tabIndex={0}
            onKeyDown={handleCarouselKeyDown}
            role="listbox"
            aria-label="Profiles"
          >
            <div className="relative w-full">
              {/* Navigation arrows (hidden when there is only one profile) */}
              {profileCount > 1 && (
                <>
                  <button
                    type="button"
                    onClick={goToPrev}
                    aria-label="Previous profile"
                    className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 z-20
                               flex h-11 w-11 items-center justify-center rounded-full
                               border border-white/10 bg-background/70 backdrop-blur
                               text-secondary hover:text-text hover:border-white/25
                               transition-colors duration-150"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      className="h-5 w-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.75 19.5 8.25 12l7.5-7.5"
                      />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={goToNext}
                    aria-label="Next profile"
                    className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 z-20
                               flex h-11 w-11 items-center justify-center rounded-full
                               border border-white/10 bg-background/70 backdrop-blur
                               text-secondary hover:text-text hover:border-white/25
                               transition-colors duration-150"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      className="h-5 w-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m8.25 4.5 7.5 7.5-7.5 7.5"
                      />
                    </svg>
                  </button>
                </>
              )}

              {/* Track viewport — fixed height so the layout below stays put */}
              <div className="h-[34rem] overflow-hidden">
                <div
                  className="flex h-full items-center gap-8 transition-transform duration-500 ease-out"
                  style={{
                    transform: `translateX(calc(50% - 10rem - ${activeIndex * 22}rem))`,
                  }}
                >
                  {profiles.map((profile, index) => {
                    const isActive = index === activeIndex;
                    return (
                      <div
                        key={profile._id}
                        role="option"
                        aria-selected={isActive}
                        onClick={() =>
                          isActive
                            ? handleSelectProfile(profile)
                            : setActiveIndex(index)
                        }
                        className={`relative w-[20rem] shrink-0 rounded-3xl border p-8 text-left
                                    transition-all duration-500 cursor-pointer
                                    flex flex-col
                                    ${
                                      isActive
                                        ? "h-[30rem] scale-100 opacity-100 border-primary/40 bg-white/[0.06] shadow-2xl shadow-black/40"
                                        : "h-[26rem] scale-90 opacity-40 border-white/10 bg-white/[0.03] hover:opacity-70"
                                    }`}
                      >
                        {/* Delete button — only interactive on the active card */}
                        {isActive && (
                          <button
                            type="button"
                            onClick={(e) => handleRequestDelete(e, profile)}
                            aria-label={`Delete profile ${profile.profileName}`}
                            className="absolute top-5 right-5 z-10 p-2.5 rounded-lg text-secondary
                                       hover:text-accent hover:bg-white/[0.06] transition-colors duration-150"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                              className="w-6 h-6"
                            >
                              <path
                                fillRule="evenodd"
                                d="M8.75 1a.75.75 0 0 0-.75.75V2h-3.5a.75.75 0 0 0 0 1.5h.564l.62 10.548A2.75 2.75 0 0 0 8.427 17h3.146a2.75 2.75 0 0 0 2.743-2.952l.62-10.548h.564a.75.75 0 0 0 0-1.5h-3.5v-.25a.75.75 0 0 0-.75-.75h-2.5ZM8.5 6.75a.75.75 0 0 1 1.5 0v6.5a.75.75 0 0 1-1.5 0v-6.5Zm3.75-.75a.75.75 0 0 0-.75.75v6.5a.75.75 0 0 0 1.5 0v-6.5a.75.75 0 0 0-.75-.75Z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </button>
                        )}

                        {/* Country avatar */}
                        <div className="h-20 w-20 overflow-hidden rounded-2xl border border-white/10">
                          <span
                            className={`fi fis fi-${profile.country?.toLowerCase()} !block !h-full !w-full`}
                            title={profile.country}
                          />
                        </div>

                        {/* Name + country */}
                        <div className="mt-6">
                          <h3 className="text-2xl font-bold text-text leading-tight">
                            {profile.profileName}
                          </h3>
                          <p className="mt-1 text-base text-secondary">
                            {COUNTRY_NAME_BY_ID[profile.country] ||
                              profile.country}
                          </p>
                        </div>

                        {!profile.isActive && (
                          <span className="mt-3 inline-flex w-fit rounded-full bg-white/10 px-2.5 py-0.5 text-xs text-secondary">
                            Archived
                          </span>
                        )}

                        {/* Application counts */}
                        <div className="mt-6 space-y-3">
                          <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3">
                            <span className="text-sm font-medium text-secondary">
                              To apply
                            </span>
                            <span className="text-2xl font-bold text-text">
                              {profile.toApplyCount ?? 0}
                            </span>
                          </div>
                          <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3">
                            <span className="text-sm font-medium text-secondary">
                              Applied
                            </span>
                            <span className="text-2xl font-bold text-text">
                              {profile.appliedCount ?? 0}
                            </span>
                          </div>
                        </div>

                        {/* Live clock pinned to the bottom */}
                        <div className="mt-auto pt-6 border-t border-white/10">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 text-text">
                              <span className="h-2 w-2 rounded-full bg-primary" />
                              <span className="text-lg font-semibold">
                                <LiveClock timezone={profile.timezone} />
                              </span>
                            </div>
                            <span className="text-xs text-secondary">
                              {profile.timezone}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Select button */}
            <div className="mt-4 flex justify-center">
              <button
                type="button"
                onClick={() => handleSelectProfile(profiles[activeIndex])}
                className="w-full max-w-[20rem] rounded-xl bg-primary hover:bg-primary/90
                           py-3.5 text-base font-bold uppercase tracking-wide text-white
                           shadow-lg shadow-primary/25 transition-all duration-200"
              >
                Select
              </button>
            </div>

            {/* Pagination dots */}
            {profileCount > 1 && (
              <div className="mt-6 flex items-center justify-center gap-2">
                {profiles.map((profile, index) => (
                  <button
                    key={profile._id}
                    type="button"
                    onClick={() => setActiveIndex(index)}
                    aria-label={`Go to profile ${index + 1}`}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      index === activeIndex
                        ? "w-6 bg-primary"
                        : "w-2 bg-white/20 hover:bg-white/40"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </main>

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
