"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "@/components/SideBar/Sidebar";
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
  const [mounted, setMounted] = useState(false);
  const [windowWidth, setWindowWidth] = useState<number>(0);
  const itemsPerPage = 10;

  // Detect client mount and window size
  useEffect(() => {
    setMounted(true);
    const handleResize = () => setWindowWidth(window.innerWidth);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Determine display mode
  const displayMode = mounted
    ? windowWidth >= 1024
      ? "grid"
      : windowWidth >= 768
      ? "stacked"
      : "sidebar"
    : "grid"; // default to grid during SSR

  const paginatedEmployees = filteredEmployees.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Sidebar handlers
  const handleFilterChange = (employees: Employee[]) => {
    setFilteredEmployees(employees);
    setCurrentPage(1);
  };
  const handleFilterUpdate = (filterType: "company" | "department", value: string) =>
    setSelectedFilters((prev) => ({ ...prev, [filterType]: value }));

  // Navbar handlers
  const handleSearch = (term: string) => console.log("Search:", term);
  const handleNavbarFilterChange = (filters: Record<string, any>) =>
    console.log("Navbar Filters:", filters);
  const handleGroupByChange = (groupBy: string) => console.log("Group By:", groupBy);
  const handleViewTypeChange = (newViewType: "grid" | "list" | "kanban") =>
    setViewType(newViewType);
  const handlePageChange = (page: number) => setCurrentPage(page);
  const handleNewEmployee = () => console.log("New Employee");
  const handleExport = () => console.log("Export");
  const handleSettings = () => console.log("Settings");

  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);

  // Helper to render employee cards
  const renderEmployees = () =>
    paginatedEmployees.length > 0 ? (
      paginatedEmployees.map((emp) => {
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
            status={info.status}
          />
        );
      })
    ) : (
      <p className="text-gray-500 text-center mt-4">No employees found.</p>
    );

  return (
    <div className="flex h-screen bg-gray-50">
             <Sidebar
        
        onFilterChange={handleFilterChange}
        selectedFilters={selectedFilters}
        onFilterUpdate={handleFilterUpdate}
      >
        {mounted && displayMode === "sidebar" && (
          <div className="px-4 mt-4 overflow-y-auto">{renderEmployees()}</div>
        )}
      </Sidebar>

      {/* Main Content */}
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

        {/* Large screens: grid */}
        {mounted && displayMode === "grid" && (
          <div className="p-6 overflow-y-auto flex-1 hidden lg:block">
            <div className="grid gap-6 grid-cols-[repeat(auto-fit,minmax(280px,1fr))] max-w-[1100px] mx-auto">
              {renderEmployees()}
            </div>
          </div>
        )}

        {/* Half screen: stacked */}
        {mounted && displayMode === "stacked" && (
          <div className="p-6 overflow-y-auto flex-1">
            <div className="flex flex-col gap-0">{renderEmployees()}</div>
          </div>
        )}
      </div>
      {/* Sidebar */} 
      

   

      {/* Main Content Area */}
 
    </div>
  );
}
