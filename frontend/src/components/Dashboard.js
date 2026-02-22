import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { taskAPI } from "../services/api";
import { fetchAuthSession } from "aws-amplify/auth";
import { 
  FiGrid, 
  FiClock, 
  FiZap, 
  FiCheckCircle,
  FiPlus,
  FiList,
  FiUsers,
  FiUserPlus,
  FiArrowRight,
  FiAlertCircle
} from "react-icons/fi";
import "./Dashboard.css";

function Dashboard({ user }) {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    inProgress: 0,
    closed: 0,
  });
  const [recentTasks, setRecentTasks] = useState([]);
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

      // Get 5 most recent tasks
      setRecentTasks(tasks.slice(0, 5));
      setError(null);
    } catch (err) {
      console.error("Error fetching stats:", err);
      setError("Failed to load dashboard statistics");
    } finally {
      setLoading(false);
    }
  };

  // Helper function to format user name safely
  const formatUserName = () => {
    if (!user?.signInDetails?.loginId) return 'User';
    
    try {
      return user.signInDetails.loginId
        .split('@')[0]
        ?.split('.')
        ?.map(n => n.charAt(0).toUpperCase() + n.slice(1))
        ?.join(' ') || 'User';
    } catch (err) {
      return 'User';
    }
  };

  const getStatusBadgeClass = (status) => {
    switch(status) {
      case 'open': return 'badge-open';
      case 'in-progress': return 'badge-progress';
      case 'closed': return 'badge-closed';
      default: return '';
    }
  };

  const getStatusText = (status) => {
    switch(status) {
      case 'open': return 'Open';
      case 'in-progress': return 'In Progress';
      case 'closed': return 'Closed';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <FiAlertCircle size={48} className="error-icon" />
        <h3>Unable to Load Dashboard</h3>
        <p>{error}</p>
        <button onClick={fetchStats} className="btn-retry">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* Welcome Section */}
      <div className="welcome-section">
        <div className="welcome-content">
          <h1 className="welcome-title">
            Welcome back, <span>{formatUserName()}</span>
          </h1>
          <p className="welcome-subtitle">
            Here's what's happening with your tasks today.
          </p>
        </div>
        {userRole === 'admin' && (
          <button 
            onClick={() => navigate('/tasks/create')} 
            className="btn-primary"
          >
            <FiPlus className="btn-icon" />
            New Task
          </button>
        )}
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon total">
            <FiGrid />
          </div>
          <div className="stat-details">
            <span className="stat-label">Total Tasks</span>
            <span className="stat-value">{stats.total}</span>
          </div>
          <div className="stat-trend">
            <span className="trend-percent">100%</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon open">
            <FiClock />
          </div>
          <div className="stat-details">
            <span className="stat-label">Open</span>
            <span className="stat-value">{stats.open}</span>
          </div>
          <div className="stat-trend">
            <span className="trend-value">{stats.total > 0 ? Math.round((stats.open/stats.total)*100) : 0}%</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon progress">
            <FiZap />
          </div>
          <div className="stat-details">
            <span className="stat-label">In Progress</span>
            <span className="stat-value">{stats.inProgress}</span>
          </div>
          <div className="stat-trend">
            <span className="trend-value">{stats.total > 0 ? Math.round((stats.inProgress/stats.total)*100) : 0}%</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon completed">
            <FiCheckCircle />
          </div>
          <div className="stat-details">
            <span className="stat-label">Completed</span>
            <span className="stat-value">{stats.closed}</span>
          </div>
          <div className="stat-trend">
            <span className="trend-value completed">{stats.total > 0 ? Math.round((stats.closed/stats.total)*100) : 0}%</span>
          </div>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="progress-overview">
        <div className="progress-header">
          <h2>Progress Overview</h2>
          <Link to="/tasks" className="view-all-link">
            View All Tasks <FiArrowRight className="link-arrow" />
          </Link>
        </div>
        <div className="progress-bar-container">
          <div className="progress-bar-item">
            <span className="progress-label">Open</span>
            <div className="progress-track">
              <div 
                className="progress-fill open" 
                style={{ width: `${stats.total > 0 ? (stats.open/stats.total)*100 : 0}%` }}
              ></div>
            </div>
            <span className="progress-percent">{stats.total > 0 ? Math.round((stats.open/stats.total)*100) : 0}%</span>
          </div>
          <div className="progress-bar-item">
            <span className="progress-label">In Progress</span>
            <div className="progress-track">
              <div 
                className="progress-fill progress" 
                style={{ width: `${stats.total > 0 ? (stats.inProgress/stats.total)*100 : 0}%` }}
              ></div>
            </div>
            <span className="progress-percent">{stats.total > 0 ? Math.round((stats.inProgress/stats.total)*100) : 0}%</span>
          </div>
          <div className="progress-bar-item">
            <span className="progress-label">Completed</span>
            <div className="progress-track">
              <div 
                className="progress-fill completed" 
                style={{ width: `${stats.total > 0 ? (stats.closed/stats.total)*100 : 0}%` }}
              ></div>
            </div>
            <span className="progress-percent">{stats.total > 0 ? Math.round((stats.closed/stats.total)*100) : 0}%</span>
          </div>
        </div>
      </div>

      {/* Recent Tasks & Quick Actions */}
      <div className="dashboard-grid">
        {/* Recent Tasks */}
        <div className="recent-tasks-card">
          <div className="card-header">
            <h2>Recent Tasks</h2>
            <Link to="/tasks" className="card-link">
              View All <FiArrowRight />
            </Link>
          </div>
          
          {recentTasks.length > 0 ? (
            <div className="tasks-list">
              {recentTasks.map((task) => (
                <div 
                  key={task.id} 
                  className="task-item"
                  onClick={() => navigate(`/tasks/${task.id}`)}
                >
                  <div className="task-info">
                    <h3 className="task-title">{task.title || 'Untitled Task'}</h3>
                    <p className="task-meta">
                      <span className="task-id">#{task.id?.slice(0, 8) || 'N/A'}</span>
                      <span className="task-due">Due: {task.dueDate || 'Not set'}</span>
                    </p>
                  </div>
                  <div className="task-status">
                    <span className={`status-badge ${getStatusBadgeClass(task.status)}`}>
                      {getStatusText(task.status)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <FiList size={48} className="empty-icon" />
              <p>No tasks yet</p>
              {userRole === 'admin' && (
                <button onClick={() => navigate('/tasks/create')} className="btn-link">
                  Create your first task
                </button>
              )}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="quick-actions-card">
          <h2>Quick Actions</h2>
          <div className="actions-list">
            <Link to="/tasks" className="action-item">
              <FiList className="action-icon" />
              <div className="action-content">
                <h3>Browse All Tasks</h3>
                <p>View and manage your task list</p>
              </div>
              <FiArrowRight className="action-arrow" />
            </Link>

            {userRole === 'admin' && (
              <>
                <Link to="/tasks/create" className="action-item">
                  <FiPlus className="action-icon" />
                  <div className="action-content">
                    <h3>Create New Task</h3>
                    <p>Add a task to the system</p>
                  </div>
                  <FiArrowRight className="action-arrow" />
                </Link>

                <Link to="/tasks/assign" className="action-item">
                  <FiUserPlus className="action-icon" />
                  <div className="action-content">
                    <h3>Assign Tasks</h3>
                    <p>Allocate tasks to team members</p>
                  </div>
                  <FiArrowRight className="action-arrow" />
                </Link>

                <Link to="/users" className="action-item">
                  <FiUsers className="action-icon" />
                  <div className="action-content">
                    <h3>User Management</h3>
                    <p>Manage team members and roles</p>
                  </div>
                  <FiArrowRight className="action-arrow" />
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;