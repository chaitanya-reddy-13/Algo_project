// src/pages/ContestDetail.js
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "../utils/axiosInstance";

const ContestDetail = () => {
  const { id } = useParams();
  const [problems, setProblems] = useState([]);
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    axios.post(`/api/contests/${id}/enter/`).then((res) => {
      const start = new Date(res.data.start_time);
      const duration = res.data.duration_minutes * 60 * 1000;
      const endTime = new Date(start.getTime() + duration);

      const interval = setInterval(() => {
        const now = new Date();
        const remaining = Math.max(0, endTime - now);
        setTimeLeft(remaining);

        if (remaining === 0) {
          clearInterval(interval);
          alert("⏱ Time's up! You can now review the problems.");
        }
      }, 1000);

      return () => clearInterval(interval);
    });

    axios.get(`/api/contests/${id}/problems/`).then((res) => {
      setProblems(res.data);
    });
  }, [id]);

  const formatTime = (ms) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="container mt-5">
      <div className="bg-light p-4 rounded shadow">
        <h2 className="mb-3 border-bottom pb-2">📝 Contest Problems</h2>
        
        {timeLeft !== null && (
          <div className="alert alert-info text-center">
            <strong>⏳ Time Left: {formatTime(timeLeft)}</strong>
          </div>
        )}
        {problems.length === 0 ? (
          <p className="text-muted text-center">No problems found in this contest.</p>
        ) : (
          <ul className="list-group">
            {problems.map((problem) => (
              <li className="list-group-item d-flex justify-content-between align-items-center" key={problem.id}>
                <div>
                  <strong>{problem.title}</strong> - <span className="badge bg-secondary">{problem.difficulty}</span>
                </div>
                <Link to={`/contests/${id}/problem/${problem.id}/submit`} className="btn btn-primary">
                  Solve
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ContestDetail;
