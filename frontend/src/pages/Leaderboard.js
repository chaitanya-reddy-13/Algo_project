import React, { useEffect, useState } from "react";
import axios from "axios";

const Leaderboard = () => {
  const [leaders, setLeaders] = useState([]);

  useEffect(() => {
    axios.get("/api/leaderboard/").then(res => setLeaders(res.data));
  }, []);

  return (
    <div className="container mt-4">
      <h2>Leaderboard</h2>
      <ol className="list-group list-group-numbered">
        {leaders.map((user, index) => (
          <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
            {user.username}
            <span className="badge bg-primary rounded-pill">{user.accepted_count}</span>
          </li>
        ))}
      </ol>
    </div>
  );
};

export default Leaderboard;