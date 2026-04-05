/**
 * HTTP 클라이언트 단일 진입점 — 인터셉터에서 요청/응답 로그 및 Bearer 토큰 부착
 */
import axios from 'axios';
import { getAuthToken, maskToken } from './authTokenStore';

const axiosLib = axios.create();

function summarizeData(data) {
  if (data == null) return null;
  if (typeof data === 'string') return { type: 'string', length: data.length };
  if (typeof data === 'object' && !Array.isArray(data)) {
    return { type: 'object', keys: Object.keys(data).slice(0, 12) };
  }
  if (Array.isArray(data)) return { type: 'array', length: data.length };
  return { type: typeof data };
}

axiosLib.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const method = (config.method || 'get').toUpperCase();
    const url = config.url || '';
    console.log('[HTTP 요청]', {
      method,
      url,
      baseURL: config.baseURL || '(없음)',
      params: config.params ?? null,
      token: maskToken(token),
      authorizationAttached: Boolean(token),
    });
    return config;
  },
  (error) => {
    console.log('[HTTP 요청 오류]', error?.message || error);
    return Promise.reject(error);
  },
);

axiosLib.interceptors.response.use(
  (response) => {
    const { status, statusText, config, data } = response;
    console.log('[HTTP 응답]', {
      status,
      statusText,
      url: config?.url,
      method: (config?.method || 'get').toUpperCase(),
      data: summarizeData(data),
    });
    return response;
  },
  (error) => {
    const res = error.response;
    if (res) {
      console.log('[HTTP 응답 실패]', {
        status: res.status,
        statusText: res.statusText,
        url: res.config?.url,
        method: (res.config?.method || 'get').toUpperCase(),
        data: summarizeData(res.data),
      });
    } else {
      console.log('[HTTP 네트워크/기타 오류]', error?.message || error);
    }
    return Promise.reject(error);
  },
);

export default axiosLib;
export { axiosLib };
