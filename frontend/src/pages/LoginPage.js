import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/LoginPage.css";
 
export default function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

//this function will handle the login process for the admin
const handleLogin = async (e) => {
  e.preventDefault();
  setError("");
  setLoading(true);

  //try to send a post request to the backend containing the admins username and password
  try {
    const res = await fetch("http://localhost:5000/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: username.trim(), password }),
    });
    //wait for the response and save it as a json
    const data = await res.json();
    //if the admin loggged in properly, take them to the home page, otherwise give and error message
    if (res.ok && data.success) {
      navigate("/admin");
    } else {
      setError(data.error || "Login failed. Please try again.");
    }
  } catch (err) {
    //if connection does not work, give a message
    setError("Could not connect to server. Please try again later");
  } finally {
    setLoading(false);
  }
};
 
  return (
    <div className="landing-root">
      <div className="landing-card">
 
        {/*set up the left panel for the admin login area*/}
        <div className="panel panel-left">
          <h2 className="panel-title">Admin Login</h2>
          <div className="panel-divider" />
 
          <form className="admin-form" onSubmit={handleLogin}>
            <div className="field-group">
              <label className="field-label" htmlFor="username">Username</label>
              <input
                id="username"
                className="field-input"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="field-group">
              <label className="field-label" htmlFor="password">Password</label>
              <input
                id="password"
                className="field-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
 
            {error && (
              <div className="admin-error" role="alert">⚠ {error}</div>
            )}
 
            <button type="submit" className="btn-admin" disabled={loading}>
              {loading ? "Loading..." : "Sign In"}
            </button>
          </form>
        </div>
 
        {/*add a divided between the two panels*/}
        <div className="card-divider" />
 
        {/*right side panel which is for regular users*/}
        <div className="panel panel-right">
          <div className="brand-logo">🌸</div>
          <h1 className="brand-name">
            Fragrance<br />
            <span className="brand-accent">Finder</span>
          </h1>
          <p className="brand-tagline">
            Discover your perfect scent, <br />curated just for you.
          </p>
          <button className="btn-start" onClick={() => navigate("/home")}>
            Start Today!
          </button>
        </div>
 
      </div>
    </div>
  );
}
 
