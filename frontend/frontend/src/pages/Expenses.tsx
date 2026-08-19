import React, { useEffect, useState } from "react";
import api from "../services/api";
import { Expense, Category } from "../types/models";
import { Link, useNavigate } from "react-router-dom";

function Expenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filterCategory, setFilterCategory] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("");

  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
    fetchExpenses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchCategories() {
    try {
      const res = await api.get("/categories");
      setCategories(res.data);
    } catch {
      // ignore
    }
  }

  async function fetchExpenses() {
    try {
      const params: any = {};
      if (filterCategory) params.categoryId = filterCategory;
      if (typeFilter) params.type = typeFilter;
      const res = await api.get("/expenses", { params });
      setExpenses(res.data);
    } catch {
      alert("Erreur lors de la récupération des dépenses");
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Supprimer cette dépense ?")) return;
    try {
      await api.delete(`/expenses/${id}`);
      setExpenses((s) => s.filter((e) => e.id !== id));
    } catch {
      alert("Impossible de supprimer");
    }
  }

  return (
    <div className="container">
      <h1>Dépenses</h1>
      <div className="card actions">
        <button onClick={() => navigate("/expenses/new")}>+ Nouvelle dépense</button>
        <div>
          <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
            <option value="">Toutes catégories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option value="">Tous types</option>
            <option value="PONCTUELLE">Ponctuelle</option>
            <option value="RECURRENTE">Récurrente</option>
          </select>
          <button onClick={fetchExpenses}>Filtrer</button>
        </div>
      </div>

      <div className="card list">
        {expenses.length === 0 ? <p>Aucune dépense</p> : (
          <table className="table">
            <thead>
              <tr>
                <th>Montant</th>
                <th>Type</th>
                <th>Catégorie</th>
                <th>Date</th>
                <th>Description</th>
                <th>Reçu</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((e) => (
                <tr key={e.id}>
                  <td>{e.amount.toFixed(2)} €</td>
                  <td>{e.type}</td>
                  <td>{e.category?.name ?? "—"}</td>
                  <td>{e.type === "PONCTUELLE" ? (e.date ? new Date(e.date).toLocaleDateString() : "—") : (e.startDate ? `Débute ${new Date(e.startDate).toLocaleDateString()}` : "—")}</td>
                  <td>{e.description ?? "—"}</td>
                  <td>{e.receiptUrl ? <a href={`http://localhost:5000${e.receiptUrl}`} target="_blank" rel="noreferrer">Voir</a> : "—"}</td>
                  <td>
                    <Link to={`/expenses/${e.id}/edit`} className="btn small">Éditer</Link>
                    <button className="btn small danger" onClick={() => handleDelete(e.id)}>Suppr</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default Expenses;
