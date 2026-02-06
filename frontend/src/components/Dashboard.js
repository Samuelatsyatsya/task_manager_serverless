import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { taskAPI } from '../services/api';
import './Dashboard.css';

function Dashboard({ user }) {
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    inProgress: 0,
    closed: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState('member');

  useEffect(() => {
    fetchStats();
    getUserRole();
  }, []);

  const getUserRole = async () => {
    try {
      const attributes = user.signInUserSession?.idToken?.payload;
      const role = attributes?.['custom:role'] || 'member';
      setUserRole(role);
    } catch (err) {
      console.error('Error getting user role:', err);
    }
  };

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await taskAPI.getTasks();
      const tasks = response.tasks || [];

      const stats = {
        total: tasks.length,
        open: tasks.filter(t => t.status === 'open').length,
        inProgress: tasks.filter(t => t.status === 'in-progress').length,
        closed: tasks.filter(t => t.status === 'closed').length
      };

      setStats(stats);
      setError(null);
    } catch (err) {
      console.error('Error fetching stats:', err);
      setError('Failed to load dashboard statistics');
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
          <Link to="/tasks" className="btn btn-primary">View All Tasks</Link>
          {userRole === 'admin' && (
            <Link to="/tasks/create" className="btn btn-success">Create New Task</Link>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
