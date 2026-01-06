import api from "@/lib/api";

// Fetch all interns + their mentors
export async function getInterns() {
  const res = await api.get("/users/hr/interns"); // new backend endpoint
  return res.data;
}
