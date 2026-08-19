import React, { useEffect, useState } from "react";
import api from "../services/api";
import { Income } from "../types/models";
import { useNavigate } from "react-router-dom";

function Incomes() {
  const [incomes, setIncomes] = useState<Income[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchIncomes();
  }, []);

  async function fetchIncomes() {
    try {
      const res = await api.get("/incomes");
      setIncomes(res.data);
    } catch {
      alert("Impossible de récupérer les revenus");
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Supprimer ce revenu ?")) return;
    try {
      await api.delete(`/incomes/${id}`);
      setIncomes((s) => s.filter((i) => i.id !== id));
    } catch {
      alert("Impossible de supprimer");
    }
  }

  return (
    <div className="container">
      <h1>Revenus</h1>

      <div className="card actions">
        <button onClick={() => navigate("/incomes/new")}>+ Nouveau revenu</button>
      </div>

      <div className="card list">
        {incomes.length === 0 ? <p>Aucun revenu</p> : (
          <table className="table">
            <thead>
              <tr>
                <th>Montant</th>
                <th>Source</th>
                <th>Date</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {incomes.map((i) => (
                <tr key={i.id}>
                  <td>{i.amount.toFixed(2)} €</td>
                  <td>{i.source}</td>
                  <td>{new Date(i.date).toLocaleDateString()}</td>
                  <td>{i.description ?? "—"}</td>
                  <td>
                    <button className="btn small" onClick={() => navigate(`/incomes/${i.id}/edit`)}>Éditer</button>
                    <button className="btn small danger" onClick={() => handleDelete(i.id)}>Suppr</button>
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

export default Incomes;
