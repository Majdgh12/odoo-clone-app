// UpdateEmployee.tsx
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
import UpdatePrivateInfoTab from "@/components/UpdateComponents/privateInfo";


interface UpdateEmployeeProps {
  employeeId: string; // Selected employee ID from home page
  departments: any[];
}

export default function UpdateEmployee({ employeeId, departments }: UpdateEmployeeProps) {
  const [employee, setEmployee] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // --- Fetch selected employee and map backend data to flat structure ---
  useEffect(() => {
    const fetchEmployee = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`http://localhost:5000/api/employees/${employeeId}`);
        if (!res.ok) throw new Error("Failed to fetch employee");
        const data = await res.json();

        // Flatten backend structure for easier input binding
        const flatEmployee = {
          _id: data._id,
          full_name: data.user?.general_info?.full_name || "",
          work_email: data.user?.general_info?.work_email || "",
          work_phone: data.user?.general_info?.work_phone || "",
          work_mobile: data.user?.general_info?.work_mobile || "",
          company: data.user?.general_info?.company || "",
          job_position: data.user?.general_info?.job_position || "",
          tags: data.user?.general_info?.tags || [],
          department_id: data.user?.general_info?.department?._id || "",
          manager_id: data.user?.general_info?.manager?._id || "",
          coach_id: data.user?.general_info?.coach?._id || "",
          status: data.user?.general_info?.status || "offline",
        };

        setEmployee(flatEmployee);
      } catch (err) {
        console.error(err);
        alert("Failed to load employee details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchEmployee();
  }, [employeeId]);

  // --- Update local state on input change ---
  const handleChange = (field: string, value: any) => {
    setEmployee((prev: any) => ({ ...prev, [field]: value }));
  };

  // --- Handle update employee API call ---
  const handleUpdateEmployee = async () => {
    if (!employee?.full_name || !employee?.work_email) {
      alert("Please fill in all required fields");
      return;
    }

    setIsLoading(true);

    try {
      // --- Construct payload according to backend API ---
      const payload = {
        user: {
          general_info: {
            full_name: employee.full_name,
            work_email: employee.work_email,
            work_phone: employee.work_phone,
            work_mobile: employee.work_mobile,
            company: employee.company,
            job_position: employee.job_position,
            tags: employee.tags,
            department_id: employee.department_id,
            manager_id: employee.manager_id,
            coach_id: employee.coach_id,
            status: employee.status || "offline",
          },
        },
      };

      const res = await fetch(`http://localhost:5000/api/employees/${employee._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const resJson = await res.json();

      // --- Show server error if update fails ---
      console.log(resJson);
      if (!res.ok) throw new Error(resJson?.error || "Update failed");

      alert("Employee updated successfully!");
    } catch (err: any) {
      console.error(err);
      alert("Error updating employee: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!employee) return <p>Loading employee details...</p>;

  return (
    <div className="space-y-6">
      <Card className="p-6 shadow-md">
        <h3 className="text-xl font-semibold mb-4">✏️ Update Employee</h3>
        <CardContent className="space-y-4">
          <Input
            value={employee.full_name}
            placeholder="Full Name *"
            onChange={(e) => handleChange("full_name", e.target.value)}
            disabled={isLoading}
          />
          <Input
            value={employee.work_email}
            placeholder="Work Email *"
            type="email"
            onChange={(e) => handleChange("work_email", e.target.value)}
            disabled={isLoading}
          />
          <Input
            value={employee.work_phone}
            placeholder="Work Phone"
            onChange={(e) => handleChange("work_phone", e.target.value)}
            disabled={isLoading}
          />
          <Input
            value={employee.work_mobile}
            placeholder="Work Mobile"
            onChange={(e) => handleChange("work_mobile", e.target.value)}
            disabled={isLoading}
          />
          <Input
            value={employee.company}
            placeholder="Company"
            onChange={(e) => handleChange("company", e.target.value)}
            disabled={isLoading}
          />
          <Input
            value={employee.job_position}
            placeholder="Job Position"
            onChange={(e) => handleChange("job_position", e.target.value)}
            disabled={isLoading}
          />
          <Input
            value={employee.tags.join(", ")}
            placeholder="Tags (comma separated)"
            onChange={(e) =>
              handleChange(
                "tags",
                e.target.value.split(",").map((t) => t.trim())
              )
            }
            disabled={isLoading}
          />

          {/* Department Select */}
          <Select
            value={employee.department_id}
            onValueChange={(val) => handleChange("department_id", val)}
            disabled={isLoading}
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

          {/* Manager / Coach display */}
          <Input
            value={employee.manager_id || "—"}
            placeholder="Manager"
            disabled
          />
          <Input
            value={employee.coach_id || "—"}
            placeholder="Coach"
            disabled
          />

          <Button
            onClick={handleUpdateEmployee}
            className="bg-[#65435C] text-white hover:bg-[#54344c] w-full"
            disabled={isLoading}
          >
            {isLoading ? "Updating Employee..." : "Update Employee"}
          </Button>
        </CardContent>
      </Card>
      {employee && (
        <UpdatePrivateInfoTab
          employeeId={employee._id}
          apiBaseUrl="http://localhost:5000/api"
        />
      )}

    </div>
  );
}
