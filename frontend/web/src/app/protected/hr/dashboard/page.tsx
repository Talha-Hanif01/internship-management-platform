"use client";

import { useEffect, useState } from "react";
import { getInterns } from "@/services/hr.service"; // Service to fetch interns from backend
import { Table, Spin } from "antd"; // Ant Design components

/**
 * HR Dashboard
 * -------------
 * Displays a list of all interns in a table
 * Shows assigned mentor for each intern
 * Only accessible by users with the HR role
 */
export default function HrDashboard() {
  // -----------------------------
  // State
  // -----------------------------
  const [interns, setInterns] = useState([]); // Store interns fetched from backend
  const [loading, setLoading] = useState(true); // Loading indicator for async API call

  // -----------------------------
  // Fetch interns on component mount
  // -----------------------------
  useEffect(() => {
    const fetchInterns = async () => {
      try {
        // Call backend API to get all interns with mentor info
        const data = await getInterns();
        setInterns(data); // Save interns data to state
      } catch (err) {
        console.error("Failed to fetch interns", err);
      } finally {
        setLoading(false); // Stop loading spinner regardless of success/failure
      }
    };

    fetchInterns();
  }, []); // Empty dependency array → runs only once when component mounts

  // -----------------------------
  // Table Columns for Ant Design
  // -----------------------------
  const columns = [
    {
      title: "Name", // Column header
      dataIndex: "name", // Field from the data
      key: "name", // Unique key for React
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
    },
    {
      title: "Assigned Mentor", // New column to display mentor email
      dataIndex: ["mentor", "email"], // Access nested field: mentor.email
      key: "mentor",
      render: (text: string) => text || "Not assigned", // If no mentor, show "Not assigned"
    },
  ];

  // -----------------------------
  // Show loading spinner while fetching data
  // -----------------------------
  if (loading) return <Spin />;

  // -----------------------------
  // Render the table with fetched interns
  // -----------------------------
  return (
    <Table
      dataSource={interns} // Data for the table
      columns={columns} // Column definitions
      rowKey="id" // Unique key for each row (important for React)
    />
  );
}
