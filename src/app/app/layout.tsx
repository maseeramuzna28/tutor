import React from "react";
import { RoleProvider } from "@/context/RoleContext";
import AppShell from "@/components/App/AppShell";

export const metadata = {
  title: "TUTO App Preview",
  description: "Preview the TUTO student and faculty learning platform with demo data.",
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleProvider>
      <AppShell>{children}</AppShell>
    </RoleProvider>
  );
}
