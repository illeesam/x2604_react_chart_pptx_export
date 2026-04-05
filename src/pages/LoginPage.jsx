import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  DEFAULT_LOGIN_ID,
  DEFAULT_LOGIN_PASSWORD,
} from '../auth/authDefaults';
import { ROUTE_PATHS } from '../routes/routePaths';

// 로그인 — 기본 계정(demo / demo1234)으로 데모 인증
export default function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const fromPath = location.state?.from?.pathname;
  const [id, setId] = useState(DEFAULT_LOGIN_ID);
  const [password, setPassword] = useState(DEFAULT_LOGIN_PASSWORD);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      navigate(fromPath || ROUTE_PATHS.MAIN, { replace: true });
    }
  }, [user, navigate, fromPath]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (login(id.trim(), password)) {
      navigate(fromPath || ROUTE_PATHS.MAIN, { replace: true });
      return;
    }
    setError('아이디 또는 비밀번호가 올바르지 않습니다.');
  };

  return (
    <div style={s.wrap}>
      <div style={s.card}>
        <h1 style={s.title}>로그인</h1>
        <p style={s.hint}>
          데모 계정: <code style={s.code}>{DEFAULT_LOGIN_ID}</code> /{' '}
          <code style={s.code}>{DEFAULT_LOGIN_PASSWORD}</code>
        </p>

        <form onSubmit={handleSubmit} style={s.form}>
          <label style={s.label}>
            아이디
            <input
              style={s.input}
              value={id}
              onChange={(e) => setId(e.target.value)}
              autoComplete="username"
            />
          </label>
          <label style={s.label}>
            비밀번호
            <input
              style={s.input}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </label>
          {error ? <p style={s.error}>{error}</p> : null}
          <button type="submit" style={s.submit}>
            로그인
          </button>
        </form>

        <Link to={ROUTE_PATHS.MAIN} style={s.back}>
          ← 메인으로
        </Link>
      </div>
    </div>
  );
}

const s = {
  wrap: {
    minHeight: '60vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    background: '#fff',
    borderRadius: 12,
    padding: '28px 28px 20px',
    boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
    border: '1px solid #e2e8f0',
  },
  title: { margin: '0 0 8px', fontSize: 22, fontWeight: 800, color: '#1e293b' },
  hint: { margin: '0 0 20px', fontSize: 13, color: '#64748b' },
  code: {
    background: '#f1f5f9',
    padding: '2px 6px',
    borderRadius: 4,
    fontSize: 12,
  },
  form: { display: 'flex', flexDirection: 'column', gap: 14 },
  label: { display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, fontWeight: 600, color: '#475569' },
  input: {
    padding: '10px 12px',
    borderRadius: 8,
    border: '1px solid #cbd5e1',
    fontSize: 15,
  },
  error: { margin: 0, fontSize: 13, color: '#b91c1c' },
  submit: {
    marginTop: 4,
    padding: '12px 16px',
    border: 'none',
    borderRadius: 8,
    background: '#3b82f6',
    color: '#fff',
    fontSize: 15,
    fontWeight: 700,
    cursor: 'pointer',
  },
  back: { display: 'inline-block', marginTop: 18, fontSize: 13, color: '#3b82f6' },
};
