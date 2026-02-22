// AssignTask.js
import React, { useState, useEffect } from "react";
import { taskAPI } from "../services/api";
import "./AssignTask.css";

function AssignTask() {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedTask, setSelectedTask] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

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
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedTask || !selectedUser) {
      setMessage("Please select both a task and a user.");
      return;
    }

    try {
      await taskAPI.assignTask(selectedTask, selectedUser);
      setMessage("Task assigned successfully!");
      setSelectedTask("");
      setSelectedUser("");
    } catch (err) {
      console.error("Error assigning task:", err);
      setMessage(err.response?.data?.message || "Failed to assign task.");
    }
  };

  if (loading) {
    return <div>Loading tasks and users...</div>;
  }

  return (
    <div className="assign-task">
      <h2>Assign Task</h2>

      {message && <div className="message">{message}</div>}

      <div className="form-group">
        <label>Select Task:</label>
        <select
          value={selectedTask}
          onChange={(e) => setSelectedTask(e.target.value)}
        >
          <option value="">-- Select Task --</option>
          {tasks.map((task) => (
            <option key={task.taskId} value={task.taskId}>
              {task.title} ({task.status})
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>Select User:</label>
        <select
          value={selectedUser}
          onChange={(e) => setSelectedUser(e.target.value)}
        >
          <option value="">-- Select User --</option>
          {users.map((user) => (
            <option key={user.userId} value={user.userId}>
              {user.firstName} {user.lastName} ({user.email})
            </option>
          ))}
        </select>
      </div>

      <button className="btn btn-primary" onClick={handleAssign}>
        Assign Task
      </button>
    </div>
  );
}

export default AssignTask;