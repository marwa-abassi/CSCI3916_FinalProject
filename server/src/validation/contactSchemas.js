import { z } from "zod";

const contactType = z.enum(["Personal", "Professional"]);

export const createContactSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(200),
  email: z.string().trim().min(1, "Email is required").email().max(320),
  phone: z.string().trim().min(1, "Phone is required").max(50),
  type: contactType
});

export const updateContactSchema = createContactSchema.partial().refine(
  (obj) => Object.keys(obj).length > 0,
  "Provide at least one field to update"
);

