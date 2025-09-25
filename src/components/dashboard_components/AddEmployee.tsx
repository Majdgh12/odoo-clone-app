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
import { useSession } from "next-auth/react";

interface AddEmployeeProps {
  departments?: any[]; // optional: if not passed, component will fetch
  onSuccess?: (createdEmployee?: any) => void;
  onClose?: () => void;
  prefill?: Partial<any>;
}

export default function AddEmployee({
  departments: initialDepartments,
  onSuccess,
  onClose,
  prefill,
}: AddEmployeeProps) {
  const { data: session } = useSession();
  // default to empty array so .map won't crash
  const [departments, setDepartments] = useState<any[]>(
    initialDepartments ?? []
  );

  const [newEmployee, setNewEmployee] = useState<any>({
    full_name: "",
    job_position: "",
    work_email: "",
    work_phone: "",
    work_mobile: "",
    company: "",
    department_id: "", // empty string means "no department"
    manager_id: null,
    coach_id: null,
    status: "offline",
    tags: [],
    ...prefill,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [tagInput, setTagInput] = useState("");

  useEffect(() => {
    // fetch departments only if parent didn't supply them
    if (!initialDepartments) {
      fetch("http://localhost:5000/api/departments")
        .then((r) => {
          if (!r.ok) throw new Error("Failed to fetch departments");
          return r.json();
        })
        .then((data) => {
          setDepartments(data || []);
        })
        .catch((err) => {
          console.error("Failed to fetch departments", err);
          setDepartments([]);
        });
    }
  }, [initialDepartments]);

  // when user picks department in the select
  const handleDepartmentChange = (departmentId: string) => {
    // empty string => no department
    const selected =
      departments && departments.find((d) => d._id === departmentId);

    setNewEmployee((prev: any) => ({
      ...prev,
      // store null when nothing selected
      department_id: departmentId ? departmentId : "",
      // manager_id from department if exists, otherwise leave null
      manager_id: selected?.manager_id ?? null,
    }));
  };

  const handleAddTag = () => {
    const trimmed = tagInput.trim();
    if (!trimmed) return;
    if (newEmployee.tags.length >= 3) {
      alert("You can only add up to 3 tags");
      return;
    }
    if (newEmployee.tags.includes(trimmed)) {
      alert("Tag already added");
      return;
    }
    setNewEmployee((prev: any) => ({ ...prev, tags: [...prev.tags, trimmed] }));
    setTagInput("");
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setNewEmployee((prev: any) => ({
      ...prev,
      tags: prev.tags.filter((t: string) => t !== tagToRemove),
    }));
  };

  const handleAddEmployee = async () => {
    // department optional now → only fullname & email required
    if (!newEmployee.full_name || !newEmployee.work_email) {
      alert("Please fill in required fields: name and email");
      return;
    }

    setIsLoading(true);

    try {
      // prepare headers (include token if available)
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      const accessToken = (session as any)?.accessToken;
      if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;

      // ensure we send null for department if not chosen
      const payload = {
        ...newEmployee,
        department_id: newEmployee.department_id ? newEmployee.department_id : null,
        manager_id: newEmployee.manager_id || null,
      };

      console.log("🚀 AddEmployee payload:", payload);

      const res = await fetch("http://localhost:5000/api/employees", {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });

      const text = await res.text();
      let data: any = {};
      try {
        data = JSON.parse(text);
      } catch {
        data = { raw: text };
      }

      if (!res.ok) {
        const msg = data?.message || data?.error || `Server error: ${res.status}`;
        throw new Error(msg);
      }

      console.log("✅ AddEmployee response:", data);
      alert("Employee added successfully");

      if (onSuccess) onSuccess(data);
      if (onClose) onClose();

      // reset
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
      console.error("AddEmployee error:", err);
      alert("Error adding employee: " + (err.message || err));
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
          onChange={(e) => setNewEmployee({ ...newEmployee, full_name: e.target.value })}
          disabled={isLoading}
        />
        <Input
          value={newEmployee.work_email}
          placeholder="Work Email *"
          type="email"
          onChange={(e) => setNewEmployee({ ...newEmployee, work_email: e.target.value })}
          disabled={isLoading}
        />
        <Input
          value={newEmployee.work_phone}
          placeholder="Work Phone"
          onChange={(e) => setNewEmployee({ ...newEmployee, work_phone: e.target.value })}
          disabled={isLoading}
        />
        <Input
          value={newEmployee.work_mobile}
          placeholder="Work Mobile"
          onChange={(e) => setNewEmployee({ ...newEmployee, work_mobile: e.target.value })}
          disabled={isLoading}
        />
        <Input
          value={newEmployee.company}
          placeholder="Company"
          onChange={(e) => setNewEmployee({ ...newEmployee, company: e.target.value })}
          disabled={isLoading}
        />
        <Input
          value={newEmployee.job_position}
          placeholder="Job Position"
          onChange={(e) => setNewEmployee({ ...newEmployee, job_position: e.target.value })}
          disabled={isLoading}
        />

        {/* Tags */}
        <div>
          <div className="flex gap-2">
            <Input
              value={tagInput}
              placeholder="Add a tag (max 3)"
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())}
              disabled={isLoading || newEmployee.tags.length >= 3}
            />
            <Button
              type="button"
              onClick={handleAddTag}
              disabled={isLoading || newEmployee.tags.length >= 3}
              className="bg-[#65435C] text-white"
            >
              Add
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {newEmployee.tags.map((tag: string, idx: number) => (
              <span
                key={idx}
                className="px-3 py-1 rounded-full bg-[#65435C] text-white text-sm flex items-center gap-2"
              >
                {tag}
                <button type="button" onClick={() => handleRemoveTag(tag)} className="ml-1 text-xs bg-white text-[#65435C] rounded-full px-1">
                  ✕
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Department Select (optional) */}
        <Select onValueChange={handleDepartmentChange} value={newEmployee.department_id ?? ""}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select Department (optional)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem >No department</SelectItem>
            {departments.map((d) => (
              <SelectItem key={d._id} value={d._id}>
                {d.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {newEmployee.manager_id && (
          <div className="p-2 bg-blue-50 rounded text-sm">👤 Manager ID: {newEmployee.manager_id}</div>
        )}

        <div className="flex gap-2">
          <Button onClick={handleAddEmployee} className="bg-[#65435C] text-white w-full" disabled={isLoading}>
            {isLoading ? "Adding..." : "Add Employee"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
