import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import HomePage from "./pages/HomePage";
import SimilarityFeature from "./features/similarity/SimilarityFeature";
import LoginPage from "./pages/LoginPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/discover" element={<SimilarityFeature />} />
      </Routes>
    </Router>
  );
}

export default App;