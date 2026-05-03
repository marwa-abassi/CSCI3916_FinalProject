import mongoose from "mongoose";

const ContactSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    type: {
      type: String,
      required: true,
      enum: ["Personal", "Professional"]
    }
  },
  { timestamps: true }
);

ContactSchema.index({ name: "text", email: "text", phone: "text" });

export const Contact =
  mongoose.models.Contact ?? mongoose.model("Contact", ContactSchema);

