import { createClient } from '@supabase/supabase-js';

// .env.local 에 넣어 둔 Supabase 접속 정보 (Vite는 VITE_ 로 시작하는 변수만 읽는다)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// 값이 비어 있으면 콘솔에 알려 준다
if (!supabaseUrl || !supabasePublishableKey) {
  console.error(
    'Supabase 환경변수가 비어 있습니다. .env.local 에 VITE_SUPABASE_URL 과 VITE_SUPABASE_PUBLISHABLE_KEY 를 넣고 개발 서버를 다시 시작하세요.'
  );
}

// 앱 전체에서 하나만 만들어 같이 쓰는 Supabase 연결
// 값이 비어 있으면 연결을 만들지 않고 null 로 둔다 (createClient 가 에러를 던지는 것을 막기 위해)
let supabase = null;
if (supabaseUrl && supabasePublishableKey) {
  supabase = createClient(supabaseUrl, supabasePublishableKey);
}

export { supabase };
