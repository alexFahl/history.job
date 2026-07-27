import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useUiStore from "../store/uiStore";
import { useApplications } from "../hooks/useApplications";
import { STATUS_ORDER, STATUS_LABELS } from "../utils/constants";
import Navbar from "../components/layout/Navbar";
import ApplicationCard from "../components/common/ApplicationCard";
import NewApplicationModal from "../components/layout/NewApplicationModal";

// Solid accent colour per Kanban status (top bar + header dot)
const STATUS_ACCENTS = {
  T: "bg-secondary",
  A: "bg-primary",
  I: "bg-accent",
  R: "bg-red-400",
  O: "bg-emerald-400",
};

// Text colour per status (column header icon)
const STATUS_TEXT_COLORS = {
  T: "text-secondary",
  A: "text-primary",
  I: "text-accent",
  R: "text-red-400",
  O: "text-emerald-400",
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

      <main className="flex-1 min-w-0">
        <div className="max-w-[100rem] mx-auto px-6 py-8">
          {/* Stats bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <StatCard label="Total" value={stats.total} />
            <StatCard label="Applied" value={stats.applied} />
            <StatCard label="Interviewing" value={stats.interviewing} />
            <StatCard label="Rejected" value={stats.rejected} />
          </div>

          {/* Toolbar: add application */}
          <div className="flex justify-end mb-6">
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="bg-primary hover:bg-primary/90 text-white font-semibold text-sm
                       px-5 py-2.5 rounded-lg shadow-lg shadow-primary/20
                       transition-all duration-200 whitespace-nowrap"
            >
              + Add application
            </button>
          </div>

          {/* Loading / error states */}
          {isLoading && (
            <p className="text-secondary text-center mt-16">
              Loading applications…
            </p>
          )}
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
                    <div
                      key={statusCode}
                      className="flex-1 min-w-[240px] flex flex-col overflow-hidden rounded-2xl
                               border border-white/[0.06] bg-white/[0.02]"
                    >
                      {/* Coloured accent bar */}
                      <div
                        className={`h-1 w-full ${STATUS_ACCENTS[statusCode]}`}
                      />

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
                          {groupedByStatus[statusCode].length}
                        </span>
                      </div>

                      {/* Cards */}
                      <div className="flex-1 space-y-2 px-3 pb-3">
                        {groupedByStatus[statusCode].map((application) => (
                          <ApplicationCard
                            key={application._id}
                            application={application}
                          />
                        ))}

                        {groupedByStatus[statusCode].length === 0 && (
                          <div className="flex items-center justify-center rounded-xl border border-dashed border-white/10 py-8 text-xs text-white/25">
                            No applications
                          </div>
                        )}
                      </div>
                    </div>
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
 * StatCard
 * Small presentational component for the analytics bar at the top of the Dashboard
 */
function StatCard({ label, value }) {
  return (
    <div className="bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3">
      <p className="text-secondary text-xs">{label}</p>
      <p className="text-text text-2xl font-bold mt-1">{value}</p>
    </div>
  );
}

export default Dashboard;
