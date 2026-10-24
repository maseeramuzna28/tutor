"use client";

import React, { createContext, useContext, useState } from "react";

export type Role = "student" | "faculty";

interface RoleContextType {
  role: Role;
  setRole: (role: Role) => void;
}

const RoleContext = createContext<RoleContextType>({
  role: "student",
  setRole: () => {},
});

export function RoleProvider({ children }: { children: React.ReactNode }) {
  // DEMO ONLY: this is a preview switch, not authentication or security.
  // Replace it with the signed in user's role from your backend later.
  const [role, setRole] = useState<Role>("student");
  return (
    <RoleContext.Provider value={{ role, setRole }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  return useContext(RoleContext);
}
