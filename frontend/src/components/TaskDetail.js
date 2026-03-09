import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchAuthSession } from 'aws-amplify/auth';
import { taskAPI } from '../services/api';
import './TaskDetail.css';

function TaskDetail({ user }) {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState('member');
  const [updating, setUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState('');

  const getUserRole = useCallback(async () => {
    try {
      const session = await fetchAuthSession();
      const payload = session.tokens?.idToken?.payload;
      const customRole = payload?.['custom:role'];
      const groups = payload?.['cognito:groups'] || [];
      const isAdmin = customRole === 'admin' || groups.includes('admin');
      setUserRole(isAdmin ? 'admin' : 'member');
    } catch (err) {
      console.error('Error getting user role:', err);
    }
  }, []);

  const fetchTask = useCallback(async () => {
    try {
      setLoading(true);
      const response = await taskAPI.getTasks();
      const foundTask = (response.tasks || []).find(t => t.taskId === taskId);
      
      if (foundTask) {
        setTask(foundTask);
        setNewStatus(foundTask.status);
        setError(null);
      } else {
        setError('Task not found');
      }
    } catch (err) {
      console.error('Error fetching task:', err);
      setError('Failed to load task details');
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    fetchTask();
    getUserRole();
  }, [fetchTask, getUserRole]);

  const handleStatusUpdate = async () => {
    if (newStatus === task.status) {
      return;
    }

    try {
      setUpdating(true);
      await taskAPI.updateStatus(taskId, newStatus);
      await fetchTask();
      setError(null);
    } catch (err) {
      console.error('Error updating task:', err);
      setError(err.response?.data?.message || 'Failed to update task status');
    } finally {
      setUpdating(false);
    }
  };

  const handleCloseTask = async () => {
    if (!window.confirm('Are you sure you want to close this task?')) {
      return;
    }

    try {
      setUpdating(true);
      await taskAPI.closeTask(taskId);
      await fetchTask();
      setError(null);
    } catch (err) {
      console.error('Error closing task:', err);
      setError(err.response?.data?.message || 'Failed to close task');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading task details...</div>;
  }

  if (error && !task) {
    return (
      <div className="error-container">
        <div className="error">{error}</div>
        <button onClick={() => navigate('/tasks')} className="btn btn-primary">
          Back to Tasks
        </button>
      </div>
    );
  }

  if (!task) {
    return null;
  }

  return (
    <div className="task-detail">
      <div className="task-detail-header">
        <button onClick={() => navigate('/tasks')} className="btn-back">
          ← Back to Tasks
        </button>
        <h2>{task.title}</h2>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="task-detail-content">
        <div className="task-info-section">
          <h3>Task Information</h3>
          
          <div className="info-row">
            <label>Status:</label>
            <span className={`status-badge status-${task.status}`}>
              {task.status}
            </span>
          </div>

          <div className="info-row">
            <label>Priority:</label>
            <span className={`priority-badge priority-${task.priority}`}>
              {task.priority}
            </span>
          </div>

          <div className="info-row">
            <label>Created By:</label>
            <span>{task.createdByEmail}</span>
          </div>

          <div className="info-row">
            <label>Created At:</label>
            <span>{new Date(task.createdAt * 1000).toLocaleString()}</span>
          </div>

          {task.dueDate && (
            <div className="info-row">
              <label>Due Date:</label>
              <span>{new Date(task.dueDate).toLocaleDateString()}</span>
            </div>
          )}

          {task.tags && task.tags.length > 0 && (
            <div className="info-row">
              <label>Tags:</label>
              <div className="tags">
                {task.tags.map((tag, index) => (
                  <span key={index} className="tag">{tag}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="task-description-section">
          <h3>Description</h3>
          <p>{task.description}</p>
        </div>

        {task.status !== 'closed' && (
          <div className="task-actions-section">
            <h3>Actions</h3>
            
            <div className="status-update">
              <label htmlFor="status">Update Status:</label>
              <select
                id="status"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                disabled={updating}
              >
                <option value="open">Open</option>
                <option value="in-progress">In Progress</option>
                {userRole === 'admin' && <option value="closed">Closed</option>}
              </select>
              <button
                onClick={handleStatusUpdate}
                disabled={updating || newStatus === task.status}
                className="btn btn-primary"
              >
                {updating ? 'Updating...' : 'Update Status'}
              </button>
            </div>

            {userRole === 'admin' && (
              <div className="admin-actions">
                <button
                  onClick={handleCloseTask}
                  disabled={updating}
                  className="btn btn-danger"
                >
                  {updating ? 'Closing...' : 'Close Task'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default TaskDetail;
