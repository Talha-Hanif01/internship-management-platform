"use client";

import { useEffect, useState } from "react";
import { getMyInterns } from "@/services/mentor.service"; // New service for mentor
import { Table, Spin } from "antd";

/**
 * Mentor Dashboard
 * ----------------
 * Displays a list of interns assigned to the logged-in mentor
 * Only accessible by users with the MENTOR role
 */
export default function MentorDashboard() {
  const [interns, setInterns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInterns = async () => {
      try {
        const data = await getMyInterns(); // Call backend API
        setInterns(data); // Save interns to state
      } catch (err) {
        console.error("Failed to fetch interns for mentor", err);
      } finally {
        setLoading(false);
      }
    };

    fetchInterns();
  }, []);

  const columns = [
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Role", dataIndex: "role", key: "role" },
  ];

  if (loading) return <Spin />;

  return <Table dataSource={interns} columns={columns} rowKey="id" />;
}
