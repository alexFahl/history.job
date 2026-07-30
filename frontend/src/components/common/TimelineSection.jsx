import { useState } from "react";
import {
  useAddFollowUp,
  useDeleteFollowUp,
  useAddReply,
  useDeleteReply,
} from "../../hooks/useApplicationDetail";
import { formatDateTime } from "../../utils/formatDate";
import { CHANNEL_LABELS } from "../../utils/constants";
import Modal from "./Modal";

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

  // Today's date in "YYYY-MM-DD" (local time) for the <input type="date"> default
  const today = () => new Date().toLocaleDateString("en-CA");

  const [activeForm, setActiveForm] = useState(null); // null | "followup" | "reply"
  const [date, setDate] = useState(today);
  const [note, setNote] = useState("");
  const [channel, setChannel] = useState("M");

  const resetForm = () => {
    setDate(today());
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
    <>
      <section className="group flex flex-col rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 transition-all duration-300 hover:border-white/[0.14] hover:bg-white/[0.03]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-text">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-white/[0.06] text-secondary">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-3.5 w-3.5"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm.75-13a.75.75 0 0 0-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 0 0 0-1.5h-3.25V5Z"
                  clipRule="evenodd"
                />
              </svg>
            </span>
            Timeline
          </h3>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setActiveForm("followup")}
              className="text-xs text-primary hover:text-primary/80 font-medium transition-colors"
            >
              + Follow-up
            </button>
            <button
              type="button"
              onClick={() => setActiveForm("reply")}
              className="text-xs text-primary hover:text-primary/80 font-medium transition-colors"
            >
              + Reply
            </button>
          </div>
        </div>

        {/* Vertical timeline */}
        <div className="space-y-4 mb-2 h-72 overflow-y-auto pr-1">
          {events.length === 0 && (
            <p className="text-white/20 text-xs">No timeline events yet.</p>
          )}

          {events.map((event, index) => (
            <div key={event._id ?? index} className="flex gap-3">
              <div className="flex flex-col items-center">
                <span
                  className={`mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${
                    event.type === "applied"
                      ? "bg-primary/20"
                      : event.type === "followup"
                        ? "bg-secondary/20"
                        : "bg-accent/20"
                  }`}
                >
                  <span
                    className={`h-2 w-2 rounded-full ${
                      event.type === "applied"
                        ? "bg-primary"
                        : event.type === "followup"
                          ? "bg-secondary"
                          : "bg-accent"
                    }`}
                  />
                </span>
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
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg
                               text-white/25 hover:bg-accent/10 hover:text-accent transition-colors duration-150"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="h-4 w-4"
                    >
                      <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Add follow-up / reply modal */}
      <Modal
        isOpen={activeForm !== null}
        onClose={resetForm}
        title={activeForm === "reply" ? "Log a reply" : "Log a follow-up"}
      >
        <form
          onSubmit={activeForm === "reply" ? handleAddReply : handleAddFollowUp}
          className="space-y-3"
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
            disabled={
              activeForm === "reply"
                ? addReplyMutation.isPending
                : addFollowUpMutation.isPending
            }
            className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50
                       text-white text-sm font-medium py-2 rounded-lg transition-colors duration-200"
          >
            {activeForm === "reply"
              ? addReplyMutation.isPending
                ? "Saving…"
                : "Log reply"
              : addFollowUpMutation.isPending
                ? "Saving…"
                : "Log follow-up"}
          </button>
        </form>
      </Modal>
    </>
  );
}

export default TimelineSection;
