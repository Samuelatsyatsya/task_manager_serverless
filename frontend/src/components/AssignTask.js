import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { taskAPI } from "../services/api";
import { 
  FiArrowLeft, 
  FiUserCheck, 
  FiCheckCircle, 
  FiAlertCircle,
  FiUsers,
  FiList
} from "react-icons/fi";
import "./AssignTask.css";

function AssignTask() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedTask, setSelectedTask] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    fetchTasks();
    fetchUsers();
  }, []);

  const fetchTasks = async () => {
    try {
      const data = await taskAPI.getTasks();
      setTasks(data.tasks || []);
    } catch (err) {
      console.error("Error fetching tasks:", err);
    }
  };

  const fetchUsers = async () => {
    try {
      // Assuming you have an endpoint to get active users
      const response = await taskAPI.getUsers(); 
      const activeUsers = response.users?.filter(u => u.status === "active") || [];
      setUsers(activeUsers);
    } catch (err) {
      console.error("Error fetching users:", err);
      setMessage({ 
        type: "error", 
        text: "Failed to load users. Please try again." 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedTask || !selectedUser) {
      setMessage({ 
        type: "error", 
        text: "Please select both a task and a user." 
      });
      return;
    }

    try {
      setSubmitting(true);
      await taskAPI.assignTask(selectedTask, selectedUser);
      setMessage({ 
        type: "success", 
        text: "Task assigned successfully!" 
      });
      setSelectedTask("");
      setSelectedUser("");
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setMessage({ type: "", text: "" });
      }, 3000);
    } catch (err) {
      console.error("Error assigning task:", err);
      setMessage({ 
        type: "error", 
        text: err.response?.data?.message || "Failed to assign task." 
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Get task details for preview
  const getSelectedTaskDetails = () => {
    return tasks.find(t => t.taskId === selectedTask);
  };

  // Get user details for preview
  const getSelectedUserDetails = () => {
    return users.find(u => u.userId === selectedUser);
  };

  if (loading) {
    return (
      <div className="assign-task-loading">
        <div className="loading-spinner"></div>
        <p>Loading tasks and users...</p>
      </div>
    );
  }

  const selectedTaskDetails = getSelectedTaskDetails();
  const selectedUserDetails = getSelectedUserDetails();

  return (
    <div className="assign-task-container">
      {/* Header */}
      <div className="page-header">
        <div className="header-left">
          <button className="back-button" onClick={() => navigate('/tasks')}>
            <FiArrowLeft className="back-icon" />
            <span>Back to Tasks</span>
          </button>
          <h1 className="page-title">Assign Task</h1>
        </div>
        <div className="header-right">
          <div className="assignment-stats">
            <span className="stats-label">Available:</span>
            <span className="stats-value">
              {tasks.filter(t => t.status !== 'closed').length} tasks
            </span>
            <span className="stats-divider">•</span>
            <span className="stats-value">
              {users.length} users
            </span>
          </div>
        </div>
      </div>

      {/* Message Alert */}
      {message.text && (
        <div className={`message-alert ${message.type}`}>
          {message.type === 'success' ? (
            <FiCheckCircle className="alert-icon" />
          ) : (
            <FiAlertCircle className="alert-icon" />
          )}
          <span className="alert-message">{message.text}</span>
          <button 
            className="alert-close" 
            onClick={() => setMessage({ type: "", text: "" })}
          >
            ×
          </button>
        </div>
      )}

      <div className="assign-task-grid">
        {/* Assignment Form Card */}
        <div className="form-card">
          <div className="card-header">
            <FiUserCheck className="header-icon" />
            <h2>Assignment Details</h2>
          </div>

          <div className="form-content">
            <div className="form-group">
              <label htmlFor="task-select">
                <FiList className="input-icon" />
                Select Task
              </label>
              <select
                id="task-select"
                value={selectedTask}
                onChange={(e) => setSelectedTask(e.target.value)}
                className="form-select"
              >
                <option value="">-- Choose a task to assign --</option>
                {tasks
                  .filter(task => task.status !== 'closed')
                  .map((task) => (
                    <option key={task.taskId} value={task.taskId}>
                      {task.title} ({task.status})
                    </option>
                  ))}
              </select>
              {tasks.filter(t => t.status !== 'closed').length === 0 && (
                <span className="input-warning">
                  No available tasks to assign
                </span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="user-select">
                <FiUsers className="input-icon" />
                Select User
              </label>
              <select
                id="user-select"
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                className="form-select"
              >
                <option value="">-- Choose a team member --</option>
                {users.map((user) => (
                  <option key={user.userId} value={user.userId}>
                    {user.firstName} {user.lastName} ({user.email})
                  </option>
                ))}
              </select>
              {users.length === 0 && (
                <span className="input-warning">
                  No active users available
                </span>
              )}
            </div>

            <button 
              className="btn-assign"
              onClick={handleAssign}
              disabled={submitting || !selectedTask || !selectedUser}
            >
              {submitting ? (
                <>
                  <span className="spinner"></span>
                  Assigning...
                </>
              ) : (
                <>
                  <FiUserCheck className="btn-icon" />
                  Assign Task
                </>
              )}
            </button>
          </div>
        </div>

        {/* Preview Card */}
        <div className="preview-card">
          <h3>Assignment Preview</h3>
          
          {selectedTaskDetails || selectedUserDetails ? (
            <div className="preview-content">
              {selectedTaskDetails && (
                <div className="preview-section">
                  <h4>Selected Task</h4>
                  <div className="preview-task">
                    <div className="preview-header">
                      <span className="preview-title">{selectedTaskDetails.title}</span>
                      <span className={`task-status-badge ${selectedTaskDetails.status}`}>
                        {selectedTaskDetails.status}
                      </span>
                    </div>
                    <p className="preview-description">
                      {selectedTaskDetails.description || 'No description provided'}
                    </p>
                    {selectedTaskDetails.priority && (
                      <span className={`task-priority ${selectedTaskDetails.priority}`}>
                        {selectedTaskDetails.priority} priority
                      </span>
                    )}
                  </div>
                </div>
              )}

              {selectedUserDetails && (
                <div className="preview-section">
                  <h4>Selected User</h4>
                  <div className="preview-user">
                    <div className="user-avatar">
                      {selectedUserDetails.firstName?.[0]}{selectedUserDetails.lastName?.[0]}
                    </div>
                    <div className="user-details">
                      <span className="user-name">
                        {selectedUserDetails.firstName} {selectedUserDetails.lastName}
                      </span>
                      <span className="user-email">{selectedUserDetails.email}</span>
                      {selectedUserDetails.role && (
                        <span className="user-role">{selectedUserDetails.role}</span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {selectedTaskDetails && selectedUserDetails && (
                <div className="preview-summary">
                  <FiCheckCircle className="summary-icon" />
                  <p>
                    Ready to assign this task to {selectedUserDetails.firstName}.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="preview-empty">
              <FiUserCheck className="empty-icon" />
              <p>Select a task and user to see preview</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AssignTask;