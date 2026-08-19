import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { auth } from "../middlewares/auth.js";

const prisma = new PrismaClient();
const router = Router();

router.use(auth);

function monthRange(month) {
  const [y, m] = month.split("-").map(Number);
  const from = new Date(Date.UTC(y, m - 1, 1));
  const to = new Date(Date.UTC(y, m, 0, 23, 59, 59, 999));
  return { from, to };
}

router.get("/", async (req, res) => {
  try {
    const { month } = req.query;
    let from, to;
    if (month) ({ from, to } = monthRange(month));

    const userId = req.userId;

    // ponctuelles
    const ponctuelles = await prisma.expense.findMany({
      where: {
        userId,
        type: "PONCTUELLE",
        ...(from && to ? { date: { gte: from, lte: to } } : {}),
      },
    });

    // récurrentes actives dans le mois
    let recurrentes = [];
    if (month) {
      recurrentes = await prisma.expense.findMany({
        where: {
          userId,
          type: "RECURRENTE",
          startDate: { lte: to },
          OR: [{ endDate: null }, { endDate: { gte: from } }],
        },
      });
    }

    const incomes = await prisma.income.findMany({
      where: {
        userId,
        ...(from && to ? { date: { gte: from, lte: to } } : {}),
      },
    });

    const totalExpenses = [...ponctuelles, ...recurrentes].reduce((s, e) => s + e.amount, 0);
    const totalIncomes = incomes.reduce((s, i) => s + i.amount, 0);
    const balance = totalIncomes - totalExpenses;

    // stats par catégorie
    const allForPie = await prisma.expense.findMany({
      where: {
        userId,
        OR: [
          { type: "PONCTUELLE", ...(from && to ? { date: { gte: from, lte: to } } : {}) },
          { type: "RECURRENTE", ...(month ? { startDate: { lte: to }, OR: [{ endDate: null }, { endDate: { gte: from } }] } : {}) },
        ],
      },
      include: { category: true },
    });

    const byCategory = {};
    for (const e of allForPie) {
      const key = e.category?.name || "Sans catégorie";
      byCategory[key] = (byCategory[key] || 0) + e.amount;
    }

    res.json({ totalIncomes, totalExpenses, balance, byCategory });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

export default router;
