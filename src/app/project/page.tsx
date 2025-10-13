"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Navbar from "@/components/NavbarProject";
import ProjectCard from "@/components/ProjectCard";

interface Project {
  _id: string;
  name: string;
  description?: string;
  department_id?: string;
  manager_id?: string;
  team_lead_id?: string;
  members?: string[];
  start_date?: string;
  end_date?: string;
  status: string;
  priority: string;
  tags: string[];
  meta?: any;
}

const HomePage = () => {
  const { data: session } = useSession();
  const department = session?.user.departmentId;
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  console.log("Department ID:", department);
  const fetchProjects = async () => {
    if (!session?.user) return;

    setLoading(true);
    setError(null);

    try {
      // Decide endpoint based on role
      let endpoint = "http://localhost:5000/api/projects";

      if (session.user.role === "manager") {
        endpoint = `http://localhost:5000/api/projects/department/${department}`;
      } else if (session.user.role === "admin") {
        endpoint = `http://localhost:5000/api/projects`;
      }

      const res = await fetch(endpoint, { cache: "no-store" });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Server error: ${res.status} — ${text}`);
      }

      const data = await res.json();
      console.log("📡 API returned:", data);

      let projectArray: Project[] = [];

      if (Array.isArray(data)) {
        projectArray = data;
      } else if (data.data && Array.isArray(data.data)) {
        projectArray = data.data;
      } else if (data.projects && Array.isArray(data.projects)) {
        projectArray = data.projects;
      } else {
        console.warn("⚠️ Unexpected format:", data);
      }

      setProjects(projectArray);
      setFilteredProjects(projectArray);
    } catch (err: any) {
      console.error("❌ Failed to fetch projects:", err);
      setError(err.message);
      setProjects([]);
      setFilteredProjects([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [session?.user]);
  console.log("Session user:", session?.user);
  // 🔍 Handle search
  const handleSearch = (term: string) => {
    if (!term.trim()) {
      setFilteredProjects(projects);
      return;
    }

    const filtered = projects.filter((p) =>
      p.name.toLowerCase().includes(term.toLowerCase())
    );

    setFilteredProjects(filtered);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Navbar
        totalProjects={filteredProjects.length}
        currentPage={1}
        totalPages={1}
        itemsPerPage={10}
        onSearch={handleSearch}
        onFilterChange={() => {}}
        onGroupByChange={() => {}}
        onViewTypeChange={() => {}}
        onPageChange={() => {}}
        onExport={() => {}}
      />

      <div className="pt-24 px-6 grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {loading && <p>Loading projects...</p>}
        {error && <p className="text-red-600">Error: {error}</p>}
        {!loading && !error && filteredProjects.length === 0 && (
          <p className="text-gray-600 col-span-full text-center">
            No projects found.
          </p>
        )}
        {filteredProjects.map((project) => (
          <ProjectCard key={project._id} project={project} />
        ))}
      </div>
    </div>
  );
};

export default HomePage;
