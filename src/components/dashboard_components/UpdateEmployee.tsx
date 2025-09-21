"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

interface UpdateEmployeeProps {
  employeeId: string; // ID of the employee/admin to update
  departments: any[];
  employees: any[];
}

export default function UpdateEmployee({ employeeId, departments }: UpdateEmployeeProps) {
  const [employee, setEmployee] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch employee data on mount
  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        console.log(`📥 Fetching employee ${employeeId}`);
        const res = await fetch(`http://localhost:5000/api/employees/${employeeId}`);
        if (!res.ok) throw new Error("❌ Failed to fetch employee data");
        const data = await res.json();
        console.log("📥 Loaded employee:", data);
        setEmployee(data);
      } catch (err) {
        console.error("❌ Error fetching employee:", err);
        alert("❌ Failed to load employee details");
      }
    };
    fetchEmployee();
  }, [employeeId]);

  // Handle department change (auto-assign manager)
  const handleDepartmentChange = (departmentId: string) => {
    const selectedDepartment = departments.find((dept) => dept._id === departmentId);
    setEmployee((prev: any) => ({
      ...prev,
      department_id: departmentId,
      manager_id: selectedDepartment?.manager_id || null,
    }));
  };

  // Handle update
  const handleUpdateEmployee = async () => {
    if (!employee.full_name || !employee.work_email || !employee.department_id) {
      alert("❌ Please fill in all required fields (Name, Email, Department)");
      return;
    }

    setIsLoading(true);
    try {
      console.log("📤 Sending updated employee data:", employee);

      const res = await fetch(`http://localhost:5000/api/employees/${employeeId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(employee),
      });

      const responseText = await res.text();
      console.log("📥 Raw response:", responseText);

      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch {
        throw new Error(`Invalid JSON response: ${responseText}`);
      }

      if (!res.ok) {
        throw new Error(responseData.error || responseData.message || `Server error: ${res.status}`);
      }

      alert("✅ Employee updated successfully!");
      console.log("✅ Updated employee:", responseData.employee);
    } catch (err: any) {
      console.error("❌ UpdateEmployee error:", err);
      alert(`❌ Error updating employee: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (!employee) {
    return (
      <Card className="p-6 shadow-md">
        <h3 className="text-xl font-semibold">Loading employee...</h3>
      </Card>
    );
  }

  return (
    <Card className="p-6 shadow-md">
      <h3 className="text-xl font-semibold mb-4">✏️ Update Employee</h3>
      <CardContent className="space-y-4">
        <Input
          value={employee.full_name}
          placeholder="Full Name *"
          onChange={(e) => setEmployee({ ...employee, full_name: e.target.value })}
          disabled={isLoading}
        />
        <Input
          value={employee.work_email}
          placeholder="Work Email *"
          type="email"
          onChange={(e) => setEmployee({ ...employee, work_email: e.target.value })}
          disabled={isLoading}
        />
        <Input
          value={employee.work_phone}
          placeholder="Work Phone"
          onChange={(e) => setEmployee({ ...employee, work_phone: e.target.value })}
          disabled={isLoading}
        />
        <Input
          value={employee.work_mobile}
          placeholder="Work Mobile"
          onChange={(e) => setEmployee({ ...employee, work_mobile: e.target.value })}
          disabled={isLoading}
        />
        <Input
          value={employee.company}
          placeholder="Company"
          onChange={(e) => setEmployee({ ...employee, company: e.target.value })}
          disabled={isLoading}
        />
        <Input
          value={employee.job_position}
          placeholder="Job Position"
          onChange={(e) => setEmployee({ ...employee, job_position: e.target.value })}
          disabled={isLoading}
        />

        {/* Department Select */}
        <Select
          onValueChange={handleDepartmentChange}
          value={employee.department_id}
          disabled={isLoading}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select Department *" />
          </SelectTrigger>
          <SelectContent>
            {departments.map((d) => (
              <SelectItem key={d._id} value={d._id}>
                {d.name} {d.manager_id && `(Manager: ${d.manager_id})`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Show selected manager */}
        {employee.manager_id && (
          <div className="p-2 bg-blue-50 rounded text-sm">
            👤 Manager ID: {employee.manager_id}
          </div>
        )}

        <Button
          onClick={handleUpdateEmployee}
          className="bg-[#65435C] text-white hover:bg-[#54344c] w-full"
          disabled={isLoading}
        >
          {isLoading ? "Updating Employee..." : "Update Employee"}
        </Button>
      </CardContent>
    </Card>
  );
}
