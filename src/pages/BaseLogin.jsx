import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  DEFAULT_LOGIN_ID,
  DEFAULT_LOGIN_PASSWORD,
} from '../auth/authDefaults';
import { ROUTE_PATHS } from '../routes/routePaths';

// 로그인 — 기본 계정(demo / demo1234)으로 데모 인증
export default function BaseLogin() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const fromPath = location.state?.from?.pathname;
  const [id, setId] = useState(DEFAULT_LOGIN_ID);
  const [password, setPassword] = useState(DEFAULT_LOGIN_PASSWORD);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      navigate(fromPath || ROUTE_PATHS.BASE_MAIN, { replace: true });
    }
  }, [user, navigate, fromPath]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (login(id.trim(), password)) {
      navigate(fromPath || ROUTE_PATHS.BASE_MAIN, { replace: true });
      return;
    }
    setError('아이디 또는 비밀번호가 올바르지 않습니다.');
  };

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-6">
      <div className="w-full max-w-[400px] rounded-xl border border-slate-200 bg-white p-7 pb-5 shadow-lg">
        <h1 className="mb-2 text-[22px] font-extrabold text-slate-800">로그인</h1>
        <p className="mb-5 text-[13px] text-slate-500">
          데모 계정:{' '}
          <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">{DEFAULT_LOGIN_ID}</code>{' '}
          /{' '}
          <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">{DEFAULT_LOGIN_PASSWORD}</code>
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          <label className="flex flex-col gap-1.5 text-[13px] font-semibold text-slate-600">
            아이디
            <input
              className="rounded-lg border border-slate-300 px-3 py-2.5 text-[15px]"
              value={id}
              onChange={(e) => setId(e.target.value)}
              autoComplete="username"
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
            />
          </label>
          {error ? <p className="m-0 text-[13px] text-red-700">{error}</p> : null}
          <button
            type="submit"
            className="mt-1 cursor-pointer rounded-lg bg-blue-500 px-4 py-3 text-[15px] font-bold text-white"
          >
            로그인
          </button>
        </form>

        <Link to={ROUTE_PATHS.BASE_MAIN} className="mt-4 inline-block text-[13px] text-blue-500">
          ← 메인으로
        </Link>
      </div>
    </div>
  );
}
