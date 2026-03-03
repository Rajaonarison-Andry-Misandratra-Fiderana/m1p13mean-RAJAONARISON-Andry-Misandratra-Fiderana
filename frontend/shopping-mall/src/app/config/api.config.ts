declare global {
  interface Window {
    __SHOPPING_MALL_API_URL__?: string;
  }
}

const PLACEHOLDER = '__API_BASE_URL__';

const runtimeApiBaseUrl =
  typeof window !== 'undefined' ? window.__SHOPPING_MALL_API_URL__?.trim() : undefined;

export const API_BASE_URL =
  runtimeApiBaseUrl && runtimeApiBaseUrl !== PLACEHOLDER ? runtimeApiBaseUrl : '/api';
