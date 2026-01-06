import api from "@/lib/api";

// LOGIN API
export async function login(email: string, password: string) {
  const res = await api.post("/auth/login", {
    email,
    password,
  });

  const { accessToken } = res.data;

  // Store access token
  localStorage.setItem("accessToken", accessToken);

  return res.data;
}

// LOGOUT API
export const logout = async () => {
  await api.post("/auth/logout");
};

export async function refreshToken() {
  const res = await api.post("/auth/refresh");
  return res.data;
}
