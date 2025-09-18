"use client";

import { useState } from "react";
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

interface AddEmployeeProps {
  departments: any[];
  employees: any[];
}

export default function AddEmployee({ departments }: AddEmployeeProps) {
  const [newEmployee, setNewEmployee] = useState<any>({
    full_name: "",
    job_position: "",
    work_email: "",
    work_phone: "",
    work_mobile: "",
    company: "",
    department_id: "",
    manager_id: "",
    coach_id: "",
  });

  const handleAddEmployee = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newEmployee), 
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to add employee");
      }

      const data = await res.json();
      alert("✅ Employee added successfully!");
      console.log("New employee:", data);

      // reset form
      setNewEmployee({
        full_name: "",
        job_position: "",
        work_email: "",
        work_phone: "",
        work_mobile: "",
        company: "",
        department_id: "",
        manager_id: "",
        coach_id: "",
      });
    } catch (err: any) {
      alert("❌ Error adding employee: " + err.message);
      console.error(err);
    }
  };

  return (
    <Card className="p-6 shadow-md">
      <h3 className="text-xl font-semibold mb-4">➕ Add Employee</h3>
      <CardContent className="space-y-4">
        <Input
          value={newEmployee.full_name}
          placeholder="Full Name"
          onChange={(e) => setNewEmployee({ ...newEmployee, full_name: e.target.value })}
        />
        <Input
          value={newEmployee.work_email}
          placeholder="Work Email"
          onChange={(e) => setNewEmployee({ ...newEmployee, work_email: e.target.value })}
        />
        <Input
          value={newEmployee.work_phone}
          placeholder="Work Phone"
          onChange={(e) => setNewEmployee({ ...newEmployee, work_phone: e.target.value })}
        />
        <Input
          value={newEmployee.work_mobile}
          placeholder="Work Mobile"
          onChange={(e) => setNewEmployee({ ...newEmployee, work_mobile: e.target.value })}
        />
        <Input
          value={newEmployee.company}
          placeholder="Company"
          onChange={(e) => setNewEmployee({ ...newEmployee, company: e.target.value })}
        />
        <Input
          value={newEmployee.job_position}
          placeholder="Job Position"
          onChange={(e) => setNewEmployee({ ...newEmployee, job_position: e.target.value })}
        />

        {/* Department Select */}
        <Select
          onValueChange={(value) => setNewEmployee({ ...newEmployee, department_id: value })}
          value={newEmployee.department_id}
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

        <Button
          onClick={handleAddEmployee}
          className="bg-[#65435C] text-white hover:bg-[#54344c] w-full"
        >
          Add Employee
        </Button>
      </CardContent>
    </Card>
  );
}
