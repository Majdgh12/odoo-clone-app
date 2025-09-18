"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface DepartmentsProps {
  departments: any[];
  setDepartments: (departments: any[]) => void;
}

export default function Departments({
  departments,
  setDepartments,
}: DepartmentsProps) {
  const [newDepartmentName, setNewDepartmentName] = useState("");
  const [newDepartmentCompany, setNewDepartmentCompany] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ Add Department (calls backend API)
  const handleAddDepartment = async () => {
    if (!newDepartmentName || !newDepartmentCompany) {
      alert("⚠️ Please enter department name and company");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("http://localhost:5000/api/departments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newDepartmentName,
          company: newDepartmentCompany,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to create department");
      }

      const created = await res.json();
      setDepartments([...departments, created]);
      setNewDepartmentName("");
      setNewDepartmentCompany("");
      alert("✅ Department added successfully");
    } catch (err: any) {
      alert(`❌ Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Delete Department (calls backend API)
  const handleDeleteDepartment = async (id: string) => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/departments/${id}`,
        { method: "DELETE" }
      );

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to delete department");
      }

      setDepartments(departments.filter((d) => d._id !== id));
      alert("🗑️ Department deleted");
    } catch (err: any) {
      alert(`❌ Error: ${err.message}`);
    }
  };

  return (
    <Card className="p-6 shadow-md">
      <h3 className="text-xl font-semibold mb-4">🏢 Departments</h3>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Department Name"
            value={newDepartmentName}
            onChange={(e) => setNewDepartmentName(e.target.value)}
          />
          <Input
            placeholder="Company"
            value={newDepartmentCompany}
            onChange={(e) => setNewDepartmentCompany(e.target.value)}
          />
        </div>

        <Button
          onClick={handleAddDepartment}
          disabled={loading}
          className="bg-[#65435C] text-white hover:bg-[#54344c] w-full mt-2"
        >
          {loading ? "Adding..." : "Add Department"}
        </Button>

        <ul className="space-y-2 mt-4">
          {departments.map((d) => (
            <li
              key={d._id}
              className="flex justify-between items-center bg-gray-100 px-4 py-2 rounded"
            >
              <span>
                {d.name} ({d.company})
              </span>
              <Button
                size="sm"
                variant="outline"
                className="text-red-600 hover:text-red-800"
                onClick={() => handleDeleteDepartment(d._id)}
              >
                Delete
              </Button>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
