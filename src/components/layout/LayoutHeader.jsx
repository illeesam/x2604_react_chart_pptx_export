import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROUTE_PATHS } from '../../routes/routePaths';
import { navMenuItems } from '../../routes/routeConfig';

/** 상단 고정 헤더 — 로고, 메인 메뉴, 로그인/사용자 영역 */
export default function LayoutHeader() {
  const { user, logout } = useAuth();

  return (
    <nav style={navStyle}>
      <div style={navInner}>
        <div style={navLeft}>
          <Link to={ROUTE_PATHS.BASE_MAIN} style={navLogoLink}>
            <span style={navLogo}>📊 ReportHub</span>
          </Link>
          <div style={navMenu}>
            {navMenuItems.map(({ path, label }) => (
              <NavLink
                key={path}
                to={path}
                style={({ isActive }) => ({
                  ...navLinkBase,
                  ...(isActive ? navLinkActive : {}),
                })}
              >
                {label}
              </NavLink>
            ))}
          </div>
        </div>

        <div style={navRightArea}>
          {user ? (
            <div style={userBar}>
              <span style={userText}>
                <span style={userName}>{user.name}</span>
                <span style={userEmail}>{user.email}</span>
              </span>
              <button type="button" style={btnLogout} onClick={logout}>
                로그아웃
              </button>
            </div>
          ) : (
            <Link
              to={ROUTE_PATHS.BASE_LOGIN}
              style={loginIconBtn}
              title="로그인"
              aria-label="로그인"
            >
              <LoginIcon />
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

function LoginIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm0 2c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5Z"
        fill="currentColor"
      />
    </svg>
  );
}

const navStyle = {
  background: 'linear-gradient(135deg, #1e293b, #334155)',
  boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
  position: 'sticky',
  top: 0,
  zIndex: 100,
};

const navInner = {
  maxWidth: 1100,
  margin: '0 auto',
  padding: '12px 24px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: 16,
};

const navLeft = {
  display: 'flex',
  alignItems: 'center',
  gap: 28,
  flexWrap: 'wrap',
  minWidth: 0,
};

const navMenu = {
  display: 'flex',
  alignItems: 'center',
  gap: 4,
};

const navLinkBase = {
  padding: '8px 14px',
  borderRadius: 8,
  fontSize: 14,
  fontWeight: 600,
  color: '#94a3b8',
  textDecoration: 'none',
  transition: 'background 0.15s, color 0.15s',
};

const navLinkActive = {
  background: 'rgba(255,255,255,0.12)',
  color: '#fff',
};

const navLogoLink = {
  textDecoration: 'none',
  color: 'inherit',
  flexShrink: 0,
};

const navLogo = { color: '#fff', fontSize: 20, fontWeight: 800, letterSpacing: '-0.5px' };

const navRightArea = {
  display: 'flex',
  alignItems: 'center',
  flexShrink: 0,
};

const loginIconBtn = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 42,
  height: 42,
  borderRadius: '50%',
  background: 'rgba(255,255,255,0.1)',
  color: '#e2e8f0',
  border: '1px solid rgba(255,255,255,0.2)',
  textDecoration: 'none',
  transition: 'background 0.15s',
};

const userBar = {
  display: 'flex',
  alignItems: 'center',
  gap: 12,
};

const userText = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-end',
  gap: 2,
};

const userName = { fontSize: 13, fontWeight: 700, color: '#fff' };
const userEmail = { fontSize: 11, color: '#94a3b8' };

const btnLogout = {
  padding: '6px 12px',
  borderRadius: 6,
  border: '1px solid rgba(255,255,255,0.35)',
  background: 'rgba(255,255,255,0.08)',
  color: '#fff',
  fontSize: 12,
  fontWeight: 600,
  cursor: 'pointer',
};
