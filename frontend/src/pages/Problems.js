// src/pages/Problems.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const Problems = () => {
  const [problems, setProblems] = useState([]);

  useEffect(() => {
    axios.get("/api/problems/").then(res => setProblems(res.data));
  }, []);

  return (
    <div className="container mt-4">
      <h2>All Problems</h2>
      <ul className="list-group">
        {problems.map(problem => (
          <li className="list-group-item d-flex justify-content-between align-items-center" key={problem.id}>
            <div>
              <strong>{problem.title}</strong> - <span>{problem.difficulty}</span>
            </div>
            <Link to={`/submit/${problem.id}`} className="btn btn-primary">Solve</Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Problems;
