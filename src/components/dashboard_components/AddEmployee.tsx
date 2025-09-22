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
    manager_id: null,
    coach_id: null,
    status: "offline",
    tags: [],
  });

  const [isLoading, setIsLoading] = useState(false);
  const [tagInput, setTagInput] = useState("");

  // 🟢 FIXED: Department change is now ONLY for department/manager logic
  const handleDepartmentChange = (departmentId: string) => {
    console.log("🏢 Selected department ID:", departmentId);

    const selectedDepartment = departments.find(
      (dept) => dept._id === departmentId
    );

    console.log("🏢 Found department:", selectedDepartment);

    setNewEmployee((prev: any) => ({
      ...prev,
      department_id: departmentId,
      manager_id: selectedDepartment?.manager_id || null,
    }));

    console.log("👤 Auto-assigned manager ID:", selectedDepartment?.manager_id);
  };

  // 🟢 FIXED: Handle adding tags (moved outside department function)
  const handleAddTag = () => {
    const trimmed = tagInput.trim();
    if (!trimmed) return;
    if (newEmployee.tags.length >= 3) {
      alert("⚠️ You can only add up to 3 tags");
      return;
    }
    if (newEmployee.tags.includes(trimmed)) {
      alert("⚠️ Tag already added");
      return;
    }

    setNewEmployee((prev: any) => ({
      ...prev,
      tags: [...prev.tags, trimmed],
    }));
    setTagInput("");
  };

  // 🟢 FIXED: Handle removing tags
  const handleRemoveTag = (tagToRemove: string) => {
    setNewEmployee((prev: any) => ({
      ...prev,
      tags: prev.tags.filter((tag: string) => tag !== tagToRemove),
    }));
  };

  const handleAddEmployee = async () => {
    console.log("🚀 Starting handleAddEmployee");

    if (
      !newEmployee.full_name ||
      !newEmployee.work_email ||
      !newEmployee.department_id
    ) {
      alert("❌ Please fill in all required fields (Name, Email, Department)");
      return;
    }

    setIsLoading(true);

    try {
      console.log("📤 Sending employee data to backend:", newEmployee);

      const requestOptions = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(newEmployee),
      };

      const res = await fetch(
        "http://localhost:5000/api/employees",
        requestOptions
      );

      const responseText = await res.text();
      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch {
        throw new Error(`Invalid JSON response: ${responseText}`);
      }

      if (!res.ok) {
        throw new Error(
          responseData.error ||
            responseData.message ||
            `Server error: ${res.status}`
        );
      }

      alert("✅ Employee added successfully!");

      setNewEmployee({
        full_name: "",
        job_position: "",
        work_email: "",
        work_phone: "",
        work_mobile: "",
        company: "",
        department_id: "",
        manager_id: null,
        coach_id: null,
        status: "offline",
        tags: [],
      });
    } catch (err: any) {
      alert(`❌ Error adding employee: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6 shadow-md">
      <h3 className="text-xl font-semibold mb-4">➕ Add Employee</h3>
      <CardContent className="space-y-4">
        <Input
          value={newEmployee.full_name}
          placeholder="Full Name *"
          onChange={(e) =>
            setNewEmployee({ ...newEmployee, full_name: e.target.value })
          }
          disabled={isLoading}
        />
        <Input
          value={newEmployee.work_email}
          placeholder="Work Email *"
          type="email"
          onChange={(e) =>
            setNewEmployee({ ...newEmployee, work_email: e.target.value })
          }
          disabled={isLoading}
        />
        <Input
          value={newEmployee.work_phone}
          placeholder="Work Phone"
          onChange={(e) =>
            setNewEmployee({ ...newEmployee, work_phone: e.target.value })
          }
          disabled={isLoading}
        />
        <Input
          value={newEmployee.work_mobile}
          placeholder="Work Mobile"
          onChange={(e) =>
            setNewEmployee({ ...newEmployee, work_mobile: e.target.value })
          }
          disabled={isLoading}
        />
        <Input
          value={newEmployee.company}
          placeholder="Company"
          onChange={(e) =>
            setNewEmployee({ ...newEmployee, company: e.target.value })
          }
          disabled={isLoading}
        />
        <Input
          value={newEmployee.job_position}
          placeholder="Job Position"
          onChange={(e) =>
            setNewEmployee({ ...newEmployee, job_position: e.target.value })
          }
          disabled={isLoading}
        />

        {/* 🟢 FIXED: Tag input section */}
        <div>
          <div className="flex gap-2">
            <Input
              value={tagInput}
              placeholder="Add a tag (max 3)"
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddTag();
                }
              }}
              disabled={isLoading || newEmployee.tags.length >= 3}
            />
            <Button
              type="button"
              onClick={handleAddTag}
              disabled={isLoading || newEmployee.tags.length >= 3}
              className="bg-[#65435C] text-white hover:bg-[#54344c]"
            >
              Add
            </Button>
          </div>

          {/* Show tags as pills */}
          <div className="flex flex-wrap gap-2 mt-2">
            {newEmployee.tags.map((tag: string, index: number) => (
              <span
                key={index}
                className="px-3 py-1 rounded-full bg-[#65435C] text-white text-sm flex items-center gap-2"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-1 text-xs bg-white text-[#65435C] rounded-full px-1"
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Department Select */}
        <Select
          onValueChange={handleDepartmentChange}
          value={newEmployee.department_id}
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

        {newEmployee.manager_id && (
          <div className="p-2 bg-blue-50 rounded text-sm">
            👤 Manager ID: {newEmployee.manager_id}
          </div>
        )}

        <Button
          onClick={handleAddEmployee}
          className="bg-[#65435C] text-white hover:bg-[#54344c] w-full"
          disabled={isLoading}
        >
          {isLoading ? "Adding Employee..." : "Add Employee"}
        </Button>
      </CardContent>
    </Card>
  );
}
