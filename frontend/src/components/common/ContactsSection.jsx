import { useState } from "react";
import {
  useAddContact,
  useDeleteContact,
} from "../../hooks/useApplicationDetail";

/**
 * ContactsSection
 *
 * Displays the list of recruiter contacts saved on the application
 *
 * Props:
 *   application : the full Application document
 */
function ContactsSection({ application }) {
  const addContactMutation = useAddContact(application._id);
  const deleteContactMutation = useDeleteContact(application._id);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [job, setJob] = useState("");

  const resetForm = () => {
    setName("");
    setEmail("");
    setPhone("");
    setJob("");
    setIsFormOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    await addContactMutation.mutateAsync({
      name,
      email: email || undefined,
      phone: phone || undefined,
      job: job || undefined,
    });

    resetForm();
  };

  return (
    <section className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-text font-semibold text-sm">Contacts</h3>
        <button
          type="button"
          onClick={() => setIsFormOpen((open) => !open)}
          className="text-xs text-primary hover:text-primary/80 font-medium transition-colors"
        >
          {isFormOpen ? "Cancel" : "+ Add contact"}
        </button>
      </div>

      {/* Existing contacts */}
      <div className="space-y-2 mb-2 flex-1 min-h-[8rem] overflow-y-auto pr-1">
        {application.contacts.length === 0 && !isFormOpen && (
          <p className="text-white/20 text-xs">No contacts added yet.</p>
        )}

        {application.contacts.map((contact, index) => (
          <div
            key={contact._id ?? index}
            className="flex items-start justify-between gap-2 bg-white/[0.04] rounded-lg px-3 py-2 text-sm"
          >
            <div>
              <p className="text-text font-medium">{contact.name}</p>
              <p className="text-secondary text-xs">
                {[contact.job, contact.email, contact.phone]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            </div>
            <button
              type="button"
              onClick={() => deleteContactMutation.mutate(contact._id)}
              disabled={deleteContactMutation.isPending}
              aria-label={`Delete contact ${contact.name}`}
              className="text-white/20 hover:text-accent text-sm leading-none transition-colors duration-150 disabled:opacity-30"
            >
              &times;
            </button>
          </div>
        ))}
      </div>

      {/* Add contact inline form */}
      {isFormOpen && (
        <form onSubmit={handleSubmit} className="space-y-2 mt-3">
          <input
            type="text"
            placeholder="Name *"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full bg-white/[0.06] border border-white/10 rounded-lg px-3 py-2
                       text-text placeholder-white/20 text-sm
                       focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-white/[0.06] border border-white/10 rounded-lg px-3 py-2
                         text-text placeholder-white/20 text-sm
                         focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
            <input
              type="tel"
              placeholder="Phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="bg-white/[0.06] border border-white/10 rounded-lg px-3 py-2
                         text-text placeholder-white/20 text-sm
                         focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>
          <input
            type="text"
            placeholder="Role (e.g. HR Manager)"
            value={job}
            onChange={(e) => setJob(e.target.value)}
            className="w-full bg-white/[0.06] border border-white/10 rounded-lg px-3 py-2
                       text-text placeholder-white/20 text-sm
                       focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
          <button
            type="submit"
            disabled={addContactMutation.isPending}
            className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50
                       text-white text-sm font-medium py-2 rounded-lg transition-colors duration-200"
          >
            {addContactMutation.isPending ? "Adding…" : "Save contact"}
          </button>
        </form>
      )}
    </section>
  );
}

export default ContactsSection;
