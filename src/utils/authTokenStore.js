/**
 * API용 Bearer 토큰 — localStorage 영속 + 메모리(axios 인터셉터가 즉시 참조)
 * AuthContext 와 동기화; 이 모듈만 axiosLib 가 import (순환 참조 방지)
 */
export const AUTH_TOKEN_STORAGE_KEY = 'reporthub_auth_token';

let memoryToken = null;

/** 임의 토큰 (로그인 성공 시 발급) */
export function generateAuthToken() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `rh_${crypto.randomUUID()}`;
  }
  return `rh_${Date.now()}_${Math.random().toString(36).slice(2, 12)}`;
}

export function getAuthToken() {
  if (memoryToken != null && memoryToken !== '') return memoryToken;
  try {
    return localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

/** localStorage 기준으로 메모리 토큰 맞춤 (외부에서 LS 삭제·변경 후 호출) */
export function syncMemoryTokenFromStorage() {
  try {
    memoryToken = localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
  } catch {
    memoryToken = null;
  }
  return memoryToken;
}

/** 메모리 + localStorage 동시 설정 (null 이면 삭제) */
export function setAuthTokenPersisted(token) {
  memoryToken = token || null;
  try {
    if (token) localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
    else localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export function readTokenFromLocalStorage() {
  try {
    return localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function clearAuthTokenPersisted() {
  memoryToken = null;
  try {
    localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

/** 로그용: 토큰 마스킹 */
export function maskToken(token) {
  if (!token || typeof token !== 'string') return '(없음)';
  if (token.length <= 8) return '****';
  return `${token.slice(0, 4)}…${token.slice(-4)}`;
}
