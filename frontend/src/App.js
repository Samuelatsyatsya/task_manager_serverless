// import React from 'react';
// import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// import { Amplify } from 'aws-amplify';
// import { Authenticator } from '@aws-amplify/ui-react';
// import '@aws-amplify/ui-react/styles.css';
// import Dashboard from './components/Dashboard';
// import TaskList from './components/TaskList';
// import CreateTask from './components/CreateTask';
// import TaskDetail from './components/TaskDetail';
// import './App.css';

// // Configure Amplify
// Amplify.configure({
//   Auth: {
//     Cognito: {
//       userPoolId: process.env.REACT_APP_USER_POOL_ID,
//       userPoolClientId: process.env.REACT_APP_USER_POOL_CLIENT_ID,
//       signUpVerificationMethod: 'code',
//       loginWith: {
//         email: true
//       }
//     }
//   }
// });

// function App() {
//   return (
//     <Authenticator
//       signUpAttributes={['email']}
//       loginMechanisms={['email']}

//       // This handles password change flow automatically
//       variation="modal"
//     >
//       {({ signOut, user }) => (
//         <Router>
//           <div className="App">
//             <header className="App-header">
//               <h1>Task Management System</h1>
//               <div className="user-info">
//                 <span>Welcome, {user.signInDetails.loginId}</span>
//                 <button onClick={signOut} className="btn-signout">Sign Out</button>
//               </div>
//             </header>
//             <main className="App-main">
//               <Routes>
//                 <Route path="/" element={<Dashboard user={user} />} />
//                 <Route path="/tasks" element={<TaskList user={user} />} />
//                 <Route path="/tasks/create" element={<CreateTask user={user} />} />
//                 <Route path="/tasks/:taskId" element={<TaskDetail user={user} />} />
//                 <Route path="*" element={<Navigate to="/" replace />} />
//               </Routes>
//             </main>
//           </div>
//         </Router>
//       )}
//     </Authenticator>
//   );
// }

// export default App;
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

// Configure Amplify
Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: process.env.REACT_APP_USER_POOL_ID,
      userPoolClientId: process.env.REACT_APP_USER_POOL_CLIENT_ID,
      signUpVerificationMethod: 'code',
      loginWith: {
        email: true
      }
    }
  }
});

function App() {
  return (
    <Authenticator
      loginMechanisms={['email']}
      signUpAttributes={[]}
      
      formFields={{
        signUp: {
          email: {
            order: 1,
            isRequired: true
          },
          password: {
            order: 2,
            isRequired: true
          },
          confirm_password: {
            order: 3,
            isRequired: true
          }
        },
        forceNewPassword: {
          password: {
            placeholder: 'Enter your new password',
          }
        }
      }}
      
      variation="modal"
    >
      {({ signOut, user }) => {
        // Debug logging
        console.log('=== USER OBJECT ===');
        console.log('Full user:', user);
        console.log('ID Token Payload:', user.signInUserSession?.idToken?.payload);
        console.log('Custom Role:', user.signInUserSession?.idToken?.payload?.['custom:role']);
        console.log('Cognito Groups:', user.signInUserSession?.idToken?.payload?.['cognito:groups']);
        console.log('==================');

        return (
          <Router>
            <div className="App">
              <header className="App-header">
                <h1>Task Management System</h1>
                <div className="user-info">
                  <span>Welcome, {user.signInDetails.loginId}</span>
                  <button onClick={signOut} className="btn-signout">Sign Out</button>
                </div>
              </header>
              <main className="App-main">
                <Routes>
                  <Route path="/" element={<Dashboard user={user} />} />
                  <Route path="/tasks" element={<TaskList user={user} />} />
                  <Route path="/tasks/create" element={<CreateTask user={user} />} />
                  <Route path="/tasks/:taskId" element={<TaskDetail user={user} />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>
            </div>
          </Router>
        );
      }}
    </Authenticator>
  );
}

export default App;
