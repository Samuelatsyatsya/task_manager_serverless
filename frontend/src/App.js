import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Amplify } from 'aws-amplify';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';

import Dashboard from './components/Dashboard';
import TaskList from './components/TaskList';
import CreateTask from './components/CreateTask';
import TaskDetail from './components/TaskDetail';
import './App.css';

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: process.env.REACT_APP_USER_POOL_ID,
      userPoolClientId: process.env.REACT_APP_USER_POOL_CLIENT_ID,
      loginWith: { email: true },
    },
  },
});

function App() {
  return (
    <Authenticator>
      {({ signOut, user }) => (
        <Router>
          <div className="App">
            <header className="App-header">
              <h1>Task Management System</h1>
              <div className="user-info">
                <span>Welcome, {user?.signInDetails?.loginId}</span>
                <button onClick={signOut} className="btn-signout">
                  Sign Out
                </button>
              </div>
            </header>

            <main className="App-main">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/tasks" element={<TaskList />} />
                <Route path="/tasks/create" element={<CreateTask />} />
                <Route path="/tasks/:taskId" element={<TaskDetail />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </div>
        </Router>
      )}
    </Authenticator>
  );
}

export default App;