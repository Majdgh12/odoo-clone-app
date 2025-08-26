"use client";

import React, { useState } from 'react';
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
    // Handle favorite functionality
    console.log('Favorite toggled');
  };

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      {/* Top Row - Title and Main Actions */}
      <div className="flex items-center justify-between mb-4">
        {/* Left Side - Title */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            {showNewBadge && (
              <span className="bg-purple-600 text-white px-2 py-1 rounded text-xs font-medium">
                New
              </span>
            )}
            <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
            <span className="text-gray-400">📋</span>
          </div>
        </div>

        {/* Right Side - Action Buttons */}
        <div className="flex items-center space-x-4">
          <ViewTypeSelector onViewTypeChange={onViewTypeChange} />
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalEmployees}
            itemsPerPage={itemsPerPage}
            onPageChange={onPageChange}
          />
          <ActionButtons
            onNewEmployee={onNewEmployee}
            onExport={onExport}
            onSettings={onSettings}
          />
        </div>
      </div>

      {/* Bottom Row - Search and Filter Controls */}
      <div className="flex items-center justify-between space-x-4">
        {/* Left Side - Search and Filters */}
        <div className="flex items-center space-x-3 flex-1 max-w-2xl">
          <SearchBar 
            onSearch={onSearch}
            placeholder="Search..."
          />
        </div>

        {/* Right Side - Filter Controls */}
        <div className="flex items-center space-x-3">
          <FilterDropdown onFilterChange={onFilterChange} />
          <GroupByDropdown onGroupByChange={onGroupByChange} />
          <FavoritesButton onFavoriteToggle={handleFavoriteToggle} />
        </div>
      </div>

      {/* Optional - Filter Status Bar */}
      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">
            Showing {totalEmployees} employees
          </span>
        </div>
      </div>
    </div>
  );
};

export default Navbar;