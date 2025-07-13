import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "../utils/axiosInstance";

const ContestList = () => {
  const [contests, setContests] = useState([]);

  useEffect(() => {
    axios.get("contests/").then((res) => setContests(res.data));
  }, []);

  return (
    <div className="container mt-4">
      <h2>Available Contests</h2>
      <ul className="list-group">
        {contests.map((contest) => (
          <li className="list-group-item d-flex justify-content-between align-items-center" key={contest.id}>
            <div>
              <strong>{contest.name}</strong><br />
              Start: {new Date(contest.start_time).toLocaleString()}<br />
              Duration: {contest.duration_minutes} mins
            </div>
            <Link to={`/contests/${contest.id}`} className="btn btn-success">
              Enter Contest
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ContestList;