import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/PreferencesPage.css";

export default function PreferencesPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    scentProfile: "",
    priceRange: "",
    gender: "",
    occasion: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.scentProfile || !formData.priceRange || !formData.gender) {
      setError("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        "http://localhost:5000/api/recommendations",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        },
      );

      const data = await response.json();

      if (response.ok && data.success) {
        navigate("/results", {
          state: {
            recommendations: data.recommendations,
            suggestedPerfumes: data.suggested_perfumes,
            userPreferences: formData,
          },
        });
      } else {
        setError(
          data.error || "Failed to get recommendations. Please try again.",
        );
      }
    } catch (err) {
      setError("Could not connect to server. Please try again later.");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  // TODO: implement login and logout functionality
  const handleLogout = () => {
    console.log("User logged out");
    navigate("/");
  };

  return (
    <div className="preferences-root">
      <div className="preferences-container">
        <div className="preferences-header">
          <div className="logo" onClick={() => navigate("/")}>
            🌸
          </div>
        </div>

        <div className="preferences-content">
          <h1 className="preferences-title">Find Your Perfect Fragrance</h1>
          <p className="preferences-subtitle">
            Tell us what you're looking for, and we'll use AI to recommend
            fragrances tailored to your preferences.
          </p>

          <form className="preferences-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="scentProfile" className="form-label">
                Scent Profile <span className="required">*</span>
              </label>
              <select
                id="scentProfile"
                name="scentProfile"
                value={formData.scentProfile}
                onChange={handleChange}
                className="form-select"
              >
                <option value="">Select a scent profile</option>
                <option value="floral">🌸 Floral</option>
                <option value="woody">🌲 Woody</option>
                <option value="citrus">🍊 Citrus</option>
                <option value="fruity">🍓 Fruity</option>
                <option value="spicy">🌶️ Spicy</option>
                <option value="fresh">💨 Fresh</option>
                <option value="musky">☁️ Musky</option>
                <option value="oriental">🌙 Oriental</option>
                <option value="aromatic">🌿 Aromatic</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="priceRange" className="form-label">
                Price Range <span className="required">*</span>
              </label>
              <select
                id="priceRange"
                name="priceRange"
                value={formData.priceRange}
                onChange={handleChange}
                className="form-select"
              >
                <option value="">Select a price range</option>
                <option value="0-50">Under $50</option>
                <option value="50-100">$50 - $100</option>
                <option value="100-150">$100 - $150</option>
                <option value="150-250">$150 - $250</option>
                <option value="250+">$250+</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="gender" className="form-label">
                Gender Preference <span className="required">*</span>
              </label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="form-select"
              >
                <option value="">Select a preference</option>
                <option value="masculine">♂️ Masculine</option>
                <option value="feminine">♀️ Feminine</option>
                <option value="unisex">⚧️ Unisex</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="occasion" className="form-label">
                Occasion or Mood <span className="optional">(optional)</span>
              </label>
              <select
                id="occasion"
                name="occasion"
                value={formData.occasion}
                onChange={handleChange}
                className="form-select"
              >
                <option value="">Select an occasion or mood</option>
                <option value="daily">🌅 Daily Wear</option>
                <option value="office">💼 Office</option>
                <option value="evening">🌙 Evening</option>
                <option value="date">💕 Date Night</option>
                <option value="party">🎉 Party</option>
                <option value="summer">☀️ Summer</option>
                <option value="winter">❄️ Winter</option>
                <option value="romantic">💘 Romantic</option>
                <option value="fresh-energetic">⚡ Fresh & Energetic</option>
                <option value="mysterious">🔮 Mysterious</option>
              </select>
            </div>

            {error && <div className="error-message">{error}</div>}

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? "Getting Recommendations..." : "Get AI Recommendation"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
