import React, { useEffect, useState } from "react";
import axios from "../utils/axiosInstance";

const Submissions = () => {
  const [submissions, setSubmissions] = useState([]);

  useEffect(() => {
    axios.get("submissions/").then(res => setSubmissions(res.data));
  }, []);

  return (
    <div className="container mt-4">
      <h2>My Submissions</h2>
      <ul className="list-group">
        {submissions.map((submission) => (
          <li className="list-group-item" key={submission.id}>
            <strong>Problem:</strong> {submission.problem_title} | <strong>Verdict:</strong> {submission.verdict} | <strong>Language:</strong> {submission.language}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Submissions;