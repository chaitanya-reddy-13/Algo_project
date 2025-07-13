import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "../utils/axiosInstance";

const ContestDetail = () => {
  const { id } = useParams();
  const [problems, setProblems] = useState([]);
  const [startTime, setStartTime] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    axios.post(`contests/${id}/enter/`).then((res) => {
      const start = new Date(res.data.start_time);
      setStartTime(start);
      const duration = res.data.duration_minutes * 60 * 1000;
      const endTime = new Date(start.getTime() + duration);

      const interval = setInterval(() => {
        const now = new Date();
        const remaining = Math.max(0, endTime - now);
        setTimeLeft(remaining);

        if (remaining === 0) {
          clearInterval(interval);
          alert("Time's up! You can now review the problems.");
        }
      }, 1000);

      return () => clearInterval(interval);
    });

    axios.get(`contests/${id}/problems/`).then((res) => {
      setProblems(res.data);
    });
  }, [id]);

  const formatTime = (ms) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="container mt-4">
      <h2>Contest Problems</h2>
      {timeLeft !== null && (
        <p className="alert alert-info">Time Left: {formatTime(timeLeft)}</p>
      )}
      <ul className="list-group">
        {problems.map((problem) => (
          <li className="list-group-item d-flex justify-content-between align-items-center" key={problem.id}>
            <div>
              <strong>{problem.title}</strong> - {problem.difficulty}
            </div>
            <Link to={`/contests/${id}/submit/${problem.id}`} className="btn btn-primary">
              Solve
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ContestDetail;