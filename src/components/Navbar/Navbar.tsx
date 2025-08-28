"use client";

import React, { useState } from 'react';
import { Settings } from 'lucide-react';
import {
  SearchBar,
  FilterDropdown,
  GroupByDropdown,
  FavoritesButton,
  ViewTypeSelector,
  Pagination,
  ActionButtons
} from './index';

interface NavbarProps {
  title?: string;
  totalEmployees: number;
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  onSearch: (searchTerm: string) => void;
  onFilterChange: (filters: Record<string, any>) => void;
  onGroupByChange: (groupBy: string) => void;
  onViewTypeChange: (viewType: 'grid' | 'list' | 'kanban') => void;
  onPageChange: (page: number) => void;
  onNewEmployee: () => void;
  onExport: () => void;
  onSettings: () => void;
}

const Navbar: React.FC<NavbarProps> = ({
  title = "Employees",
  totalEmployees,
  currentPage,
  totalPages,
  itemsPerPage,
  onSearch,
  onFilterChange,
  onGroupByChange,
  onViewTypeChange,
  onPageChange,
  onNewEmployee,
  onExport,
  onSettings
}) => {
  const [showNewBadge] = useState(true);

  const handleFavoriteToggle = () => {
    console.log('Favorite toggled');
  };

  return (
  <div className="fixed top-0 left-0 right-0 bg-white border-b border-gray-300 px-4 py-4  z-10 ">
  <div className="flex items-center gap-2 justify-between w-full">
    
    {/* Left - New Employee Button */}
    <div className="flex justify-start">
      <button
        onClick={onNewEmployee}
        className="bg-[#65435c] text-white px-4 py-2 rounded text-sm font-medium hover:bg-[#55394e] select-none"
      >
        New</button> 
        <span className="flex pl-1 mt-1.5 text-xl font- text-gray-900 select-none">{title}</span>
        <Settings className="mt-3 pl-0.5 w-4 h-4 text-black" />
    </div>

    {/* Center - Search Bar */}
    <div className="flex-1 flex w-[300px] max-w-md justify-center select-none">
      <SearchBar onSearch={onSearch} placeholder="Search..." />
    </div>

    {/* Right - Pagination + ViewType + Settings */}
    <div className="flex justify-end items-center gap-3">
    
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalEmployees}
        itemsPerPage={itemsPerPage}
        onPageChange={onPageChange}
      />
        <ViewTypeSelector onViewTypeChange={onViewTypeChange} />
      {/* <SettingsButton onSettings={onSettings} /> */}
    </div>

  </div>

  {/* Status bar
  <div className="mt-3 flex items-center justify-between">
    <span className="text-sm text-gray-600">
      Showing {totalEmployees} employees
    </span>
  </div> */}
</div>

  );
};

export default Navbar;
