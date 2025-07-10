// src/pages/Submit.js
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Editor from "@monaco-editor/react";

const Submit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [problem, setProblem] = useState(null);
  const [code, setCode] = useState(() => localStorage.getItem("code") || "");
  const [language, setLanguage] = useState("python");
  const [customInput, setCustomInput] = useState("");
  const [output, setOutput] = useState("");
  const [hint, setHint] = useState("");

  const token = localStorage.getItem("access");

  // Load problem details
  useEffect(() => {
    if (!token) {
      alert("Please log in first.");
      navigate("/login");
      return;
    }

    axios
      .get(`/api/problems/${id}/`)
      .then((res) => setProblem(res.data))
      .catch((err) => {
        console.error("Error loading problem:", err);
        alert("Failed to load problem");
      });
  }, [id, token, navigate]);

  // Handle code execution (Run)
  const handleRun = async () => {
    try {
      const res = await axios.post(
        "/api/submissions/",
        {
          problem: id,
          code,
          language,
          custom_input: customInput,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setOutput(res.data.sample_output || res.data.error_message);
    } catch (err) {
      console.error("Run error:", err.response?.data || err.message);
      alert("Error running code: " + (err.response?.data?.error || "Unknown error"));
    }
  };

  // Handle final submission (Submit)
  const handleSubmit = async () => {
    try {
      const res = await axios.post(
        "/api/submissions/",
        {
          problem: id,
          code,
          language,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setOutput(`Verdict: ${res.data.verdict}\nOutput: ${res.data.sample_output}`);
    } catch (err) {
      console.error("Submit error:", err.response?.data || err.message);
      alert("Error submitting code: " + (err.response?.data?.error || "Unknown error"));
    }
  };

  // Handle AI hint request
  const handleHint = async () => {
    try {
      const res = await axios.post(
        "/api/ai-hint/",
        { problem_id: id },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setHint(res.data.hint);
    } catch (err) {
      console.error("Hint error:", err.response?.data || err.message);
      alert("Error getting AI hint: " + (err.response?.data?.error || "Unknown error"));
    }
  };

  const handleEditorChange = (value) => {
    setCode(value);
    localStorage.setItem("code", value);
  };

  return (
    <div className="container mt-4">
      {problem ? (
        <>
          <h2>{problem.title}</h2>
          <p>{problem.description}</p>

          <div className="mb-3">
            <label>Language</label>
            <select
              className="form-select"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              <option value="python">Python</option>
              <option value="cpp">C++</option>
            </select>
          </div>

          <div className="mb-3">
            <label>Code</label>
            <Editor
              height="400px"
              language={language === "cpp" ? "cpp" : "python"}
              value={code}
              onChange={handleEditorChange}
              options={{ fontSize: 14, minimap: { enabled: false } }}
            />
          </div>

          <div className="mb-3">
            <label>Custom Input (optional)</label>
            <textarea
              className="form-control"
              rows="3"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
            />
          </div>

          <div className="d-flex gap-2">
            <button className="btn btn-secondary" onClick={handleRun}>
              Run
            </button>
            <button className="btn btn-success" onClick={handleSubmit}>
              Submit
            </button>
            <button className="btn btn-info" onClick={handleHint}>
              Get AI Hint
            </button>
          </div>

          {output && (
            <div className="alert alert-warning mt-3">
              <strong>Output:</strong>
              <pre>{output}</pre>
            </div>
          )}

          {hint && (
            <div className="alert alert-info mt-3">
              <strong>AI Hint:</strong>
              <p>{hint}</p>
            </div>
          )}
        </>
      ) : (
        <p>Loading problem...</p>
      )}
    </div>
  );
};

export default Submit;
