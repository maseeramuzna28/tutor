"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useRole } from "@/context/RoleContext";
import { Loading } from "@/components/ui/States";

export default function AppIndex() {
  const { role } = useRole();
  const router = useRouter();

  useEffect(() => {
    router.replace(role === "faculty" ? "/app/faculty" : "/app/dashboard");
  }, [role, router]);

  return <Loading label="Loading workspace..." />;
}
