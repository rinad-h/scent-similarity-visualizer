import { useNavigate } from "react-router-dom";
import "../styles/Navbar.css";

export default function Navbar({ isLoggedIn, onLogout }) {
  const navigate = useNavigate();

  return (
    <header className="results-header">
      <div className="header-brand" onClick={() => navigate("/")}>
        <span className="header-logo-icon">🌸</span>
        <span className="header-logo-text">
          Fragrance <span>Finder</span>
        </span>
      </div>

      <nav className="header-nav">
        {isLoggedIn ? (
          <button className="btn-nav-ghost" onClick={onLogout}>
            Logout
          </button>
        ) : (
          <>
            <button className="btn-nav-ghost" onClick={() => navigate("/login")}>
              Login
            </button>
            <button className="btn-nav-filled" onClick={() => navigate("/signup")}>
              Sign Up
            </button>
          </>
        )}
      </nav>
    </header>
  );
}