"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "@/components/SideBar/Sidebar";
import Navbar from "@/components/Navbar/Navbar";
import type { Employee } from "@/lib/types";
import EmployeeCard from "@/components/EmployeeCard";
import EmployeeListView from "@/components/EmployeeListView";
import { initializeEmployees } from "@/lib/getEmployees";

export default function Home() {
  const [allEmployees, setAllEmployees] = useState<Employee[]>([]);
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

  // Fetch employees on mount
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const employees = await initializeEmployees();
        setAllEmployees(employees);
        setAllFilteredEmployees(employees);
        setFilteredEmployees(employees);
        setCurrentPage(1);
      } catch (err) {
        console.error("Failed to fetch employees:", err);
      }
    };
    fetchEmployees();
  }, []);

  // Detect client mount and window size
  useEffect(() => {
    setMounted(true);
    const handleResize = () => setWindowWidth(window.innerWidth);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const displayMode = mounted
    ? windowWidth >= 1024
      ? "grid"
      : windowWidth >= 768
        ? "stacked"
        : "mobile"
    : "grid";

  const paginatedEmployees = filteredEmployees.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Sidebar handlers
  const handleFilterChange = (employees: Employee[]) => {
    if (!employees || employees.length === 0) return;
    setAllFilteredEmployees(employees);
    setFilteredEmployees(employees);
    setCurrentPage(1);
  };

  const handleFilterUpdate = (filterType: "company" | "department", value: string) => {
    setSelectedFilters((prev) => ({ ...prev, [filterType]: value }));

    // Apply filter immediately
    let filtered = [...allFilteredEmployees];
    if (filterType === "company" && value !== "all") {
      filtered = filtered.filter(emp => emp.user.general_info.company === value);
    }
    if (filterType === "department" && value !== "all") {
      filtered = filtered.filter(emp => emp.user.general_info.department === value);
    }

    setFilteredEmployees(filtered);
    setCurrentPage(1);
  };

  // Navbar search
  const handleSearch = (term: string) => {
    if (!term.trim()) {
      setFilteredEmployees(allFilteredEmployees);
      setCurrentPage(1);
      return;
    }

    const searchLower = term.toLowerCase();
    const searchResults = allFilteredEmployees.filter(emp => {
      const info = emp.user.general_info;
      return (
        info.full_name?.toLowerCase().includes(searchLower) ||
        info.job_position?.toLowerCase().includes(searchLower) ||
        info.work_email?.toLowerCase().includes(searchLower) ||
        info.work_phone?.toLowerCase().includes(searchLower) ||
        info.tags?.some(tag => tag.toLowerCase().includes(searchLower))
      );
    });

    setFilteredEmployees(searchResults);
    setCurrentPage(1);
  };

  const handleViewTypeChange = (newViewType: "grid" | "list" | "kanban") => setViewType(newViewType);
  const handlePageChange = (page: number) => setCurrentPage(page);

  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);

  const renderEmployees = () =>
    paginatedEmployees.length > 0 ? (
      paginatedEmployees.map((emp, index) => {
        const info = emp.user.general_info;

        // pick a unique key: prefer emp.id, fallback to emp._id, then index
        const key = emp.id || (emp as any)._id || `emp-${index}`;

        return (
          <div key={key} className="w-full max-w-[420px]">
            <EmployeeCard
              id={emp.id || (emp as any)._id || ""}
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
      <p className="text-gray-500 text-center mt-4">No employees found.</p>
    );
  return (
    <div className="h-screen bg-gray-50 flex">
      <aside className="w-64 bg-white border-r border-gray-200 flex-shrink-0">
        <Sidebar
          allEmployees={allEmployees}       // <--- always unfiltered
          onFilterChange={setFilteredEmployees}  // <--- updates what is displayed
          selectedFilters={selectedFilters}
          onFilterUpdate={handleFilterUpdate}
        />
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
          <Navbar
            title="Employees"
            totalEmployees={filteredEmployees.length}
            currentPage={currentPage}
            totalPages={totalPages}
            itemsPerPage={itemsPerPage}
            onSearch={handleSearch}
            onViewTypeChange={handleViewTypeChange}
            onPageChange={handlePageChange} onFilterChange={function (filters: Record<string, any>): void {
              throw new Error("Function not implemented.");
            }} onGroupByChange={function (groupBy: string): void {
              throw new Error("Function not implemented.");
            }} onNewEmployee={function (): void {
              throw new Error("Function not implemented.");
            }} onExport={function (): void {
              throw new Error("Function not implemented.");
            }} onSettings={function (): void {
              throw new Error("Function not implemented.");
            }} />
        </header>

        <section className="flex-1 bg-gray-50 overflow-y-auto overflow-x-hidden pt-16 lg:pt-12">
          {mounted && displayMode === "grid" && (
            <div className="p-4 mt-2">
              {viewType === "list" ? (
                <EmployeeListView employees={paginatedEmployees} />
              ) : (
                <div className="grid gap-2 grid-cols-3 max-w-[1400px] mx-auto">
                  {renderEmployees()}
                </div>
              )}
            </div>
          )}

          {mounted && displayMode === "stacked" && (
            <div className="p-4 mt-4">
              {viewType === "list" ? (
                <EmployeeListView employees={paginatedEmployees} />
              ) : (
                <div className="flex flex-col gap-2 max-w-2xl mx-auto">
                  {renderEmployees()}
                </div>
              )}
            </div>
          )}

          {mounted && displayMode === "mobile" && (
            <div className="p-3 mt-4 mx-3">
              {viewType === "list" ? (
                <EmployeeListView employees={paginatedEmployees} />
              ) : (
                <div className="flex flex-col gap-1 w-full">{renderEmployees()}</div>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}