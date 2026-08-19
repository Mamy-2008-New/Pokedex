import React, { useEffect, useState } from "react";
import api from "../services/api";
import { Category } from "../types/models";

function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [editing, setEditing] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");

  useEffect(() => {
    fetchCats();
  }, []);

  async function fetchCats() {
    try {
      const res = await api.get("/categories");
      setCategories(res.data);
    } catch {
      alert("Erreur");
    }
  }

  async function createCat() {
    if (!name) return;
    try {
      const res = await api.post("/categories", { name });
      setCategories((s) => [res.data, ...s]);
      setName("");
    } catch {
      alert("Impossible de créer");
    }
  }

  async function startEdit(c: Category) {
    setEditing(c.id);
    setEditValue(c.name);
  }

  async function saveEdit(id: number) {
    try {
      await api.put(`/categories/${id}`, { name: editValue });
      setCategories((s) => s.map((c) => (c.id === id ? { ...c, name: editValue } : c)));
      setEditing(null);
    } catch {
      alert("Erreur");
    }
  }

  async function del(id: number) {
    if (!confirm("Supprimer cette catégorie ?")) return;
    try {
      await api.delete(`/categories/${id}`);
      setCategories((s) => s.filter((c) => c.id !== id));
    } catch (err: any) {
      alert(err?.response?.data?.error || "Impossible de supprimer");
    }
  }

  return (
    <div className="container">
      <h1>Catégories</h1>
      <div className="card actions">
        <input placeholder="Nouvelle catégorie" value={name} onChange={(e) => setName(e.target.value)} />
        <button onClick={createCat}>Créer</button>
      </div>

      <div className="card list">
        <table className="table">
          <thead>
            <tr><th>Nom</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {categories.map((c) => (
              <tr key={c.id}>
                <td>
                  {editing === c.id ? (
                    <input value={editValue} onChange={(e) => setEditValue(e.target.value)} />
                  ) : (
                    c.name
                  )}
                </td>
                <td>
                  {editing === c.id ? (
                    <>
                      <button className="btn small" onClick={() => saveEdit(c.id)}>OK</button>
                      <button className="btn small ghost" onClick={() => setEditing(null)}>Annuler</button>
                    </>
                  ) : (
                    <>
                      <button className="btn small" onClick={() => startEdit(c)}>Éditer</button>
                      <button className="btn small danger" onClick={() => del(c.id)}>Suppr</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Categories;
