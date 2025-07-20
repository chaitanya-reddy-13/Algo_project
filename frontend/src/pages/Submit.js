import React, { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import axios from "../utils/axiosInstance";
import Editor from "@monaco-editor/react";
import "../styles/Submit.css";

const Submit = () => {
  const { problemId } = useParams();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const contestId = queryParams.get('contestId');
  const [problem, setProblem] = useState(null);
  const [code, setCode] = useState(() => localStorage.getItem(`code-${problemId}`) || "");
  const [language, setLanguage] = useState("python");
  const [customInput, setCustomInput] = useState("");
  const [output, setOutput] = useState("");
  const [verdictDetails, setVerdictDetails] = useState(null);
  const [contest, setContest] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [contestEnded, setContestEnded] = useState(false);

  useEffect(() => {
    // Fetch problem details
    axios.get(`/problems/${problemId}/`)
      .then(res => {
        setProblem(res.data);
        const firstSample = res.data.testcases.find(tc => tc.is_sample);
        if (firstSample) {
          setCustomInput(firstSample.input_data);
        }
      })
      .catch(err => alert("Failed to load problem"));

    // Fetch contest details if contestId is present
    if (contestId) {
      axios.get(`/contests/${contestId}/`)
        .then(res => {
          setContest(res.data);
          const endTime = new Date(res.data.start_time).getTime() + res.data.duration_minutes * 60 * 1000;

          const interval = setInterval(() => {
            const now = new Date().getTime();
            const remaining = Math.max(0, endTime - now);
            setTimeLeft(remaining);

            if (remaining === 0) {
              clearInterval(interval);
              setContestEnded(true);
              alert("Contest has ended!");
            }
          }, 1000);

          return () => clearInterval(interval);
        })
        .catch(err => alert("Failed to load contest details"));
    }
  }, [problemId, contestId]);

  const formatTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleRun = async () => {
    try {
      const res = await axios.post("/submit/", {
        problem: problemId,
        code,
        language,
        custom_input: customInput,
      });
      setOutput(res.data.sample_output || res.data.error_message);
      setVerdictDetails(null); // Clear previous verdict details
    } catch (err) {
      alert("Error running code");
      setVerdictDetails(null); // Clear previous verdict details
    }
  };

  const handleSubmit = async () => {
    if (contestEnded) {
      alert("Contest has ended. Cannot submit.");
      return;
    }

    const submissionData = {
      problem: problemId,
      code,
      language,
    };

    const url = contestId
      ? `/contests/${contestId}/problems/${problemId}/submit/`
      : "/submit/";

    try {
      const res = await axios.post(url, submissionData);
      setVerdictDetails({
        verdict: res.data.verdict,
        output: res.data.sample_output,
        error_message: res.data.error_message,
      });
      setOutput(""); // Clear output from run
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
        {contestId && contest && (
          <div className="contest-timer text-center mb-3">
            <h5>Contest: {contest.name}</h5>
            {timeLeft !== null && !contestEnded ? (
              <p className="text-info">Time Left: {formatTime(timeLeft)}</p>
            ) : (
              <p className="text-danger">Contest Ended</p>
            )}
          </div>
        )}
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

        {/* Display Verdict Details */}
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

        {/* Display Run Output */}
        {output && !verdictDetails && (
          <div className="output-container mt-3">
            <h6>Run Output:</h6>
            <pre>{output}</pre>
          </div>
        )}

        <div className="button-container">
          <button className="btn btn-primary" onClick={handleRun}>Run</button>
          <button className="btn btn-success" onClick={handleSubmit} disabled={contestId && contestEnded}>
            Submit {contestId && contestEnded && "(Contest Ended)"}
          </button>
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


