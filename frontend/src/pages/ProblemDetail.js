import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "../utils/axiosInstance";

const ProblemDetail = () => {
  const { id } = useParams();
  const [problem, setProblem] = useState(null);

  useEffect(() => {
    axios.get(`/api/problems/${id}/`).then(res => setProblem(res.data));
  }, [id]);

  return (
    <div className="container mt-4">
      {problem ? (
        <>
          <h2>{problem.title}</h2>
          <p><strong>Difficulty:</strong> {problem.difficulty}</p>
          <p>{problem.description}</p>
          <Link to={`/problem/${problem.id}/submit`} className="btn btn-primary">Submit Solution</Link>
        </>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default ProblemDetail;