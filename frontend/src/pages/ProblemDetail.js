import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

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
          <p>{problem.description}</p>
        </>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default ProblemDetail;