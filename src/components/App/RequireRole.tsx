"use client";

import React from "react";
import { useRole, Role } from "@/context/RoleContext";
import { AccessNote } from "../ui/States";

export default function RequireRole({
  role: needed,
  children,
}: {
  role: Role;
  children: React.ReactNode;
}) {
  // DEMO ONLY: this checks the demo role, which is not security.
  // Real access control must be enforced by the backend.
  const { role } = useRole();
  return role === needed ? <>{children}</> : <AccessNote needs={needed} />;
}
