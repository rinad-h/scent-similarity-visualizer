import { useState } from "react";
import "../../App.css";

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
    } catch (err) {
      if (field === "brand") {
        setBrandSuggestions([]);
        setBrandAvailable(false);
      } else {
        setPerfumeSuggestions([]);
        setPerfumeAvailable(false);
      }
    }
  };

  const handleBrandChange = (value) => {
    setBrand(value);
    setResults([]);
    setError("");
    setPerfume("");
    setPerfumeSuggestions([]);
    setPerfumeAvailable(true);
    fetchAutocomplete("brand", value);
  };

  const handlePerfumeChange = (value) => {
    setPerfume(value);
    setResults([]);
    setError("");
    fetchAutocomplete("perfume", value, brand);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setResults([]);

    try {
      const res = await fetch("http://127.0.0.1:5000/similar_perfumes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brand, perfume }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Perfume not found");
        return;
      }

      setResults(data.similar_perfumes);
    } catch (err) {
      setError("Error connecting to server");
    }
  };

  return (
    <div className="container">
      <div className="content">
        <div className="logo">Logo</div>
        <h1>Perfume Similarity App</h1>

        <form onSubmit={handleSubmit}>
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
              <p className="error">Brand not available</p>
            )}
            {brandSuggestions.length > 0 && (
              <ul className="suggestions">
                {brandSuggestions.map((item, idx) => (
                  <li
                    key={`brand-${idx}`}
                    onClick={() => handleBrandChange(item)}
                  >
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </div>

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
              <p className="error">Perfume not available</p>
            )}
            {perfumeSuggestions.length > 0 && (
              <ul className="suggestions">
                {perfumeSuggestions.map((item, idx) => (
                  <li
                    key={`perfume-${idx}`}
                    onClick={() => handlePerfumeChange(item)}
                  >
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <button type="submit">Find Similar</button>
        </form>

        {error && <p className="error">{error}</p>}

        {results.length > 0 && (
          <div className="results">
            <h2>Top Similar Perfumes:</h2>
            <ul>
              {results.map((r, idx) => (
                <li key={idx}>
                  <strong>{r.perfume}</strong> by {r.brand} (Score: {r.score})
                  <br />
                  Notes: {r.notes}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default SimilarityFeature;
