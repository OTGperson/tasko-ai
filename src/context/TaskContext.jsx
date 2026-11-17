import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase.js';
import { useAuth } from './useAuth.js';
import { TaskContext } from './useTasks.js';

// 날짜 문자열(2026-11-17T...)을 화면에서 쓰던 '2026.11.17' 모양으로 바꾼다
function formatCreatedAt(value) {
  const date = new Date(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return year + '.' + month + '.' + day;
}

// [변환 1] 테이블 한 행(DB 열 이름) → 화면에서 쓰는 할 일 모양
function rowToTask(row) {
  let dueDate = '마감일 없음';
  if (row.due_date) {
    dueDate = row.due_date;
  }
  return {
    id: row.id,
    title: row.title,
    tag: row.category,
    priority: row.priority,
    completed: row.is_done,
    starred: row.is_starred,
    dueDate: dueDate,
    isOverdue: false,
    createdAt: formatCreatedAt(row.created_at),
  };
}

// [변환 2] 화면에서 쓰는 할 일 → 테이블에 넣을 행 (user_id는 DB가 자동으로 채운다)
function taskToRow(task) {
  return {
    title: task.title,
    category: task.tag,
    priority: task.priority,
    // 마감 날짜 계산은 다음 단계에서 하므로 지금은 비워 둔다
    due_date: null,
    is_done: false,
    is_starred: Boolean(task.starred),
  };
}

export function TaskProvider({ children }) {
  const { user, loading: authLoading } = useAuth();
  // Supabase에서 읽어 온 할 일 목록 (처음에는 비어 있다)
  const [tasks, setTasks] = useState([]);
  // 목록을 불러오는 중인지, 불러오기에 실패했는지
  const [isFetching, setIsFetching] = useState(true);
  const [loadError, setLoadError] = useState('');

  // 로그인한 사용자가 정해지면 tasks 테이블에서 목록을 읽어 온다
  useEffect(function loadTasks() {
    if (authLoading) {
      return undefined;
    }
    let cancelled = false;
    async function fetchTasks() {
      // 로그인 사용자가 없거나 연결이 없으면 빈 목록으로 둔다 (다른 사람의 목록이 남지 않게)
      if (!user || !supabase) {
        setTasks([]);
        setIsFetching(false);
        return;
      }
      setIsFetching(true);
      setLoadError('');
      setTasks([]);
      const result = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });
      if (cancelled) {
        return;
      }
      if (result.error) {
        setLoadError('할 일을 불러오지 못했습니다: ' + result.error.message);
        setTasks([]);
      } else {
        setTasks(result.data.map(rowToTask));
      }
      setIsFetching(false);
    }
    fetchTasks();

    // 화면이 바뀌거나 사용자가 바뀌면 이전 요청의 결과는 버린다
    return function stopLoading() {
      cancelled = true;
    };
  }, [user, authLoading]);

  // 인증 확인 중이거나 목록을 읽는 중이면 "불러오는 중"
  const isLoading = authLoading || isFetching;

  // 할 일 완료 상태 토글 함수
  const toggleTask = (id) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  // 할 일 추가 함수
  // (마감일 입력값은 지금은 저장하지 않는다)
  async function addTask({ title, priority = 'medium', tag = '#생활', starred = false }) {
    if (!supabase) {
      window.alert('Supabase 연결 정보가 없습니다. .env.local 을 확인해 주세요.');
      return null;
    }
    const row = taskToRow({ title, priority, tag, starred });
    const result = await supabase.from('tasks').insert(row).select().single();
    if (result.error) {
      window.alert('할 일을 저장하지 못했습니다: ' + result.error.message);
      return null;
    }
    // 저장된 행을 화면용으로 바꿔 목록 맨 앞에 넣는다
    const newTask = rowToTask(result.data);
    setTasks((prev) => [newTask, ...prev]);
    return newTask;
  }

  // 할 일 수정 함수
  const updateTask = (id, updatedFields) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === id ? { ...task, ...updatedFields } : task
      )
    );
  };

  // 할 일 삭제 함수
  const deleteTask = (id) => {
    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== id));
  };

  // 통계 계산: 8개 할 일을 기준으로 계산
  const totalCount = tasks.length;
  const completedCount = tasks.filter((t) => t.completed).length;
  const inProgressCount = totalCount - completedCount;
  const starredCount = tasks.filter((t) => t.starred).length;
  const percentage = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  // 카테고리별 통계 계산 (#생활, #건강, #공부 등)
  const categories = ['#생활', '#건강', '#공부'];
  const categoryStats = categories.map((cat) => {
    const catTasks = tasks.filter((t) => t.tag === cat);
    const catTotal = catTasks.length;
    const catCompleted = catTasks.filter((t) => t.completed).length;
    const catPercentage = catTotal === 0 ? 0 : Math.round((catCompleted / catTotal) * 100);
    return {
      name: cat,
      total: catTotal,
      completed: catCompleted,
      percentage: catPercentage,
    };
  });

  return (
    <TaskContext.Provider
      value={{
        tasks,
        isLoading,
        loadError,
        toggleTask,
        addTask,
        updateTask,
        deleteTask,
        totalCount,
        completedCount,
        inProgressCount,
        starredCount,
        percentage,
        categoryStats,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
}
