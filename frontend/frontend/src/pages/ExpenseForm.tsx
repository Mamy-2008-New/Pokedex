import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import { Category, Expense } from "../types/models";

function ExpenseForm() {
  const { id } = useParams<{ id?: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();

  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"PONCTUELLE" | "RECURRENTE">("PONCTUELLE");
  const [date, setDate] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetchCategories();
    if (isEdit) fetchExpense();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function fetchCategories() {
    try {
      const res = await api.get("/categories");
      setCategories(res.data);
    } catch {
      // ignore
    }
  }

  async function fetchExpense() {
    try {
      const res = await api.get(`/expenses`, { params: { } });
      const found: Expense | undefined = res.data.find((e: Expense) => String(e.id) === String(id));
      if (!found) {
        alert("Dépense introuvable");
        navigate("/expenses");
        return;
      }
      setAmount(String(found.amount));
      setType(found.type);
      setDate(found.date ? found.date.split("T")[0] : "");
      setStartDate(found.startDate ? found.startDate.split("T")[0] : "");
      setEndDate(found.endDate ? found.endDate.split("T")[0] : "");
      setCategoryId(found.categoryId ? String(found.categoryId) : "");
      setDescription(found.description ?? "");
    } catch {
      alert("Erreur");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!amount) return alert("Montant requis");
    try {
      const payload: any = {
        amount: Number(amount),
        type,
        description: description || undefined,
        categoryId: categoryId ? Number(categoryId) : undefined,
      };
      if (type === "PONCTUELLE") payload.date = date || undefined;
      if (type === "RECURRENTE") {
        payload.startDate = startDate || undefined;
        payload.endDate = endDate || undefined;
      }

      if (isEdit) {
        await api.put(`/expenses/${id}`, payload);
      } else {
        const res = await api.post("/expenses", payload);
        // if file attached upload
        if (file) {
          const fd = new FormData();
          fd.append("file", file);
          await api.post(`/expenses/${res.data.id}/receipt`, fd, { headers: { "Content-Type": "multipart/form-data" } });
        }
      }
      navigate("/expenses");
    } catch (err: any) {
      alert(err?.response?.data?.error || "Erreur lors de l'enregistrement");
    }
  }

  return (
    <div className="container">
      <h1>{isEdit ? "Modifier dépense" : "Nouvelle dépense"}</h1>
      <form onSubmit={handleSubmit} className="card form-grid">
        <label>Montant (€)</label>
        <input value={amount} onChange={(e) => setAmount(e.target.value)} type="number" step="0.01" />

        <label>Type</label>
        <select value={type} onChange={(e) => setType(e.target.value as any)}>
          <option value="PONCTUELLE">Ponctuelle</option>
          <option value="RECURRENTE">Récurrente</option>
        </select>

        {type === "PONCTUELLE" ? (
          <>
            <label>Date</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </>
        ) : (
          <>
            <label>Date de début</label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            <label>Date de fin (optionnelle)</label>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </>
        )}

        <label>Catégorie</label>
        <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
          <option value="">Sans catégorie</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>

        <label>Description</label>
        <input value={description} onChange={(e) => setDescription(e.target.value)} />

        {!isEdit && (
          <>
            <label>Reçu (jpg, png, pdf — max 5MB)</label>
            <input type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          </>
        )}

        <div className="actions">
          <button type="submit">{isEdit ? "Enregistrer" : "Créer"}</button>
          <button type="button" className="ghost" onClick={() => navigate("/expenses")}>Annuler</button>
        </div>
      </form>
    </div>
  );
}

export default ExpenseForm;
