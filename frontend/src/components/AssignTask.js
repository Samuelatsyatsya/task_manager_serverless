import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { taskAPI } from "../services/api";
import {
  FiArrowLeft,
  FiUserCheck,
  FiCheckCircle,
  FiAlertCircle,
  FiUsers,
  FiList,
  FiRefreshCw,
} from "react-icons/fi";
import "./AssignTask.css";

function formatUserName(user) {
  const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim();
  return fullName || user.email || "Member";
}

function AssignTask() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedTask, setSelectedTask] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const activeTasks = useMemo(
    () => tasks.filter((task) => task.status !== "closed"),
    [tasks],
  );

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const [tasksResponse, usersResponse] = await Promise.all([
        taskAPI.getTasks(),
        taskAPI.getUsers(),
      ]);

      setTasks(tasksResponse.tasks || []);
      setUsers(usersResponse.users || []);
    } catch (err) {
      const apiMessage =
        err.response?.data?.message || "Failed to load tasks or members.";
      setMessage({ type: "error", text: apiMessage });
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleAssign = async () => {
    if (!selectedTask || !selectedUser) {
      setMessage({
        type: "error",
        text: "Please select both a task and a member.",
      });
      return;
    }

    try {
      setSubmitting(true);
      await taskAPI.assignTask(selectedTask, selectedUser);

      setMessage({
        type: "success",
        text: "Task assigned successfully.",
      });
      setSelectedTask("");
      setSelectedUser("");

      await refreshData();
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to assign task.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const selectedTaskDetails = useMemo(
    () => tasks.find((task) => task.taskId === selectedTask),
    [tasks, selectedTask],
  );

  const selectedUserDetails = useMemo(
    () => users.find((user) => user.userId === selectedUser),
    [users, selectedUser],
  );

  if (loading) {
    return (
      <div className="assign-task-loading">
        <div className="loading-spinner"></div>
        <p>Loading tasks and users...</p>
      </div>
    );
  }

  return (
    <div className="assign-task-container">
      <div className="page-header">
        <div className="header-left">
          <button className="back-button" onClick={() => navigate("/tasks")}>
            <FiArrowLeft className="back-icon" />
            <span>Back to Tasks</span>
          </button>
          <h1 className="page-title">Assign Task</h1>
        </div>

        <div className="header-right">
          <button className="refresh-button" onClick={refreshData} title="Refresh">
            <FiRefreshCw className={`refresh-icon ${refreshing ? "spin" : ""}`} />
          </button>
          <div className="assignment-stats">
            <span className="stats-label">Available:</span>
            <span className="stats-value">{activeTasks.length} tasks</span>
            <span className="stats-divider">•</span>
            <span className="stats-value">{users.length} users</span>
          </div>
        </div>
      </div>

      {message.text && (
        <div className={`message-alert ${message.type}`}>
          {message.type === "success" ? (
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
                {activeTasks.map((task) => (
                  <option key={task.taskId} value={task.taskId}>
                    {task.title} ({task.status})
                  </option>
                ))}
              </select>
              {activeTasks.length === 0 && (
                <span className="input-warning">No available tasks to assign</span>
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
                    {formatUserName(user)} ({user.email})
                  </option>
                ))}
              </select>
              {users.length === 0 && (
                <span className="input-warning">No assignable users available</span>
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
                      {selectedTaskDetails.description || "No description provided"}
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
                      {formatUserName(selectedUserDetails).slice(0, 1).toUpperCase()}
                    </div>
                    <div className="user-details">
                      <span className="user-name">{formatUserName(selectedUserDetails)}</span>
                      <span className="user-email">{selectedUserDetails.email}</span>
                      <span className="user-role">{selectedUserDetails.role || "member"}</span>
                    </div>
                  </div>
                </div>
              )}

              {selectedTaskDetails && selectedUserDetails && (
                <div className="preview-summary">
                  <FiCheckCircle className="summary-icon" />
                  <p>
                    Ready to assign this task to {formatUserName(selectedUserDetails)}.
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
