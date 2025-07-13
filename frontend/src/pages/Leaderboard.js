import React, { useEffect, useState } from "react";
import axios from "../utils/axiosInstance";

const Leaderboard = () => {
  const [leaders, setLeaders] = useState([]);

  useEffect(() => {
    axios.get("leaderboard/").then(res => setLeaders(res.data));
  }, []);

  return (
    <div className="container mt-4">
      <h2>Leaderboard</h2>
      <ul className="list-group">
        {leaders.map((user, index) => (
          <li key={index} className="list-group-item d-flex justify-content-between">
            <span>{user.username}</span>
            <span>Accepted: {user.accepted_count}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Leaderboard;