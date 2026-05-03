import React, { useEffect, useMemo, useState } from "react";
import {
  createContact,
  deleteContact,
  listContacts,
  updateContact
} from "./api";

const emptyDraft = { name: "", email: "", phone: "", type: "Personal" };

function normalizeError(err) {
  const message =
    err?.response?.data?.error ||
    err?.message ||
    "Something went wrong. Please try again.";
  const details = err?.response?.data?.details;
  if (details?.fieldErrors) {
    const firstField = Object.keys(details.fieldErrors)[0];
    const firstMsg = details.fieldErrors[firstField]?.[0];
    if (firstMsg) return `${message}: ${firstMsg}`;
  }
  return message;
}

function ContactForm({ onCreate, busy }) {
  const [draft, setDraft] = useState(emptyDraft);
  const [error, setError] = useState("");

  async function submit(e) {
    e.preventDefault();
    setError("");
    try {
      await onCreate(draft);
      setDraft(emptyDraft);
    } catch (err) {
      setError(normalizeError(err));
    }
  }

  return (
    <form className="card" onSubmit={submit}>
      <div className="cardTitle">Add contact</div>
      <div className="grid">
        <label className="field">
          <span>Name</span>
          <input
            value={draft.name}
            onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
            placeholder="Jane Doe"
            required
          />
        </label>
        <label className="field">
          <span>Email</span>
          <input
            value={draft.email}
            onChange={(e) => setDraft((d) => ({ ...d, email: e.target.value }))}
            placeholder="jane@example.com"
            required
          />
        </label>
        <label className="field">
          <span>Phone</span>
          <input
            value={draft.phone}
            onChange={(e) => setDraft((d) => ({ ...d, phone: e.target.value }))}
            placeholder="555-555-5555"
            required
          />
        </label>
        <label className="field">
          <span>Type</span>
          <select
            value={draft.type}
            onChange={(e) => setDraft((d) => ({ ...d, type: e.target.value }))}
          >
            <option value="Personal">Personal</option>
            <option value="Professional">Professional</option>
          </select>
        </label>
      </div>
      {error ? <div className="error">{error}</div> : null}
      <div className="row">
        <button className="primary" disabled={busy}>
          {busy ? "Saving..." : "Create"}
        </button>
      </div>
    </form>
  );
}

function Toolbar({ search, setSearch, type, setType, refreshing, onRefresh }) {
  return (
    <div className="card">
      <div className="row wrap">
        <label className="field grow">
          <span>Search</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, email, phone..."
          />
        </label>
        <label className="field">
          <span>Type</span>
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="">All</option>
            <option value="Personal">Personal</option>
            <option value="Professional">Professional</option>
          </select>
        </label>
        <div className="field">
          <span>&nbsp;</span>
          <button type="button" onClick={onRefresh} disabled={refreshing}>
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ContactRow({ contact, onEdit, onDelete, busy }) {
  return (
    <div className="contact">
      <div className="contactMain">
        <div className="contactName">{contact.name}</div>
        <div className="contactMeta">
          <span>{contact.email}</span>
          <span className="dot">•</span>
          <span>{contact.phone}</span>
          <span className="dot">•</span>
          <span className="pill">{contact.type}</span>
        </div>
      </div>
      <div className="row">
        <button type="button" onClick={() => onEdit(contact)} disabled={busy}>
          Edit
        </button>
        <button
          type="button"
          className="danger"
          onClick={() => onDelete(contact)}
          disabled={busy}
        >
          Delete
        </button>
      </div>
    </div>
  );
}

function EditModal({ contact, onClose, onSave, busy }) {
  const [draft, setDraft] = useState(contact);
  const [error, setError] = useState("");

  useEffect(() => setDraft(contact), [contact]);

  async function submit(e) {
    e.preventDefault();
    setError("");
    try {
      await onSave(draft);
      onClose();
    } catch (err) {
      setError(normalizeError(err));
    }
  }

  return (
    <div className="modalBackdrop" role="dialog" aria-modal="true">
      <div className="modal">
        <div className="modalHeader">
          <div className="cardTitle">Edit contact</div>
          <button type="button" onClick={onClose} disabled={busy}>
            Close
          </button>
        </div>

        <form onSubmit={submit}>
          <div className="grid">
            <label className="field">
              <span>Name</span>
              <input
                value={draft.name}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, name: e.target.value }))
                }
                required
              />
            </label>
            <label className="field">
              <span>Email</span>
              <input
                value={draft.email}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, email: e.target.value }))
                }
                required
              />
            </label>
            <label className="field">
              <span>Phone</span>
              <input
                value={draft.phone}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, phone: e.target.value }))
                }
                required
              />
            </label>
            <label className="field">
              <span>Type</span>
              <select
                value={draft.type}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, type: e.target.value }))
                }
              >
                <option value="Personal">Personal</option>
                <option value="Professional">Professional</option>
              </select>
            </label>
          </div>
          {error ? <div className="error">{error}</div> : null}
          <div className="row right">
            <button className="primary" disabled={busy}>
              {busy ? "Saving..." : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function App() {
  const [contacts, setContacts] = useState([]);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mutatingId, setMutatingId] = useState("");
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(null);

  const query = useMemo(() => ({ search, type }), [search, type]);

  async function refresh() {
    setError("");
    setLoading(true);
    try {
      const list = await listContacts(query);
      setContacts(list);
    } catch (err) {
      setError(normalizeError(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const t = setTimeout(() => refresh(), 200);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query.search, query.type]);

  async function onCreate(payload) {
    setSaving(true);
    try {
      await createContact(payload);
      await refresh();
    } finally {
      setSaving(false);
    }
  }

  async function onSaveEdited(draft) {
    setMutatingId(draft._id);
    try {
      await updateContact(draft._id, {
        name: draft.name,
        email: draft.email,
        phone: draft.phone,
        type: draft.type
      });
      await refresh();
    } finally {
      setMutatingId("");
    }
  }

  async function onDelete(c) {
    const ok = confirm(`Delete ${c.name}?`);
    if (!ok) return;
    setMutatingId(c._id);
    try {
      await deleteContact(c._id);
      await refresh();
    } finally {
      setMutatingId("");
    }
  }

  return (
    <div className="page">
      <header className="header">
        <div>
          <div className="title">Personal Contact Manager</div>
          <div className="subtitle">Create, search, edit, and delete contacts.</div>
        </div>
      </header>

      <div className="layout">
        <div className="col">
          <ContactForm onCreate={onCreate} busy={saving} />
          <Toolbar
            search={search}
            setSearch={setSearch}
            type={type}
            setType={setType}
            refreshing={loading}
            onRefresh={refresh}
          />
        </div>

        <div className="col">
          <div className="card">
            <div className="cardTitle">Contacts</div>
            {error ? <div className="error">{error}</div> : null}
            {loading ? (
              <div className="muted">Loading...</div>
            ) : contacts.length === 0 ? (
              <div className="muted">No contacts found.</div>
            ) : (
              <div className="list">
                {contacts.map((c) => (
                  <ContactRow
                    key={c._id}
                    contact={c}
                    onEdit={(x) => setEditing(x)}
                    onDelete={onDelete}
                    busy={mutatingId === c._id}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {editing ? (
        <EditModal
          contact={editing}
          onClose={() => setEditing(null)}
          onSave={onSaveEdited}
          busy={mutatingId === editing._id}
        />
      ) : null}
    </div>
  );
}

