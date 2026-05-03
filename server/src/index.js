import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import { connectDb } from "./db.js";
import { contactsRouter } from "./routes/contacts.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });
console.log("ENV PATH:", path.resolve(__dirname, "../.env"));
console.log("MONGO URI:", process.env.MONGODB_URI);

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || true
  })
);
app.use(morgan("dev"));
app.use(express.json());

app.get("/health", (_req, res) => res.json({ ok: true }));
app.use("/api/contacts", contactsRouter);

app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  const status = err?.statusCode || err?.status || 500;
  const message = err?.message || "Internal server error";
  res.status(status).json({ error: message });
});

const port = Number(process.env.PORT || 5000);

try {
  await connectDb(process.env.MONGODB_URI);
} catch (err) {
  const msg = err?.message || String(err);
  // eslint-disable-next-line no-console
  console.error("Failed to connect to MongoDB.");
  // eslint-disable-next-line no-console
  console.error(msg);
  if (msg.toLowerCase().includes("bad auth") || msg.toLowerCase().includes("authentication failed")) {
    // eslint-disable-next-line no-console
    console.error(
      "Atlas auth failed. Make sure MONGODB_URI uses a Database Access user (not your Atlas login), the password is correct (and URL-encoded if it has symbols), and the user has read/write permissions."
    );
  }
  process.exit(1);
}
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Server listening on http://localhost:${port}`);
});

