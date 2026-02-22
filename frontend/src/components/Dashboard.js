import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { taskAPI } from "../services/api";
import { fetchAuthSession } from "aws-amplify/auth";
import "./Dashboard.css";

function Dashboard({ user }) {
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    inProgress: 0,
    closed: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState("member");

  useEffect(() => {
    fetchStats();
    loadUserRole();
  }, []);

  // ✅ Gen 2–correct role detection
  const loadUserRole = async () => {
    try {
      const session = await fetchAuthSession();
      const payload = session.tokens?.idToken?.payload;

      console.log("=== ID TOKEN PAYLOAD ===");
      console.log(payload);
      console.log("========================");

      const customRole = payload?.["custom:role"];
      const groups = payload?.["cognito:groups"] || [];

      const isAdmin = customRole === "admin" || groups.includes("admin");

      setUserRole(isAdmin ? "admin" : "member");
    } catch (err) {
      console.error("Error determining user role:", err);
      setUserRole("member");
    }
  };

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await taskAPI.getTasks();
      const tasks = response.tasks || [];

      setStats({
        total: tasks.length,
        open: tasks.filter((t) => t.status === "open").length,
        inProgress: tasks.filter((t) => t.status === "in-progress").length,
        closed: tasks.filter((t) => t.status === "closed").length,
      });

      setError(null);
    } catch (err) {
      console.error("Error fetching stats:", err);
      setError("Failed to load dashboard statistics");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="dashboard">
      <h2>Dashboard</h2>

      {/* Debug block (safe to remove later) */}
      <div
        style={{
          background: "#f0f0f0",
          padding: "15px",
          margin: "15px 0",
          borderRadius: "5px",
        }}
      >
        <strong>Debug Info:</strong>
        <div>Current Role: {userRole}</div>
        <div>User Email: {user.signInDetails?.loginId}</div>
        <div>Check console for full token payload</div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Tasks</h3>
          <p className="stat-number">{stats.total}</p>
        </div>
        <div className="stat-card open">
          <h3>Open</h3>
          <p className="stat-number">{stats.open}</p>
        </div>
        <div className="stat-card in-progress">
          <h3>In Progress</h3>
          <p className="stat-number">{stats.inProgress}</p>
        </div>
        <div className="stat-card closed">
          <h3>Closed</h3>
          <p className="stat-number">{stats.closed}</p>
        </div>
      </div>

      <div className="quick-actions">
        <h3>Quick Actions</h3>
        <div className="action-buttons">
          <Link to="/tasks" className="btn btn-primary">
            View All Tasks
          </Link>

          {userRole === "admin" && (
            <Link to="/tasks/create" className="btn btn-success">
              Create New Task
            </Link>
          )}
        </div>
      </div>

      {userRole === "admin" && (
        <div className="admin-section">
          <h3>Admin Section</h3>
          <div className="admin-actions">
            <Link to="/tasks" className="btn btn-secondary">
              Manage All Tasks
            </Link>
            <Link to="/users" className="btn btn-secondary">
              Manage Users
            </Link>
            <Link to="/tasks/assign" className="btn btn-secondary">
              Assign Task
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
