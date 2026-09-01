// src/routes/ProtectedRoute.tsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

interface ProtectedRouteProps {
  children: React.ReactElement;
  allowedRoles?: string[]; // ✅ เพิ่ม prop สำหรับจำกัดสิทธิ์
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  // ✅ Bypass Auth: ให้เข้าใช้งานได้ทันทีในสิทธิ์ Admin
  return children;
};

export default ProtectedRoute;
