import React, { useEffect, useState } from "react";
import api from "../services/api";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";

function Dashboard() {
  const [month, setMonth] = useState(() => {
    const d = new Date();
    return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
  });
  const [summary, setSummary] = useState<any>(null);
  const [monthlySeries, setMonthlySeries] = useState<any[]>([]);

  useEffect(() => {
    fetchSummary();
    fetchMonthlySeries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month]);

  async function fetchSummary() {
    try {
      const res = await api.get("/summary", { params: { month } });
      setSummary(res.data);
    } catch {
      alert("Impossible de récupérer le résumé");
    }
  }

  // simple last 6 months expenses histogram using summary per month
  async function fetchMonthlySeries() {
    try {
      const now = new Date();
      const series: any[] = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
        const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
        const res = await api.get("/summary", { params: { month: key } });
        series.push({ month: key, expenses: res.data.totalExpenses || 0 });
      }
      setMonthlySeries(series);
    } catch {
      // ignore
    }
  }

  const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7f7f", "#a4de6c", "#d0ed57"];

  return (
    <div className="container">
      <h1>Tableau de bord</h1>

      <div className="card">
        <label>Mois: </label>
        <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
      </div>

      {summary ? (
        <>
          <div className="grid">
            <div className="card stat1">
              <h3>Total revenus</h3>
              <p className="big">{summary.totalIncomes?.toFixed(2) ?? "0.00"} €</p>
            </div>
            <div className="card stat2">
              <h3>Total dépenses</h3>
              <p className="big">{summary.totalExpenses?.toFixed(2) ?? "0.00"} €</p>
            </div>
            <div className="card stat3">
              <h3>Solde</h3>
              <p className="big">{(summary.balance ?? 0).toFixed(2)} €</p>
              {summary.balance < 0 && <p className="alert">Vous avez dépassé votre budget ce mois-ci de {Math.abs(summary.balance).toFixed(2)} €</p>}
            </div>
          </div>

          <div className="grid">
            <div className="card chart">
              <h3>Répartition par catégorie</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={Object.entries(summary.byCategory || {}).map(([name, value]) => ({ name, value }))} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                    {Object.entries(summary.byCategory || {}).map(([,], idx) => (
                      <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="card chart">
              <h3>Dépenses — 6 derniers mois</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={monthlySeries}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="expenses" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      ) : (
        <p>Chargement...</p>
      )}
    </div>
  );
}

export default Dashboard;
