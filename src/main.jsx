import React from 'react';
import ReactDOM from 'react-dom/client';
import 'reactflow/dist/style.css';
import './styles/index.css';
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
