// components/EmployeeGeneral.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Employee } from "../lib/types";
import { getEmployees, getEmployeeById } from "../lib/getEmployees";
import ResumeTab from "./EmployeeNotebook/ResumeTab";
import WorkInfoTab from "./EmployeeNotebook/WorkInfoTab";
import PrivateInfoTab from "./EmployeeNotebook/PrivateInfoTab";
import SettingsTab from "./EmployeeNotebook/SettingsTab";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface EmployeeGeneralProps {
  employeeId: string;
}

const toStringField = (val: any): string => {
  // If it's a string, return it.
  if (typeof val === "string") return val;
  // If it's an object with a `name` property, return name.
  if (val && typeof val === "object") {
    if (typeof val.name === "string") return val.name;
    // fallback: try id or company or stringify
    if (typeof val.company === "string") return val.company;
    if (val._id) return String(val._id);
    try {
      return JSON.stringify(val);
    } catch {
      return String(val);
    }
  }
  return "";
};

const normalizeTags = (tags: any): string[] => {
  if (!tags) return [];
  if (Array.isArray(tags)) {
    return tags.map((t) => (typeof t === "string" ? t : t?.name ?? String(t)));
  }
  return [typeof tags === "string" ? tags : tags?.name ?? String(tags)];
};

const idOf = (obj: any): string | undefined => {
  if (!obj) return undefined;
  return obj.id ?? obj._id ?? obj.toString?.();
};

