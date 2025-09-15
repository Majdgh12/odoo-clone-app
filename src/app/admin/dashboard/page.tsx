"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode"; // <-- correct named import

interface JwtPayload {
  role: string;
  userId: string;
  departmentId?: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      setError("No token found. Please login.");
      setLoading(false);
      return;
    }

    try {
      // Decode token
      const decoded = jwtDecode<JwtPayload>(token);

      // Check role
      if (decoded.role !== "admin") {
        setError("You are not authorized to access this page.");
        setLoading(false);
        return;
      }

      // Admin → allow access
      setLoading(false);
    } catch (err) {
      setError("Invalid token. Please login again.");
      setLoading(false);
    }
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      <p>Welcome, Admin! You have access to this page.</p>
    </div>
  );
}
