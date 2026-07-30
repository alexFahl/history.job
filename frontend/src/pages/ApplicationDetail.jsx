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
import Loader from "../components/common/Loader";
import Button from "../components/common/Button";
import { ChevronLeftIcon, TrashIcon } from "../components/common/icons";

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
    <div className="min-h-screen bg-background text-text flex">
      <Navbar />

      <main className="relative flex-1 min-w-0 overflow-hidden">
        {/* Ambient background — soft glows + dotted grid for depth */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-32 -left-24 h-96 w-96 rounded-full bg-primary/20 blur-[130px]" />
          <div className="absolute top-32 right-0 h-80 w-80 rounded-full bg-accent/10 blur-[130px]" />
          <div className="absolute inset-0 bg-grid-dots opacity-[0.12]" />
        </div>

        <div className="relative w-full px-6 py-8">
          {/* Header: back link + delete */}
          <div className="flex items-center justify-between mb-8">
            <Button
              variant="ghost"
              rounded="rounded-full"
              onClick={() => navigate("/dashboard")}
              className="group backdrop-blur-sm"
            >
              <ChevronLeftIcon className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
              Back to dashboard
            </Button>

            {application &&
              (!isDeleting ? (
                <Button
                  variant="danger-soft"
                  rounded="rounded-full"
                  onClick={() => setIsDeleting(true)}
                >
                  <TrashIcon className="h-4 w-4" />
                  Delete
                </Button>
              ) : (
                <div className="flex items-center gap-2">
                  <Button
                    variant="danger"
                    rounded="rounded-full"
                    onClick={handleDelete}
                    disabled={deleteMutation.isPending}
                  >
                    {deleteMutation.isPending ? "Deleting…" : "Confirm delete"}
                  </Button>
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

          {isLoading && <Loader label="Loading application…" />}
          {isError && (
            <p className="text-accent text-center mt-24">
              Failed to load this application.
            </p>
          )}

          {application && (
            <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-5 items-stretch">
              {/* Row 1 — Key info (featured) / Contacts */}
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
                rows={11}
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
