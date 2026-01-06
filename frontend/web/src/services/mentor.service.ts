import api from "@/lib/api";

/**
 * Fetch interns assigned to logged-in mentor
 */
export async function getMyInterns() {
  const res = await api.get("/users/my-interns"); // Backend endpoint
  return res.data;
}
