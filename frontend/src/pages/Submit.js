// src/pages/Submit.js
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../utils/axiosInstance";
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

  useEffect(() => {
    if (!token) {
      alert("Please login first.");
      navigate("/login");
      return;
    }

    // ✅ Corrected path: no leading "/api/"
    axios
      .get(`problems/${id}/`)
      .then((res) => setProblem(res.data))
      .catch((err) => {
        console.error("Error loading problem:", err);
        alert("Failed to load problem");
      });
  }, [id, token, navigate]);

  const handleRun = async () => {
    try {
      const res = await axios.post("submit/", {
        problem: id,
        code,
        language,
        custom_input: customInput,
      });
      setOutput(res.data.sample_output || res.data.error_message);
    } catch (err) {
      const error = err.response?.data?.error || err.message || "An unknown error occurred.";
      setOutput(`Error: ${error}`);
      console.error("Run error:", error);
    }
  };

  const handleSubmit = async () => {
    try {
      const res = await axios.post("submit/", {
        problem: id,
        code,
        language,
      });

      if (res.data.verdict === "Runtime Error" || res.data.verdict === "Syntax Error") {
        setOutput(`Verdict: ${res.data.verdict}\nError: ${res.data.error_message}`);
      } else {
        setOutput(`Verdict: ${res.data.verdict}\nOutput: ${res.data.sample_output}`);
      }
    } catch (err) {
      const error = err.response?.data?.error || err.message || "An unknown error occurred.";
      setOutput(`Error: ${error}`);
      console.error("Submit error:", error);
    }
  };

  const handleHint = async () => {
    try {
      const res = await axios.post("ai/hint/", {
        problem_id: id,
      });
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
