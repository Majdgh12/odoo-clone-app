"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import AddEmployee from "../../../components/dashboard_components/AddEmployee";
import Departments from "../../../components/dashboard_components/Departements";
import AssignManager from "../../../components/dashboard_components/AssignManager";
import UpdateEmployee from "../../../components/dashboard_components/UpdateEmployee";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Home } from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

export default function Page() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [selectedMenu, setSelectedMenu] = useState<
    "employees" | "departments" | "assign-manager" | "update-employee"
  >("employees");

  const [departments, setDepartments] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);

  // ✅ Check session & role
  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      alert("You must be logged in to access the admin page.");
      router.push("/");
      return;
    }

    if (session.user?.role !== "admin") {
      alert("You are not authorized to access the admin page.");
      router.push("/home");
      return;
    }

    setLoading(false);
  }, [session, status, router]);

  // ✅ Fetch employees & departments
  useEffect(() => {
    if (!loading) {
      fetch("http://localhost:5000/api/departments")
        .then((res) => res.json())
        .then(setDepartments);

      fetch("http://localhost:5000/api/employees")
        .then((res) => res.json())
        .then(setEmployees);
    }
  }, [loading]);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md p-4 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-lg">Admin Dashboard</h2>
          <button
            onClick={() => router.push("/home")}
            className="p-2 rounded-md hover:bg-gray-100 text-gray-600"
          >
            <Home className="w-5 h-5" />
          </button>
        </div>

        <nav className="space-y-3">
          <Button
            variant="outline"
            className={`w-full justify-start ${selectedMenu === "employees" ? "bg-[#65435C] text-white" : ""
              }`}
            onClick={() => setSelectedMenu("employees")}
          >
            Add Employee
          </Button>
          <Button
            variant="outline"
            className={`w-full justify-start ${selectedMenu === "departments" ? "bg-[#65435C] text-white" : ""
              }`}
            onClick={() => setSelectedMenu("departments")}

          >
            Departments
          </Button>
          <Button
            variant="outline"
            className={`w-full justify-start ${selectedMenu === "assign-manager" ? "bg-[#65435C] text-white" : ""
              }`}
            onClick={() => setSelectedMenu("assign-manager")}
          >
            Assign Manager
          </Button>
          <Button
            variant="outline"
            className={`w-full justify-start ${selectedMenu === "update-employee" ? "bg-[#65435C] text-white" : ""
              }`}
            onClick={() => setSelectedMenu("update-employee")}
          >
            Update Employee
          </Button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-y-auto space-y-6">
        {selectedMenu === "employees" && (
          <AddEmployee employees={employees} departments={departments} />
        )}

        {selectedMenu === "departments" && (
          <Departments departments={departments} setDepartments={setDepartments} />
        )}

        {selectedMenu === "assign-manager" && (
          <AssignManager employees={employees} departments={departments} />
        )}

        {selectedMenu === "update-employee" && (
          <div className="space-y-4">
            {/* Select Employee */}
            <Select
              value={selectedEmployeeId || ""}
              onValueChange={(val) => setSelectedEmployeeId(val)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Employee to Update" />
              </SelectTrigger>
              <SelectContent>
                {employees.map((e) => (
                  <SelectItem key={e._id} value={e._id}>
                    {e.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Render UpdateEmployee only if an employee is selected */}
            {selectedEmployeeId && (
              <UpdateEmployee
                employeeId={selectedEmployeeId}
                employees={employees}
                departments={departments}
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
}
