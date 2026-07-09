import { useNavigate } from "react-router-dom";
import { JOB_TYPE_LABELS } from "../../utils/constants";
import { timeAgo } from "../../utils/formatDate";

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
      className="w-full text-left bg-white/[0.04] hover:bg-white/[0.08] border border-white/10
                 hover:border-primary/50 rounded-xl p-4 transition-all duration-200"
    >
      <h4 className="text-text font-medium text-sm">
        {application.companyName}
      </h4>
      <p className="text-secondary text-xs mt-0.5">{application.jobTitle}</p>

      <div className="flex items-center gap-2 mt-3 text-xs text-white/40">
        {application.jobType && (
          <span className="bg-white/5 px-2 py-0.5 rounded-full">
            {JOB_TYPE_LABELS[application.jobType]}
          </span>
        )}
        <span>{timeAgo(application.createdAt)}</span>
      </div>
    </button>
  );
}

export default ApplicationCard;
