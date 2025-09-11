"use client";

import React, { useState, useEffect } from "react";
import { ChevronLeft, Users2, ChevronRight } from "lucide-react";
import type { Employee } from "@/lib/types";

interface SidebarProps {
  allEmployees: Employee[];
  onFilterChange: (filteredEmployees: Employee[]) => void;
  selectedFilters: {
    company: string;
    department: string;
  };
  onFilterUpdate: (filterType: "company" | "department", value: string) => void;
  children?: React.ReactNode;
}

const Sidebar: React.FC<SidebarProps> = ({
  allEmployees,
  onFilterChange,
  selectedFilters,
  onFilterUpdate,
  children,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [departments, setDepartments] = useState<string[]>([]);
  const [counts, setCounts] = useState({
    total: 0,
    byDepartment: {} as Record<string, number>,
  });

  // Compute departments and counts from allEmployees
 useEffect(() => {
  if (!allEmployees || allEmployees.length === 0) return;

  const deptCounts: Record<string, number> = {};
  allEmployees.forEach((emp) => {
    const deptName = typeof emp.user.general_info.department === "string"
      ? emp.user.general_info.department
      : emp.user.general_info.department?.name ?? "Unknown";

    if (deptName) deptCounts[deptName] = (deptCounts[deptName] || 0) + 1;
  });

  setCounts({
    total: allEmployees.length,
    byDepartment: deptCounts,
  });

  setDepartments(Object.keys(deptCounts).sort());
}, [allEmployees]); // <- only triggers when the real source changes// <- only compute counts, DO NOT call onFilterChange here

  // Apply filtering whenever selectedFilters change
  useEffect(() => {
    if (!allEmployees) return;

    let filtered = [...allEmployees];

    if (selectedFilters.department && selectedFilters.department !== "all") {
      filtered = filtered.filter((emp) => {
        let deptName = emp.user.general_info.department;
        if (typeof deptName !== "string") deptName = deptName?.name ?? "Unknown";
        return deptName.toLowerCase() === selectedFilters.department.toLowerCase();
      });
    }

    if (selectedFilters.company && selectedFilters.company !== "all") {
      filtered = filtered.filter(
        (emp) => emp.user.general_info.company.toLowerCase() === selectedFilters.company.toLowerCase()
      );
    }

    onFilterChange(filtered); // <- only here
  }, [selectedFilters, allEmployees, onFilterChange]); // <- safe

  const handleDepartmentFilter = (department: string) => {
    onFilterUpdate("department", department);
  };

  const getFilteredCount = (department: string) => {
    if (department === "all") return counts.total;
    return counts.byDepartment[department] || 0;
  };

  return (
    <div
      className={`t-16 h-screen overflow-hidden bg-white shadow-lg transition-all duration-300 ${
        isCollapsed ? "w-16" : "w-64"
      } border-r border-gray-300 pt-16`}
    >
      {/* Collapse button */}
      <div className="flex justify-end p-2 mb-0">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 rounded-md hover:bg-gray-100 transition-colors"
        >
          <ChevronLeft
            className={`w-5 h-5 text-black transition-transform ${
              isCollapsed ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>

      {!isCollapsed && (
        <div className="p-2 space-y-4">
          <div>
            <div className="flex items-center mb-3">
              <Users2 className="w-5 h-5 text-[#65435c] mr-2" />
              <h3 className="text-sm font-semibold uppercase tracking-wide text-black">
                DEPARTMENT
              </h3>
            </div>

            <div className="space-y-1">
              <button
                onClick={() => handleDepartmentFilter("all")}
                className={`w-full text-left cursor-pointer px-3 rounded-s-sm ${
                  selectedFilters.department === "all"
                    ? "bg-[#007c7415]"
                    : "hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="px-2 py-1.5 font-semibold text-black">All</span>
                  <span className="bg-gray-200 text-black px-2 py-1 rounded-full text-xs font-medium">
                    {getFilteredCount("all")}
                  </span>
                </div>
              </button>

              {departments.map((dept) => (
                <button
                  key={dept}
                  onClick={() => handleDepartmentFilter(dept)}
                  className={`w-full text-left mt-0.5 px-3 py-1.5 rounded-md text-sm transition-colors ${
                    selectedFilters.department === dept
                      ? "bg-teal-50 text-black border font-medium"
                      : "text-black hover:bg-gray-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <ChevronRight className="w-3 h-3 mr-1 text-black" />
                      <span className="text-black">{dept}</span>
                    </div>
                    <span className="bg-gray-200 text-black px-2 py-0.5 rounded-full text-xs font-medium">
                      {getFilteredCount(dept)}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {children && !isCollapsed && (
        <div className="block lg:hidden flex-1 overflow-y-auto p-4">{children}</div>
      )}

      {isCollapsed && (
        <div className="p-2 space-y-4 mt-4 flex justify-center">
          <Users2 className="w-6 h-6 text-[#65435c]" />
        </div>
      )}
    </div>
  );
};

export default Sidebar;
