import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useUiStore from "../store/uiStore";
import { useApplications } from "../hooks/useApplications";
import { STATUS_ORDER, STATUS_LABELS } from "../utils/constants";
import Navbar from "../components/layout/Navbar";
import ApplicationCard from "../components/common/ApplicationCard";
import NewApplicationModal from "../components/layout/NewApplicationModal";
import Loader from "../components/common/Loader";
import Button from "../components/common/Button";
import {
  PlusIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "../components/common/icons";

// Solid accent colour per Kanban status (top bar + header dot)
const STATUS_ACCENTS = {
  T: "bg-secondary",
  A: "bg-primary",
  I: "bg-warning",
  R: "bg-danger",
  O: "bg-success",
};

// Text colour per status (column header icon)
const STATUS_TEXT_COLORS = {
  T: "text-secondary",
  A: "text-primary",
  I: "text-warning",
  R: "text-danger",
  O: "text-success",
};

// Icon path per status (heroicons outline)
const STATUS_ICONS = {
  // To Apply — document
  T: "M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z",
  // Applied — paper airplane
  A: "M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5",
  // Interviewing — chat bubbles
  I: "M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z",
  // Rejected — x circle
  R: "m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
  // Offer — trophy
  O: "M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.497 14.25a7.454 7.454 0 0 0 .981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 0 0 7.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 0 0 2.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 0 1 2.916.52 6.003 6.003 0 0 1-5.395 4.972m0 0a6.726 6.726 0 0 1-2.749 1.35m0 0a6.772 6.772 0 0 1-3.044 0",
};

// Briefcase icon for the "Total" stat card (heroicons outline)
const TOTAL_ICON =
  "M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 0 0 .75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 0 0-3.413-.387m4.5 6.008c-.194.165-.42.295-.673.38A23.978 23.978 0 0 1 12 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 0 1-.673-.38m0 0A2.18 2.18 0 0 1 3 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 0 1 3.413-.387m7.5 0V5.25A2.25 2.25 0 0 0 13.5 3h-3a2.25 2.25 0 0 0-2.25 2.25v.894m7.5 0a48.667 48.667 0 0 0-7.5 0M12 12.75h.008v.008H12v-.008Z";

// Colour tones used by the stat cards
const STAT_TONES = {
  primary: { chip: "bg-primary/15 text-primary", glow: "bg-primary/30" },
  secondary: {
    chip: "bg-secondary/15 text-secondary",
    glow: "bg-secondary/30",
  },
  accent: { chip: "bg-accent/15 text-accent", glow: "bg-accent/30" },
  warning: { chip: "bg-warning/15 text-warning", glow: "bg-warning/30" },
  red: { chip: "bg-danger/15 text-danger", glow: "bg-danger/30" },
};

// Per-column pagination — how many cards to show at once
const PAGE_SIZE_OPTIONS = [5, 10, 25, "All"];

function Dashboard() {
  const navigate = useNavigate();
  const selectedProfile = useUiStore((state) => state.selectedProfile);
  const visibleColumns = useUiStore((state) => state.visibleColumns);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    data: applications,
    isLoading,
    isError,
  } = useApplications(selectedProfile?._id);

  // Guard: no profile selected — redirect back to the selector
  useEffect(() => {
    if (!selectedProfile) {
      navigate("/profiles", { replace: true });
    }
  }, [selectedProfile, navigate]);

  if (!selectedProfile) {
    return null;
  }

  // Group applications by status for the Kanban columns
  const groupedByStatus = STATUS_ORDER.reduce((acc, statusCode) => {
    acc[statusCode] =
      applications?.filter((app) => app.status === statusCode) ?? [];
    return acc;
  }, {});

  // Quick analytics numbers shown at the top of the dashboard
  const stats = {
    total: applications?.length ?? 0,
    applied: applications?.filter((a) => a.status !== "T").length ?? 0,
    interviewing: groupedByStatus.I?.length ?? 0,
    rejected: groupedByStatus.R?.length ?? 0,
  };

  // Only the columns the user has chosen to display
  const visibleStatuses = STATUS_ORDER.filter((code) =>
    visibleColumns.includes(code),
  );

  return (
    <div className="min-h-screen bg-background flex">
      <Navbar />

      <main className="relative flex-1 min-w-0 overflow-hidden">
        {/* Ambient background */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="animate-aurora absolute -top-40 left-1/4 h-96 w-96 rounded-full bg-primary/15 blur-[150px]" />
          <div className="absolute top-1/2 right-0 h-80 w-80 rounded-full bg-accent/10 blur-[150px]" />
        </div>

        <div className="relative max-w-[100rem] mx-auto px-6 py-8">
          {/* Stats bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <StatCard
              label="Total"
              value={stats.total}
              tone="primary"
              icon={TOTAL_ICON}
              featured
            />
            <StatCard
              label="Applied"
              value={stats.applied}
              tone="secondary"
              icon={STATUS_ICONS.A}
            />
            <StatCard
              label="Interviewing"
              value={stats.interviewing}
              tone="warning"
              icon={STATUS_ICONS.I}
            />
            <StatCard
              label="Rejected"
              value={stats.rejected}
              tone="red"
              icon={STATUS_ICONS.R}
            />
          </div>

          {/* Toolbar: divider + add application (same row) */}
          <div className="flex items-center gap-4 mb-6">
            <div className="h-px flex-1 bg-gradient-to-r from-white/10 via-white/20 to-white/30" />
            <Button
              variant="gradient"
              rounded="rounded-xl"
              onClick={() => setIsModalOpen(true)}
              className="group whitespace-nowrap"
            >
              <PlusIcon className="h-4 w-4 transition-transform duration-300 group-hover:rotate-90" />
              Add application
            </Button>
          </div>

          {/* Loading / error states */}
          {isLoading && <Loader label="Loading applications…" />}
          {isError && (
            <p className="text-accent text-center mt-16">
              Failed to load applications. Please refresh the page.
            </p>
          )}

          {/* Kanban board */}
          {!isLoading && !isError && (
            <>
              {visibleStatuses.length === 0 ? (
                <p className="text-secondary text-center mt-16">
                  No columns selected. Enable at least one column above.
                </p>
              ) : (
                <div className="flex flex-wrap gap-4 items-stretch">
                  {visibleStatuses.map((statusCode) => (
                    <KanbanColumn
                      key={statusCode}
                      statusCode={statusCode}
                      applications={groupedByStatus[statusCode]}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <NewApplicationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        profileId={selectedProfile._id}
      />
    </div>
  );
}

/**
 * KanbanColumn
 * One status column with its own independent pagination:
 *   - a page-size selector (5 / 10 / 25 / All)
 *   - previous / next controls
 */
function KanbanColumn({ statusCode, applications }) {
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);

  const total = applications.length;
  const isAll = pageSize === "All";
  const effectiveSize = isAll ? Math.max(total, 1) : pageSize;
  const totalPages = Math.max(1, Math.ceil(total / effectiveSize));

  // Clamp the page if the underlying data shrank (e.g. a card moved out)
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * effectiveSize;
  const visible = isAll
    ? applications
    : applications.slice(start, start + effectiveSize);

  const handlePageSizeChange = (e) => {
    const raw = e.target.value;
    setPageSize(raw === "All" ? "All" : Number(raw));
    setPage(1);
  };

  const showPager = !isAll && totalPages > 1;

  return (
    <div
      className="flex-1 min-w-[240px] flex flex-col overflow-hidden rounded-3xl
               border border-white/[0.07] bg-surface/40 backdrop-blur-sm"
    >
      {/* Coloured accent bar */}
      <div className={`h-1 w-full ${STATUS_ACCENTS[statusCode]}`} />

      {/* Column header */}
      <div className="flex items-center justify-between px-4 pt-3.5 pb-3">
        <div className="flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.7}
            className={`h-4 w-4 ${STATUS_TEXT_COLORS[statusCode]}`}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d={STATUS_ICONS[statusCode]}
            />
          </svg>
          <span className="text-sm font-semibold text-text">
            {STATUS_LABELS[statusCode]}
          </span>
        </div>
        <span className="min-w-[1.5rem] rounded-full bg-white/[0.06] px-2 py-0.5 text-center text-xs font-medium text-secondary">
          {total}
        </span>
      </div>

      {/* Cards */}
      <div className="flex-1 space-y-2 px-3 pb-3">
        {visible.map((application) => (
          <ApplicationCard key={application._id} application={application} />
        ))}

        {total === 0 && (
          <div className="flex items-center justify-center rounded-xl border border-dashed border-white/10 py-8 text-xs text-white/25">
            No applications
          </div>
        )}
      </div>

      {/* Pagination footer */}
      {total > 0 && (
        <div className="flex items-center justify-between gap-2 border-t border-white/[0.06] px-3 py-2.5">
          <label className="flex items-center gap-1.5 text-xs text-secondary">
            <span>Show</span>
            <select
              value={pageSize}
              onChange={handlePageSizeChange}
              className="rounded-md border border-white/10 bg-white/[0.06] px-2 py-1 text-xs text-text
                         appearance-none cursor-pointer focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            >
              {PAGE_SIZE_OPTIONS.map((opt) => (
                <option key={opt} value={opt} className="bg-surface">
                  {opt}
                </option>
              ))}
            </select>
          </label>

          {showPager && (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                aria-label="Previous page"
                className="flex h-7 w-7 items-center justify-center rounded-md border border-white/10
                           text-secondary hover:border-white/20 hover:text-text transition-colors duration-150
                           disabled:opacity-30 disabled:hover:border-white/10"
              >
                <ChevronLeftIcon className="h-4 w-4" />
              </button>
              <span className="text-xs font-medium text-secondary tabular-nums">
                {currentPage} / {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                aria-label="Next page"
                className="flex h-7 w-7 items-center justify-center rounded-md border border-white/10
                           text-secondary hover:border-white/20 hover:text-text transition-colors duration-150
                           disabled:opacity-30 disabled:hover:border-white/10"
              >
                <ChevronRightIcon className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * StatCard
 * Small presentational component for the analytics bar at the top of the Dashboard
 */
function StatCard({ label, value, tone = "primary", icon, featured = false }) {
  const { chip, glow } = STAT_TONES[tone] ?? STAT_TONES.primary;

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl p-4 transition-all duration-300 ${
        featured
          ? "border border-primary/30 bg-gradient-to-br from-primary/[0.16] via-white/[0.03] to-transparent shadow-glow-sm hover:border-primary/50"
          : "border border-white/[0.08] bg-white/[0.02] hover:border-white/[0.14] hover:bg-white/[0.03]"
      }`}
    >
      {/* Ambient glow that intensifies on hover */}
      <div
        className={`pointer-events-none absolute -bottom-8 -right-8 rounded-full ${glow}
                    blur-2xl transition-opacity duration-300 group-hover:opacity-90 ${
                      featured ? "h-28 w-28 opacity-80" : "h-24 w-24 opacity-50"
                    }`}
      />

      <div className="relative flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p
            className={`truncate text-sm font-medium uppercase tracking-wide ${
              featured ? "text-primary" : "text-secondary"
            }`}
          >
            {label}
          </p>
          <p
            className={`mt-1 font-bold tracking-tight text-text ${
              featured ? "text-4xl" : "text-3xl"
            }`}
          >
            {value}
          </p>
        </div>
        <span
          className={`flex shrink-0 items-center justify-center rounded-xl ${chip} ${
            featured ? "h-12 w-12" : "h-11 w-11"
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.7}
            className={featured ? "h-6 w-6" : "h-5 w-5"}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
          </svg>
        </span>
      </div>
    </div>
  );
}

export default Dashboard;
