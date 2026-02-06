import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { taskAPI } from '../services/api';
import './TaskList.css';

function TaskList({ user }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [userRole, setUserRole] = useState('member');

  useEffect(() => {
    fetchTasks();
    getUserRole();
  }, [statusFilter]);

  const getUserRole = async () => {
    try {
      const attributes = user.signInUserSession?.idToken?.payload;
      const role = attributes?.['custom:role'] || 'member';
      setUserRole(role);
    } catch (err) {
      console.error('Error getting user role:', err);
    }
  };

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const filter = statusFilter === 'all' ? null : statusFilter;
      const response = await taskAPI.getTasks(filter);
      setTasks(response.tasks || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'high':
        return 'priority-high';
      case 'medium':
        return 'priority-medium';
      case 'low':
        return 'priority-low';
      default:
        return '';
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'open':
        return 'status-open';
      case 'in-progress':
        return 'status-in-progress';
      case 'closed':
        return 'status-closed';
      default:
        return '';
    }
  };

  if (loading) {
    return <div className="loading">Loading tasks...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="task-list">
      <div className="task-list-header">
        <h2>Tasks</h2>
        {userRole === 'admin' && (
          <Link to="/tasks/create" className="btn btn-success">Create Task</Link>
        )}
      </div>

      <div className="filters">
        <label>Filter by status:</label>
        <select 
          value={statusFilter} 
          onChange={(e) => setStatusFilter(e.target.value)}
          className="filter-select"
        >
          <option value="all">All</option>
          <option value="open">Open</option>
          <option value="in-progress">In Progress</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      {tasks.length === 0 ? (
        <div className="no-tasks">No tasks found</div>
      ) : (
        <div className="tasks-grid">
          {tasks.map(task => (
            <Link 
              to={`/tasks/${task.taskId}`} 
              key={task.taskId} 
              className="task-card"
            >
              <div className="task-card-header">
                <h3>{task.title}</h3>
                <span className={`priority-badge ${getPriorityClass(task.priority)}`}>
                  {task.priority}
                </span>
              </div>
              <p className="task-description">{task.description}</p>
              <div className="task-card-footer">
                <span className={`status-badge ${getStatusClass(task.status)}`}>
                  {task.status}
                </span>
                <span className="task-date">
                  {new Date(task.createdAt * 1000).toLocaleDateString()}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default TaskList;
