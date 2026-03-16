import { useNavigate } from "react-router-dom";

function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="container">
      <div className="content">

        {/* Header */}
        <div className="header">
          <div className="logo" onClick={() => navigate("/")}>
            SB
          </div>

          <div className="auth-buttons">
            <button>Login</button>
            <button>Signup</button>
          </div>
        </div>

        <h1>Fragrance Finder</h1>

        {/* Main Buttons */}
        <div className="home-buttons">
          <button onClick={() => alert("Preference page not built yet")}>
            Get My Recommendation
          </button>

          <button onClick={() => navigate("/discover")}>
            Explore All Perfumes
          </button>
        </div>

      </div>
    </div>
  );
}

export default HomePage;