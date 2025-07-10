import React, { useEffect, useState } from "react";
import axios from "axios";

const Submissions = () => {
  const [submissions, setSubmissions] = useState([]);

  useEffect(() => {
    axios.get("/api/submissions/", {
      headers: { Authorization: `Bearer ${localStorage.getItem("access")}` },
    }).then(res => setSubmissions(res.data));
  }, []);

  return (
    <div className="container mt-4">
      <h2>Your Submissions</h2>
      <ul className="list-group">
        {submissions.map(sub => (
          <li key={sub.id} className="list-group-item">
            Problem ID: {sub.problem}, Verdict: {sub.verdict}, Language: {sub.language}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Submissions;
