import React, { useEffect, useState } from "react";
import axios from "../utils/axiosInstance";

const Submissions = () => {
  const [submissions, setSubmissions] = useState([]);
  const [expandedSubmissionId, setExpandedSubmissionId] = useState(null);

  useEffect(() => {
    axios.get("/submissions/")
      .then((res) => setSubmissions(res.data))
      .catch((err) => {
        console.error(err);
        alert("Failed to load submissions");
      });
  }, []);

  const getVerdictClass = (verdict) => {
    switch (verdict) {
      case "Accepted":
        return "text-success";
      case "Wrong Answer":
        return "text-danger";
      case "Runtime Error":
      case "Syntax Error":
        return "text-warning";
      case "Time Limit Exceeded":
        return "text-secondary";
      default:
        return "text-muted";
    }
  };

  const toggleCodeVisibility = (submissionId) => {
    setExpandedSubmissionId(expandedSubmissionId === submissionId ? null : submissionId);
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4">My Submissions</h2>

      <div className="table-responsive">
        <table className="table table-hover align-middle">
          <thead className="table-light">
            <tr>
              <th scope="col">#</th>
              <th scope="col">Problem</th>
              <th scope="col">Language</th>
              <th scope="col">Verdict</th>
              <th scope="col">Submitted At</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {submissions.map((sub, index) => (
              <React.Fragment key={sub.id}>
                <tr>
                  <td>{index + 1}</td>
                  <td>{sub.problem_title}</td>
                  <td>{sub.language.toUpperCase()}</td>
                  <td className={getVerdictClass(sub.verdict)}>
                    <strong>{sub.verdict}</strong>
                  </td>
                  <td>{new Date(sub.created_at).toLocaleString()}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-outline-info"
                      onClick={() => toggleCodeVisibility(sub.id)}
                    >
                      {expandedSubmissionId === sub.id ? "Hide Code" : "View Code"}
                    </button>
                  </td>
                </tr>
                {expandedSubmissionId === sub.id && (
                  <tr>
                    <td colSpan="6">
                      <div className="card card-body bg-light mt-2">
                        <h6>Submitted Code:</h6>
                        <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-all" }}>{sub.code}</pre>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
            {submissions.length === 0 && (
              <tr>
                <td colSpan="6" className="text-center text-muted">
                  No submissions yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Submissions;
