"use client";

import React, { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { SearchBar, ViewTypeSelector, Pagination } from "@/components/Navbar/index";
import NewTask from "@/app/task/components/NewTask"; // ✅ NewTask modal for creating tasks

interface NavbarTaskProps {
  totalTasks: number;
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  onSearch: (searchTerm: string) => void;
  onFilterChange: (filters: Record<string, any>) => void;
  onGroupByChange: (groupBy: string) => void;
  onViewTypeChange: (viewType: "grid" | "list" | "kanban") => void;
  onPageChange: (page: number) => void;
  onExport: () => void;
  onNewClick?: () => void; // optional external handler if needed
}

const NavbarTask: React.FC<NavbarTaskProps> = ({
  totalTasks,
  currentPage,
  totalPages,
  itemsPerPage,
  onSearch,
  onFilterChange,
  onGroupByChange,
  onViewTypeChange,
  onPageChange,
  onExport,
  onNewClick,
}) => {
  const { data: session } = useSession();
  const [role, setRole] = useState<string | null>(null);
  const router = useRouter();

  const [showAddTaskModal, setShowAddTaskModal] = useState(false);

  useEffect(() => {
    if (session?.user) {
      setRole(session.user.role as string);
      console.log("Session user in NavbarTask:", session.user);
    }
  }, [session]);

  const handleTaskAdded = () => {
    setShowAddTaskModal(false);
    alert("✅ Task added successfully!");
  };

  const renderRoleButtons = () => {
    if (!role) return null;

    return (
      <div className="flex items-center gap-2">
        <button
          className="bg-[#65435c] text-white px-3 py-1 rounded text-sm font-medium hover:bg-[#55394e]"
          onClick={() => router.push("/home")}
        >
          Home
        </button>
        <button
          onClick={() => signOut({ redirect: true, callbackUrl: "/" })}
          className="bg-[#65435c] text-white px-3 py-1 rounded text-sm font-medium hover:bg-[#55394e]"
        >
          Logout
        </button>
      </div>
    );
  };

 return (
  <>
    <div className="fixed top-0 left-0 right-0 bg-white border-b border-gray-300 px-4 py-4 z-10">
      <div className="flex flex-wrap items-center justify-between gap-3 w-full">
        {/* 🔹 Left side: navigation buttons */}
        <div className="flex items-center gap-2">
          {renderRoleButtons()}
        </div>

        {/* 🔹 Center: search bar */}
        <div className="flex-1 flex justify-center min-w-[200px] max-w-md">
          <SearchBar onSearch={onSearch} placeholder="Search Tasks..." />
        </div>

        {/* 🔹 Right side: pagination, view, and add button */}
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalTasks}
            itemsPerPage={itemsPerPage}
            onPageChange={onPageChange}
          />

          <ViewTypeSelector onViewTypeChange={onViewTypeChange} />

          {/* ✅ Single Add Task button (responsive and visible once) */}
          {/* {role==="teamlead" && */}
             <button
            onClick={() => (onNewClick ? onNewClick() : setShowAddTaskModal(true))}
            className="bg-[#65435c] text-white px-3 py-1 rounded text-sm font-medium hover:bg-[#55394e]"
          >
            + New Task
          </button>
          {/* }
          */}
        </div>
      </div>
    </div>

    {/* 🔹 Task Modal */}
    {showAddTaskModal && (
      <NewTask onClose={() => setShowAddTaskModal(false)} onSave={handleTaskAdded} />
    )}
  </>
);
};
export default NavbarTask;