import { useState } from "react";
import Navbar from "../../common/Navbar";
import "../../styles/SimilarityFeature.css";

function SimilarityFeature() {
  const [brand, setBrand] = useState("");
  const [perfume, setPerfume] = useState("");
  const [brandSuggestions, setBrandSuggestions] = useState([]);
  const [perfumeSuggestions, setPerfumeSuggestions] = useState([]);
  const [brandAvailable, setBrandAvailable] = useState(true);
  const [perfumeAvailable, setPerfumeAvailable] = useState(true);
  const [results, setResults] = useState([]);
  const [error, setError] = useState("");

  const fetchAutocomplete = async (field, query, brandVal = "") => {
    if (!query) {
      if (field === "brand") setBrandSuggestions([]);
      if (field === "perfume") setPerfumeSuggestions([]);
      return;
    }
    try {
      const url = new URL("http://127.0.0.1:5000/autocomplete");
      url.searchParams.append("field", field);
      url.searchParams.append("q", query);
      if (brandVal) url.searchParams.append("brand", brandVal);
      const res = await fetch(url.toString());
      const data = await res.json();
      if (field === "brand") {
        setBrandSuggestions(data.suggestions || []);
        setBrandAvailable(data.available !== false);
      } else {
        setPerfumeSuggestions(data.suggestions || []);
        setPerfumeAvailable(data.available !== false);
      }
    } catch {
      if (field === "brand") { setBrandSuggestions([]); setBrandAvailable(false); }
      else { setPerfumeSuggestions([]); setPerfumeAvailable(false); }
    }
  };

  const handleBrandChange = (value) => {
    setBrand(value); setResults([]); setError("");
    setPerfume(""); setPerfumeSuggestions([]); setPerfumeAvailable(true);
    fetchAutocomplete("brand", value);
  };

  const handlePerfumeChange = (value) => {
    setPerfume(value); setResults([]); setError("");
    fetchAutocomplete("perfume", value, brand);
  };

  const handleBrandSelect = (value) => {
    setBrand(value); setBrandSuggestions([]); setResults([]); setError("");
    setPerfume(""); setPerfumeSuggestions([]); setPerfumeAvailable(true);
  };

  const handlePerfumeSelect = (value) => {
    setPerfume(value); setPerfumeSuggestions([]); setResults([]); setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setResults([]);
    try {
      const res = await fetch("http://127.0.0.1:5000/similar_perfumes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brand, perfume }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Perfume not found"); return; }
      setResults(data.similar_perfumes);
    } catch {
      setError("Error connecting to server");
    }
  };

  return (
    <div className="sim-page">
      <Navbar />

      {/* ── Hero search section ── */}
      <section className="sim-hero">
        <div className="sim-hero-bg" aria-hidden="true" />

        <h1 className="sim-hero-title">Find Your Scent Match</h1>
        <p className="sim-hero-subtitle">
          Enter a perfume you love — we'll find the closest matches.
        </p>

        <form className="sim-search-form" onSubmit={handleSubmit}>
          <div className="sim-inputs-row">

            {/* Brand */}
            <div className="autocomplete-field">
              <input
                type="text"
                placeholder="Brand"
                value={brand}
                onChange={(e) => handleBrandChange(e.target.value)}
                required
                autoComplete="off"
              />
              {brand && !brandAvailable && (
                <p className="sim-field-error">Brand not available</p>
              )}
              {brandSuggestions.length > 0 && (
                <ul className="suggestions">
                  {brandSuggestions.map((item, idx) => (
                    <li key={`brand-${idx}`} onClick={() => handleBrandSelect(item)}>
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Perfume */}
            <div className="autocomplete-field">
              <input
                type="text"
                placeholder="Perfume Name"
                value={perfume}
                onChange={(e) => handlePerfumeChange(e.target.value)}
                required
                autoComplete="off"
                disabled={!brand}
              />
              {perfume && !perfumeAvailable && (
                <p className="sim-field-error">Perfume not available</p>
              )}
              {perfumeSuggestions.length > 0 && (
                <ul className="suggestions">
                  {perfumeSuggestions.map((item, idx) => (
                    <li key={`perfume-${idx}`} onClick={() => handlePerfumeSelect(item)}>
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <button type="submit" className="sim-btn-find">Find Similar</button>
          </div>

          {error && <p className="sim-error">{error}</p>}
        </form>
      </section>

      {/* ── Results grid ── */}
      {results.length > 0 && (
        <section className="sim-results-section">
          <h2 className="sim-results-heading">Top Matches</h2>
          <div className="sim-results-grid">
            {results.map((r, idx) => (
              <div className="sim-result-card" key={idx}>
                <span className="sim-result-rank">#{idx + 1}</span>
                <h3 className="sim-result-name">{r.perfume}</h3>
                <p className="sim-result-brand">{r.brand}</p>
                <div className="sim-result-divider" />
                <p className="sim-result-notes">{r.notes}</p>
                <span className="sim-result-score">Score: {r.score}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default SimilarityFeature;