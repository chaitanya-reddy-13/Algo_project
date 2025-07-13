// src/App.js
import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Problems from "./pages/Problems";
import ProblemDetail from "./pages/ProblemDetail";
import Submit from "./pages/Submit";
import Submissions from "./pages/Submissions";
import Leaderboard from "./pages/Leaderboard";
import Login from "./pages/Login";
import Register from "./pages/Register"; // ✅ Add this import
import ContestList from "./pages/ContestList";
import ContestDetail from "./pages/ContestDetail";

const App = () => {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/problems" element={<Problems />} />
        <Route path="/problems/:id" element={<ProblemDetail />} />
        <Route path="/submit/:id" element={<Submit />} />
        <Route path="/submissions" element={<Submissions />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} /> {/* ✅ Add this route */}
          <Route path="/contests" element={<ContestList />} />
          <Route path="/contests/:id" element={<ContestDetail />} />
      </Routes>
    </Router>
  );
};

export default App;
