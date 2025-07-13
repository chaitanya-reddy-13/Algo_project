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
    <nav className="navbar navbar-expand-lg navbar-light bg-light px-3">
      <Link className="navbar-brand" to="/">NexCode</Link>
      <div className="collapse navbar-collapse">
        <ul className="navbar-nav me-auto mb-2 mb-lg-0">
          <li className="nav-item"><Link className="nav-link" to="/problems">Problems</Link></li>
          <li className="nav-item"><Link className="nav-link" to="/submissions">Submissions</Link></li>
          <li className="nav-item"><Link className="nav-link" to="/leaderboard">Leaderboard</Link></li>
          <li className="nav-item"><Link className="nav-link" to="/contests">Contests</Link></li> {/* ✅ Added */}
        </ul>
        <ul className="navbar-nav">
          {user ? (
            <>
              <li className="nav-item">
                <span className="nav-link">Welcome, {user.username}</span>
              </li>
              <li className="nav-item">
                <button className="btn btn-outline-danger" onClick={handleLogout}>Logout</button>
              </li>
            </>
          ) : (
            <>
              <li className="nav-item"><Link className="nav-link" to="/login">Login</Link></li>
              <li className="nav-item"><Link className="nav-link" to="/register">Register</Link></li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
