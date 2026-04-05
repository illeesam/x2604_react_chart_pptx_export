import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROUTE_PATHS } from '../../routes/routePaths';
import { navMenuItems } from '../../routes/routeConfig';

/** 상단 고정 헤더 — 로고, 메인 메뉴, 로그인/사용자 영역 */
export default function LayoutHeader() {
  const { user, logout } = useAuth();

  return (
    <nav className="sticky top-0 z-[100] bg-gradient-to-br from-slate-800 to-slate-700 shadow-md">
      <div className="mx-auto flex max-w-[1100px] items-center justify-between gap-4 px-6 py-3">
        <div className="flex min-w-0 flex-wrap items-center gap-7">
          <Link
            to={ROUTE_PATHS.BASE_MAIN}
            className="shrink-0 text-inherit no-underline"
          >
            <span className="text-xl font-extrabold tracking-tight text-white">
              📊 ReportHub
            </span>
          </Link>
          <div className="flex items-center gap-1">
            {navMenuItems.map(({ path, label }) => (
              <NavLink
                key={path}
                to={path}
                className={({ isActive }) =>
                  [
                    'rounded-lg px-3.5 py-2 text-sm font-semibold no-underline transition-colors',
                    isActive
                      ? 'bg-white/10 text-white'
                      : 'text-slate-400 hover:bg-white/5 hover:text-white',
                  ].join(' ')
                }
              >
                {label}
              </NavLink>
            ))}
          </div>
        </div>

        <div className="flex shrink-0 items-center">
          {user ? (
            <div className="flex items-center gap-3">
              <span className="flex flex-col items-end gap-0.5">
                <span className="text-[13px] font-bold text-white">{user.name}</span>
                <span className="text-[11px] text-slate-400">{user.email}</span>
              </span>
              <button
                type="button"
                className="cursor-pointer rounded-md border border-white/35 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white"
                onClick={logout}
              >
                로그아웃
              </button>
            </div>
          ) : (
            <Link
              to={ROUTE_PATHS.BASE_LOGIN}
              className="flex h-[42px] w-[42px] items-center justify-center rounded-full border border-white/20 bg-white/10 text-slate-200 no-underline transition-colors hover:bg-white/15"
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
