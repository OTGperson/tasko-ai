import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth.js';

/**
 * 로그인한 사람에게만 자식 화면을 보여 준다.
 * - 로그인 확인 중: 배경색만 보여 준다 (깜빡임 방지)
 * - 로그인 안 함: 로그인 화면(/login)으로 보낸다
 */
export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="w-full h-full bg-[#F8F9FA] dark:bg-[#121417]"></div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
