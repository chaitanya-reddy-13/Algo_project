import React, { useEffect, useState } from "react";
import axios from "../utils/axiosInstance";

const Leaderboard = () => {
  const [leaders, setLeaders] = useState([]);

  useEffect(() => {
    axios.get("/leaderboard/")
      .then(res => setLeaders(res.data))
      .catch(err => console.error("Failed to load leaderboard", err));
  }, []);

  return (
    <div className="container mt-5">
      <h2 className="mb-4 text-center fw-bold text-primary">🏆 Leaderboard</h2>
      <div className="card shadow">
        <div className="card-body">
          {leaders.length === 0 ? (
            <p className="text-center text-muted">No submissions yet.</p>
          ) : (
            <table className="table table-striped text-center">
              <thead className="table-dark">
                <tr>
                  <th>#</th>
                  <th>Username</th>
                  <th>Accepted Solutions</th>
                </tr>
              </thead>
              <tbody>
                {leaders.map((user, index) => (
                  <tr key={user.username}>
                    <td>{index + 1}</td>
                    <td>{user.username}</td>
                    <td>{user.accepted_count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
