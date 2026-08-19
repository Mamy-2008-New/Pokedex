import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { auth } from "../middlewares/auth.js";

const prisma = new PrismaClient();
const router = Router();

router.use(auth);

router.get("/", async (req, res) => {
  const categories = await prisma.category.findMany({ where: { userId: req.userId } });
  res.json(categories);
});

router.post("/", async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: "Nom requis" });
  const cat = await prisma.category.create({ data: { name, userId: req.userId } });
  res.json(cat);
});

router.put("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const { name } = req.body;
  try {
    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: "Catégorie introuvable" });
    if (existing.userId !== req.userId) return res.status(403).json({ error: "Accès refusé" });
    const updated = await prisma.category.update({ where: { id }, data: { name } });
    res.json(updated);
  } catch {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.delete("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const inUse = await prisma.expense.findFirst({ where: { categoryId: id, userId: req.userId } });
  if (inUse) return res.status(400).json({ error: "Catégorie utilisée" });
  try {
    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: "Catégorie introuvable" });
    if (existing.userId !== req.userId) return res.status(403).json({ error: "Accès refusé" });
    await prisma.category.delete({ where: { id } });
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

export default router;
