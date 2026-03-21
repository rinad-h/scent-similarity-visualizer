import Navbar from "../common/Navbar";
import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/ResultsPage.css";

// decided to clean the LLM response on this page since this is the only place that needs it. can be extracted to a utils file if needed in the future.
const cleanMarkdown = (text = "") =>
  text
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/^#{1,6}\s*/gm, "")
    .replace(/^\*\s+/gm, "")
    .trim();

const parseRecommendationText = (text = "") => {
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  // stripping the response into the sections Tanvi made for the UI
  const sections = [];
  let currentSection = { title: "Recommendation", bullets: [], paragraphs: [] };

  lines.forEach((line) => {
    if (line.startsWith("###")) {
      if (currentSection.bullets.length || currentSection.paragraphs.length) {
        sections.push(currentSection);
      }
      currentSection = {
        title: cleanMarkdown(line.replace(/^###\s*/, "")),
        bullets: [],
        paragraphs: [],
      };
      return;
    }

    if (line.startsWith("*")) {
      currentSection.bullets.push(cleanMarkdown(line));
      return;
    }

    currentSection.paragraphs.push(cleanMarkdown(line));
  });

  if (currentSection.bullets.length || currentSection.paragraphs.length) {
    sections.push(currentSection);
  }

  return sections;
};

// for the scent note pills
const splitNotesIntoTiers = (notesText = "") => {
  const notes = notesText
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  if (notes.length === 0) {
    return { top: [], mid: [], base: [] };
  }

  const third = Math.ceil(notes.length / 3);

  return {
    top: notes.slice(0, third),
    mid: notes.slice(third, third * 2),
    base: notes.slice(third * 2),
  };
};

export default function ResultsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [whyOpen, setWhyOpen] = useState(false);
  const [saved, setSaved] = useState(false);

  const isLoggedIn = false; //to do: connect with acc login

  const recommendations = location.state?.recommendations || "";
  const suggestedPerfumes = location.state?.suggestedPerfumes || [];
  const userPreferences = location.state?.userPreferences || {};

  const topPerfume = suggestedPerfumes[0] || null;
  const notesByTier = splitNotesIntoTiers(topPerfume?.notes || "");

  const recommendationSections = useMemo(
    () => parseRecommendationText(recommendations),
    [recommendations],
  );

  const perfume = {
    name: topPerfume?.perfume || "No perfume selected",
    brand: topPerfume?.brand || "AI Recommendation",
    notes: notesByTier,
  };

  const whyReasons = [
    userPreferences.scentProfile
      ? {
          label: "Scent profile match",
          detail: `Built around your selected ${userPreferences.scentProfile} profile.`,
        }
      : null,
    userPreferences.gender
      ? {
          label: "Gender preference",
          detail: `Recommendations are tailored for ${userPreferences.gender} fragrances.`,
        }
      : null,
    // dataset doesnt have prices so removed it from the recommendation. left it in the preference selection in case we want to add them later.
    userPreferences.priceRange
      ? {
          label: "Budget aligned",
          detail: `Suggestions were filtered to your ${userPreferences.priceRange} price range.`,
        }
      : null,
    userPreferences.occasion
      ? {
          label: "Occasion fit",
          detail: `The selection considers a ${userPreferences.occasion} use case.`,
        }
      : null,
  ].filter(Boolean);

  const handleSave = () => {
    //to do: save logic
    setSaved(true);
    setTimeout(() => navigate("/"), 1200);
  };

  if (!recommendations && suggestedPerfumes.length === 0) {
    return (
      <div className="results-root">
        <main className="results-main">
          <div className="description-card">
            <p className="card-section-title">No Recommendation Found</p>
            <p className="description-text">
              We could not find recommendation data for this session.
            </p>
            <div className="results-actions">
              <button
                className="btn-action-primary"
                onClick={() => navigate("/preferences")}
              >
                Go to Preferences
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="results-root">

      <Navbar isLoggedIn={isLoggedIn} onLogout={() => { /* to do: logout logic */ }} />

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

            <div className="notes-section">
              <p className="notes-label">Fragrance Notes</p>
              <div className="notes-rows">
                {Object.entries(perfume.notes).map(([tier, notes]) => (
                  <div className="notes-row" key={tier}>
                    <span className="notes-tier">{tier}</span>
                    <div className="notes-pills">
                      {notes.map((n) => (
                        <span className="note-pill" key={n}>
                          {n}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        {suggestedPerfumes.length > 0 && (
          <div className="similar-perfumes-card">
            <p className="card-section-title">Other Suggested Perfumes</p>
            <div className="perfumes-grid">
              {suggestedPerfumes.map((item, index) => (
                <div
                  className="perfume-card"
                  key={`${item.brand}-${item.perfume}-${index}`}
                >
                  <div className="perfume-card-icon">🧴</div>
                  <p className="perfume-card-brand">{item.brand}</p>
                  <p className="perfume-card-name">{item.perfume}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="description-card">
          <p className="card-section-title">AI Recommendation</p>
          {recommendationSections.length > 0 ? (
            <div className="ai-content">
              {recommendationSections.map((section, index) => (
                <div className="ai-section" key={`${section.title}-${index}`}>
                  <h3 className="ai-section-title">{section.title}</h3>
                  {section.paragraphs.length > 0 && (
                    <div className="ai-paragraph">
                      {section.paragraphs.map((paragraph, paragraphIndex) => (
                        <p
                          className="ai-text"
                          key={`${section.title}-p-${paragraphIndex}`}
                        >
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  )}
                  {section.bullets.length > 0 && (
                    <ul className="ai-bullet-list">
                      {section.bullets.map((bullet, bulletIndex) => (
                        <li
                          className="ai-bullet-item"
                          key={`${section.title}-b-${bulletIndex}`}
                        >
                          {bullet}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="description-text">{cleanMarkdown(recommendations)}</p>
          )}
          <div className="ai-badge">✦ AI-generated recommendation</div>
        </div>

        {whyReasons.length > 0 && (
          <div className="why-card">
            <button className="why-toggle" onClick={() => setWhyOpen(!whyOpen)}>
              <span className="why-toggle-label">Why this recommendation?</span>
              <span className={`why-chevron ${whyOpen ? "open" : ""}`}>▼</span>
            </button>

            <div className={`why-body ${whyOpen ? "open" : ""}`}>
              <ul className="why-reason-list">
                {whyReasons.map((reason, index) => (
                  <li className="why-reason-item" key={index}>
                    <div className="why-reason-dot" />
                    <p className="why-reason-text">
                      <strong>{reason.label} — </strong>
                      {reason.detail}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

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
