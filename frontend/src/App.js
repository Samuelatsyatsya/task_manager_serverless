import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Link,
  useLocation,
} from "react-router-dom";
import { Amplify } from "aws-amplify";
import { Authenticator } from "@aws-amplify/ui-react";
import { fetchAuthSession } from "aws-amplify/auth";
import "@aws-amplify/ui-react/styles.css";
import { 
  FiHome, 
  FiList, 
  FiLogOut, 
  FiZap,
  FiGrid,
  FiSettings
} from "react-icons/fi";

import Dashboard from "./components/Dashboard";
import TaskList from "./components/TaskList";
import CreateTask from "./components/CreateTask";
import TaskDetail from "./components/TaskDetail";
import AssignTask from './components/AssignTask';
import "./App.css";

// Amplify Gen 2 config
Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: process.env.REACT_APP_USER_POOL_ID,
      userPoolClientId: process.env.REACT_APP_USER_POOL_CLIENT_ID,
      loginWith: { email: true },
    },
  },
});

// Navigation component with active route highlighting
function Navigation({ userRole }) {
  const location = useLocation();
  
  const navItems = [
    { path: "/", label: "Dashboard", icon: FiHome },
    { path: "/tasks", label: "Tasks", icon: FiList },
  ];

  return (
    <nav className="main-nav">
      <div className="nav-brand">
        <FiZap className="brand-icon" />
        <span className="brand-name">TaskFlow</span>
      </div>
      
      <div className="nav-links">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
            >
              <Icon className="nav-icon" />
              <span className="nav-label">{item.label}</span>
            </Link>
          );
        })}
      </div>
      
      {userRole === 'admin' && (
        <div className="nav-section">
          <div className="nav-section-title">Admin</div>
          <Link to="/settings" className="nav-link">
            <FiSettings className="nav-icon" />
            <span className="nav-label">Settings</span>
          </Link>
        </div>
      )}
      
      <div className="nav-footer">
        <div className="nav-version">v2.0.0</div>
        <div className="nav-stats">
          <FiGrid className="stats-icon" />
          <span>Enterprise</span>
        </div>
      </div>
    </nav>
  );
}

// Helper function to get page title based on path
const getPageTitle = (pathname) => {
  if (pathname === '/') return 'Dashboard';
  if (pathname === '/tasks') return 'Tasks';
  if (pathname.includes('/tasks/create')) return 'Create Task';
  if (pathname.includes('/tasks/assign')) return 'Assign Task';
  if (pathname.includes('/tasks/') && 
      !pathname.includes('/tasks/create') && 
      !pathname.includes('/tasks/assign')) {
    return 'Task Details';
  }
  return '';
};

// Helper function to format user name
const formatUserName = (loginId) => {
  if (!loginId) return 'User';
  try {
    return loginId
      .split("@")[0]
      ?.split(".")
      ?.map(name => name.charAt(0).toUpperCase() + name.slice(1))
      ?.join(" ") || 'User';
  } catch {
    return 'User';
  }
};

// Helper function to get user initials
const getUserInitials = (loginId) => {
  if (!loginId) return 'U';
  try {
    return loginId
      .split("@")[0]
      ?.split(".")
      .map(n => n[0])
      .join("")
      .toUpperCase() || 'U';
  } catch {
    return 'U';
  }
};

// Main App Content component that uses hooks
function AppContent({ user, signOut }) {
  const [userRole, setUserRole] = useState('member');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function determineUserRole() {
      try {
        // First check user attributes for custom:role
        const customRole = user?.attributes?.['custom:role'];
        
        // Then check the session for cognito:groups
        const session = await fetchAuthSession();
        const payload = session.tokens?.idToken?.payload;
        const groups = payload?.['cognito:groups'] || [];
        
        // Check both sources for admin
        const isAdmin = 
          customRole === 'admin' || 
          groups.includes('admin') ||
          customRole === 'Admin' ||
          groups.includes('Admin');
        
        console.log('User role determination:', {
          customRole,
          groups,
          isAdmin,
          fromAttributes: customRole === 'admin',
          fromGroups: groups.includes('admin')
        });
        
        setUserRole(isAdmin ? 'admin' : 'member');
      } catch (error) {
        console.error('Error determining user role:', error);
        setUserRole('member');
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      determineUserRole();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="app-loading">
        <div className="loading-spinner"></div>
        <p>Loading user permissions...</p>
      </div>
    );
  }

  return (
    <Router>
      <div className="app-container">
        <Navigation userRole={userRole} />
        
        <div className="main-content">
          <header className="content-header">
            <div className="header-left">
              <h1 className="page-title">
                {getPageTitle(window.location.pathname)}
              </h1>
            </div>
            
            <div className="header-right">
              <div className="user-menu">
                <div className="user-avatar">
                  {getUserInitials(user?.signInDetails?.loginId)}
                </div>
                <div className="user-details">
                  <span className="user-name">
                    {formatUserName(user?.signInDetails?.loginId)}
                  </span>
                  <span className="user-role">
                    {userRole === 'admin' ? 'Administrator' : 'Team Member'}
                  </span>
                </div>
                <button onClick={signOut} className="btn-signout" title="Sign Out">
                  <FiLogOut className="signout-icon" />
                </button>
              </div>
            </div>
          </header>

          <main className="content-area">
            <Routes>
              <Route path="/tasks/assign" element={<AssignTask user={user} />} />
              <Route path="/" element={<Dashboard user={user} />} />
              <Route path="/tasks" element={<TaskList user={user} />} />
              <Route path="/tasks/create" element={<CreateTask user={user} />} />
              <Route path="/tasks/:taskId" element={<TaskDetail user={user} />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

function App() {
  return (
    <Authenticator
      components={{
        SignIn: {
          Header() {
            return (
              <div className="auth-header">
                <FiZap className="auth-logo" />
                <h2>TaskFlow</h2>
                <p>Enterprise Task Management</p>
              </div>
            );
          },
        },
      }}
    >
      {({ signOut, user }) => (
        <AppContent user={user} signOut={signOut} />
      )}
    </Authenticator>
  );
}

export default App;