"use client";

import React, { useState, useEffect } from "react";
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

interface DepartmentsProps {
  departments?: any[]; // optional initial list
  setDepartments?: (departments: any[]) => void; // optional parent updater
  isModal?: boolean;
  onClose?: () => void;
}

export default function Departments({
  departments: initialDepartments = [],
  setDepartments,
  isModal = false,
  onClose,
}: DepartmentsProps) {
  const [departments, setDepartmentsLocal] = useState<any[]>(initialDepartments);
  const [employeesWithoutDept, setEmployeesWithoutDept] = useState<any[]>([]);
  const [newDepartmentName, setNewDepartmentName] = useState("");
  const [newDepartmentCompany, setNewDepartmentCompany] = useState("");
  const [selectedManagerId, setSelectedManagerId] = useState<string>("");
  const [loading, setLoading] = useState(false);

  // ---------- Helpers ----------
  const getEmployeeDisplayName = (emp: any) => {
    // Prefer full_name, then nested user.general_info.full_name, then email, then id
    return (
      emp.full_name ||
      emp.name ||
      emp.user?.general_info?.full_name ||
      emp.work_email ||
      emp.email ||
      emp._id ||
      emp.id ||
      "Unknown"
    );
  };

  // Robust check: return true if employee has a department (various shapes)
  const employeeHasDepartment = (emp: any) => {
    const dept =
      emp.department_id ?? emp.department ?? emp.user?.general_info?.department;

    if (dept === null || dept === undefined) return false;
    if (typeof dept === "string") {
      const s = dept.trim().toLowerCase();
      if (s === "" || s === "null" || s === "undefined") return false;
      return true;
    }
    if (typeof dept === "object") {
      // object might be { _id: "...", name: "Sales" } or empty object
      if (dept._id || dept.name) return true;
      return false;
    }
    // other truthy values -> treat as has department
    return Boolean(dept);
  };

  // ---------- Fetch departments (if parent didn't supply) ----------
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/departments");
        if (!res.ok) throw new Error("Failed to fetch departments");
        const data = await res.json();
        setDepartmentsLocal(data || []);
        if (setDepartments) setDepartments(data || []);
      } catch (err) {
        console.error("Error fetching departments:", err);
        setDepartmentsLocal([]);
      }
    };

    if (!initialDepartments || initialDepartments.length === 0) {
      fetchDepartments();
    }
  }, [initialDepartments, setDepartments]);

  // ---------- Fetch employees with NO department (candidates for manager) ----------
  useEffect(() => {
    const fetchEmployeesNoDept = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/employees");
        if (!res.ok) throw new Error("Failed to fetch employees");
        const data = await res.json();
        console.log("DEBUG: fetched employees payload:", data);

        const noDept = (data || []).filter((e: any) => !employeeHasDepartment(e));
        console.log("DEBUG: employees WITHOUT department:", noDept);
        setEmployeesWithoutDept(noDept);
      } catch (err) {
        console.error("Failed to fetch employees for manager select:", err);
        setEmployeesWithoutDept([]);
      }
    };

    fetchEmployeesNoDept();
  }, []); // run once on mount

  // ---------- Create Department and optionally assign manager ----------
  const handleAddDepartment = async () => {
    if (!newDepartmentName || !newDepartmentCompany) {
      alert("⚠️ Please enter department name and company");
      return;
    }

    setLoading(true);
    try {
      console.log("Creating department:", {
        name: newDepartmentName,
        company: newDepartmentCompany,
        manager_id: selectedManagerId || null,
      });

      // 1) create department
      const res = await fetch("http://localhost:5000/api/departments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newDepartmentName,
          company: newDepartmentCompany,
        }),
      });

      const created = await res.json();
      if (!res.ok) {
        throw new Error(created?.message || created?.error || "Failed to create department");
      }

      console.log("Department created:", created);

      // 2) If manager chosen: assign manager to department and update employee record
      if (selectedManagerId) {
        try {
          // assign-manager update on department
          const assignRes = await fetch(
            `http://localhost:5000/api/departments/${created._id}/assign-manager`,
            {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ manager_id: selectedManagerId }),
            }
          );

          const assignData = await assignRes.json();
          if (!assignRes.ok) {
            console.warn("assign-manager failed:", assignData);
          } else {
            console.log("assign-manager response:", assignData);
          }

          // update the employee document to set department_id
          const updateEmpRes = await fetch(`http://localhost:5000/api/employees/${selectedManagerId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ department_id: created._id }),
          });

          const updateEmpData = await updateEmpRes.json();
          if (!updateEmpRes.ok) {
            console.warn("Failed to set employee.department_id:", updateEmpData);
          } else {
            console.log("Updated employee with new department:", updateEmpData);
          }
        } catch (err) {
          console.error("Error while assigning manager or updating employee:", err);
        }
      }

      // 3) refresh departments list locally & parent
      const refreshedRes = await fetch("http://localhost:5000/api/departments");
      const refreshed = refreshedRes.ok ? await refreshedRes.json() : [...departments, created];
      setDepartmentsLocal(refreshed);
      if (setDepartments) setDepartments(refreshed);

      alert("✅ Department added successfully");

      // reset form
      setNewDepartmentName("");
      setNewDepartmentCompany("");
      setSelectedManagerId("");

      if (isModal && onClose) onClose();
    } catch (err: any) {
      console.error("Error in handleAddDepartment:", err);
      alert(`❌ Error: ${err.message || err}`);
    } finally {
      setLoading(false);
    }
  };

  // ---------- UI ----------
  const content = (
    <Card className="p-6 shadow-md max-w-xl">
      <h3 className="text-xl font-semibold mb-4">🏢 Create Department</h3>

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

        <div>
          <label className="block text-sm mb-1 font-medium">
            Assign Manager (optional) — only employees without a department
          </label>
          <Select value={selectedManagerId} onValueChange={(v) => setSelectedManagerId(v)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Choose manager (optional)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem >No manager</SelectItem>
              {employeesWithoutDept.map((emp) => {
                const id = emp._id || emp.id;
                return (
                  <SelectItem key={id} value={id}>
                    {getEmployeeDisplayName(emp)}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
          <p className="text-xs text-gray-500 mt-1">
            Manager candidate list shows employees that have no department assigned.
          </p>
        </div>

        <div className="flex gap-2">
          <Button onClick={handleAddDepartment} className="bg-[#65435C] text-white w-full" disabled={loading}>
            {loading ? "Creating..." : "Create Department"}
          </Button>
          {isModal && (
            <Button variant="ghost" onClick={onClose} className="w-full">
              Cancel
            </Button>
          )}
        </div>

        <hr className="my-2" />

        <h4 className="font-semibold">All departments</h4>
        <ul className="space-y-2 max-h-48 overflow-auto mt-2">
          {departments.map((d) => (
            <li key={d._id} className="bg-gray-100 px-3 py-1 rounded">
              {d.name} {d.company ? `(${d.company})` : ""}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/40" onClick={onClose} />
        <div className="relative z-10">{content}</div>
      </div>
    );
  }

  return content;
}
