"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import AddEmployee from "../../../components/dashboard_components/AddEmployee";
import Departments from "../../../components/dashboard_components/Departements";
import AssignManager from "../../../components/dashboard_components/AssignManager";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function Page() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [selectedMenu, setSelectedMenu] = useState<"employees" | "departments" | "assign-manager">("employees");
  const [departments, setDepartments] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);

  // Check session & role
  useEffect(() => {
    if (status === "loading") return; // wait for session

    if (!session) {
      alert("You must be logged in to access the admin page."); // show alert
      router.push("/"); // redirect if not logged in
      return;
    }

    if (session.user?.role !== "admin") {
      alert("You are not authorized to access the admin page."); // show alert
      router.push("/home"); // redirect to home page
      return;
    }

    setLoading(false); // session valid & admin
  }, [session, status, router]);

  // Fetch employees & departments
  useEffect(() => {
    if (!loading) {
      fetch("/api/departments").then(res => res.json()).then(setDepartments);
      fetch("/api/employees").then(res => res.json()).then(setEmployees);
    }
  }, [loading]);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md p-4 space-y-6">
        <h2 className="font-bold text-lg">Admin Dashboard</h2>
        <nav className="space-y-3">
          <Button variant="outline" className="w-full justify-start" onClick={() => setSelectedMenu("employees")}>
            Add Employee
          </Button>
          <Button variant="outline" className="w-full justify-start" onClick={() => setSelectedMenu("departments")}>
            Departments
          </Button>
          <Button variant="outline" className="w-full justify-start" onClick={() => setSelectedMenu("assign-manager")}>
            Assign Manager
          </Button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-y-auto space-y-6">
        {selectedMenu === "employees" && <AddEmployee employees={employees} departments={departments} />}
        {selectedMenu === "departments" && <Departments  departments={departments} setDepartments={setDepartments} />}
        {selectedMenu === "assign-manager" && <AssignManager employees={employees} departments={departments} />}
      </main>
    </div>
  );
}
