import { useState } from "react";
import {
  useAddFollowUp,
  useDeleteFollowUp,
  useAddReply,
  useDeleteReply,
} from "../../hooks/useApplicationDetail";
import { formatDateTime } from "../../utils/formatDate";
import { CHANNEL_LABELS } from "../../utils/constants";

/**
 * TimelineSection
 *
 * Merges followUps and replies into a single chronological list
 *
 * Props:
 *   application : the full Application document
 */
function TimelineSection({ application }) {
  const addFollowUpMutation = useAddFollowUp(application._id);
  const deleteFollowUpMutation = useDeleteFollowUp(application._id);
  const addReplyMutation = useAddReply(application._id);
  const deleteReplyMutation = useDeleteReply(application._id);

  const [activeForm, setActiveForm] = useState(null); // null | "followup" | "reply"
  const [date, setDate] = useState("");
  const [note, setNote] = useState("");
  const [channel, setChannel] = useState("M");

  const resetForm = () => {
    setDate("");
    setNote("");
    setChannel("M");
    setActiveForm(null);
  };

  const handleAddFollowUp = async (e) => {
    e.preventDefault();
    if (!date) return;
    await addFollowUpMutation.mutateAsync({
      date,
      note: note || undefined,
      communicationChannel: channel,
    });
    resetForm();
  };

  const handleAddReply = async (e) => {
    e.preventDefault();
    if (!date) return;
    await addReplyMutation.mutateAsync({
      date,
      note: note || undefined,
      communicationChannel: channel,
    });
    resetForm();
  };

  // Build a single chronological list of events for display.
  // Each event keeps its sub-document _id and type so the delete button
  // knows which mutation to call. "applied" isn't a sub-document — it comes
  // straight from application.appliedDate — so it has no delete action.
  const events = [
    ...(application.appliedDate
      ? [{ type: "applied", date: application.appliedDate }]
      : []),
    ...application.followUps.map((f) => ({ type: "followup", ...f })),
    ...application.replies.map((r) => ({ type: "reply", ...r })),
  ].sort((a, b) => new Date(a.date) - new Date(b.date));

  const handleDeleteEvent = (event) => {
    if (event.type === "followup") {
      deleteFollowUpMutation.mutate(event._id);
    } else if (event.type === "reply") {
      deleteReplyMutation.mutate(event._id);
    }
  };

  return (
    <section className="bg-white/[0.03] border border-white/10 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-text font-semibold text-sm">Timeline</h3>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() =>
              setActiveForm(activeForm === "followup" ? null : "followup")
            }
            className="text-xs text-primary hover:text-primary/80 font-medium transition-colors"
          >
            + Follow-up
          </button>
          <button
            type="button"
            onClick={() =>
              setActiveForm(activeForm === "reply" ? null : "reply")
            }
            className="text-xs text-primary hover:text-primary/80 font-medium transition-colors"
          >
            + Reply
          </button>
        </div>
      </div>

      {/* Vertical timeline */}
      <div className="space-y-4 mb-2">
        {events.length === 0 && (
          <p className="text-white/20 text-xs">No timeline events yet.</p>
        )}

        {events.map((event, index) => (
          <div key={event._id ?? index} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span
                className={`w-2 h-2 rounded-full mt-1.5 ${
                  event.type === "applied"
                    ? "bg-primary"
                    : event.type === "followup"
                      ? "bg-secondary"
                      : "bg-accent"
                }`}
              />
              {index < events.length - 1 && (
                <span className="w-px flex-1 bg-white/10 mt-1" />
              )}
            </div>
            <div className="pb-2 flex-1 flex items-start justify-between gap-2">
              <div>
                <p className="text-text text-sm font-medium">
                  {event.type === "applied" && "Application sent"}
                  {event.type === "followup" && "Follow-up"}
                  {event.type === "reply" && "Reply received"}
                  {event.communicationChannel && (
                    <span className="text-secondary font-normal">
                      {" "}
                      · {CHANNEL_LABELS[event.communicationChannel]}
                    </span>
                  )}
                </p>
                <p className="text-white/30 text-xs mt-0.5">
                  {formatDateTime(event.date)}
                </p>
                {event.note && (
                  <p className="text-secondary text-xs mt-1">{event.note}</p>
                )}
              </div>

              {/* Only followUps and replies are deletable — appliedDate is a plain field */}
              {event.type !== "applied" && (
                <button
                  type="button"
                  onClick={() => handleDeleteEvent(event)}
                  aria-label="Delete timeline event"
                  className="text-white/20 hover:text-accent text-sm leading-none transition-colors duration-150 shrink-0"
                >
                  &times;
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add follow-up form */}
      {activeForm === "followup" && (
        <form
          onSubmit={handleAddFollowUp}
          className="space-y-2 mt-4 border-t border-white/10 pt-4"
        >
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="w-full bg-white/[0.06] border border-white/10 rounded-lg px-3 py-2
                       text-text text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
          <select
            value={channel}
            onChange={(e) => setChannel(e.target.value)}
            className="w-full bg-white/[0.06] border border-white/10 rounded-lg px-3 py-2
                       text-text text-sm appearance-none focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          >
            {Object.entries(CHANNEL_LABELS).map(([code, label]) => (
              <option key={code} value={code} className="bg-[#0d1528]">
                {label}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Short note (optional)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full bg-white/[0.06] border border-white/10 rounded-lg px-3 py-2
                       text-text placeholder-white/20 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
          <button
            type="submit"
            disabled={addFollowUpMutation.isPending}
            className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50
                       text-white text-sm font-medium py-2 rounded-lg transition-colors duration-200"
          >
            {addFollowUpMutation.isPending ? "Saving…" : "Log follow-up"}
          </button>
        </form>
      )}

      {/* Add reply form */}
      {activeForm === "reply" && (
        <form
          onSubmit={handleAddReply}
          className="space-y-2 mt-4 border-t border-white/10 pt-4"
        >
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="w-full bg-white/[0.06] border border-white/10 rounded-lg px-3 py-2
                       text-text text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
          <select
            value={channel}
            onChange={(e) => setChannel(e.target.value)}
            className="w-full bg-white/[0.06] border border-white/10 rounded-lg px-3 py-2
                       text-text text-sm appearance-none focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          >
            {Object.entries(CHANNEL_LABELS).map(([code, label]) => (
              <option key={code} value={code} className="bg-[#0d1528]">
                {label}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Short note (optional)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full bg-white/[0.06] border border-white/10 rounded-lg px-3 py-2
                       text-text placeholder-white/20 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
          <button
            type="submit"
            disabled={addReplyMutation.isPending}
            className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50
                       text-white text-sm font-medium py-2 rounded-lg transition-colors duration-200"
          >
            {addReplyMutation.isPending ? "Saving…" : "Log reply"}
          </button>
        </form>
      )}
    </section>
  );
}

export default TimelineSection;
