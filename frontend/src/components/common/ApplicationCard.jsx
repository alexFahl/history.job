import { useNavigate } from "react-router-dom";
import { timeAgo } from "../../utils/formatDate";
import { ChevronRightIcon } from "./icons";

// Left accent colour per application status
const STATUS_ACCENTS = {
  T: "before:bg-secondary",
  A: "before:bg-primary",
  I: "before:bg-warning",
  R: "before:bg-danger",
  O: "before:bg-success",
};

// Avatar tint per status
const AVATAR_TONES = {
  T: "bg-secondary/15 text-secondary ring-secondary/20",
  A: "bg-primary/15 text-primary ring-primary/20",
  I: "bg-warning/15 text-warning ring-warning/20",
  R: "bg-danger/15 text-danger ring-danger/20",
  O: "bg-success/15 text-success ring-success/20",
};

/**
 * ApplicationCard
 *
 * A single card representing one job application on the Kanban board
 *
 * Props:
 *   application : the Application document from the API
 */
function ApplicationCard({ application }) {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      onClick={() => navigate(`/applications/${application._id}`)}
      className={`group relative flex w-full items-center gap-3 overflow-hidden rounded-xl
                 border border-white/[0.07] bg-white/[0.03] py-2.5 pl-4 pr-3 text-left
                 transition-all duration-200 hover:-translate-y-0.5 hover:border-white/15 hover:bg-white/[0.06]
                 hover:shadow-lg hover:shadow-black/30
                 before:absolute before:inset-y-1.5 before:left-0 before:w-1 before:rounded-full before:content-['']
                 ${STATUS_ACCENTS[application.status] ?? "before:bg-white/20"}`}
    >
      {/* Company initial avatar */}
      <span
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold ring-1 ${
          AVATAR_TONES[application.status] ??
          "bg-white/10 text-text ring-white/10"
        }`}
      >
        {application.companyName?.charAt(0)?.toUpperCase() || "?"}
      </span>

      <div className="min-w-0 flex-1">
        <h4 className="truncate text-sm font-semibold text-text">
          {application.companyName}
        </h4>
        <p className="truncate text-xs text-secondary">
          {application.jobTitle}
        </p>
        <span className="mt-0.5 block text-[11px] text-white/35">
          {timeAgo(application.createdAt)}
        </span>
      </div>

      {/* Chevron hint on hover */}
      <ChevronRightIcon className="h-4 w-4 shrink-0 text-white/25 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-secondary" />
    </button>
  );
}

export default ApplicationCard;
