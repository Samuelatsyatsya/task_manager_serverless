import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { taskAPI } from "../services/api";
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
    getUserRole();
  }, []);

  // const getUserRole = async () => {
  //   try {
  //     const attributes = user.signInUserSession?.idToken?.payload;

  //     // Debug: Log the entire payload
  //     console.log('ID Token Payload:', attributes);
  //     console.log('Custom Role:', attributes?.['custom:role']);
  //     console.log('Cognito Groups:', attributes?.['cognito:groups']);

  //     // Check both custom:role and cognito:groups
  //     const customRole = attributes?.['custom:role'];
  //     const groups = attributes?.['cognito:groups'] || [];

  //     // User is admin if they have custom:role = 'admin' OR are in 'admin' group
  //     const isAdmin = customRole === 'admin' || groups.includes('admin');
  //     const role = isAdmin ? 'admin' : 'member';

  //     console.log('Determined Role:', role);
  //     setUserRole(role);
  //   } catch (err) {
  //     console.error('Error getting user role:', err);
  //   }
  // };

  const getUserRole = async () => {
    try {
      const attributes = user.signInUserSession?.idToken?.payload;

      // Log EVERYTHING
      console.log("=== FULL DEBUG ===");
      console.log("Raw ID Token:", user.signInUserSession?.idToken?.jwtToken);
      console.log("All Token Claims:", JSON.stringify(attributes, null, 2));
      console.log("Custom Role:", attributes?.["custom:role"]);
      console.log("Cognito Groups:", attributes?.["cognito:groups"]);

      // List ALL keys in the token
      console.log("All attribute keys:", Object.keys(attributes || {}));
      console.log("==================");

      const customRole = attributes?.["custom:role"];
      const groups = attributes?.["cognito:groups"] || [];
      const email = user.signInDetails?.loginId;

      // Force admin for your email temporarily
      const isAdmin =
        email === "samuel.atsyatsya@amalitech.com" ||
        customRole === "admin" ||
        groups.includes("admin");

      const role = isAdmin ? "admin" : "member";

      console.log("Final determined role:", role);

      setUserRole(role);
    } catch (err) {
      console.error("Error getting user role:", err);
    }
  };

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await taskAPI.getTasks();
      const tasks = response.tasks || [];

      const stats = {
        total: tasks.length,
        open: tasks.filter((t) => t.status === "open").length,
        inProgress: tasks.filter((t) => t.status === "in-progress").length,
        closed: tasks.filter((t) => t.status === "closed").length,
      };

      setStats(stats);
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

      {/* Debug section - remove after fixing */}
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
        <div>Check browser console for full token details</div>
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
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
