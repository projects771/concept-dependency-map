import React from 'react';
import ReactDOM from 'react-dom/client';
import 'reactflow/dist/style.css';
import './styles/index.css';
// Shared app-shell styles (.ls-shell / .ls-card / .ls-role-pill / …) used by
// SignIn, Register, RoleSelection, CourseJoin and EducatorDashboard.
// These previously lived in components/LandingScreen.css, which was only
// imported by an unused LandingScreen.jsx — so Vite tree-shook the whole
// module out of the build and none of those pages ever received this CSS
// in production (hence the uncentered, unstyled cards). They now live in
// styles/ and are imported here, where nothing can drop them.
import './styles/shell.css';
import App from './App.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import { RoleProvider } from './context/RoleContext.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RoleProvider>
      <ToastProvider>
        <App />
      </ToastProvider>
    </RoleProvider>
  </React.StrictMode>
);
