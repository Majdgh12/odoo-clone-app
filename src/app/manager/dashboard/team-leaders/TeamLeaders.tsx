"use client";

// src/components/TeamLeaders.tsx
import { useState, useEffect } from "react";
import { Employee } from "@/lib/types";

interface TeamLeadersProps {
  employees: string[]; // Array of employee names
  removeEmployee: (employeeName: string) => void; // Function to remove employee
}

const TeamLeaders = ({ employees, removeEmployee }: TeamLeadersProps) => {
  const [teamLeaderData, setTeamLeaderData] = useState<Employee[]>([]);

  // Fetch employee data and filter based on submitted names
  useEffect(() => {
    console.log("Received employees:", employees); // Debug prop
    const fetchEmployeeData = async () => {
      if (!employees || employees.length === 0) {
        console.log("No employees to fetch, setting empty data");
        setTeamLeaderData([]);
        return;
      }
      try {
        const response = await fetch(`http://localhost:5000/api/employees`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const allEmployees = await response.json();
        console.log("All employees from API:", allEmployees); // Debug all data
        const validEmployees = allEmployees
          .filter((emp: any) => emp && emp.user && emp.user.general_info && emp.user.general_info.full_name)
          .filter((emp: any) => employees.includes(emp.user.general_info.full_name)) // Filter by submitted names
          .map((emp: any) => ({
            id: emp._id?.toString() || "",
            _id: emp._id,
            user: {
              general_info: {
                full_name: emp.user.general_info.full_name || "",
                job_position: emp.user.general_info.job_position || "",
                work_email: emp.user.general_info.work_email || "",
                work_phone: emp.user.general_info.work_phone || "",
                work_mobile: emp.user.general_info.work_mobile || "",
                tags: emp.user.general_info.tags || [],
                company: emp.user.general_info.company || "",
                department: emp.user.general_info.department || "",
                manager: emp.user.general_info.manager || undefined,
                coach: emp.user.general_info.coach || undefined,
                image: emp.user.general_info.image || "",
                status: emp.user.general_info.status || "offline",
              },
            },
          })) as Employee[];
        console.log("Filtered team leader data:", validEmployees); // Debug filtered data
        setTeamLeaderData(validEmployees);
      } catch (err) {
        console.error("Error fetching team leader data:", err);
        setTeamLeaderData([]);
      }
    };

    fetchEmployeeData();
  }, [employees]);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-[#65435c] mb-4">Team Leaders</h2>
      {teamLeaderData.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {teamLeaderData.map((emp) => (
            <div
              key={emp.id}
              className="bg-white p-4 rounded-lg shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-200"
            >
              <img
                src={emp.user?.general_info?.image || "https://via.placeholder.com/150"}
                alt={emp.user?.general_info?.full_name || "Employee"}
                className="w-24 h-24 rounded-full mx-auto mb-2"
              />
              <h3 className="text-lg font-semibold text-[#65435c] text-center">
                {emp.user?.general_info?.full_name || "Unknown"}
              </h3>
              <p className="text-gray-600 text-center">
                {emp.user?.general_info?.job_position || "—"}
              </p>
              <p className="text-gray-500 text-center">
                {emp.user?.general_info?.work_email || "—"}
              </p>
              <div className="flex justify-center mt-2">
                <button
                  onClick={() => removeEmployee(emp.user?.general_info?.full_name || "")}
                  className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">No team leaders submitted yet or data fetch failed.</p>
      )}
    </div>
  );
};

export default TeamLeaders;