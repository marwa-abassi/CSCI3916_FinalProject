import axios from "axios";

export const api = axios.create({
  baseURL: ""
});

export async function listContacts({ search = "", type = "" } = {}) {
  const res = await api.get("/api/contacts", { params: { search, type } });
  return res.data.contacts;
}

export async function createContact(payload) {
  const res = await api.post("/api/contacts", payload);
  return res.data.contact;
}

export async function updateContact(id, patch) {
  const res = await api.put(`/api/contacts/${id}`, patch);
  return res.data.contact;
}

export async function deleteContact(id) {
  await api.delete(`/api/contacts/${id}`);
}

