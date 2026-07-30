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
    <section className="group rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 transition-all duration-300 hover:border-white/[0.14] hover:bg-white/[0.03]">
      <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-text">
        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-white/[0.06] text-secondary">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-3.5 w-3.5"
          >
            <path d="M3 3.5A1.5 1.5 0 0 1 4.5 2h6.879a1.5 1.5 0 0 1 1.06.44l4.122 4.12A1.5 1.5 0 0 1 17 7.622V16.5a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 3 16.5v-13Z" />
          </svg>
        </span>
        Documents
      </h3>

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

  const isUploaded = Boolean(currentUrl) && !uploadMutation.isPending;

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      onClick={isUploaded ? undefined : () => inputRef.current?.click()}
      className={`flex h-[90px] flex-col justify-center overflow-hidden rounded-xl transition-all duration-200 ${
        isUploaded
          ? "border border-primary/30 bg-primary/[0.08] px-3"
          : `items-center border-2 border-dashed px-4 text-center cursor-pointer ${
              isDragging
                ? "border-primary bg-primary/10 scale-[1.01]"
                : "border-white/10 hover:border-primary/40 hover:bg-white/[0.03]"
            }`
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.doc,.docx"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      {uploadMutation.isPending ? (
        <div className="flex flex-col items-center gap-2 py-3">
          <span className="h-6 w-6 rounded-full border-2 border-white/10 border-t-primary animate-spin" />
          <p className="text-primary text-xs">Uploading {label}…</p>
        </div>
      ) : isUploaded ? (
        /* Filled state — compact single row so height stays fixed */
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/20 text-primary">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-5 w-5"
            >
              <path d="M3 3.5A1.5 1.5 0 0 1 4.5 2h6.879a1.5 1.5 0 0 1 1.06.44l4.122 4.12A1.5 1.5 0 0 1 17 7.622V16.5a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 3 16.5v-13Z" />
            </svg>
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-text">{label}</p>
            <span className="mt-0.5 inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-3 w-3"
              >
                <path
                  fillRule="evenodd"
                  d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
                  clipRule="evenodd"
                />
              </svg>
              Added
            </span>
          </div>

          <div className="flex shrink-0 items-center gap-1">
            <a
              href={currentUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              aria-label={`View ${label}`}
              title="View"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-primary/40
                         bg-primary/15 text-primary hover:border-primary/60 hover:bg-primary/25 transition-colors duration-150"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-4 w-4"
              >
                <path d="M10 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
                <path
                  fillRule="evenodd"
                  d="M.664 10.59a1.651 1.651 0 0 1 0-1.186A10.004 10.004 0 0 1 10 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0 1 10 17c-4.257 0-7.893-2.66-9.336-6.41ZM14 10a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z"
                  clipRule="evenodd"
                />
              </svg>
            </a>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                inputRef.current?.click();
              }}
              aria-label={`Replace ${label}`}
              title="Replace"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10
                         bg-white/[0.04] text-secondary hover:border-white/20 hover:text-text transition-colors duration-150"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-4 w-4"
              >
                <path
                  fillRule="evenodd"
                  d="M15.312 11.424a5.5 5.5 0 0 1-9.201 2.466l-.312-.311h2.433a.75.75 0 0 0 0-1.5H3.989a.75.75 0 0 0-.75.75v4.242a.75.75 0 0 0 1.5 0v-2.43l.31.31a7 7 0 0 0 11.712-3.138.75.75 0 0 0-1.449-.39Zm1.24-8.176a.75.75 0 0 0-1.5 0v2.43l-.31-.31a7 7 0 0 0-11.712 3.14.75.75 0 1 0 1.449.388 5.5 5.5 0 0 1 9.201-2.466l.312.311H11.26a.75.75 0 0 0 0 1.5h4.243a.75.75 0 0 0 .75-.75V3.248Z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              aria-label={`Delete ${label}`}
              title="Delete"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-500/40
                         bg-red-500/10 text-red-400 hover:border-red-500/60 hover:bg-red-500/20
                         hover:text-red-300 transition-colors duration-150 disabled:opacity-40"
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
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-0.5">
          <p className="text-secondary text-xs font-semibold">{label}</p>
          <p className="text-white/20 text-xs">
            Drop a file here or click to browse
          </p>
        </div>
      )}

      {error && <p className="text-accent text-xs mt-2">{error}</p>}
    </div>
  );
}

export default DocumentsSection;
