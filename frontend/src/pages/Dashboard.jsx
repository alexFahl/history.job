import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useUiStore from "../store/uiStore";
import { useApplications } from "../hooks/useApplications";
import { STATUS_ORDER, STATUS_LABELS, STATUS_COLORS } from "../utils/constants";
import Navbar from "../components/layout/Navbar";
import ApplicationCard from "../components/common/ApplicationCard";
import NewApplicationModal from "../components/layout/NewApplicationModal";

function Dashboard() {
  const navigate = useNavigate();
  const selectedProfile = useUiStore((state) => state.selectedProfile);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    data: applications,
    isLoading,
    isError,
  } = useApplications(selectedProfile?._id);

  // Guard: no profile selected
  if (!selectedProfile) {
    navigate("/profiles");
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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Stats bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <StatCard label="Total" value={stats.total} />
          <StatCard label="Applied" value={stats.applied} />
          <StatCard label="Interviewing" value={stats.interviewing} />
          <StatCard label="Rejected" value={stats.rejected} />
        </div>

        {/* Add application button */}
        <div className="flex justify-end mb-6">
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="bg-primary hover:bg-primary/90 text-white font-semibold text-sm
                       px-5 py-2.5 rounded-lg shadow-lg shadow-primary/20
                       transition-all duration-200"
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {STATUS_ORDER.map((statusCode) => (
              <div
                key={statusCode}
                className="bg-white/[0.02] border border-white/5 rounded-2xl p-3"
              >
                <div className="flex items-center justify-between mb-3 px-1">
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded-full ${STATUS_COLORS[statusCode]}`}
                  >
                    {STATUS_LABELS[statusCode]}
                  </span>
                  <span className="text-white/30 text-xs">
                    {groupedByStatus[statusCode].length}
                  </span>
                </div>

                <div className="space-y-2 min-h-[80px]">
                  {groupedByStatus[statusCode].map((application) => (
                    <ApplicationCard
                      key={application._id}
                      application={application}
                    />
                  ))}

                  {groupedByStatus[statusCode].length === 0 && (
                    <p className="text-white/15 text-xs text-center py-6">
                      No applications
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

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
 * Small presentational component for the analytics bar at the top of the Dashboard.
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
