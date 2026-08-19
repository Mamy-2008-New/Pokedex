import React, { useEffect, useState } from "react";
import api from "../services/api";
import { User } from "../types/models";

function Profile() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    fetch();
  }, []);

  async function fetch() {
    try {
      const res = await api.get("/auth/me");
      setUser(res.data);
    } catch {
      // ignore
    }
  }

  return (
    <div className="container">
      <h1>Profil</h1>
      <div className="card">
        {user ? (
          <>
            <p>
              <strong>Email :</strong> {user.email}
            </p>
            <p>
              <strong>Date de création :</strong>{" "}
              {new Date(user.createdAt).toLocaleString()}
            </p>
          </>
        ) : (
          <p>Chargement...</p>
        )}
      </div>
    </div>
  );
}

export default Profile;
