import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <h2>💸 Expense Tracker</h2>
      <ul>
        {token ? (
          <>
            <li><Link to="/dashboard">Dashboard</Link></li>
            <li><Link to="/expenses">Dépenses</Link></li>
            <li><Link to="/incomes">Revenus</Link></li>
            <li><Link to="/categories">Catégories</Link></li>
            <li><Link to="/profile">Profil</Link></li>
            <li><button onClick={logout}>Déconnexion</button></li>
          </>
        ) : (
          <>
            <li><Link to="/login">Connexion</Link></li>
            <li><Link to="/signup">Inscription</Link></li>
          </>
        )}
      </ul>
    </nav>
  );
}

export default Navbar;
