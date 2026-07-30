import { useState } from "react";
import {
  useAddContact,
  useDeleteContact,
} from "../../hooks/useApplicationDetail";
import Modal from "./Modal";
import Button from "./Button";
import { TextInput } from "./Field";

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
                <path d="M10 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3.465 14.493a1.23 1.23 0 0 0 .41 1.412A9.957 9.957 0 0 0 10 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 0 0-13.074.003Z" />
              </svg>
            </span>
            Contacts
          </h3>
          <button
            type="button"
            onClick={() => setIsFormOpen(true)}
            className="text-xs text-primary hover:text-primary/80 font-medium transition-colors"
          >
            + Add contact
          </button>
        </div>

        {/* Existing contacts */}
        <div className="space-y-2 mb-2 h-56 overflow-y-auto pr-1">
          {application.contacts.length === 0 && (
            <p className="text-white/20 text-xs">No contacts added yet.</p>
          )}

          {application.contacts.map((contact, index) => (
            <div
              key={contact._id ?? index}
              className="flex items-start justify-between gap-3 rounded-xl border border-white/[0.06] bg-white/[0.04] px-3 py-2.5 text-sm transition-colors duration-150 hover:border-white/[0.12]"
            >
              <div className="flex items-start gap-3 min-w-0">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
                  {contact.name?.charAt(0)?.toUpperCase() || "?"}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-text font-medium">
                    {contact.name}
                  </p>
                  <p className="truncate text-secondary text-xs">
                    {[contact.job, contact.email, contact.phone]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => deleteContactMutation.mutate(contact._id)}
                disabled={deleteContactMutation.isPending}
                aria-label={`Delete contact ${contact.name}`}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg
                           text-white/25 hover:bg-accent/10 hover:text-accent transition-colors duration-150 disabled:opacity-30"
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
            </div>
          ))}
        </div>
      </section>

      {/* Add contact modal */}
      <Modal isOpen={isFormOpen} onClose={resetForm} title="Add a contact">
        <form onSubmit={handleSubmit} className="space-y-3">
          <TextInput
            type="text"
            placeholder="Name *"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
          />
          <div className="grid grid-cols-2 gap-2">
            <TextInput
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextInput
              type="tel"
              placeholder="Phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <TextInput
            type="text"
            placeholder="Role (e.g. HR Manager)"
            value={job}
            onChange={(e) => setJob(e.target.value)}
          />
          <Button
            type="submit"
            variant="primary"
            fullWidth
            disabled={addContactMutation.isPending}
          >
            {addContactMutation.isPending ? "Adding…" : "Save contact"}
          </Button>
        </form>
      </Modal>
    </>
  );
}

export default ContactsSection;
