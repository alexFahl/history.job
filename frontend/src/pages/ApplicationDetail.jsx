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

  const handleDelete = async () => {
    await deleteMutation.mutateAsync();
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-3xl mx-auto px-6 py-8">
        {/* Back link */}
        <button
          type="button"
          onClick={() => navigate("/dashboard")}
          className="text-secondary hover:text-primary text-sm mb-6 transition-colors duration-150"
        >
          ← Back to dashboard
        </button>

        {isLoading && (
          <p className="text-secondary text-center mt-16">Loading…</p>
        )}
        {isError && (
          <p className="text-accent text-center mt-16">
            Failed to load this application.
          </p>
        )}

        {application && (
          <div className="space-y-5">
            {/* Header + Key info — editable in one block */}
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

            {/* Contacts */}
            <ContactsSection application={application} />

            {/* Timeline */}
            <TimelineSection application={application} />

            {/* Documents */}
            <DocumentsSection application={application} />

            {/* Notes */}
            <NotesSection
              value={application.notes}
              onSave={handleSaveNotes}
              isSaving={updateMutation.isPending}
            />

            {/* Danger zone */}
            <div className="border border-red-500/20 bg-red-500/5 rounded-2xl p-5">
              <h3 className="text-red-400 font-semibold text-sm mb-2">
                Danger zone
              </h3>
              <p className="text-secondary text-xs mb-4">
                This will permanently delete this application. This action
                cannot be undone.
              </p>

              {!isDeleting ? (
                <button
                  type="button"
                  onClick={() => setIsDeleting(true)}
                  className="text-sm text-red-400 hover:text-red-300 font-medium transition-colors duration-150"
                >
                  Delete this application
                </button>
              ) : (
                <div className="flex items-center gap-3">
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
                    className="text-secondary hover:text-text text-sm transition-colors duration-150"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ApplicationDetail;
