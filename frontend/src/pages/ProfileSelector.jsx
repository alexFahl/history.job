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
import Button from "../components/common/Button";
import { Field, TextInput, Select } from "../components/common/Field";
import { PlusIcon, TrashIcon } from "../components/common/icons";

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
    <div className="relative min-h-screen overflow-hidden bg-background flex flex-col px-6 py-8">
      {/* Ambient animated background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="animate-aurora absolute -top-32 -left-24 h-96 w-96 rounded-full bg-primary/25 blur-[130px]" />
        <div className="animate-aurora-alt absolute top-1/3 -right-24 h-[26rem] w-[26rem] rounded-full bg-accent/15 blur-[140px]" />
        <div className="bg-grid-dots absolute inset-0 opacity-[0.15] [mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)]" />
      </div>

      {/* Header */}
      <header className="relative max-w-6xl w-full mx-auto flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text sm:text-3xl">
            Welcome back,{" "}
            <span className="text-gradient animate-gradient-pan">
              {user?.username}
            </span>
          </h1>
          <p className="text-secondary text-sm mt-1.5">
            Choose a profile to continue, or create a new one.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Dedicated "create profile" action — kept out of the carousel */}
          <Button
            variant="gradient"
            rounded="rounded-xl"
            onClick={() => setIsModalOpen(true)}
            className="group"
          >
            <PlusIcon className="w-4 h-4 transition-transform duration-300 group-hover:rotate-90" />
            New profile
          </Button>

          <Button variant="ghost" rounded="rounded-xl" onClick={handleLogout}>
            Log out
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="relative flex-1 flex flex-col items-center justify-center py-8">
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
            <Button
              variant="gradient"
              rounded="rounded-xl"
              onClick={() => setIsModalOpen(true)}
              className="mt-6"
            >
              Create a profile
            </Button>
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
              <div className="h-[26rem] overflow-hidden sm:h-[34rem]">
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
                        className={`relative w-[20rem] shrink-0 rounded-4xl border p-6 text-left
                                    transition-all duration-500 cursor-pointer
                                    flex flex-col overflow-hidden sm:p-8
                                    ${
                                      isActive
                                        ? "h-[24rem] scale-100 opacity-100 border-primary/40 bg-surface/80 shadow-card ring-1 ring-primary/20 sm:h-[30rem]"
                                        : "h-[20rem] scale-90 opacity-40 border-white/10 bg-white/[0.03] hover:opacity-70 sm:h-[26rem]"
                                    }`}
                      >
                        {/* Brand glow on the active card */}
                        {isActive && (
                          <div className="pointer-events-none absolute -top-20 -right-16 h-48 w-48 rounded-full bg-primary/25 blur-3xl" />
                        )}

                        {/* Delete button — only interactive on the active card */}
                        {isActive && (
                          <button
                            type="button"
                            onClick={(e) => handleRequestDelete(e, profile)}
                            aria-label={`Delete profile ${profile.profileName}`}
                            className="absolute top-5 right-5 z-10 p-2.5 rounded-lg text-secondary
                                       hover:text-accent hover:bg-white/[0.06] transition-colors duration-150"
                          >
                            <TrashIcon className="w-6 h-6" />
                          </button>
                        )}

                        {/* Country avatar */}
                        <div className="h-16 w-16 overflow-hidden rounded-2xl border border-white/10 sm:h-20 sm:w-20">
                          <span
                            className={`fi fis fi-${profile.country?.toLowerCase()} !block !h-full !w-full`}
                            title={profile.country}
                          />
                        </div>

                        {/* Name + country */}
                        <div className="mt-4 sm:mt-6">
                          <h3 className="text-xl font-bold text-text leading-tight sm:text-2xl">
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
                        <div className="mt-4 grid grid-cols-2 gap-3 sm:mt-6">
                          {/* To apply */}
                          <div className="rounded-xl border border-secondary/25 bg-secondary/[0.08] p-3">
                            <div className="flex items-center gap-2">
                              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-secondary/20 text-secondary">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth={1.7}
                                  className="h-4 w-4"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
                                  />
                                </svg>
                              </span>
                              <span className="text-xs font-medium text-secondary">
                                To apply
                              </span>
                            </div>
                            <p className="mt-2 text-3xl font-bold text-text tabular-nums">
                              {profile.toApplyCount ?? 0}
                            </p>
                          </div>

                          {/* Applied */}
                          <div className="rounded-xl border border-primary/25 bg-primary/[0.10] p-3">
                            <div className="flex items-center gap-2">
                              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/20 text-primary">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth={1.7}
                                  className="h-4 w-4"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5"
                                  />
                                </svg>
                              </span>
                              <span className="text-xs font-medium text-primary">
                                Applied
                              </span>
                            </div>
                            <p className="mt-2 text-3xl font-bold text-text tabular-nums">
                              {profile.appliedCount ?? 0}
                            </p>
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
              <Button
                variant="gradient"
                size="lg"
                rounded="rounded-xl"
                fullWidth
                onClick={() => handleSelectProfile(profiles[activeIndex])}
                className="max-w-[20rem] uppercase tracking-wide"
              >
                Select
              </Button>
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

          {formError && (
            <p className="text-accent text-sm bg-accent/10 border border-accent/20 rounded-lg px-4 py-2.5">
              {formError}
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
            <Button
              variant="ghost"
              fullWidth
              onClick={handleCancelDelete}
              className="text-text"
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              fullWidth
              onClick={handleConfirmDelete}
              disabled={deleteProfileMutation.isPending}
            >
              {deleteProfileMutation.isPending ? "Deleting…" : "Delete profile"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default ProfileSelector;
