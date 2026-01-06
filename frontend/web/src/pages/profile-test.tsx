import { useAuth } from "@/context/auth.context";

export default function ProfileTest() {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h1>Profile Test</h1>

      {isAuthenticated ? (
        <>
          <p>Email: {user?.email}</p>
          <p>Role: {user?.role}</p>
        </>
      ) : (
        <p>Not logged in</p>
      )}
    </div>
  );
}
