"use client";

// src/components/Overview.tsx
import { useEffect, useState } from "react";
import { Employee } from "@/lib/types";

// Mock API functions with error handling
const getDepartments = async () => {
  try {
    const res = await fetch("http://localhost:5000/api/departments?manager=true", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();
    console.log("Departments data:", data);
    return data;
  } catch (err) {
    console.error("Error fetching departments:", err);
    return [];
  }
};

const getEmployeesByDept = async (deptId: string) => {
  try {
    const res = await fetch(`http://localhost:5000/api/employees?departmentId=${deptId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();
    console.log("Employees data after fetch:", data);
    return data;
  } catch (err) {
    console.error("Error fetching employees:", err);
    return [];
  }
};

const getTeamLeadersByDept = async (deptId: string) => {
  try {
    const res = await fetch(`http://localhost:5000/api/employees?departmentId=${deptId}&job_position=Team Leader`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();
    console.log("Team leaders data after fetch:", data);
    return data;
  } catch (err) {
    console.error("Error fetching team leaders:", err);
    return [];
  }
};

// Define DepartmentType locally since it's not exported from types.ts
interface DepartmentType {
  _id: string;
  id: string;
  name: string;
  company: string;
  manager_id: string;
}

interface OverviewProps {
  submittedEmployees: string[]; // Current list of all submitted employees
  setSubmittedEmployees: (employees: string[]) => void;
}

const Overview = ({ submittedEmployees, setSubmittedEmployees }: OverviewProps) => {
  const [departments, setDepartments] = useState<DepartmentType[]>([]);
  const [selectedDept, setSelectedDept] = useState<DepartmentType | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [teamLeaders, setTeamLeaders] = useState<Employee[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [selectedEmployeesLocal, setSelectedEmployeesLocal] = useState<string[]>([]); // Local state for current selection
  const [employeeSelectionState, setEmployeeSelectionState] = useState<{ [key: string]: boolean }>({}); // Track individual selection states

  // Fetch manager's assigned department
  useEffect(() => {
    getDepartments().then((data) => {
      if (data.length > 0) {
        const managerDepts = data.map((dept: any) => ({
          _id: dept._id,
          id: dept._id,
          name: dept.name,
          company: dept.company,
          manager_id: dept.manager_id?.toString() || "",
        }));
        console.log("Mapped departments:", managerDepts);
        setDepartments(managerDepts);
        setSelectedDept(managerDepts[0]); // Default to first department
      } else {
        console.log("No departments found");
      }
    });
  }, []);

  // Fetch employees & team leaders when a department is selected
  useEffect(() => {
    if (!selectedDept) return;

    setLoadingEmployees(true);
    console.log("Fetching employees for department:", selectedDept._id);

    Promise.all([
      getEmployeesByDept(selectedDept._id).then((data) => {
        const mappedEmployees = data.map((emp: any) => {
          const employee: Employee = {
            id: emp._id?.toString() || "",
            _id: emp._id,
            user: {
              general_info: {
                full_name: emp.user?.general_info?.full_name || "",
                job_position: emp.user?.general_info?.job_position || "",
                work_email: emp.user?.general_info?.work_email || "",
                work_phone: emp.user?.general_info?.work_phone || "",
                work_mobile: emp.user?.general_info?.work_mobile || "",
                tags: emp.user?.general_info?.tags || [],
                company: emp.user?.general_info?.company || "",
                department: emp.user?.general_info?.department || "",
                manager: emp.user?.general_info?.manager || undefined,
                coach: emp.user?.general_info?.coach || undefined,
                image: emp.user?.general_info?.image || "",
                status: emp.user?.general_info?.status || "offline",
              },
            },
          };
          console.log("Mapped employee:", employee);
          return employee;
        }) as unknown as Employee[];
        setEmployees(mappedEmployees);
        return mappedEmployees;
      }),
      getTeamLeadersByDept(selectedDept._id).then((data) => {
        const mappedTeamLeaders = data.map((emp: any) => {
          const employee: Employee = {
            id: emp._id?.toString() || "",
            _id: emp._id,
            user: {
              general_info: {
                full_name: emp.user?.general_info?.full_name || "",
                job_position: emp.user?.general_info?.job_position || "",
                work_email: emp.user?.general_info?.work_email || "",
                work_phone: emp.user?.general_info?.work_phone || "",
                work_mobile: emp.user?.general_info?.work_mobile || "",
                tags: emp.user?.general_info?.tags || [],
                company: emp.user?.general_info?.company || "",
                department: emp.user?.general_info?.department || "",
                manager: emp.user?.general_info?.manager || undefined,
                coach: emp.user?.general_info?.coach || undefined,
                image: emp.user?.general_info?.image || "",
                status: emp.user?.general_info?.status || "offline",
              },
            },
          };
          console.log("Mapped team leader:", employee);
          return employee;
        }) as unknown as Employee[];
        setTeamLeaders(mappedTeamLeaders);
        return mappedTeamLeaders;
      }),
    ]).finally(() => setLoadingEmployees(false));
  }, [selectedDept]);

  const getFullName = (emp: Employee) => emp.user?.general_info?.full_name || "—";

  // Handle selecting an employee with visual feedback
  const handleSelectEmployee = (emp: Employee) => {
    const fullName = getFullName(emp);
    setEmployeeSelectionState((prev) => ({
      ...prev,
      [fullName]: !prev[fullName], // Toggle selection state
    }));
    setSelectedEmployeesLocal((prev) =>
      prev.includes(fullName) ? prev.filter((name) => name !== fullName) : [...prev, fullName]
    );
  };

  // Handle submit with duplicate check
  const handleSubmit = () => {
    console.log("Submitting employees (local):", selectedEmployeesLocal);
    const duplicates = selectedEmployeesLocal.filter((name) => submittedEmployees.includes(name));
    if (duplicates.length > 0) {
      alert(`The following team leaders are already added: ${duplicates.join(", ")}.`);
      // Optionally prevent submission or proceed with only new employees
      const newEmployees = selectedEmployeesLocal.filter((name) => !submittedEmployees.includes(name));
      if (newEmployees.length > 0) {
        const newSubmittedEmployees = [...new Set([...submittedEmployees, ...newEmployees])];
        setSubmittedEmployees(newSubmittedEmployees);
        setSelectedEmployeesLocal([]); // Clear local selection after submit
        setEmployeeSelectionState({}); // Reset selection states
        alert(`Added new team leaders: ${newEmployees.join(", ")}`);
      }
    } else {
      const newSubmittedEmployees = [...new Set([...submittedEmployees, ...selectedEmployeesLocal])];
      setSubmittedEmployees(newSubmittedEmployees);
      setSelectedEmployeesLocal([]); // Clear local selection after submit
      setEmployeeSelectionState({}); // Reset selection states
      alert(`Submitted: ${newSubmittedEmployees.join(", ") || "None"}`);
    }
  };

  return (
    <div className="p-6">
      {/* Department Selector */}
      <div className="mb-4">
        <label htmlFor="department-select" className="mr-2 font-bold">
          Select Department:
        </label>
        <select
          id="department-select"
          value={selectedDept?._id || ""}
          onChange={(e) => {
            const dept = departments.find((d) => d._id === e.target.value) || null;
            setSelectedDept(dept);
          }}
          className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="" disabled>
            Choose a department
          </option>
          {departments.map((dept) => (
            <option key={dept._id} value={dept._id}>
              {dept.name}
            </option>
          ))}
        </select>
      </div>

      <div className="p-3 bg-white rounded-lg shadow-lg mb-6">
        <h2 className="text-2xl font-bold text-[#65435c]">
          Department: {selectedDept?.name || "None selected"}
        </h2>
      </div>

      <div className="mt-6">
        {loadingEmployees ? (
          <p className="text-center text-green-600">Loading employees...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-lg shadow-lg border border-gray-300">
              <thead>
                <tr className="bg-green-400 text-white">
                  <th className="py-3 px-4 text-left font-semibold">Name</th>
                  <th className="py-3 px-4 text-left font-semibold">Email</th>
                  <th className="py-3 px-4 text-left font-semibold">Job Position</th>
                  <th className="py-3 px-4 text-left font-semibold">Status</th>
                  <th className="py-3 px-4 text-left font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {employees.length > 0 ? (
                  employees
                    .filter(
                      (emp) =>
                        emp.user?.general_info?.job_position !== "Administrator" &&
                        emp.user?.general_info?.job_position !== "Department Manager" &&
                        emp.user?.general_info?.job_position !== "Team Lead"
                    )
                    .map((emp, index) => {
                      const fullName = getFullName(emp);
                      const isSelected = employeeSelectionState[fullName] || false;

                      return (
                        <tr
                          key={emp.id}
                          className={`hover:bg-blue-50 transition-colors duration-200 ${
                            index % 2 === 1 ? "bg-gray-100" : "bg-white"
                          }`}
                        >
                          <td className="py-3 px-4 border-b border-gray-200">
                            {fullName}
                          </td>
                          <td className="py-3 px-4 border-b border-gray-200">
                            {emp.user?.general_info?.work_email || "—"}
                          </td>
                          <td className="py-3 px-4 border-b border-gray-200">
                            {emp.user?.general_info?.job_position || "—"}
                          </td>
                          <td className="py-3 px-4 border-b border-gray-200">
                            {emp.user?.general_info?.status || "—"}
                          </td>
                          <td className="py-3 px-4 border-b border-gray-200">
                            <button
                              onClick={() => handleSelectEmployee(emp)}
                              className={`px-3 py-1 rounded-lg text-white ${
                                isSelected
                                  ? "bg-amber-500 hover:bg-amber-600" // Selected state
                                  : "bg-purple-500 hover:bg-purple-600" // Default state
                              } transition-colors duration-200`}
                            >
                              {isSelected ? "Selected" : "Select"}
                            </button>
                          </td>
                        </tr>
                      );
                    })
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-3 px-4 border-b border-gray-200 text-center text-gray-500"
                    >
                      No employees found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Selected Employees Tags */}
      {selectedEmployeesLocal.length > 0 && (
        <div className="mt-4">
          <h3 className="text-xl font-bold text-[#65435c] mb-2">
            Selected Employees (Current):
          </h3>
          <div className="flex flex-wrap gap-2 mb-2">
            {selectedEmployeesLocal.map((name) => (
              <span
                key={name}
                className="bg-purple-200 text-purple-800 px-2 py-1 rounded-full text-sm"
              >
                {name}
                <button
                  onClick={() =>
                    setSelectedEmployeesLocal((prev) => prev.filter((n) => n !== name))
                  }
                  className="ml-2 text-red-500 hover:text-red-700"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            Submit
          </button>
        </div>
      )}
    </div>
  );
};

export default Overview;