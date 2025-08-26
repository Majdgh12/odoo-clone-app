"use client";

import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '@/components/Navbar/Navbar';
import type { Employee } from '@/lib/types';

export default function Home() {
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [selectedFilters, setSelectedFilters] = useState({
    company: 'all',
    department: 'all'
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [viewType, setViewType] = useState<'grid' | 'list' | 'kanban'>('grid');
  const itemsPerPage = 10;

  // Sidebar handlers
  const handleFilterChange = (employees: Employee[]) => {
    setFilteredEmployees(employees);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handleFilterUpdate = (filterType: 'company' | 'department', value: string) => {
    setSelectedFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  // Navbar handlers
  const handleSearch = (searchTerm: string) => {
    console.log('Search:', searchTerm);
    // Add search logic here
  };

  const handleNavbarFilterChange = (filters: Record<string, any>) => {
    console.log('Navbar Filters:', filters);
    // Add navbar filter logic here
  };

  const handleGroupByChange = (groupBy: string) => {
    console.log('Group By:', groupBy);
    // Add group by logic here
  };

  const handleViewTypeChange = (newViewType: 'grid' | 'list' | 'kanban') => {
    setViewType(newViewType);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleNewEmployee = () => {
    console.log('New Employee');
    // Add new employee logic here
  };

  const handleExport = () => {
    console.log('Export');
    // Add export logic here
  };

  const handleSettings = () => {
    console.log('Settings');
    // Add settings logic here
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


      </div>
    </div>
  );
}