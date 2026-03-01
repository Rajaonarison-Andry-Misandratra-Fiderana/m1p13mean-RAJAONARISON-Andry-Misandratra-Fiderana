const globalApiBaseUrl = (globalThis as { __SHOPPING_MALL_API_URL__?: string }).__SHOPPING_MALL_API_URL__;
const localStorageApiBaseUrl = globalThis.localStorage?.getItem('shoppingMallApiBaseUrl') || undefined;

// Default local backend URL. Can be overridden at runtime by setting
// `window.__SHOPPING_MALL_API_URL__ = "https://your-api-domain/api"`.
// You can also set `localStorage.shoppingMallApiBaseUrl`.
export const API_BASE_URL = (
  globalApiBaseUrl ||
  localStorageApiBaseUrl ||
  'http://localhost:5000/api'
).replace(/\/+$/, '');
