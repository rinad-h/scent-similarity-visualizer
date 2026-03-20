import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/ResultsPage.css";

// SAMPLE PLACEHOLDER DATA TILL LLM STUFF IS DONE :)

const PLACEHOLDER_RESULT = {
  name: "Baccarat Rouge 540",
  brand: "Maison Francis Kurkdjian",
  price: "$325",
  priceNote: "avg. retail",
  notes: {
    top: ["Jasmine", "Saffron"],
    mid: ["Amberwood", "Ambergris"],
    base: ["Fir Resin", "Cedar"],
  },
  aiDescription:
    "An ethereal luminosity radiates from this iconic composition — warm amber resin melts into " +
    "a shimmering jasmine heart, grounded by cedar and a whisper of saffron. It clings to skin " +
    "like a second breath: intimate, radiant, utterly unforgettable. Wear it when you want to be " +
    "remembered long after you've left the room.",
  reasons: [
    {
      label: "Matches your warm & sweet preference",
      detail: "You selected amber and vanilla as favourite scent families — this fragrance is built around warm resinous amber.",
    },
    {
      label: "Season fit: Autumn / Winter",
      detail: "The dense woodsy base and heavy sillage make it ideal for cooler temperatures.",
    },
    {
      label: "Longevity preference",
      detail: "You indicated you prefer long-lasting scents — Baccarat Rouge 540 is consistently rated 10–12 hours on skin.",
    },
    {
      label: "Occasion: Evening / Special events",
      detail: "The projection and intensity suit the evening-wear occasions you selected.",
    },
  ],
};

export default function ResultsPage() {
  const navigate = useNavigate();
  const [whyOpen, setWhyOpen] = useState(false);
  const [saved, setSaved] = useState(false);

  const isLoggedIn = false; //to do: connect with acc login

  const perfume = PLACEHOLDER_RESULT;

  const handleSave = () => { //to do: save logic
    setSaved(true);
    setTimeout(() => navigate("/"), 1200);
  };

  return (
    <div className="results-root">
      <header className="results-header">
        <div className="header-brand" onClick={() => navigate("/")}>
          <span className="header-logo-icon">🌸</span>
          <span className="header-logo-text">
            Fragrance <span>Finder</span>
          </span>
        </div>

        <nav className="header-nav">
          {isLoggedIn ? (
            <>
              <button className="btn-nav-ghost" onClick={() => {/* to do: logout logic */}}>
                Logout
              </button>
            </>
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

      <main className="results-main">

        <div className="results-eyebrow">Your Personalised Recommendation</div>

        <div className="perfume-hero-card">
          <div className="perfume-visual">
            <div className="perfume-bottle-icon">🧴</div>
            <div className="perfume-match-badge">Top Match</div>
          </div>

          <div className="perfume-info">
            <p className="perfume-brand">{perfume.brand}</p>
            <h1 className="perfume-name">{perfume.name}</h1>
            <p className="perfume-price">
              {perfume.price}
              <span>{perfume.priceNote}</span>
            </p>

            <div className="notes-section">
              <p className="notes-label">Fragrance Notes</p>
              <div className="notes-rows">
                {Object.entries(perfume.notes).map(([tier, notes]) => (
                  <div className="notes-row" key={tier}>
                    <span className="notes-tier">{tier}</span>
                    <div className="notes-pills">
                      {notes.map((n) => (
                        <span className="note-pill" key={n}>{n}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="description-card">
          <p className="card-section-title">Scent Story</p>
          <p className="description-text">"{perfume.aiDescription}"</p>
          <div className="ai-badge">✦ AI-generated description</div>
        </div>

        <div className="why-card">
          <button className="why-toggle" onClick={() => setWhyOpen(!whyOpen)}>
            <span className="why-toggle-label">Why this recommendation?</span>
            <span className={`why-chevron ${whyOpen ? "open" : ""}`}>▼</span>
          </button>

          <div className={`why-body ${whyOpen ? "open" : ""}`}>
            <ul className="why-reason-list">
              {perfume.reasons.map((r, i) => (
                <li className="why-reason-item" key={i}>
                  <div className="why-reason-dot" />
                  <p className="why-reason-text">
                    <strong>{r.label} — </strong>
                    {r.detail}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="results-actions">
          <button
            className="btn-action-primary"
            onClick={handleSave}
            disabled={saved}
          >
            {saved ? "✓ Saved!" : "♡ Save Preference"}
          </button>

          <button
            className="btn-action-secondary"
            onClick={() => navigate("/preferences")}
          >
            ↺ Generate Another
          </button>

          <button
            className="btn-action-secondary"
            onClick={() => navigate("/similar")}
          >
            ✦ Explore Similar
          </button>
        </div>

      </main>
    </div>
  );
}