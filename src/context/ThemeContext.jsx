import React, { useState, useEffect } from 'react';
import { ThemeContext } from './useTheme.js';

// 브라우저에 모드를 저장할 때 쓰는 이름
const STORAGE_KEY = 'tasko-theme';

// 처음 열 때 어떤 모드로 시작할지 정한다
// 1) 저장된 값이 있으면 그것을 쓴다  2) 없으면 기기(시스템) 설정을 따른다
function getInitialTheme() {
  let saved = null;
  try {
    saved = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    // 저장소를 쓸 수 없는 환경이면 저장값 없이 진행한다
    saved = null;
  }
  if (saved === 'dark' || saved === 'light') {
    return saved;
  }
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  if (prefersDark) {
    return 'dark';
  }
  return 'light';
}

/**
 * 라이트/다크 모드 제공자
 * - theme: 'light' | 'dark'
 * - toggleTheme: 모드를 서로 바꾸는 함수
 * - 모드가 바뀔 때마다 <html>의 dark 클래스를 켜고 끄고, 값을 localStorage에 저장한다
 */
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme);

  // 모드가 바뀌면 화면(html 태그)과 저장소에 반영
  useEffect(
    function applyTheme() {
      const root = document.documentElement;
      if (theme === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
      try {
        window.localStorage.setItem(STORAGE_KEY, theme);
      } catch {
        // 저장에 실패해도 화면은 그대로 동작한다
      }
    },
    [theme]
  );

  // 라이트 ↔ 다크 전환
  function toggleTheme() {
    if (theme === 'dark') {
      setTheme('light');
    } else {
      setTheme('dark');
    }
  }

  const value = { theme, toggleTheme };
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
