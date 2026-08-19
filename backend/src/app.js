import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import authRoutes from "./routes/auth.js";
import expenseRoutes from "./routes/expenses.js";
import incomeRoutes from "./routes/incomes.js";
import categoryRoutes from "./routes/categories.js";
import summaryRoutes from "./routes/summary.js";

dotenv.config();
const app = express();

app.use(cors({ origin: process.env.ALLOWED_ORIGIN || true }));
app.use(express.json());

// static receipts
const uploadDir = process.env.UPLOAD_DIR || "uploads";
app.use("/uploads", express.static(path.resolve(uploadDir)));

app.use("/api/auth", authRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/incomes", incomeRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/summary", summaryRoutes);

export default app;
