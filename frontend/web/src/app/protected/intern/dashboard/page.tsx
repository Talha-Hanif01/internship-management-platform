"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth.context";
import { Card, Spin } from "antd";

/**
 * Intern Dashboard
 * ----------------
 * Displays logged-in intern's info
 * and assigned mentor details.
 */
export default function InternDashboard() {
  const { user, loading } = useAuth();
  const [mentor, setMentor] = useState<any>(null);

  useEffect(() => {
    if (!loading && user) {
      // Get assigned mentor from user object
      setMentor(user.mentor || null);
    }
  }, [user, loading]);

  if (loading) return <Spin />;

  if (!user) return <p>No user data found.</p>;

  return (
    <div style={{ padding: 24 }}>
      <Card title="Your Profile" style={{ marginBottom: 16 }}>
        <p>
          <strong>Email:</strong> {user.email}
        </p>
        <p>
          <strong>Role:</strong> {user.role}
        </p>
      </Card>

      {mentor && (
        <Card title="Your Mentor">
          <p>
            <strong>Email:</strong> {mentor.email}
          </p>
          <p>
            <strong>Role:</strong> {mentor.role}
          </p>
        </Card>
      )}
    </div>
  );
}
