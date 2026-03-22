import { useNavigate } from "react-router-dom";
import Navbar from "../common/Navbar";
import "../styles/HomePage.css";

function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="home-root">
      <Navbar />
      <div className="hero">
        <h1 className="hero-title">Fragrance Finder</h1>
        <p className="hero-subtitle">
          Discover your signature scent or explore similar perfumes based on your preferences. Whether you're looking for a new fragrance or want to find perfumes similar to your favorites, we've got you covered.
        </p>
        <div className="home-buttons">
          <button onClick={() => navigate("/preferences")}>
            Get My Recommendation
          </button>
          <button onClick={() => navigate("/discover")}>
            Explore Similar Perfumes
          </button>
        </div>
        <div className="rotating-bg"></div>
      </div>
    </div>
  );
}

export default HomePage;