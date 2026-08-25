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
import Modal from "../components/common/Modal";
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

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteError, setDeleteError] = useState("");

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
    setDeleteError("");
    try {
      await deleteMutation.mutateAsync();
      navigate("/dashboard");
    } catch (err) {
      setDeleteError(
        err.response?.data?.message ||
          "Failed to delete application. Please try again.",
      );
    }
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

            {application && (
              <Button
                variant="danger-soft"
                rounded="rounded-full"
                onClick={() => {
                  setDeleteError("");
                  setIsDeleteModalOpen(true);
                }}
              >
                <TrashIcon className="h-4 w-4" />
                Delete
              </Button>
            )}
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

      {/* Delete confirmation modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete application"
      >
        <div className="space-y-4">
          <p className="text-sm text-text">
            Are you sure you want to delete{" "}
            <span className="font-semibold">
              {application?.jobTitle || "this application"}
            </span>
            {application?.companyName ? ` at ${application.companyName}` : ""}?
          </p>

          <p className="text-accent text-sm bg-accent/10 border border-accent/20 rounded-lg px-4 py-2.5">
            Warning: this will permanently delete the application, including any
            uploaded CVs and cover letters. This action cannot be undone.
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
              onClick={() => setIsDeleteModalOpen(false)}
              className="text-text"
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              fullWidth
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting…" : "Delete application"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default ApplicationDetail;
