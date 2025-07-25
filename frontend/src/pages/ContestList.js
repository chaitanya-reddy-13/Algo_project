// src/pages/ContestList.js
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "../utils/axiosInstance";

const ContestList = () => {
  const [contests, setContests] = useState([]);

  useEffect(() => {
    axios.get("contests/").then((res) => setContests(res.data));
  }, []);

  return (
    <div className="container mt-5">
      <div className="bg-white p-4 rounded shadow-sm">
        <h2 className="mb-4 text-center border-bottom pb-2">🏆 Available Contests</h2>
        {contests.length === 0 ? (
          <p className="text-muted text-center">No contests available right now.</p>
        ) : (
          <div className="list-group">
            {contests.map((contest) => (
              <div key={contest.id} className="list-group-item d-flex justify-content-between align-items-center">
                <div>
                  <h5 className="mb-1">{contest.name}</h5>
                  <small className="text-muted">
                    Start: {new Date(contest.start_time).toLocaleString()} <br />
                    Duration: {contest.duration_minutes} mins
                  </small>
                </div>
                <Link to={`/contests/${contest.id}`} className="btn btn-outline-success">
                  Enter
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ContestList;
