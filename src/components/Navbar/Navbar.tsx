"use client";

import React, { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  SearchBar,
  ViewTypeSelector,
  Pagination
} from './index';

interface NavbarProps {
  totalEmployees: number;
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  onSearch: (searchTerm: string) => void;
  onFilterChange: (filters: Record<string, any>) => void;
  onGroupByChange: (groupBy: string) => void;
  onViewTypeChange: (viewType: 'grid' | 'list' | 'kanban') => void;
  onPageChange: (page: number) => void;
  onExport: () => void;
}

const Navbar: React.FC<NavbarProps> = ({
  totalEmployees,
  currentPage,
  totalPages,
  itemsPerPage,
  onSearch,
  onFilterChange,
  onGroupByChange,
  onViewTypeChange,
  onPageChange,
  onExport
}) => {
  const { data: session } = useSession();
  const [role, setRole] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (session && session.user) {
      setRole(session.user.role as string); // Assuming session.user.role exists
    }
  }, [session]);

  const renderRoleButtons = () => {
    switch (role) {
      case 'admin':
        return (
          <div className="flex items-center gap-2">
            <button
              className="bg-[#65435c] text-white px-3 py-1 rounded text-sm font-medium hover:bg-[#55394e]"
              onClick={() => router.push('/home')} // Redirect to Home page
            >
              Home
            </button>
            <button
              className="bg-[#65435c] text-white px-3 py-1 rounded text-sm font-medium hover:bg-[#55394e]"
              onClick={() => router.push('/admin/dashboard')} // Redirect to Dashboard page
            >
              Dashboard
            </button>
            <button
              className="bg-[#65435c] text-white px-3 py-1 rounded text-sm font-medium hover:bg-[#55394e]"
              onClick={() => router.push(`/employees/${session.user.employeeId}`)} // Redirect to Profile page
            >
              Profile
            </button>
            <button
              onClick={() => signOut()}
              className="bg-[#65435c] text-white px-3 py-1 rounded text-sm font-medium hover:bg-[#55394e]"
            >
              Logout
            </button>
          </div>
        );
      case 'manager':
        return (
           <div className="flex items-center gap-2">
      <button
        className="bg-[#65435c] text-white px-3 py-1 rounded text-sm font-medium hover:bg-[#55394e]"
        onClick={() => router.push('/home')}
      >
        Home
      </button>
      <button
        className="bg-[#65435c] text-white px-3 py-1 rounded text-sm font-medium hover:bg-[#55394e]"
        onClick={() => router.push('/dashboard_manager')}
      >
        Dashboard
      </button>
      <button
        className="bg-[#65435c] text-white px-3 py-1 rounded text-sm font-medium hover:bg-[#55394e]"
        onClick={() => {
          if (session?.user?.employeeId) {
            router.push(`/employees/${session.user.employeeId}`);
          }
        }}
      >
        Profile
      </button>
      <button
        onClick={() => signOut()}
        className="bg-[#65435c] text-white px-3 py-1 rounded text-sm font-medium hover:bg-[#55394e]"
      >
        Logout
      </button>
    </div>
        );
      case 'team_lead':
        return (
          <div className="flex items-center gap-2">
      <button
        className="bg-[#65435c] text-white px-3 py-1 rounded text-sm font-medium hover:bg-[#55394e]"
        onClick={() => router.push('/home')}
      >
        Home
      </button>
      <button
        className="bg-[#65435c] text-white px-3 py-1 rounded text-sm font-medium hover:bg-[#55394e]"
        onClick={() => router.push('/dashboard_team_lead')}
      >
        My team
      </button>
      <button
        className="bg-[#65435c] text-white px-3 py-1 rounded text-sm font-medium hover:bg-[#55394e]"
        onClick={() => {
          if (session?.user?.employeeId) {
            router.push(`/employees/${session.user.employeeId}`);
          }
        }}
      >
        Profile
      </button>
      <button
        onClick={() => signOut()}
        className="bg-[#65435c] text-white px-3 py-1 rounded text-sm font-medium hover:bg-[#55394e]"
      >
        Logout
      </button>
    </div>
        );
      case 'employee':
        return (
           <div className="flex items-center gap-2">
      <button
        className="bg-[#65435c] text-white px-3 py-1 rounded text-sm font-medium hover:bg-[#55394e]"
        onClick={() => router.push('/home')}
      >
        Home
      </button>
      <button
        className="bg-[#65435c] text-white px-3 py-1 rounded text-sm font-medium hover:bg-[#55394e]"
        onClick={() => {
          if (session?.user?.employeeId) {
            router.push(`/employees/${session.user.employeeId}`);
          }
        }}
      >
        Profile
      </button>
      <button
        onClick={() => signOut()}
        className="bg-[#65435c] text-white px-3 py-1 rounded text-sm font-medium hover:bg-[#55394e]"
      >
        Logout
      </button>
    </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 bg-white border-b border-gray-300 px-4 py-4 z-10">
      {/* Large Screen Layout */}
      <div className="hidden lg:flex items-center gap-2 justify-between w-full">
        <div className="flex items-center gap-2">{renderRoleButtons()}</div>
        <div className="flex-1 flex w-[300px] max-w-md justify-center select-none">
          <SearchBar onSearch={onSearch} placeholder="Search..." />
        </div>
        <div className="flex justify-end items-center gap-3">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalEmployees}
            itemsPerPage={itemsPerPage}
            onPageChange={onPageChange}
          />
          <ViewTypeSelector onViewTypeChange={onViewTypeChange} />
        </div>
      </div>

      {/* Medium Screen Layout */}
      <div className="hidden md:flex lg:hidden flex-col gap-3">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">{renderRoleButtons()}</div>
          <div className="flex items-center gap-3">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalEmployees}
              itemsPerPage={itemsPerPage}
              onPageChange={onPageChange}
            />
            <ViewTypeSelector onViewTypeChange={onViewTypeChange} />
          </div>
        </div>
        <div className="w-full">
          <SearchBar onSearch={onSearch} placeholder="Search..." />
        </div>
      </div>

      {/* Small Screen Layout */}
      <div className="flex md:hidden flex-col gap-3">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">{renderRoleButtons()}</div>
          <div className="flex items-center gap-2">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalEmployees}
              itemsPerPage={itemsPerPage}
              onPageChange={onPageChange}
            />
            <ViewTypeSelector onViewTypeChange={onViewTypeChange} />
          </div>
        </div>
        <div className="w-full">
          <SearchBar onSearch={onSearch} placeholder="Search..." />
        </div>
      </div>
    </div>
  );
};

export default Navbar;
