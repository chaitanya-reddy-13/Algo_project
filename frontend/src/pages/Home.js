import React from "react";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="container mt-5 text-center">
      <h1 className="fw-bold mb-3 text-primary">🚀 Welcome to NexCode</h1>
      <p className="lead text-secondary mb-4">
        NexCode is your all-in-one competitive programming platform where you can practice problems, test code, get AI-generated hints, and participate in live contests — all in one place.
      </p>

      <div className="row justify-content-center">
        <div className="col-md-3 mb-3">
          <Link to="/problems" className="btn btn-outline-primary w-100 p-3 shadow-sm">
            🔍 Explore Problems
          </Link>
        </div>
        <div className="col-md-3 mb-3">
          <Link to="/contests" className="btn btn-outline-success w-100 p-3 shadow-sm">
            🏁 Join Contests
          </Link>
        </div>
        <div className="col-md-3 mb-3">
          <Link to="/leaderboard" className="btn btn-outline-warning w-100 p-3 shadow-sm">
            🏆 View Leaderboard
          </Link>
        </div>
      </div>


    </div>
  );
};

export default Home;
