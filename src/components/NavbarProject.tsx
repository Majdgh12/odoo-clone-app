"use client";

import React, { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import AddProjectModal from "@/components/AddProjectModal";
import { SearchBar, ViewTypeSelector, Pagination } from "../components/Navbar/index";
import NewProjectButton from "../components/NewProjectButton";

interface NavbarProps {
  totalProjects: number;
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  onSearch: (searchTerm: string) => void;
  onFilterChange: (filters: Record<string, any>) => void;
  onGroupByChange: (groupBy: string) => void;
  onViewTypeChange: (viewType: "grid" | "list" | "kanban") => void;
  onPageChange: (page: number) => void;
  onExport: () => void;
}

const Navbar: React.FC<NavbarProps> = ({
  totalProjects,
  currentPage,
  totalPages,
  itemsPerPage,
  onSearch,
  onFilterChange,
  onGroupByChange,
  onViewTypeChange,
  onPageChange,
  onExport,
}) => {
  const { data: session } = useSession();
  const [role, setRole] = useState<string | null>(null);
  const router = useRouter();

  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    if (session?.user) {
      setRole(session.user.role as string);
      console.log("Session user in Navbar:", session.user);
    }
  }, [session]);

  const handleProjectAdded = (created?: any) => {
    setShowAddModal(false);
    if (created) {
      alert("Project created: " + (created?.project?.name ?? "success"));
    } else {
      alert("Project added");
    }
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
        {/* Large Screen */}
        <div className="hidden lg:flex items-center gap-2 justify-between w-full">
          <div className="flex items-center gap-2">{renderRoleButtons()}</div>

          <div className="flex-1 flex w-[300px] max-w-md justify-center select-none">
            <SearchBar onSearch={onSearch} placeholder="Search Projects..." />
          </div>

          <div className="flex justify-end items-center gap-3">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalProjects}
              itemsPerPage={itemsPerPage}
              onPageChange={onPageChange}
            />
            <ViewTypeSelector onViewTypeChange={onViewTypeChange} />

            {/* Pass session to NewProjectButton */}
            {session?.user && (
              <NewProjectButton
                role={role}
                session={session}
                onProjectCreated={handleProjectAdded}
              />
            )}
          </div>
        </div>

        {/* Medium Screen */}
        <div className="hidden md:flex lg:hidden flex-col gap-3">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">{renderRoleButtons()}</div>
            <div className="flex items-center gap-3">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalProjects}
                itemsPerPage={itemsPerPage}
                onPageChange={onPageChange}
              />
              <ViewTypeSelector onViewTypeChange={onViewTypeChange} />

              {session?.user && (
                <NewProjectButton
                  role={role}
                  session={session}
                  onProjectCreated={handleProjectAdded}
                />
              )}
            </div>
          </div>
          <div className="w-full">
            <SearchBar onSearch={onSearch} placeholder="Search Projects..." />
          </div>
        </div>

        {/* Small Screen */}
        <div className="flex md:hidden flex-col gap-3">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">{renderRoleButtons()}</div>
            <div className="flex items-center gap-2">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalProjects}
                itemsPerPage={itemsPerPage}
                onPageChange={onPageChange}
              />
              <ViewTypeSelector onViewTypeChange={onViewTypeChange} />

              {session?.user && (
                <NewProjectButton
                  role={role}
                  session={session}
                  onProjectCreated={handleProjectAdded}
                />
              )}
            </div>
          </div>
          <div className="w-full">
            <SearchBar onSearch={onSearch} placeholder="Search Projects..." />
          </div>
        </div>
      </div>

      {/* Modal for Adding Project */}
      <AddProjectModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={handleProjectAdded}
      />
    </>
  );
};

export default Navbar;