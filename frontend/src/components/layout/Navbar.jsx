import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import useAuthStore from "../../store/authStore";
import useUiStore from "../../store/uiStore";
import LiveClock from "../common/LiveClock";
import { getCountryList } from "../../utils/timezones";
import { STATUS_ORDER, STATUS_LABELS } from "../../utils/constants";

// Fast lookup: ISO country code -> full country name
const COUNTRY_NAME_BY_ID = Object.fromEntries(
  getCountryList().map((c) => [c.id, c.name]),
);

// The IANA timezone of the machine running the browser (ex: "Europe/Paris")
const LOCAL_TIMEZONE = Intl.DateTimeFormat().resolvedOptions().timeZone;

// Accent dot colour per Kanban status (matches the board's status colours)
const STATUS_DOT_COLORS = {
  T: "bg-secondary",
  A: "bg-primary",
  I: "bg-accent",
  R: "bg-red-400",
  O: "bg-emerald-400",
};

/**
 * Navbar
 *
 */
function Navbar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const user = useAuthStore((state) => state.user);
  const selectedProfile = useUiStore((state) => state.selectedProfile);
  const clearSelectedProfile = useUiStore(
    (state) => state.clearSelectedProfile,
  );
  const visibleColumns = useUiStore((state) => state.visibleColumns);
  const toggleColumn = useUiStore((state) => state.toggleColumn);

  const isDashboard = pathname === "/dashboard";

  // Mobile drawer open/close state (ignored on large screens where the
  // sidebar is always visible)
  const [isOpen, setIsOpen] = useState(false);

  const handleChangeProfile = () => {
    clearSelectedProfile();
    navigate("/profiles");
  };

  const handleLogout = () => {
    clearAuth();
    clearSelectedProfile();
    navigate("/auth");
  };

  const countryName = selectedProfile
    ? (COUNTRY_NAME_BY_ID[selectedProfile.country] ?? selectedProfile.country)
    : null;

  return (
    <>
      {/* Hamburger button — mobile only */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="Open menu"
        className="fixed top-4 left-4 z-30 flex h-10 w-10 items-center justify-center rounded-lg
                   border border-white/10 bg-background/80 text-text backdrop-blur lg:hidden"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.7}
          className="h-5 w-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
          />
        </svg>
      </button>

      {/* Backdrop — mobile only, closes the drawer */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-30 bg-black/60 lg:hidden"
        />
      )}

      <aside
        className={`fixed lg:sticky top-0 left-0 z-40 lg:z-30 flex h-screen w-72 max-w-[80vw] lg:w-72
                    shrink-0 flex-col overflow-y-auto border-r border-white/10
                    bg-background/95 lg:bg-background/80 backdrop-blur-md px-4 py-6
                    transform transition-transform duration-300 lg:translate-x-0 ${
                      isOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
      >
        {/* Close button — mobile only */}
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          aria-label="Close menu"
          className="absolute top-4 right-4 z-10 flex h-8 w-8 items-center justify-center rounded-lg
                     text-secondary hover:text-text hover:bg-white/[0.06] transition-colors lg:hidden"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.7}
            className="h-5 w-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18 18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Profile card */}
        <div className="shrink-0 overflow-hidden rounded-2xl border border-white/10">
          {/* Flag banner */}
          {selectedProfile ? (
            <span className="block h-48 w-full">
              <span
                className={`fi fi-${selectedProfile.country?.toLowerCase()} !block !h-full !w-full`}
                title={selectedProfile.country}
              />
            </span>
          ) : (
            <div className="flex h-44 w-full items-center justify-center bg-white/[0.04] text-sm text-secondary">
              No profile
            </div>
          )}

          {/* Info panel */}
          <div className="bg-white/[0.04] p-5">
            <p className="text-xs text-secondary truncate">
              {countryName ?? "No profile selected"}
            </p>
            <h1 className="mt-0.5 text-xl font-bold leading-tight text-text truncate">
              {selectedProfile?.profileName ?? "—"}
            </h1>

            {/* Signed-in user */}
            <div className="mt-4 flex items-center gap-2.5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-5 w-5"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0zM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695z"
                    clipRule="evenodd"
                  />
                </svg>
              </span>
              <span className="text-sm font-medium text-text truncate">
                {user?.username ?? "—"}
              </span>
            </div>
          </div>
        </div>

        {/* Clocks */}
        <div className="mt-4 space-y-4 border-t border-white/10 pt-4">
          {/* Profile country local time */}
          <div className="flex items-center gap-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.6}
              className="h-5 w-5 shrink-0 text-secondary"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6v6l4 2m6-2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
              />
            </svg>
            <div className="leading-tight min-w-0">
              <p className="text-[10px] uppercase tracking-wide text-secondary/70 truncate">
                {countryName ?? "Profile"}
              </p>
              <p className="text-sm font-medium text-text">
                {selectedProfile ? (
                  <LiveClock timezone={selectedProfile.timezone} />
                ) : (
                  "—"
                )}
              </p>
            </div>
          </div>

          {/* Computer local time */}
          <div className="flex items-center gap-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.6}
              className="h-5 w-5 shrink-0 text-secondary"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0V12a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 12V5.25"
              />
            </svg>
            <div className="leading-tight min-w-0">
              <p className="text-[10px] uppercase tracking-wide text-secondary/70 truncate">
                Local
              </p>
              <p className="text-sm font-medium text-text">
                <LiveClock timezone={LOCAL_TIMEZONE} />
              </p>
            </div>
          </div>
        </div>

        {/* Kanban columns visibility (Dashboard only) */}
        {isDashboard && (
          <div className="mt-4 border-t border-white/10 pt-4">
            <div className="mb-3 flex items-center gap-2 text-secondary/70">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.6}
                className="h-3.5 w-3.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25zM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6z"
                />
              </svg>
              <p className="text-[10px] font-semibold uppercase tracking-wider">
                Columns
              </p>
            </div>

            <div className="space-y-1">
              {STATUS_ORDER.map((statusCode) => {
                const checked = visibleColumns.includes(statusCode);
                return (
                  <label
                    key={statusCode}
                    className="group flex cursor-pointer select-none items-center justify-between gap-3
                               rounded-xl px-3 py-2.5 transition-colors duration-150 hover:bg-white/[0.04]"
                  >
                    <span className="flex items-center gap-3">
                      <span
                        className={`h-2.5 w-2.5 rounded-full transition-all duration-200 ${
                          STATUS_DOT_COLORS[statusCode]
                        } ${checked ? "opacity-100 scale-100" : "opacity-30 scale-90"}`}
                      />
                      <span
                        className={`text-sm font-medium transition-colors duration-150 ${
                          checked
                            ? "text-text"
                            : "text-secondary group-hover:text-text"
                        }`}
                      >
                        {STATUS_LABELS[statusCode]}
                      </span>
                    </span>

                    {/* Modern toggle switch */}
                    <span
                      className={`relative h-5 w-9 shrink-0 rounded-full transition-colors duration-200 ${
                        checked
                          ? "bg-primary"
                          : "bg-white/15 group-hover:bg-white/25"
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                          checked ? "translate-x-4" : "translate-x-0"
                        }`}
                      />
                    </span>

                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleColumn(statusCode)}
                      className="sr-only"
                    />
                  </label>
                );
              })}
            </div>
          </div>
        )}

        {/* Actions pinned to the bottom */}
        <div className="mt-auto pt-6 space-y-2">
          <button
            type="button"
            onClick={handleChangeProfile}
            className="w-full rounded-lg border border-white/10 hover:border-white/20 bg-white/[0.04]
                     hover:bg-white/[0.08] px-3 py-2 text-sm text-secondary hover:text-text
                     transition-colors duration-150"
          >
            Change profile
          </button>
          <button
            type="button"
            onClick={handleLogout}
            aria-label="Log out"
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-500/40
                     hover:border-red-500/60 bg-red-500/10 hover:bg-red-500/20 px-3 py-2 text-sm
                     text-red-400 hover:text-red-300 transition-colors duration-150"
          >
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
                d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9"
              />
            </svg>
            Log out
          </button>
        </div>
      </aside>
    </>
  );
}

export default Navbar;
