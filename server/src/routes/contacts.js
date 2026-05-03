import express from "express";
import mongoose from "mongoose";
import { Contact } from "../models/Contact.js";
import {
  createContactSchema,
  updateContactSchema
} from "../validation/contactSchemas.js";

export const contactsRouter = express.Router();

function badRequest(res, message, details) {
  return res.status(400).json({ error: message, details });
}

contactsRouter.get("/", async (req, res, next) => {
  try {
    const { search = "", type = "" } = req.query;

    const filter = {};
    if (type === "Personal" || type === "Professional") filter.type = type;

    if (String(search).trim()) {
      filter.$text = { $search: String(search).trim() };
    }

    const contacts = await Contact.find(filter)
      .sort({ updatedAt: -1, createdAt: -1 })
      .lean();

    res.json({ contacts });
  } catch (err) {
    next(err);
  }
});

contactsRouter.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return badRequest(res, "Invalid contact id");
    }

    const contact = await Contact.findById(id).lean();
    if (!contact) return res.status(404).json({ error: "Not found" });

    res.json({ contact });
  } catch (err) {
    next(err);
  }
});

contactsRouter.post("/", async (req, res, next) => {
  try {
    const parsed = createContactSchema.safeParse(req.body);
    if (!parsed.success) {
      return badRequest(res, "Validation error", parsed.error.flatten());
    }

    const created = await Contact.create(parsed.data);
    res.status(201).json({ contact: created });
  } catch (err) {
    next(err);
  }
});

contactsRouter.put("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return badRequest(res, "Invalid contact id");
    }

    const parsed = updateContactSchema.safeParse(req.body);
    if (!parsed.success) {
      return badRequest(res, "Validation error", parsed.error.flatten());
    }

    const updated = await Contact.findByIdAndUpdate(id, parsed.data, {
      new: true,
      runValidators: true
    });

    if (!updated) return res.status(404).json({ error: "Not found" });
    res.json({ contact: updated });
  } catch (err) {
    next(err);
  }
});

contactsRouter.delete("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return badRequest(res, "Invalid contact id");
    }

    const deleted = await Contact.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ error: "Not found" });

    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

