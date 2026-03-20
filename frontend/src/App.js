import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import HomePage from "./pages/HomePage";
import SimilarityFeature from "./features/similarity/SimilarityFeature";
import LoginPage from "./pages/LoginPage";
import ResultsPage from "./pages/ResultsPage";
import AdminDashboard from "./pages/AdminDashboard";
import PerfumePage from "./pages/PerfumePage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/discover" element={<SimilarityFeature />} />
        <Route path="/results" element={<ResultsPage />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/perfume/new" element={<PerfumePage />} />
        <Route path="/admin/perfume/edit/:id" element={<PerfumePage />} />
      </Routes>
    </Router>
  );
}

export default App;