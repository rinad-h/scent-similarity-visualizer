import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../styles/PerfumePage.css";

export default function PerfumePage() {
  const navigate = useNavigate();
  const { id } = useParams(); // present only when editing
  const isEdit = Boolean(id);

  const [form, setForm] = useState({ brand: "", perfume: "", notes: "" });
  const [loading, setLoading] = useState(isEdit); // load existing data if editing
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // If editing, fetch the existing perfume data
  useEffect(() => {
    if (!isEdit) return;
    const fetchPerfume = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/perfumes");
        if (!res.ok) throw new Error();
        const data = await res.json();
        const found = data.find((p) => p.id === parseInt(id));
        if (!found) throw new Error("Not found");
        setForm({ brand: found.brand, perfume: found.perfume, notes: found.notes });
      } catch {
        setError("Could not load perfume data.");
      } finally {
        setLoading(false);
      }
    };
    fetchPerfume();
  }, [id, isEdit]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      const url = isEdit
        ? `http://localhost:5000/api/perfumes/${id}`
        : "http://localhost:5000/api/perfumes";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      navigate("/admin");
    } catch (err) {
      setError(err.message || "Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate("/admin");
  };

  return (
    <div className="pf-root">
      {/* Header */}
      <header className="pf-header">
        <div className="pf-logo">
          <span className="pf-logo-icon">🌸</span>
          <span className="pf-logo-text">
            Fragrance<span className="pf-logo-accent">Finder</span>
          </span>
        </div>
        <div className="pf-header-right">
          <span className="pf-admin-badge">Admin Panel</span>
          <button className="btn-logout" onClick={() => navigate("/")}>
            Logout
          </button>
        </div>
      </header>

      {/* Form Card */}
      <main className="pf-main">
        <div className="pf-card">
          <div className="pf-card-header">
            <button className="pf-back" onClick={handleCancel}>
              ← Back to Dashboard
            </button>
            <h2 className="pf-card-title">
              {isEdit ? "Edit Perfume" : "Add New Perfume"}
            </h2>
            <p className="pf-card-sub">
              {isEdit
                ? "Update the details below and save your changes."
                : "Fill in the details to add a new perfume to the database."}
            </p>
          </div>

          {loading ? (
            <div className="pf-loading">
              <div className="pf-spinner" />
              <p>Loading perfume data...</p>
            </div>
          ) : (
            <form className="pf-form" onSubmit={handleSave}>
              <div className="pf-field">
                <label className="pf-label" htmlFor="brand">Brand</label>
                <input
                  id="brand"
                  name="brand"
                  className="pf-input"
                  type="text"
                  value={form.brand}
                  onChange={handleChange}
                  placeholder="e.g. Chanel, Dior, Jo Malone"
                  required
                />
              </div>

              <div className="pf-field">
                <label className="pf-label" htmlFor="perfume">Perfume Name</label>
                <input
                  id="perfume"
                  name="perfume"
                  className="pf-input"
                  type="text"
                  value={form.perfume}
                  onChange={handleChange}
                  placeholder="e.g. Bleu de Chanel"
                  required
                />
              </div>

              <div className="pf-field">
                <label className="pf-label" htmlFor="notes">
                  Scent Notes
                  <span className="pf-label-hint">comma-separated</span>
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  className="pf-textarea"
                  value={form.notes}
                  onChange={handleChange}
                  placeholder="e.g. rose, amber, sandalwood, musk"
                  rows={3}
                />
              </div>

              {error && <div className="pf-error">⚠ {error}</div>}

              <div className="pf-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={handleCancel}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-save"
                  disabled={saving}
                >
                  {saving ? "Saving..." : isEdit ? "Save Changes" : "Add Perfume"}
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
