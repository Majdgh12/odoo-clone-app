"use client";
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface AssignManagerProps {
  departments: any[];
}

export default function AssignManager({ departments }: AssignManagerProps) {
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [employees, setEmployees] = useState<any[]>([]);
  const [selectedManager, setSelectedManager] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ Fetch employees when department changes
  useEffect(() => {
    if (!selectedDepartment) return;

    const fetchEmployees = async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/api/departments/${selectedDepartment}/employees`
        );
        if (!res.ok) throw new Error("Failed to fetch employees");
        const data = await res.json();
        setEmployees(data);
      } catch (err) {
        console.error(err);
        setEmployees([]);
      }
    };

    fetchEmployees();
  }, [selectedDepartment]);

  const handleAssign = async () => {
    if (!selectedDepartment || !selectedManager) {
      alert("⚠️ Please select both department and manager");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(
        `http://localhost:5000/api/departments/${selectedDepartment}/assign-manager`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ manager_id: selectedManager }),
        }
      );

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to assign manager");
      }

      const data = await res.json();
      alert(`✅ ${data.message || "Manager assigned successfully"}`);

      // Reset
      setSelectedDepartment("");
      setSelectedManager("");
      setEmployees([]);
    } catch (err: any) {
      alert(`❌ Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 shadow-md">
      <h3 className="text-xl font-semibold mb-4">👑 Assign Manager</h3>
      <CardContent className="space-y-4">
        {/* Department Select */}
        <Select
          value={selectedDepartment}
          onValueChange={setSelectedDepartment}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select Department" />
          </SelectTrigger>
          <SelectContent>
            {departments.map((d) => (
              <SelectItem key={d._id} value={d._id}>
                {d.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Employee Select (dynamic) */}
        <Select
          value={selectedManager}
          onValueChange={setSelectedManager}
          disabled={!employees.length}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select Manager" />
          </SelectTrigger>
          <SelectContent>
            {employees.map((emp) => (
              <SelectItem key={emp._id} value={emp._id}>
                {emp.full_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Button */}
        <Button
          onClick={handleAssign}
          disabled={loading}
          className="bg-[#65435C] text-white hover:bg-[#54344c] w-full"
        >
          {loading ? "Assigning..." : "Assign Manager"}
        </Button>
      </CardContent>
    </Card>
  );
}
