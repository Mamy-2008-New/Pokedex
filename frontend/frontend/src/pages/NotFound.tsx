import React from "react";
import { Link } from "react-router-dom";

function NotFound() {
  return (
    <div className="container">
      <h1>404 — Page non trouvée</h1>
      <p>La route demandée n'existe pas.</p>
      <Link to="/">Retour au tableau de bord</Link>
    </div>
  );
}

export default NotFound;
