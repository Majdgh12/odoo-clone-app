"use client";

import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "@/components/Navbar/Navbar";
import type { Employee } from "@/lib/types";
import EmployeeCard from "@/components/EmployeeCard";

export default function Home() {
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [selectedFilters, setSelectedFilters] = useState({
    company: "all",
    department: "all",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [viewType, setViewType] = useState<"grid" | "list" | "kanban">("grid");
  const itemsPerPage = 10;

  // Sidebar handlers
  const handleFilterChange = (employees: Employee[]) => {
    setFilteredEmployees(employees);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handleFilterUpdate = (
    filterType: "company" | "department",
    value: string
  ) => {
    setSelectedFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }));
  };

  // Navbar handlers
  const handleSearch = (searchTerm: string) => {
    console.log("Search:", searchTerm);
  };

  const handleNavbarFilterChange = (filters: Record<string, any>) => {
    console.log("Navbar Filters:", filters);
  };

  const handleGroupByChange = (groupBy: string) => {
    console.log("Group By:", groupBy);
  };

  const handleViewTypeChange = (newViewType: "grid" | "list" | "kanban") => {
    setViewType(newViewType);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleNewEmployee = () => {
    console.log("New Employee");
  };

  const handleExport = () => {
    console.log("Export");
  };

  const handleSettings = () => {
    console.log("Settings");
  };

  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar
        onFilterChange={handleFilterChange}
        selectedFilters={selectedFilters}
        onFilterUpdate={handleFilterUpdate}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Navbar */}
        <Navbar
          title="Employees"
          totalEmployees={filteredEmployees.length}
          currentPage={currentPage}
          totalPages={totalPages}
          itemsPerPage={itemsPerPage}
          onSearch={handleSearch}
          onFilterChange={handleNavbarFilterChange}
          onGroupByChange={handleGroupByChange}
          onViewTypeChange={handleViewTypeChange}
          onPageChange={handlePageChange}
          onNewEmployee={handleNewEmployee}
          onExport={handleExport}
          onSettings={handleSettings}
        />

        {/* Employee List */}
        <div className="p-6 overflow-y-auto flex-1">
          {filteredEmployees.length > 0 ? (
            <div
              className={
                viewType === "grid"
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                  : "flex flex-col gap-4"
              }
            >
              {filteredEmployees
                .slice(
                  (currentPage - 1) * itemsPerPage,
                  currentPage * itemsPerPage
                )
                .map((emp) => {
                  const info = emp.user.general_info;
                  return (
                    <EmployeeCard
                      key={emp.id}
                      id={emp.id}  
                      full_name={info.full_name}
                      job_position={info.job_position}
                      work_email={info.work_email}
                      work_phone={info.work_phone}
                      image={info.image}
                      tags={info.tags}
                    />
                  );
                })}
            </div>
          ) : (
            <p className="text-gray-500 text-center mt-10">
              No employees found.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
