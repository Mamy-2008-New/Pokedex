import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { auth } from "../middlewares/auth.js";

const prisma = new PrismaClient();
const router = Router();

router.use(auth);

router.get("/", async (req, res) => {
  const { from, to } = req.query;
  const where = { userId: req.userId };
  if (from || to) where.date = {};
  if (from) where.date.gte = new Date(from);
  if (to) where.date.lte = new Date(to);
  const items = await prisma.income.findMany({ where, orderBy: { date: "desc" } });
  res.json(items);
});

router.post("/", async (req, res) => {
  try {
    const { amount, source, description, date } = req.body;
    if (!amount || !source || !date) return res.status(400).json({ error: "amount, source, date requis" });
    const created = await prisma.income.create({
      data: { amount: Number(amount), source, description: description || null, date: new Date(date), userId: req.userId },
    });
    res.json(created);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.put("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const { amount, source, description, date } = req.body;
  try {
    const item = await prisma.income.findUnique({ where: { id } });
    if (!item || item.userId !== req.userId) return res.status(403).json({ error: "Accès refusé" });
    const updated = await prisma.income.update({
      where: { id },
      data: {
        amount: amount !== undefined ? Number(amount) : undefined,
        source: source ?? undefined,
        description: description ?? undefined,
        date: date ? new Date(date) : undefined,
      },
    });
    res.json(updated);
  } catch {
    res.status(404).json({ error: "Revenu introuvable" });
  }
});

router.delete("/:id", async (req, res) => {
  const id = Number(req.params.id);
  try {
    const item = await prisma.income.findUnique({ where: { id } });
    if (!item || item.userId !== req.userId) return res.status(403).json({ error: "Accès refusé" });
    await prisma.income.delete({ where: { id } });
    res.json({ success: true });
  } catch {
    res.status(404).json({ error: "Revenu introuvable" });
  }
});

export default router;
