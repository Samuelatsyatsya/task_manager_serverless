// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { taskAPI } from "../services/api";
// import { 
//   FiArrowLeft, 
//   FiUserCheck, 
//   FiCheckCircle, 
//   FiAlertCircle,
//   FiUsers,
//   FiList
// } from "react-icons/fi";
// import "./AssignTask.css";

// function AssignTask() {
//   const navigate = useNavigate();
//   const [tasks, setTasks] = useState([]);
//   const [users, setUsers] = useState([]);
//   const [selectedTask, setSelectedTask] = useState("");
//   const [selectedUser, setSelectedUser] = useState("");
//   const [loading, setLoading] = useState(true);
//   const [submitting, setSubmitting] = useState(false);
//   const [message, setMessage] = useState({ type: "", text: "" });

//   useEffect(() => {
//     fetchTasks();
//     fetchUsers();
//   }, []);

//   const fetchTasks = async () => {
//     try {
//       const data = await taskAPI.getTasks();
//       setTasks(data.tasks || []);
//     } catch (err) {
//       console.error("Error fetching tasks:", err);
//     }
//   };

//   const fetchUsers = async () => {
//     try {
//       // Assuming you have an endpoint to get active users
//       const response = await taskAPI.getUsers(); 
//       const activeUsers = response.users?.filter(u => u.status === "active") || [];
//       setUsers(activeUsers);
//     } catch (err) {
//       console.error("Error fetching users:", err);
//       setMessage({ 
//         type: "error", 
//         text: "Failed to load users. Please try again." 
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleAssign = async () => {
//     if (!selectedTask || !selectedUser) {
//       setMessage({ 
//         type: "error", 
//         text: "Please select both a task and a user." 
//       });
//       return;
//     }

//     try {
//       setSubmitting(true);
//       await taskAPI.assignTask(selectedTask, selectedUser);
//       setMessage({ 
//         type: "success", 
//         text: "Task assigned successfully!" 
//       });
//       setSelectedTask("");
//       setSelectedUser("");
      
//       // Clear success message after 3 seconds
//       setTimeout(() => {
//         setMessage({ type: "", text: "" });
//       }, 3000);
//     } catch (err) {
//       console.error("Error assigning task:", err);
//       setMessage({ 
//         type: "error", 
//         text: err.response?.data?.message || "Failed to assign task." 
//       });
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   // Get task details for preview
//   const getSelectedTaskDetails = () => {
//     return tasks.find(t => t.taskId === selectedTask);
//   };

//   // Get user details for preview
//   const getSelectedUserDetails = () => {
//     return users.find(u => u.userId === selectedUser);
//   };

//   if (loading) {
//     return (
//       <div className="assign-task-loading">
//         <div className="loading-spinner"></div>
//         <p>Loading tasks and users...</p>
//       </div>
//     );
//   }

//   const selectedTaskDetails = getSelectedTaskDetails();
//   const selectedUserDetails = getSelectedUserDetails();

//   return (
//     <div className="assign-task-container">
//       {/* Header */}
//       <div className="page-header">
//         <div className="header-left">
//           <button className="back-button" onClick={() => navigate('/tasks')}>
//             <FiArrowLeft className="back-icon" />
//             <span>Back to Tasks</span>
//           </button>
//           <h1 className="page-title">Assign Task</h1>
//         </div>
//         <div className="header-right">
//           <div className="assignment-stats">
//             <span className="stats-label">Available:</span>
//             <span className="stats-value">
//               {tasks.filter(t => t.status !== 'closed').length} tasks
//             </span>
//             <span className="stats-divider">•</span>
//             <span className="stats-value">
//               {users.length} users
//             </span>
//           </div>
//         </div>
//       </div>

//       {/* Message Alert */}
//       {message.text && (
//         <div className={`message-alert ${message.type}`}>
//           {message.type === 'success' ? (
//             <FiCheckCircle className="alert-icon" />
//           ) : (
//             <FiAlertCircle className="alert-icon" />
//           )}
//           <span className="alert-message">{message.text}</span>
//           <button 
//             className="alert-close" 
//             onClick={() => setMessage({ type: "", text: "" })}
//           >
//             ×
//           </button>
//         </div>
//       )}

//       <div className="assign-task-grid">
//         {/* Assignment Form Card */}
//         <div className="form-card">
//           <div className="card-header">
//             <FiUserCheck className="header-icon" />
//             <h2>Assignment Details</h2>
//           </div>

//           <div className="form-content">
//             <div className="form-group">
//               <label htmlFor="task-select">
//                 <FiList className="input-icon" />
//                 Select Task
//               </label>
//               <select
//                 id="task-select"
//                 value={selectedTask}
//                 onChange={(e) => setSelectedTask(e.target.value)}
//                 className="form-select"
//               >
//                 <option value="">-- Choose a task to assign --</option>
//                 {tasks
//                   .filter(task => task.status !== 'closed')
//                   .map((task) => (
//                     <option key={task.taskId} value={task.taskId}>
//                       {task.title} ({task.status})
//                     </option>
//                   ))}
//               </select>
//               {tasks.filter(t => t.status !== 'closed').length === 0 && (
//                 <span className="input-warning">
//                   No available tasks to assign
//                 </span>
//               )}
//             </div>

//             <div className="form-group">
//               <label htmlFor="user-select">
//                 <FiUsers className="input-icon" />
//                 Select User
//               </label>
//               <select
//                 id="user-select"
//                 value={selectedUser}
//                 onChange={(e) => setSelectedUser(e.target.value)}
//                 className="form-select"
//               >
//                 <option value="">-- Choose a team member --</option>
//                 {users.map((user) => (
//                   <option key={user.userId} value={user.userId}>
//                     {user.firstName} {user.lastName} ({user.email})
//                   </option>
//                 ))}
//               </select>
//               {users.length === 0 && (
//                 <span className="input-warning">
//                   No active users available
//                 </span>
//               )}
//             </div>

//             <button 
//               className="btn-assign"
//               onClick={handleAssign}
//               disabled={submitting || !selectedTask || !selectedUser}
//             >
//               {submitting ? (
//                 <>
//                   <span className="spinner"></span>
//                   Assigning...
//                 </>
//               ) : (
//                 <>
//                   <FiUserCheck className="btn-icon" />
//                   Assign Task
//                 </>
//               )}
//             </button>
//           </div>
//         </div>

//         {/* Preview Card */}
//         <div className="preview-card">
//           <h3>Assignment Preview</h3>
          
//           {selectedTaskDetails || selectedUserDetails ? (
//             <div className="preview-content">
//               {selectedTaskDetails && (
//                 <div className="preview-section">
//                   <h4>Selected Task</h4>
//                   <div className="preview-task">
//                     <div className="preview-header">
//                       <span className="preview-title">{selectedTaskDetails.title}</span>
//                       <span className={`task-status-badge ${selectedTaskDetails.status}`}>
//                         {selectedTaskDetails.status}
//                       </span>
//                     </div>
//                     <p className="preview-description">
//                       {selectedTaskDetails.description || 'No description provided'}
//                     </p>
//                     {selectedTaskDetails.priority && (
//                       <span className={`task-priority ${selectedTaskDetails.priority}`}>
//                         {selectedTaskDetails.priority} priority
//                       </span>
//                     )}
//                   </div>
//                 </div>
//               )}

//               {selectedUserDetails && (
//                 <div className="preview-section">
//                   <h4>Selected User</h4>
//                   <div className="preview-user">
//                     <div className="user-avatar">
//                       {selectedUserDetails.firstName?.[0]}{selectedUserDetails.lastName?.[0]}
//                     </div>
//                     <div className="user-details">
//                       <span className="user-name">
//                         {selectedUserDetails.firstName} {selectedUserDetails.lastName}
//                       </span>
//                       <span className="user-email">{selectedUserDetails.email}</span>
//                       {selectedUserDetails.role && (
//                         <span className="user-role">{selectedUserDetails.role}</span>
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               )}

