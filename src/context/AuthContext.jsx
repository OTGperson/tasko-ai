import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase.js';
import { AuthContext } from './useAuth.js';

const NO_CONNECTION_MESSAGE = 'Supabase 연결 정보가 없습니다. .env.local 을 확인해 주세요.';

/**
 * 로그인 상태(user)와 로그인·회원가입·로그아웃 함수를 앱 전체에 제공한다.
 * - loading: 처음에 저장된 로그인 정보를 확인하는 동안 true
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // 연결이 없으면 확인할 저장된 로그인이 없으므로 처음부터 false 로 둔다
  const [loading, setLoading] = useState(supabase !== null);

  useEffect(function watchSession() {
    if (!supabase) {
      return undefined;
    }

    // 새로고침해도 로그인이 유지되도록 저장된 세션을 읽는다
    supabase.auth.getSession().then(function handleSession(result) {
      let session = result.data.session;
      if (session) {
        setUser(session.user);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    // 로그인·로그아웃이 일어날 때마다 user를 갱신한다
    const listener = supabase.auth.onAuthStateChange(function handleChange(event, session) {
      if (session) {
        setUser(session.user);
      } else {
        setUser(null);
      }
    });

    return function stopWatching() {
      listener.data.subscription.unsubscribe();
    };
  }, []);

  // 이메일·비밀번호로 로그인. 실패하면 error 를 돌려준다
  async function signIn(email, password) {
    if (!supabase) {
      return { error: { message: NO_CONNECTION_MESSAGE } };
    }
    const result = await supabase.auth.signInWithPassword({ email, password });
    return { error: result.error };
  }

  // 이메일·비밀번호로 회원가입. 실패하면 error 를 돌려준다
  async function signUp(email, password) {
    if (!supabase) {
      return { error: { message: NO_CONNECTION_MESSAGE } };
    }
    const result = await supabase.auth.signUp({ email, password });
    // session 이 없으면 Supabase 에서 이메일 확인이 켜져 있다는 뜻이다
    let session = null;
    if (result.data) {
      session = result.data.session;
    }
    return { error: result.error, session };
  }

  // 로그아웃
  async function signOut() {
    if (!supabase) {
      return { error: null };
    }
    const result = await supabase.auth.signOut();
    return { error: result.error };
  }

  const value = { user, loading, signIn, signUp, signOut };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
