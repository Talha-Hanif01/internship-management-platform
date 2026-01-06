/**
 * In-memory access token
 * - Cleared on refresh failure or logout
 * - Safer than localStorage for short-lived tokens
 */

let accessToken: string | null = null;

export const setAccessToken = (token: string) => {
  accessToken = token;
};

export const getAccessToken = () => accessToken;

export const clearAuth = () => {
  accessToken = null;
  localStorage.removeItem("refreshToken");
};
