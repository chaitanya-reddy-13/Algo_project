// src/pages/Problems.js
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "../utils/axiosInstance";
import "../styles/Problems.css";

const Problems = () => {
  const [problems, setProblems] = useState([]);

  useEffect(() => {
    axios.get("/problems/")
      .then(res => setProblems(res.data))
      .catch(err => console.error("Failed to fetch problems", err));
  }, []);

  const getDifficultyClass = (difficulty) => {
    if (difficulty === "Easy") return "text-success";
    if (difficulty === "Medium") return "text-warning";
    if (difficulty === "Hard") return "text-danger";
    return "";
  };

  return (
    <div className="container mt-5">
      <h2 className="mb-4">📘 All Problems</h2>

      <div className="problem-table">
        <div className="problem-row problem-header">
          <div>#</div>
          <div>Title</div>
          <div>Difficulty</div>
          <div>Action</div>
        </div>

        {problems.map((problem, index) => (
          <div className="problem-row" key={problem.id}>
            <div>{index + 1}</div>
            <div>{problem.title}</div>
            <div className={getDifficultyClass(problem.difficulty)}>{problem.difficulty}</div>
            <div>
              <Link to={`/problem/${problem.id}/submit`} className="btn btn-sm btn-outline-primary">Solve</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Problems;
