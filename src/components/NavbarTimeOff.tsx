// src/components/Navbar/Navbar.tsx  (or wherever your Navbar file is)
"use client";

import React, { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import AddEmployeeModal from "@/components/AddEmployeeModal"; // <-- adjust path if needed
import { Plus } from "lucide-react";
import {
  SearchBar,
  ViewTypeSelector,
  Pagination
} from './Navbar/index';

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

  // NEW: modal state
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    if (session && session.user) {
      setRole(session.user.role as string); // Assuming session.user.role exists
    }
  }, [session]);

  // Reusable handler used as onSuccess for AddEmployee
  const handleEmployeeAdded = (created?: any) => {
    // close modal
    setShowAddModal(false);

    // give the user a simple feedback — replace with e.g. parent refresh callback if needed
    if (created) {
      alert("Employee created: " + (created?.employee?.full_name ?? created?.employee ?? "success"));
    } else {
      alert("Employee added");
    }

    // OPTIONAL: if Navbar had a prop to refresh employees, call it e.g. onEmployeeAdded(created)
    // e.g. props.onEmployeeAdded?.(created);
  };

  const renderRoleButtons = () => {
    switch (role) {
      case 'admin':
        return (
          <div className="flex items-center gap-2">
            <button className="bg-[#65435c] text-white px-3 py-1 rounded text-sm font-medium hover:bg-[#55394e]" onClick={() => router.push('/home')}>Home</button>
            <button onClick={() => signOut({ redirect: true, callbackUrl: "/" })} className="bg-[#65435c] text-white px-3 py-1 rounded text-sm font-medium hover:bg-[#55394e]">Logout</button>
          </div>
        );
      case 'manager':
        return (
          <div className="flex items-center gap-2">
            <button className="bg-[#65435c] text-white px-3 py-1 rounded text-sm font-medium hover:bg-[#55394e]" onClick={() => router.push('/homeEmployee')}>Home</button>
            <button onClick={() => signOut({ redirect: true, callbackUrl: "/" })} className="bg-[#65435c] text-white px-3 py-1 rounded text-sm font-medium hover:bg-[#55394e]">Logout</button>
          </div>
        );
      case 'team_lead':
        return (
          <div className="flex items-center gap-2">
            <button className="bg-[#65435c] text-white px-3 py-1 rounded text-sm font-medium hover:bg-[#55394e]" onClick={() => router.push('/home')}>Home</button>
            <button onClick={() => signOut({ redirect: true, callbackUrl: "/" })} className="bg-[#65435c] text-white px-3 py-1 rounded text-sm font-medium hover:bg-[#55394e]">Logout</button>
          </div>
        );
      case 'employee':
        return (
          <div className="flex items-center gap-2">
            <button className="bg-[#65435c] text-white px-3 py-1 rounded text-sm font-medium hover:bg-[#55394e]" onClick={() => router.push('/home')}>Home</button>
            <button onClick={() => signOut({ redirect: true, callbackUrl: "/" })} className="bg-[#65435c] text-white px-3 py-1 rounded text-sm font-medium hover:bg-[#55394e]">Logout</button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <div className="fixed top-0 left-0 right-0 bg-white border-b border-gray-300 px-4 py-4 z-10">
        {/* Large Screen Layout */}
        <div className="hidden lg:flex items-center gap-2 justify-between w-full">
          <div className="flex items-center gap-2">
            {renderRoleButtons()}
          </div>

          <div className="flex-1 flex w-[300px] max-w-md justify-center select-none">
            <SearchBar onSearch={onSearch} placeholder="Search..." />
          </div>

          <div className="flex justify-end items-center gap-3">
            <Pagination currentPage={currentPage} totalPages={totalPages} totalItems={totalEmployees} itemsPerPage={itemsPerPage} onPageChange={onPageChange} />
            <ViewTypeSelector onViewTypeChange={onViewTypeChange} />

          {/*}
            {role === 'admin' && (
              <button
                onClick={() => setShowAddModal(true)}
                className="ml-2 bg-[#65435c] text-white p-2 rounded flex items-center gap-2"
                aria-label="Add employee"
                title="Add employee"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden lg:inline text-sm">Add</span>
              </button>
            )}*/}
          </div>
        </div>

        {/* Medium Screen Layout */}
        <div className="hidden md:flex lg:hidden flex-col gap-3">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">{renderRoleButtons()}</div>
            <div className="flex items-center gap-3">
              <Pagination currentPage={currentPage} totalPages={totalPages} totalItems={totalEmployees} itemsPerPage={itemsPerPage} onPageChange={onPageChange} />
              <ViewTypeSelector onViewTypeChange={onViewTypeChange} />
              {/* PLUS BUTTON (md) */}
              <button onClick={() => setShowAddModal(true)} className="ml-2 bg-[#65435c] text-white p-2 rounded" aria-label="Add employee">
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="w-full"><SearchBar onSearch={onSearch} placeholder="Search..." /></div>
        </div>

        {/* Small Screen Layout */}
        <div className="flex md:hidden flex-col gap-3">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">{renderRoleButtons()}</div>
            <div className="flex items-center gap-2">
              <Pagination currentPage={currentPage} totalPages={totalPages} totalItems={totalEmployees} itemsPerPage={itemsPerPage} onPageChange={onPageChange} />
              <ViewTypeSelector onViewTypeChange={onViewTypeChange} />
              {/* PLUS BUTTON (sm) */}
              <button onClick={() => setShowAddModal(true)} className="ml-2 bg-[#65435c] text-white p-2 rounded" aria-label="Add employee">
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="w-full"><SearchBar onSearch={onSearch} placeholder="Search..." /></div>
        </div>
      </div>

      {/* Modal rendered once at page root of this component */}
      <AddEmployeeModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={handleEmployeeAdded}
        // departments prop optional — AddEmployee fetches departments if none supplied
      />
    </>
  );
};

export default Navbar;
