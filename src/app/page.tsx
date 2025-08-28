"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "@/components/SideBar/Sidebar";
import Navbar from "@/components/Navbar/Navbar";
import type { Employee } from "@/lib/types";
import EmployeeCard from "@/components/EmployeeCard";
import EmployeeListView from "@/components/EmployeeListView";

export default function Home() {
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [allFilteredEmployees, setAllFilteredEmployees] = useState<Employee[]>([]);
  const [selectedFilters, setSelectedFilters] = useState({
    company: "all",
    department: "all",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [viewType, setViewType] = useState<"grid" | "list" | "kanban">("grid");
  const [mounted, setMounted] = useState(false);
  const [windowWidth, setWindowWidth] = useState<number>(0);
  const itemsPerPage = 9;

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
        : "mobile"
    : "grid"; // default to grid during SSR

  const paginatedEmployees = filteredEmployees.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Sidebar handlers
  const handleFilterChange = (employees: Employee[]) => {
    setAllFilteredEmployees(employees);
    setFilteredEmployees(employees);
    setCurrentPage(1);
  };
  const handleFilterUpdate = (filterType: "company" | "department", value: string) =>
    setSelectedFilters((prev) => ({ ...prev, [filterType]: value }));

  // Navbar handlers
  const handleSearch = (term: string) => {
    if (!term.trim()) {
      // If search is empty, show all filtered employees
      setFilteredEmployees(allFilteredEmployees);
      setCurrentPage(1);
      return;
    }

    // Filter employees by name, job position, email, phone, or tags
    const searchResults = allFilteredEmployees.filter(emp => {
      const info = emp.user.general_info;
      const searchLower = term.toLowerCase();

      // Search in name
      if (info.full_name.toLowerCase().includes(searchLower)) {
        return true;
      }

      // Search in job position
      if (info.job_position.toLowerCase().includes(searchLower)) return true;

      // Search in email
      if (info.work_email.toLowerCase().includes(searchLower)) return true;

      // Search in phone
      if (info.work_phone.toLowerCase().includes(searchLower)) return true;

      // Search in tags
      if (info.tags && info.tags.some(tag => tag.toLowerCase().includes(searchLower))) return true;

      return false;
    });

    // Update the displayed employees with search results
    setFilteredEmployees(searchResults);
    setCurrentPage(1);
  };
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
    <div className="h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex-shrink-0">
        <Sidebar
          onFilterChange={handleFilterChange}
          selectedFilters={selectedFilters}
          onFilterUpdate={handleFilterUpdate}
        >
          {/* This children prop is no longer used since mobile cards will be in main content */}
        </Sidebar>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header/Navbar - Static positioned */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
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
        </header>

        {/* Content Section - Vertical scroll only */}
        <section className="flex-1 bg-gray-50 overflow-y-auto overflow-x-hidden pt-16 lg:pt-12">
          {/* Large screens: grid layout */}
          {mounted && displayMode === "grid" && (
            <div className="p-6 mt-2">
              {viewType === "list" ? (
                <EmployeeListView employees={paginatedEmployees} />
              ) : (
                <div className="grid gap-8 grid-cols-3 max-w-[1400px] mx-auto">
                  {paginatedEmployees.length > 0 ? (
                    paginatedEmployees.map((emp) => {
                      const info = emp.user.general_info;
                      return (
                        <div key={emp.id} className="h-[240px] w-full max-w-[420px]">
                          <EmployeeCard
                            id={emp.id}
                            full_name={info.full_name}
                            job_position={info.job_position}
                            work_email={info.work_email}
                            work_phone={info.work_phone}
                            image={info.image}
                            tags={info.tags}
                            status={info.status}
                          />
                        </div>
                      );
                    })
                  ) : (
                    <div className="col-span-3 flex justify-center items-center h-64">
                      <p className="text-gray-500 text-center">No employees found.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Medium screens: stacked layout */}
          {mounted && displayMode === "stacked" && (
            <div className="p-6 mt-6">
              {viewType === "list" ? (
                <EmployeeListView employees={paginatedEmployees} />
              ) : (
                <div className="flex flex-col gap-4 max-w-2xl mx-auto">
                  {renderEmployees()}
                </div>
              )}
            </div>
          )}

          {/* Small screens: full-width stacked layout */}
          {mounted && displayMode === "mobile" && (
            <div className="p-4 mt-6 mx-4">
              {viewType === "list" ? (
                <EmployeeListView employees={paginatedEmployees} />
              ) : (
                <div className="flex flex-col gap-4 w-full">
                  {renderEmployees()}
                </div>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}