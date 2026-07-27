import { useNavigate } from "react-router-dom";
import { timeAgo } from "../../utils/formatDate";

// Left accent colour per application status
const STATUS_ACCENTS = {
  T: "before:bg-secondary",
  A: "before:bg-primary",
  I: "before:bg-accent",
  R: "before:bg-red-400",
  O: "before:bg-emerald-400",
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
      className={`group relative w-full overflow-hidden text-left bg-white/[0.04] hover:bg-white/[0.07]
                 border border-white/10 hover:border-white/20 rounded-lg pl-4 pr-3 py-2.5
                 transition-all duration-200 hover:-translate-y-0.5
                 before:absolute before:inset-y-0 before:left-0 before:w-1 before:content-['']
                 ${STATUS_ACCENTS[application.status] ?? "before:bg-white/20"}`}
    >
      <div className="flex items-baseline gap-1.5 min-w-0">
        <h4 className="text-text font-medium text-sm truncate shrink-0 max-w-[55%]">
          {application.companyName}
        </h4>
        <span className="text-white/20 text-xs">·</span>
        <p className="text-secondary text-xs truncate">
          {application.jobTitle}
        </p>
      </div>

      <span className="mt-1 block text-[11px] text-white/40">
        {timeAgo(application.createdAt)}
      </span>
    </button>
  );
}

export default ApplicationCard;
