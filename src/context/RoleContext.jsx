import React, { createContext, useContext, useState } from 'react';

const RoleCtx = createContext('student');

export function RoleProvider({ children }) {
  const [role, setRole] = useState('student');
  return (
    <RoleCtx.Provider value={{ role, setRole }}>
      {children}
    </RoleCtx.Provider>
  );
}

export function useRole() { return useContext(RoleCtx); }
