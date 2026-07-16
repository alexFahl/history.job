import { useState, useRef } from "react";
import {
  useUploadDocument,
  useDeleteDocument,
} from "../../hooks/useApplicationDetail";

/**
 * DocumentsSection
 *
 * Renders two drop zones
 *
 * Upload flow:
 *   1. User drops/selects a file
 *   2. We build a FormData with "file" + "docType"
 *   3. useUploadDocument POSTs to /api/applications/:id/upload
 *   4. On success, the query cache is invalidated and the new URL appears
 *
 * Props:
 *   application : the full Application document
 */
function DocumentsSection({ application }) {
  const uploadMutation = useUploadDocument(application._id);
  const deleteMutation = useDeleteDocument(application._id);

  return (
    <section className="bg-white/[0.03] border border-white/10 rounded-2xl p-5">
      <h3 className="text-text font-semibold text-sm mb-4">Documents</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <DropZone
          label="CV"
          docType="cv"
          currentUrl={application.documents?.cvUrl}
          uploadMutation={uploadMutation}
          deleteMutation={deleteMutation}
        />
        <DropZone
          label="Cover Letter"
          docType="coverLetter"
          currentUrl={application.documents?.coverLetterUrl}
          uploadMutation={uploadMutation}
          deleteMutation={deleteMutation}
        />
      </div>
    </section>
  );
}

/**
 * DropZone
 * A single drag-and-drop area for one document slot
 */
function DropZone({
  label,
  docType,
  currentUrl,
  uploadMutation,
  deleteMutation,
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  const handleFile = async (file) => {
    if (!file) return;
    setError("");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("docType", docType);

    try {
      await uploadMutation.mutateAsync(formData);
    } catch (err) {
      setError(
        err.response?.data?.message || "Upload failed. Please try again.",
      );
    }
  };

  const handleDelete = async (e) => {
    e.stopPropagation(); // Prevent the click from also opening the file picker
    setError("");
    try {
      await deleteMutation.mutateAsync(docType);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to delete document. Please try again.",
      );
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFile(e.dataTransfer.files?.[0]);
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer
                  transition-colors duration-150
                  ${isDragging ? "border-primary bg-primary/5" : "border-white/10 hover:border-white/20"}`}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.doc,.docx"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      <p className="text-secondary text-xs font-medium mb-1">{label}</p>

      {uploadMutation.isPending ? (
        <p className="text-primary text-xs">Uploading…</p>
      ) : currentUrl ? (
        <div className="flex items-center justify-center gap-2">
          <a
            href={currentUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-primary text-xs underline hover:text-primary/80"
          >
            View uploaded file
          </a>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            aria-label={`Delete ${label}`}
            className="text-white/20 hover:text-accent text-xs leading-none transition-colors duration-150 disabled:opacity-30"
          >
            &times;
          </button>
        </div>
      ) : (
        <p className="text-white/20 text-xs">
          Drop a file here or click to browse
        </p>
      )}

      {error && <p className="text-accent text-xs mt-1">{error}</p>}
    </div>
  );
}

export default DocumentsSection;
