import React from "react";
import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-4 py-2">
      <Link className="navbar-brand fw-bold fs-4 text-white" to="/">NexCode</Link>
      
      <div className="collapse navbar-collapse">
        <ul className="navbar-nav me-auto mb-2 mb-lg-0">
          <li className="nav-item">
            <Link className="nav-link text-white" to="/problems">Problems</Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link text-white" to="/submissions">Submissions</Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link text-white" to="/leaderboard">Leaderboard</Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link text-white" to="/contests">Contests</Link>
          </li>
        </ul>

        <ul className="navbar-nav">
          {user ? (
            <li className="nav-item d-flex align-items-center gap-3">
              <span className="nav-link text-white mb-0">👋 {user.username}</span>
              <button className="btn btn-outline-danger btn-sm" onClick={handleLogout}>
                Logout
              </button>
            </li>
          ) : (
            <>
              <li className="nav-item">
                <Link className="nav-link text-white" to="/login">Login</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link text-white" to="/register">Register</Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
