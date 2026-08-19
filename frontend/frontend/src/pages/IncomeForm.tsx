import React, { useEffect, useState } from "react";
import api from "../services/api";
import { useNavigate, useParams } from "react-router-dom";

function IncomeForm() {
  const { id } = useParams<{ id?: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();

  const [amount, setAmount] = useState("");
  const [source, setSource] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (isEdit) fetchIncome();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function fetchIncome() {
    try {
      const res = await api.get("/incomes");
      const found = res.data.find((i: any) => String(i.id) === String(id));
      if (!found) {
        alert("Revenu introuvable");
        navigate("/incomes");
        return;
      }
      setAmount(String(found.amount));
      setSource(found.source);
      setDate(found.date.split("T")[0]);
      setDescription(found.description ?? "");
    } catch {
      // ignore
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!amount || !source || !date) return alert("Remplis amount, source et date");
    try {
      const payload = { amount: Number(amount), source, date, description: description || undefined };
      if (isEdit) {
        await api.put(`/incomes/${id}`, payload);
      } else {
        await api.post("/incomes", payload);
      }
      navigate("/incomes");
    } catch {
      alert("Erreur lors de l'enregistrement");
    }
  }

  return (
    <div className="container">
      <h1>{isEdit ? "Modifier revenu" : "Nouveau revenu"}</h1>
      <form onSubmit={handleSubmit} className="card form-grid">
        <label>Montant (€)</label>
        <input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} />

        <label>Source</label>
        <input value={source} onChange={(e) => setSource(e.target.value)} />

        <label>Date</label>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />

        <label>Description</label>
        <input value={description} onChange={(e) => setDescription(e.target.value)} />

        <div className="actions">
          <button type="submit">{isEdit ? "Enregistrer" : "Créer"}</button>
          <button type="button" className="ghost" onClick={() => navigate("/incomes")}>Annuler</button>
        </div>
      </form>
    </div>
  );
}

export default IncomeForm;
