import React from "react";
import { Navigate } from "react-router-dom";

interface RoleGuardProps {
  allowedRoles: string[];
  children: React.ReactNode;
}

const RoleGuard = ({ allowedRoles, children }: RoleGuardProps) => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const role = user?.role;

  if (!allowedRoles.includes(role)) {
    return <Navigate to="/dashboard" replace />;
    // or: return <Navigate to="/forbidden" replace />;
  }

  return <>{children}</>;
};

export default RoleGuard;
