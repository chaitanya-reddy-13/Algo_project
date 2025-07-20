import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "../utils/axiosInstance";
import Editor from "@monaco-editor/react";
import "../styles/Submit.css";

const Submit = () => {
  const { problemId } = useParams();
  const [problem, setProblem] = useState(null);
  const [code, setCode] = useState(() => localStorage.getItem(`code-${problemId}`) || "");
  const [language, setLanguage] = useState("python");
  const [customInput, setCustomInput] = useState("");
  const [output, setOutput] = useState("");
  const [verdictDetails, setVerdictDetails] = useState(null);

  useEffect(() => {
    if (problemId) {
      axios.get(`/problems/${problemId}/`)
        .then(res => {
          setProblem(res.data);
          const firstSample = res.data.testcases.find(tc => tc.is_sample);
          if (firstSample) {
            setCustomInput(firstSample.input_data);
          }
        })
        .catch(err => alert("Failed to load problem"));
    }
  }, [problemId]);

  const handleRun = async () => {
    try {
      const res = await axios.post("/submit/", {
        problem: problemId,
        code,
        language,
        custom_input: customInput,
      });
      setOutput(res.data.sample_output || res.data.error_message);
      setVerdictDetails(null);
    } catch (err) {
      alert("Error running code");
      setVerdictDetails(null);
    }
  };

  const handleSubmit = async () => {
    const submissionData = {
      problem: problemId,
      code,
      language,
    };

    try {
      const res = await axios.post("/submit/", submissionData);
      setVerdictDetails({
        verdict: res.data.verdict,
        output: res.data.sample_output,
        error_message: res.data.error_message,
      });
      setOutput("");
    } catch (err) {
      const errorMessage = err.response?.data?.error || "An unknown error occurred.";
      alert(`Submission failed: ${errorMessage}`);
      setVerdictDetails(null);
    }
  };

  const handleEditorChange = (value) => {
    setCode(value);
    localStorage.setItem(`code-${problemId}`, value);
  };

  return (
    <div className="submit-container">
      <div className="problem-details">
        {problem ? (
          <>
            <h4>{problem.title}</h4>
            <p>{problem.description}</p>
          </>
        ) : (
          <p>Loading problem...</p>
        )}
      </div>
      <div className="editor-container">
        <div className="editor-header">
          <select
            className="form-select language-selector"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            <option value="python">Python</option>
            <option value="cpp">C++</option>
          </select>
        </div>
        <div className="editor-main">
          <Editor
            height="100%"
            theme="vs-dark"
            language={language === "cpp" ? "cpp" : "python"}
            value={code}
            onChange={handleEditorChange}
          />
        </div>

        {verdictDetails && (
          <div className="output-container mt-3">
            <h6>Verdict: <span className={verdictDetails.verdict === "Accepted" ? "text-success" : "text-danger"}>{verdictDetails.verdict}</span></h6>
            {verdictDetails.verdict === "Wrong Answer" && verdictDetails.error_message && (
              <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
                {verdictDetails.error_message}
              </pre>
            )}
            {(verdictDetails.verdict === "Runtime Error" ||
              verdictDetails.verdict === "Time Limit Exceeded" ||
              verdictDetails.verdict === "Syntax Error") && verdictDetails.error_message && (
              <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
                {verdictDetails.error_message}
              </pre>
            )}
            {verdictDetails.verdict === "Accepted" && verdictDetails.output && (
              <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
                {verdictDetails.output}
              </pre>
            )}
          </div>
        )}

        {output && !verdictDetails && (
          <div className="output-container mt-3">
            <h6>Run Output:</h6>
            <pre>{output}</pre>
          </div>
        )}

        <div className="button-container">
          <button className="btn btn-primary" onClick={handleRun}>Run</button>
          <button className="btn btn-success" onClick={handleSubmit}>Submit</button>
        </div>
        <div className="custom-input-container">
          <textarea
            className="form-control"
            rows="3"
            placeholder="Custom Input"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};

export default Submit;