const EmployeeGeneral: React.FC<EmployeeGeneralProps> = ({ employeeId }) => {
  const router = useRouter();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [allEmployees, setAllEmployees] = useState<Employee[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeTab, setActiveTab] = useState("resume");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      setLoading(true);
      try {
        // getEmployees may be sync or async depending on your lib
        const employees = await (getEmployees() as Promise<Employee[]> | Employee[]);
        const employeesArr = Array.isArray(employees) ? employees : [employees];
        console.log("Fetched employees:", employeesArr);
        
        if (!mounted) return;
        setAllEmployees(employeesArr);


        // get employee by id (your function should return normalized object)
        const emp = await getEmployeeById(employeeId);
        if (!mounted) return;

        if (!emp) {
          setEmployee(null);
          setCurrentIndex(0);
          setLoading(false);
          return;
        }

        setEmployee(emp);

        // find the index by either id or _id (normalize both sides to string)
        const empId = idOf(emp);
        const index = employeesArr.findIndex((e) => {
          const eId = idOf(e);
          return eId !== undefined && empId !== undefined && String(eId) === String(empId);
        });

        setCurrentIndex(index !== -1 ? index : 0);
      } catch (err) {
        console.error("Failed to load employees:", err);
        setEmployee(null);
        setAllEmployees([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchData();
    return () => {
      mounted = false;
    };
  }, [employeeId]);

  const navigateToEmployee = (direction: "prev" | "next") => {
    if (!allEmployees.length) return;

    const lastIndex = allEmployees.length - 1;
    let newIndex =
      direction === "next"
        ? currentIndex < lastIndex
          ? currentIndex + 1
          : 0
        : currentIndex > 0
        ? currentIndex - 1
        : lastIndex;

    const newEmployee = allEmployees[newIndex];
    const newId = idOf(newEmployee);
    if (newId) router.push(`/employees/${newId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading employee details...</div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Employee Not Found</h2>
          <p className="text-gray-600">The employee with this ID does not exist.</p>
        </div>
      </div>
    );
  }

  const info = employee.user?.general_info ?? {};
  const departmentText = toStringField(info.department);
  const companyText = toStringField(info.company);
  const tags = normalizeTags(info.tags);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            onClick={() => router.push("/")}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            <span className="font-medium">Home</span>
          </button>

          <div className="flex items-center space-x-4 bg-gray-50 rounded-lg px-4 py-2">
            <button
              onClick={() => navigateToEmployee("prev")}
              className="p-1 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={allEmployees.length <= 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="text-sm text-gray-700 font-medium">
              {currentIndex + 1} / {allEmployees.length}
            </span>

            <button
              onClick={() => navigateToEmployee("next")}
              className="p-1 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={allEmployees.length <= 1}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="w-20" />
        </div>
      </div>

      <div className="p-6 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="p-8 border-b border-gray-200">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mr-3">{info.full_name ?? "—"}</h1>
                <span className="text-blue-500 text-xl">🔗</span>
              </div>

              <p className="text-lg text-gray-600 mb-8">{info.job_position ?? "—"}</p>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-16 gap-y-6">
                <div className="space-y-6">
                  {/* Work Email */}
                  <div className="flex items-start">
                    <span className="text-sm text-gray-500 w-24 flex-shrink-0 mt-1">
                      Work Email <span className="text-blue-500">?</span>
                    </span>
                    <span className="text-sm text-gray-900 ml-4">{info.work_email ?? "—"}</span>
                  </div>

                  {/* Work Phone */}
                  <div className="flex items-start">
                    <span className="text-sm text-gray-500 w-24 flex-shrink-0 mt-1">
                      Work Phone <span className="text-blue-500">?</span>
                    </span>
                    <span className="text-sm text-gray-900 ml-4">{info.work_phone ?? "—"}</span>
                  </div>

                  {/* Work Mobile */}
                  <div className="flex items-start">
                    <span className="text-sm text-gray-500 w-24 flex-shrink-0 mt-1">
                      Work Mobile <span className="text-blue-500">?</span>
                    </span>
                    <span className="text-sm text-gray-900 ml-4">{info.work_mobile ?? "—"}</span>
                  </div>

                  {/* Tags */}
                  <div className="flex items-start">
                    <span className="text-sm text-gray-500 w-24 flex-shrink-0 mt-1">
                      Tags <span className="text-blue-500">?</span>
                    </span>
                    <div className="ml-4 flex flex-wrap gap-1">
                      {tags.length > 0 ? (
                        tags.map((tag, idx) => (
                          <span key={idx} className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                            {tag}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-gray-400">Tags</span>
                      )}
                    </div>
                  </div>

                  {/* Company */}
                  <div className="flex items-start">
                    <span className="text-sm text-gray-500 w-24 flex-shrink-0 mt-1">
                      Company <span className="text-blue-500">?</span>
                    </span>
                    <span className="text-sm text-gray-900 ml-4">{companyText || "—"}</span>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  {/* Department */}
                  <div className="flex items-start">
                    <span className="text-sm text-gray-500 w-24 flex-shrink-0 mt-1">
                      Department <span className="text-blue-500">?</span>
                    </span>
                    <span className="text-sm text-gray-900 ml-4">{departmentText || "—"}</span>
                  </div>

                  {/* Manager */}
                  <div className="flex items-start">
                    <span className="text-sm text-gray-500 w-24 flex-shrink-0 mt-1">
                      Manager <span className="text-blue-500">?</span>
                    </span>
                    <div className="ml-4 flex items-center">
                      {info.manager ? (
                        <>
                          <img
                            src={info.manager.image}
                            alt={info.manager.name}
                            className="w-6 h-6 rounded-full mr-2"
                            onError={(e) => (e.currentTarget.src = "https://via.placeholder.com/24x24.png?text=👤")}
                          />
                          <span className="text-sm text-gray-900">{info.manager.name}</span>
                        </>
                      ) : (
                        <span className="text-sm text-gray-400">—</span>
                      )}
                    </div>
                  </div>

                  {/* Coach */}
                  <div className="flex items-start">
                    <span className="text-sm text-gray-500 w-24 flex-shrink-0 mt-1">
                      Coach <span className="text-blue-500">?</span>
                    </span>
                    <div className="ml-4 flex items-center">
                      {info.coach ? (
                        <>
                          <img
                            src={info.coach.image}
                            alt={info.coach.name}
                            className="w-6 h-6 rounded-full mr-2"
                            onError={(e) => (e.currentTarget.src = "https://via.placeholder.com/24x24.png?text=👤")}
                          />
                          <span className="text-sm text-gray-900">{info.coach.name}</span>
                        </>
                      ) : (
                        <span className="text-sm text-gray-400">—</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Employee Photo */}
            <div className="ml-8 flex-shrink-0">
              <img
                src={info.image}
                alt={info.full_name}
                className="w-32 h-40 rounded-lg object-cover border border-gray-200"
                onError={(e) => (e.currentTarget.src = "https://via.placeholder.com/128x160.png?text=No+Photo")}
              />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-8">
            {[
              { id: "resume", label: "Resume" },
              { id: "work", label: "Work Information" },
              { id: "private", label: "Private Information" },
              { id: "settings", label: "Settings" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-8">
          {activeTab === "resume" && <ResumeTab employee={employee} />}
          {activeTab === "work" && <WorkInfoTab employee={employee} />}
          {activeTab === "private" && <PrivateInfoTab employee={employee} />}
          {activeTab === "settings" && <SettingsTab employee={employee} />}
        </div>
      </div>
    </div>
  );
};

export default EmployeeGeneral;
