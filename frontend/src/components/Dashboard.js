import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { taskAPI } from "../services/api";
import { fetchAuthSession } from "aws-amplify/auth";
import { 
  FiGrid, 
  FiClipboard, 
  FiCheckCircle, 
  FiClock, 
  FiXCircle,
  FiUsers,
  FiPlusCircle,
  FiBarChart2
} from "react-icons/fi";
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

  const loadUserRole = async () => {
    try {
      const session = await fetchAuthSession();
      const payload = session.tokens?.idToken?.payload;

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

  const StatCard = ({ title, value, icon: Icon, color, status }) => (
    <div className={`stat-card ${status}`}>
      <div className="stat-icon-wrapper">
        <Icon className="stat-icon" style={{ color }} />
      </div>
      <div className="stat-content">
        <h3 className="stat-title">{title}</h3>
        <p className="stat-value">{value}</p>
      </div>
      <div className="stat-trend">
        <span className="trend-indicator">→</span>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <FiXCircle size={48} />
        <h3>Error Loading Dashboard</h3>
        <p>{error}</p>
        <button onClick={fetchStats} className="btn-retry">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* Header Section */}
      <div className="dashboard-header">
        <div className="header-left">
          <h1>Dashboard</h1>
          <p className="welcome-text">
            Welcome back, <span>{user.signInDetails?.loginId?.split('@')[0] || 'User'}</span>
          </p>
        </div>
        <div className="header-right">
          <div className="role-badge">
            <FiUsers size={16} />
            <span>{userRole === 'admin' ? 'Administrator' : 'Team Member'}</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <StatCard
          title="Total Tasks"
          value={stats.total}
          icon={FiGrid}
          color="#64748b"
          status="total"
        />
        <StatCard
          title="Open"
          value={stats.open}
          icon={FiClock}
          color="#3b82f6"
          status="open"
        />
        <StatCard
          title="In Progress"
          value={stats.inProgress}
          icon={FiBarChart2}
          color="#f59e0b"
          status="progress"
        />
        <StatCard
          title="Completed"
          value={stats.closed}
          icon={FiCheckCircle}
          color="#10b981"
          status="completed"
        />
      </div>

      {/* Main Actions Section */}
      <div className="actions-section">
        <div className="section-header">
          <h2>Quick Actions</h2>
          <Link to="/tasks" className="view-all-link">
            View All Tasks →
          </Link>
        </div>
        
        <div className="action-grid">
          <Link to="/tasks" className="action-card primary">
            <div className="action-icon">
              <FiClipboard />
            </div>
            <div className="action-content">
              <h3>Browse Tasks</h3>
              <p>View and manage all tasks</p>
            </div>
            <span className="action-arrow">→</span>
          </Link>

          {userRole === "admin" && (
            <>
              <Link to="/tasks/create" className="action-card success">
                <div className="action-icon">
                  <FiPlusCircle />
                </div>
                <div className="action-content">
                  <h3>Create Task</h3>
                  <p>Add a new task to the system</p>
                </div>
                <span className="action-arrow">→</span>
              </Link>

              <Link to="/tasks/assign" className="action-card warning">
                <div className="action-icon">
                  <FiUsers />
                </div>
                <div className="action-content">
                  <h3>Assign Tasks</h3>
                  <p>Allocate tasks to team members</p>
                </div>
                <span className="action-arrow">→</span>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Admin Section */}
      {userRole === "admin" && (
        <div className="admin-section">
          <div className="section-header">
            <h2>Administration</h2>
            <span className="admin-badge">Admin Access</span>
          </div>
          
          <div className="admin-grid">
            <Link to="/tasks" className="admin-card">
              <FiClipboard size={24} />
              <h4>Task Management</h4>
              <p>Full control over all tasks</p>
            </Link>
            
            <Link to="/users" className="admin-card">
              <FiUsers size={24} />
              <h4>User Management</h4>
              <p>Manage team members and roles</p>
            </Link>
            
            <div className="admin-card stats-preview">
              <h4>Task Distribution</h4>
              <div className="progress-bars">
                <div className="progress-item">
                  <span>Open</span>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill open" 
                      style={{ width: `${(stats.open / stats.total * 100) || 0}%` }}
                    ></div>
                  </div>
                  <span className="progress-value">{stats.open}</span>
                </div>
                <div className="progress-item">
                  <span>In Progress</span>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill progress" 
                      style={{ width: `${(stats.inProgress / stats.total * 100) || 0}%` }}
                    ></div>
                  </div>
                  <span className="progress-value">{stats.inProgress}</span>
                </div>
                <div className="progress-item">
                  <span>Completed</span>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill completed" 
                      style={{ width: `${(stats.closed / stats.total * 100) || 0}%` }}
                    ></div>
                  </div>
                  <span className="progress-value">{stats.closed}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;