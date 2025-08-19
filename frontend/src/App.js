import { useState } from "react";
import "./App.css";

function App() {
  const [brand, setBrand] = useState("");
  const [perfume, setPerfume] = useState("");
  const [results, setResults] = useState([]);
  const [error, setError] = useState("");

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
        <div className="logo">Logo</div> {/* Replace with your logo */}
        <h1>Perfume Similarity App</h1>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Brand"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Perfume Name"
            value={perfume}
            onChange={(e) => setPerfume(e.target.value)}
            required
          />
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

export default App;
