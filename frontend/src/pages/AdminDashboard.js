import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/AdminDashboard.css";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [perfumes, setPerfumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(null); // id of row to confirm delete

  // Fetch perfumes on mount
  useEffect(() => {
    fetchPerfumes();
  }, []);

  const fetchPerfumes = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("http://localhost:5000/api/perfumes");
      if (!res.ok) throw new Error("Failed to load perfumes");
      const data = await res.json();
      setPerfumes(data);
    } catch (err) {
      setError("Could not load perfume database. Is the server running?");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/perfumes/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Delete failed");
      setPerfumes((prev) => prev.filter((p) => p.id !== id));
      setDeleteConfirm(null);
    } catch (err) {
      setError("Failed to delete perfume.");
    }
  };

  const handleLogout = () => {
    navigate("/");
  };

  const filtered = perfumes.filter(
    (p) =>
      p.brand.toLowerCase().includes(search.toLowerCase()) ||
      p.perfume.toLowerCase().includes(search.toLowerCase()) ||
      p.notes.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="dash-root">
      {/* Header */}
      <header className="dash-header">
        <div className="dash-logo">
          <span className="dash-logo-icon">🌸</span>
          <span className="dash-logo-text">
            Fragrance<span className="dash-logo-accent">Finder</span>
          </span>
        </div>
        <div className="dash-header-right">
          <span className="dash-admin-badge">Admin Panel</span>
          <button className="btn-logout" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="dash-main">
        <div className="dash-toolbar">
          <div className="dash-toolbar-left">
            <h2 className="dash-title">Perfume Database</h2>
            <span className="dash-count">{filtered.length} entries</span>
          </div>
          <div className="dash-toolbar-right">
            <input
              className="dash-search"
              type="text"
              placeholder="Search brand, name, or notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button
              className="btn-add"
              onClick={() => navigate("/admin/perfume/new")}
            >
              + Add Perfume
            </button>
          </div>
        </div>

        {error && <div className="dash-error">⚠ {error}</div>}

        {loading ? (
          <div className="dash-loading">
            <div className="dash-spinner" />
            <p>Loading perfume database...</p>
          </div>
        ) : (
          <div className="dash-table-wrapper">
            <table className="dash-table">
              <thead>
                <tr>
                  <th>Brand</th>
                  <th>Perfume Name</th>
                  <th>Notes</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="dash-empty">
                      No perfumes found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((p, i) => (
                    <tr key={p.id} className="dash-row">
                      <td className="dash-td-brand">{p.brand}</td>
                      <td className="dash-td-name">{p.perfume}</td>
                      <td className="dash-td-notes">
                        <span className="notes-pill">{p.notes || "—"}</span>
                      </td>
                      <td className="dash-td-actions">
                        <button
                          className="btn-edit"
                          onClick={() =>
                            navigate(`/admin/perfume/edit/${p.id}`)
                          }
                        >
                          Edit
                        </button>
                        {deleteConfirm === p.id ? (
                          <span className="delete-confirm">
                            <span>Sure?</span>
                            <button
                              className="btn-confirm-yes"
                              onClick={() => handleDelete(p.id)}
                            >
                              Yes
                            </button>
                            <button
                              className="btn-confirm-no"
                              onClick={() => setDeleteConfirm(null)}
                            >
                              No
                            </button>
                          </span>
                        ) : (
                          <button
                            className="btn-delete"
                            onClick={() => setDeleteConfirm(p.id)}
                          >
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
