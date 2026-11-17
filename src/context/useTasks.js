import { createContext, useContext } from 'react';

// 할 일 상태 공유를 위한 React Context
// (빠른 새로고침 규칙 때문에 컴포넌트 파일(TaskContext.jsx)과 분리했습니다)
export const TaskContext = createContext(null);

// 편의를 위한 Custom Hook
export function useTasks() {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
}
