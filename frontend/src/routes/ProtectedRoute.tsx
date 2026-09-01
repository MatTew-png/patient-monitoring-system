// src/routes/ProtectedRoute.tsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

interface ProtectedRouteProps {
  children: React.ReactElement;
  allowedRoles?: string[]; // ✅ เพิ่ม prop สำหรับจำกัดสิทธิ์
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { token, currentUser } = useAuthStore();

  // ❌ ถ้ายังไม่มี token → กลับไปหน้า login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // ✅ ถ้ามีการจำกัด role → ตรวจสอบ position ของ currentUser
  if (allowedRoles && currentUser && !allowedRoles.includes(currentUser.position)) {
    return <Navigate to="/" replace />;
  }

  // ✅ ผ่านทุกเงื่อนไข → render หน้านั้นได้
  return children;
};

export default ProtectedRoute;
