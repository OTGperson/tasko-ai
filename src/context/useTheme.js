import { createContext, useContext } from 'react';

// 라이트/다크 모드 상태 공유를 위한 React Context
// (빠른 새로고침 규칙 때문에 컴포넌트 파일(ThemeContext.jsx)과 분리했습니다)
export const ThemeContext = createContext(null);

// 편의를 위한 Custom Hook
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
