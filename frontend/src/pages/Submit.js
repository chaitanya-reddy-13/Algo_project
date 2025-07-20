import React, { useState, useEffect } from "react";
import axios from "axios";

const Submit = ({ problemId }) => {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("python");
  const [customInput, setCustomInput] = useState("");
  const [verdict, setVerdict] = useState("");
  const [token, setToken] = useState("");
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    // Load token from localStorage
    const storedToken = localStorage.getItem("token");
    setToken(storedToken);

    // Fetch user ID using token (only if not already stored)
    if (storedToken) {
      axios
        .get("http://65.0.127.55/api/user/", {
          headers: {
            Authorization: `Bearer ${storedToken}`,
          },
        })
        .then((res) => {
          setUserId(res.data.id); // Adjust based on your actual response
        })
        .catch((err) => {
          console.error("Error fetching user:", err);
        });
    }
  }, []);

  const handleSubmit = async () => {
    try {
      const response = await axios.post(
        "http://65.0.127.55/api/submit/",
        {
          code: code,
          language: language,
          problem: problemId,
          user: userId,
          custom_input: customInput,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setVerdict(response.data.verdict || "Submitted successfully!");
    } catch (error) {
      console.error("Submission failed:", error.response?.data || error.message);
      setVerdict("Submission failed. Please check the console.");
    }
  };

  return (
    <div className="submit-container">
      <h2>Submit Your Solution</h2>

      <div>
        <label>Language:</label>
        <select value={language} onChange={(e) => setLanguage(e.target.value)}>
          <option value="python">Python</option>
          <option value="cpp">C++</option>
        </select>
      </div>

      <div>
        <label>Code:</label>
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          rows={12}
          cols={80}
        />
      </div>

      <div>
        <label>Custom Input (Optional):</label>
        <textarea
          value={customInput}
          onChange={(e) => setCustomInput(e.target.value)}
          rows={4}
          cols={80}
        />
      </div>

      <button onClick={handleSubmit}>Submit</button>

      {verdict && <div><strong>Verdict:</strong> {verdict}</div>}
    </div>
  );
};

export default Submit;
