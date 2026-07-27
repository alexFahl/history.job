import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useUiStore from "../store/uiStore";
import {
  useApplicationDetail,
  useUpdateApplicationDetail,
  useDeleteApplicationDetail,
} from "../hooks/useApplicationDetail";
import Navbar from "../components/layout/Navbar";
import StatusDropdown from "../components/common/StatusDropdown";
import EditableInfoSection from "../components/common/EditableInfoSection";
import ContactsSection from "../components/common/ContactsSection";
import TimelineSection from "../components/common/TimelineSection";
import DocumentsSection from "../components/common/DocumentsSection";
import NotesSection from "../components/common/NotesSection";

/**
 * ApplicationDetail
 *
 * Centralizes everything about one specific job offer
 *
 * Route: /applications/:id
 */
function ApplicationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const selectedProfile = useUiStore((state) => state.selectedProfile);

  const { data: application, isLoading, isError } = useApplicationDetail(id);
  const updateMutation = useUpdateApplicationDetail(id, selectedProfile?._id);
  const deleteMutation = useDeleteApplicationDetail(id, selectedProfile?._id);

  const [isDeleting, setIsDeleting] = useState(false);

  const handleStatusChange = (newStatus) => {
    updateMutation.mutate({ status: newStatus });
  };

  const handleSaveInfo = (partialData) => {
    updateMutation.mutate(partialData);
  };

  const handleSaveNotes = (newNotes) => {
    updateMutation.mutate({ notes: newNotes });
  };

  const handleSaveDescription = (newDescription) => {
    updateMutation.mutate({ description: newDescription });
  };

  const handleDelete = async () => {
    await deleteMutation.mutateAsync();
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-background flex">
      <Navbar />

      <main className="flex-1 min-w-0">
        <div className="px-6 py-8">
          {/* Header: back link + delete */}
          <div className="flex items-center justify-between mb-6">
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="text-secondary hover:text-primary text-sm transition-colors duration-150"
            >
              ← Back to dashboard
            </button>

            {application &&
              (!isDeleting ? (
                <button
                  type="button"
                  onClick={() => setIsDeleting(true)}
                  className="flex items-center gap-2 rounded-lg border border-red-500/40 hover:border-red-500/60
                             bg-red-500/10 hover:bg-red-500/20 px-4 py-2 text-sm font-medium
                             text-red-400 hover:text-red-300 transition-colors duration-150"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="h-4 w-4"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.75 1a.75.75 0 0 0-.75.75V2h-3.5a.75.75 0 0 0 0 1.5h.564l.62 10.548A2.75 2.75 0 0 0 8.427 17h3.146a2.75 2.75 0 0 0 2.743-2.952l.62-10.548h.564a.75.75 0 0 0 0-1.5h-3.5v-.25a.75.75 0 0 0-.75-.75h-2.5ZM8.5 6.75a.75.75 0 0 1 1.5 0v6.5a.75.75 0 0 1-1.5 0v-6.5Zm3.75-.75a.75.75 0 0 0-.75.75v6.5a.75.75 0 0 0 1.5 0v-6.5a.75.75 0 0 0-.75-.75Z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Delete
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={deleteMutation.isPending}
                    className="bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white text-sm
                               font-medium px-4 py-2 rounded-lg transition-colors duration-150"
                  >
                    {deleteMutation.isPending ? "Deleting…" : "Confirm delete"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsDeleting(false)}
                    className="text-secondary hover:text-text text-sm px-2 transition-colors duration-150"
                  >
                    Cancel
                  </button>
                </div>
              ))}
          </div>

          {isLoading && (
            <p className="text-secondary text-center mt-16">Loading…</p>
          )}
          {isError && (
            <p className="text-accent text-center mt-16">
              Failed to load this application.
            </p>
          )}

          {application && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch">
              {/* Row 1 — Key info / Documents */}
              <EditableInfoSection
                application={application}
                onSave={handleSaveInfo}
                isSaving={updateMutation.isPending}
                statusSlot={
                  <StatusDropdown
                    value={application.status}
                    onChange={handleStatusChange}
                  />
                }
              />
              <ContactsSection application={application} />

              {/* Row 2 — Description / Timeline */}
              <NotesSection
                value={application.description}
                onSave={handleSaveDescription}
                isSaving={updateMutation.isPending}
                title="Description"
                placeholder="Paste or type the job description here…"
                rows={10}
              />
              <TimelineSection application={application} />

              {/* Row 3 — Documents / Notes */}
              <DocumentsSection application={application} />
              <NotesSection
                value={application.notes}
                onSave={handleSaveNotes}
                isSaving={updateMutation.isPending}
                rows={3}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default ApplicationDetail;