//               {selectedTaskDetails && selectedUserDetails && (
//                 <div className="preview-summary">
//                   <FiCheckCircle className="summary-icon" />
//                   <p>
//                     Ready to assign this task to {selectedUserDetails.firstName}.
//                   </p>
//                 </div>
//               )}
//             </div>
//           ) : (
//             <div className="preview-empty">
//               <FiUserCheck className="empty-icon" />
//               <p>Select a task and user to see preview</p>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

// export default AssignTask;





import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { taskAPI } from "../services/api";
import { fetchAuthSession } from "aws-amplify/auth";
import { 
  FiArrowLeft, 
  FiUserCheck, 
  FiCheckCircle, 
  FiAlertCircle,
  FiUsers,
  FiList,
  FiRefreshCw
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
  const [debugInfo, setDebugInfo] = useState(null);
  const [apiError, setApiError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setApiError(null);
    try {
      await Promise.all([fetchTasks(), fetchUsers()]);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTasks = async () => {
    try {
      const data = await taskAPI.getTasks();
      console.log("Tasks API response:", data);
      // Handle both { tasks: [...] } and direct array
      const tasksList = data.tasks || (Array.isArray(data) ? data : []);
      setTasks(tasksList);
    } catch (err) {
      console.error("Error fetching tasks:", err);
      setMessage({ type: "error", text: "Failed to load tasks." });
      setApiError(prev => ({ ...prev, tasks: err.message }));
    }
  };

  const fetchUsers = async () => {
    try {
      console.log("Fetching users...");
      const response = await taskAPI.getUsers();
      console.log("Raw users API response:", response);

      // Parse the response - it could be:
      // 1. An array directly
      // 2. An object with a 'users' property
      // 3. An object with a 'data' property
      // 4. Some other structure
      let usersList = [];
      if (Array.isArray(response)) {
        usersList = response;
      } else if (response.users && Array.isArray(response.users)) {
        usersList = response.users;
      } else if (response.data && Array.isArray(response.data)) {
        usersList = response.data;
      } else if (response.Items && Array.isArray(response.Items)) {
        // DynamoDB scan result often has Items
        usersList = response.Items;
      } else if (response && typeof response === 'object') {
        // If it's a single object but not an array, maybe it's a user? Unlikely.
        console.warn("Unexpected response format:", response);
        // Try to see if it's a wrapped object with a common key
        const possibleKeys = ['members', 'team', 'profiles', 'results'];
        for (let key of possibleKeys) {
          if (response[key] && Array.isArray(response[key])) {
            usersList = response[key];
            break;
          }
        }
      }

      console.log("Parsed users list:", usersList);

      // Normalize user objects to have consistent field names
      const normalizedUsers = usersList.map(user => ({
        userId: user.userId || user.id || user.sub || user.username,
        id: user.userId || user.id || user.sub || user.username,
        firstName: user.firstName || user.given_name || user.name?.split(' ')[0] || '',
        lastName: user.lastName || user.family_name || (user.name?.split(' ').slice(1).join(' ') || ''),
        email: user.email || user.contact,
        name: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        status: user.status || user.userStatus || 'active',
        role: user.role || user['custom:role'] || 'member'
      }));

      // Filter active users if status field exists
      const activeUsers = normalizedUsers.filter(u => 
        !u.status || u.status.toLowerCase() === "active" || u.status.toLowerCase() === "enabled"
      );

      setUsers(activeUsers);
      
      if (activeUsers.length === 0) {
        setDebugInfo({
          message: "No active users found",
          rawResponse: response,
          parsedCount: usersList.length,
          normalizedCount: normalizedUsers.length
        });
      } else {
        // Clear debug if users exist
        setDebugInfo(null);
      }
    } catch (err) {
      console.error("Error fetching users:", err);
      setMessage({ 
        type: "error", 
        text: "Failed to load users. Please check API implementation." 
      });
      setDebugInfo({
        error: err.message,
        status: err.response?.status,
        data: err.response?.data,
        config: err.config
      });
      setApiError(prev => ({ ...prev, users: err.message }));
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
      
      // Refresh tasks to show updated assignment
      fetchTasks();
      
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

  const getSelectedTaskDetails = () => {
    return tasks.find(t => t.taskId === selectedTask || t.id === selectedTask);
  };

  const getSelectedUserDetails = () => {
    return users.find(u => u.userId === selectedUser || u.id === selectedUser);
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
          <button className="refresh-button" onClick={fetchData} title="Refresh">
            <FiRefreshCw className={`refresh-icon ${loading ? 'spin' : ''}`} />
          </button>
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

      {/* Debug Info - shown only in development or when error */}
      {(process.env.NODE_ENV === 'development' || debugInfo) && debugInfo && (
        <div className="debug-panel">
          <h4>Debug Info</h4>
          <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
          <button onClick={() => setDebugInfo(null)}>Dismiss</button>
        </div>
      )}

      {/* API Error Banner */}
      {apiError && (
        <div className="error-banner">
          <FiAlertCircle className="banner-icon" />
          <span>API Error: {apiError.users || apiError.tasks}</span>
          <button onClick={() => setApiError(null)}>×</button>
        </div>
      )}

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
                    <option key={task.taskId || task.id} value={task.taskId || task.id}>
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
                  <option key={user.userId || user.id} value={user.userId || user.id}>
                    {user.firstName || user.name} {user.lastName} ({user.email})
                  </option>
                ))}
              </select>
              {users.length === 0 && (
                <span className="input-warning">
                  No users found. Check the API or add users in Cognito.
                </span>
              )}
            </div>

            <button 
              className="btn-assign"
              onClick={handleAssign}
              disabled={submitting || !selectedTask || !selectedUser || users.length === 0}
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
                      {(selectedUserDetails.firstName?.[0] || selectedUserDetails.name?.[0] || '?')}
                      {(selectedUserDetails.lastName?.[0] || '')}
                    </div>
                    <div className="user-details">
                      <span className="user-name">
                        {selectedUserDetails.firstName || selectedUserDetails.name} {selectedUserDetails.lastName || ''}
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
                    Ready to assign this task to {selectedUserDetails.firstName || selectedUserDetails.name}.
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