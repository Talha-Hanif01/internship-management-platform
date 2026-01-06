// ACCESS TOKEN
export const getAccessToken = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("accessToken");
};

export const setAccessToken = (token: string) => {
  localStorage.setItem("accessToken", token);
};

export const clearTokens = () => {
  localStorage.removeItem("accessToken");
};
