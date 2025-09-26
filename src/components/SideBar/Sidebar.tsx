// src/components/Sidebar/Sidebar.tsx
"use client";

import React, { useEffect, useState } from "react";
import { ChevronLeft, Users2, ChevronRight, Plus } from "lucide-react";
import type { Employee } from "@/lib/types";
import Departments from "@/components/dashboard_components/Departments";
import { useSession } from "next-auth/react";

interface Department {
  _id: string;
  name: string;
}

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
  const { data: session, status } = useSession();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [counts, setCounts] = useState({
    total: 0,
    byDepartment: {} as Record<string, number>,
  });

  // modal state for adding department
  const [showAddDept, setShowAddDept] = useState(false);

  // determine if current user is admin
  const isAdmin = session?.user?.role === "admin";

  // Function to fetch departments (used on mount and after closing modal)
  const fetchDepartments = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/departments");
      if (!res.ok) throw new Error("Failed to fetch departments");
      const data = await res.json();
      setDepartments(data || []);
    } catch (err) {
      console.error("Error fetching departments:", err);
      setDepartments([]);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  // Compute employee counts (employees without department counted only in total "All")
  useEffect(() => {
    const deptCounts: Record<string, number> = {};

    allEmployees.forEach((emp) => {
      let deptName =
        typeof emp.user?.general_info?.department === "string"
          ? emp.user.general_info.department
          : emp.user?.general_info?.department?.name ?? null;

      if (deptName) {
        deptCounts[deptName] = (deptCounts[deptName] || 0) + 1;
      }
      // employees without department are counted in total only
    });

    setCounts({
      total: allEmployees.length,
      byDepartment: deptCounts,
    });
  }, [allEmployees]);

  // Apply filtering
  useEffect(() => {
    let filtered = [...allEmployees];

    if (selectedFilters.department && selectedFilters.department !== "all") {
      filtered = filtered.filter((emp) => {
        let deptName =
          typeof emp.user?.general_info?.department === "string"
            ? emp.user.general_info.department
            : emp.user?.general_info?.department?.name ?? null;

        return (
          deptName &&
          deptName.toLowerCase() === selectedFilters.department.toLowerCase()
        );
      });
    }

    if (selectedFilters.company && selectedFilters.company !== "all") {
      filtered = filtered.filter(
        (emp) =>
          emp.user?.general_info?.company?.toLowerCase() ===
          selectedFilters.company.toLowerCase()
      );
    }

    onFilterChange(filtered);
  }, [selectedFilters, allEmployees, onFilterChange]);

  const handleDepartmentFilter = (department: string) => {
    onFilterUpdate("department", department);
  };

  const getFilteredCount = (department: string) => {
    if (department === "all") return counts.total;
    return counts.byDepartment[department] || 0;
  };

  // called when modal closes to refresh department list in sidebar
  const handleModalClose = () => {
    setShowAddDept(false);
    fetchDepartments(); // refresh departments after closing modal (new dept may exist)
  };

  return (
    <>
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
            <div className="flex items-center justify-between">
              <div className="flex items-center mb-3">
                <Users2 className="w-5 h-5 text-[#65435c] mr-2" />
                <h3 className="text-sm font-semibold uppercase tracking-wide text-black">
                  DEPARTMENT
                </h3>
              </div>

              {/* Plus button: opens Add Department modal (only for admin) */}
              <div className="mb-3">
                {isAdmin ? (
                  <button
                    onClick={() => setShowAddDept(true)}
                    className="p-1 rounded-md hover:bg-gray-100 transition-colors text-gray-600"
                    title="Create department"
                    aria-label="Create department"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                ) : null}
              </div>
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

              {/* Show only defined departments */}
              {departments.map((dept) => (
                <button
                  key={dept._id}
                  onClick={() => handleDepartmentFilter(dept.name)}
                  className={`w-full text-left mt-0.5 px-3 py-1.5 rounded-md text-sm transition-colors ${
                    selectedFilters.department === dept.name
                      ? "bg-teal-50 text-black border font-medium"
                      : "text-black hover:bg-gray-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <ChevronRight className="w-3 h-3 mr-1 text-black" />
                      <span className="text-black">{dept.name}</span>
                    </div>
                    <span className="bg-gray-200 text-black px-2 py-0.5 rounded-full text-xs font-medium">
                      {getFilteredCount(dept.name)}
                    </span>
                  </div>
                </button>
              ))}
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

      {/* Modal: Departments create form */}
      {showAddDept && (
        <Departments
          isModal={true}
          onClose={handleModalClose}
          // Sidebar will refresh departments after modal closes
        />
      )}
    </>
  );
};

export default Sidebar;
