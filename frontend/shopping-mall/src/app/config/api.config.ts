const globalApiBaseUrl = (globalThis as { __SHOPPING_MALL_API_URL__?: string })
  .__SHOPPING_MALL_API_URL__;

const localStorageApiBaseUrl =
  globalThis.localStorage?.getItem('shoppingMallApiBaseUrl') || undefined;

export const API_BASE_URL = (globalApiBaseUrl || localStorageApiBaseUrl || '/api').replace(
  /\/+$/,
  '',
);
