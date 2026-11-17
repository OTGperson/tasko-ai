import { createContext, useContext } from 'react';

// 로그인 상태 공유를 위한 React Context
// (빠른 새로고침 규칙 때문에 컴포넌트 파일(AuthContext.jsx)과 분리했습니다)
export const AuthContext = createContext(null);

// 편의를 위한 Custom Hook
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Supabase 영어 에러 메시지를 한국어로 바꾼다
export function toKoreanAuthError(error) {
  let message = '';
  if (error && error.message) {
    message = error.message;
  }

  if (message.includes('Invalid login credentials')) {
    return '이메일 또는 비밀번호가 올바르지 않습니다.';
  }
  if (message.includes('Email not confirmed')) {
    return '이메일 확인이 아직 끝나지 않았습니다.';
  }
  if (message.includes('User already registered')) {
    return '이미 가입된 이메일입니다.';
  }
  if (message.includes('at least 6 characters')) {
    return '비밀번호는 6자 이상이어야 합니다.';
  }
  if (message.includes('Unable to validate email address') || message.includes('invalid format')) {
    return '이메일 형식이 올바르지 않습니다.';
  }
  if (message.includes('rate limit') || message.includes('For security purposes')) {
    return '요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.';
  }
  if (message.includes('Failed to fetch') || message.includes('NetworkError')) {
    return '네트워크 연결을 확인해 주세요.';
  }
  if (message.includes('Supabase')) {
    return message;
  }
  return '문제가 생겼습니다. 잠시 후 다시 시도해 주세요.';
}
