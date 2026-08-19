import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { auth } from "../middlewares/auth.js";
import { upload } from "../middlewares/upload.js";

const prisma = new PrismaClient();
const router = Router();

router.use(auth);

router.get("/", async (req, res) => {
  const { from, to, categoryId, type } = req.query;
  const where = { userId: req.userId };
  if (categoryId) where.categoryId = Number(categoryId);
  if (type === "PONCTUELLE" || type === "RECURRENTE") where.type = type;
  if (from || to) where.date = {};
  if (from) where.date.gte = new Date(from);
  if (to) where.date.lte = new Date(to);
  const items = await prisma.expense.findMany({ where, orderBy: { createdAt: "desc" } });
  res.json(items);
});

router.post("/", async (req, res) => {
  try {
    const { amount, categoryId, description, type, date, startDate, endDate } = req.body;
    if (amount === undefined) return res.status(400).json({ error: "Montant requis" });
    if (type === "RECURRENTE" && !startDate) return res.status(400).json({ error: "Date de début requise pour récurrente" });
    const created = await prisma.expense.create({
      data: {
        amount: Number(amount),
        categoryId: categoryId ? Number(categoryId) : null,
        description: description || null,
        type: type === "RECURRENTE" ? "RECURRENTE" : "PONCTUELLE",
        date: date ? new Date(date) : null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        userId: req.userId,
      },
    });
    res.json(created);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.put("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const body = req.body;
  try {
    const exp = await prisma.expense.findUnique({ where: { id } });
    if (!exp || exp.userId !== req.userId) return res.status(403).json({ error: "Accès refusé" });
    const updated = await prisma.expense.update({
      where: { id },
      data: {
        amount: body.amount !== undefined ? Number(body.amount) : undefined,
        categoryId: body.categoryId !== undefined ? Number(body.categoryId) : undefined,
        description: body.description ?? undefined,
        type: body.type === "RECURRENTE" ? "RECURRENTE" : body.type === "PONCTUELLE" ? "PONCTUELLE" : undefined,
        date: body.date ? new Date(body.date) : body.date === null ? null : undefined,
        startDate: body.startDate ? new Date(body.startDate) : body.startDate === null ? null : undefined,
        endDate: body.endDate ? new Date(body.endDate) : body.endDate === null ? null : undefined,
      },
    });
    res.json(updated);
  } catch {
    res.status(404).json({ error: "Dépense introuvable" });
  }
});

router.delete("/:id", async (req, res) => {
  const id = Number(req.params.id);
  try {
    const exp = await prisma.expense.findUnique({ where: { id } });
    if (!exp || exp.userId !== req.userId) return res.status(403).json({ error: "Accès refusé" });
    await prisma.expense.delete({ where: { id } });
    res.json({ success: true });
  } catch {
    res.status(404).json({ error: "Dépense introuvable" });
  }
});

router.post("/:id/receipt", upload.single("file"), async (req, res) => {
  const id = Number(req.params.id);
  const file = req.file;
  if (!file) return res.status(400).json({ error: "Fichier requis" });
  const exp = await prisma.expense.findUnique({ where: { id } });
  if (!exp || exp.userId !== req.userId) return res.status(403).json({ error: "Accès refusé" });
  const updated = await prisma.expense.update({ where: { id }, data: { receiptUrl: `/uploads/${file.filename}` } });
  res.json(updated);
});

export default router;
