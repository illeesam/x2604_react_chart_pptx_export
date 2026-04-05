import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROUTE_PATHS } from '../routes/routePaths';

/** 로그인 페이지 — `baseLoginData.json` 사용자로 검증, 성공 시 이전 경로 또는 메인으로 이동 */
export default function BaseLogin() {
  const { user, login, authReady, formHints } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const fromPath = location.state?.from?.pathname; // PrivateRoute 가 넘긴 redirect 출발지
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(''); // 제출 실패 메시지

  // ── 이미 로그인된 경우 리다이렉트 ──
  useEffect(() => {
    if (user) {
      navigate(fromPath || ROUTE_PATHS.BASE_MAIN, { replace: true });
    }
  }, [user, navigate, fromPath]);

  // ── 서버 힌트로 폼 기본값 채움 ──
  useEffect(() => {
    if (authReady) {
      setId(formHints.defaultId);
      setPassword(formHints.defaultPassword);
    }
  }, [authReady, formHints.defaultId, formHints.defaultPassword]);

  /** 폼 제출 — `login()` 성공 시 navigate */
  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!authReady) return;
    if (login(id.trim(), password)) {
      navigate(fromPath || ROUTE_PATHS.BASE_MAIN, { replace: true });
      return;
    }
    setError('아이디 또는 비밀번호가 올바르지 않습니다.');
  };

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-6">
      {/* ── 로그인 카드 ── */}
      <div className="w-full max-w-[400px] rounded-xl border border-slate-200 bg-white p-7 pb-5 shadow-lg">
        <h1 className="mb-2 text-[22px] font-extrabold text-slate-800">로그인</h1>
        <p className="mb-5 text-[13px] text-slate-500">
          데모 계정:{' '}
          <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">{formHints.defaultId}</code>{' '}
          /{' '}
          <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">{formHints.defaultPassword}</code>
          <span className="block pt-1 text-[11px] text-slate-400">계정 정보는 /api/baseLoginData.json 에서 불러옵니다.</span>
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          <label className="flex flex-col gap-1.5 text-[13px] font-semibold text-slate-600">
            아이디
            <input
              className="rounded-lg border border-slate-300 px-3 py-2.5 text-[15px]"
              value={id}
              onChange={(e) => setId(e.target.value)}
              autoComplete="username"
              disabled={!authReady}
            />
          </label>
          <label className="flex flex-col gap-1.5 text-[13px] font-semibold text-slate-600">
            비밀번호
            <input
              className="rounded-lg border border-slate-300 px-3 py-2.5 text-[15px]"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              disabled={!authReady}
            />
          </label>
          {error ? <p className="m-0 text-[13px] text-red-700">{error}</p> : null}
          <button
            type="submit"
            className="mt-1 cursor-pointer rounded-lg bg-blue-500 px-4 py-3 text-[15px] font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!authReady}
          >
            {authReady ? '로그인' : '인증 정보 로딩…'}
          </button>
        </form>

        <Link to={ROUTE_PATHS.BASE_MAIN} className="mt-4 inline-block text-[13px] text-blue-500">
          ← 메인으로
        </Link>
      </div>
    </div>
  );
}
