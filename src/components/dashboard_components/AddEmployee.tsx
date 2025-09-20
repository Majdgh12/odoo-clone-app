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
    status: "offline"
  });

  const [isLoading, setIsLoading] = useState(false);

  // Handle department selection and auto-assign manager
  const handleDepartmentChange = (departmentId: string) => {
    console.log('🏢 Selected department ID:', departmentId);
    
    // Find the selected department
    const selectedDepartment = departments.find(dept => dept._id === departmentId);
    console.log('🏢 Found department:', selectedDepartment);
    
    // Update employee data with department and manager
    setNewEmployee(prev => ({
      ...prev,
      department_id: departmentId,
      manager_id: selectedDepartment?.manager_id || null // Auto-assign manager from department
    }));
    
    console.log('👤 Auto-assigned manager ID:', selectedDepartment?.manager_id);
  };

  const handleAddEmployee = async () => {
    console.log('🚀 Starting handleAddEmployee');
    
    // Basic validation
    if (!newEmployee.full_name || !newEmployee.work_email || !newEmployee.department_id) {
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
          "Accept": "application/json"
        },
        body: JSON.stringify(newEmployee),
      };
      
      console.log("📤 Request options:", requestOptions);
      
      const res = await fetch("http://localhost:5000/api/employees", requestOptions);

      console.log("📥 Response status:", res.status);
      console.log("📥 Response headers:", Object.fromEntries(res.headers.entries()));
      
      // Get response text first to see what we're receiving
      const responseText = await res.text();
      console.log("📥 Raw response text:", responseText);
      
      let responseData;
      try {
        responseData = JSON.parse(responseText);
        console.log("📥 Parsed response data:", responseData);
      } catch (parseErr) {
        console.error("❌ JSON parse error:", parseErr);
        throw new Error(`Invalid JSON response: ${responseText}`);
      }

      if (!res.ok) {
        console.error("❌ Server error response:", responseData);
        throw new Error(responseData.error || responseData.message || `Server error: ${res.status}`);
      }

      alert("✅ Employee added successfully!");
      console.log("✅ New employee created:", responseData.employee);

      // Reset form
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
        status: "offline"
      });
      
    } catch (err: any) {
      console.error("❌ AddEmployee error:", err);
      console.error("❌ Error stack:", err.stack);
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

        {/* Show selected manager info */}
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