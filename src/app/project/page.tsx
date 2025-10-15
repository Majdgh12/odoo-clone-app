"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Navbar from "@/components/NavbarProject";
import ProjectCard from "@/components/ProjectCard";

interface Project {
  _id: string;
  name: string;
  description?: string;
  department_id?: { _id: string; name: string };
  manager_id?: any;
  team_lead_id?: any;
  members?: any[];
  start_date?: string;
  end_date?: string;
  status: string;
  priority: string;
  tags: string[];
  meta?: any;
}

const HomePage = () => {
  const { data: session } = useSession();
  const departmentId = session?.user.departmentId;

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = async () => {
    if (!session?.user) return;

    setLoading(true);
    setError(null);

    try {
      let endpoint = "http://localhost:5000/api/projects";

      if (
        (session.user.role === "employee" || session.user.role === "team_lead") &&
        departmentId
      ) {
        endpoint = `http://localhost:5000/api/projects?departmentId=${departmentId}`;
      }

      if (session.user.role === "manager" && departmentId) {
        endpoint = `http://localhost:5000/api/projects?departmentId=${departmentId}`;
      }


      const res = await fetch(endpoint, { cache: "no-store" });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Server error: ${res.status} — ${text}`);
      }

      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Failed to fetch projects");

      setProjects(data.data || []);
    } catch (err: any) {
      console.error("❌ Failed to fetch projects:", err);
      setError(err.message);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [session?.user]);

  // Group projects by department for admin
  const groupedProjects: Record<string, Project[]> = {};
  if (session?.user?.role === "admin") {
    projects.forEach((p) => {
      const deptName = p.department_id?.name || "Unknown Department";
      if (!groupedProjects[deptName]) groupedProjects[deptName] = [];
      groupedProjects[deptName].push(p);
    });
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Navbar
        totalProjects={projects.length}
        currentPage={1}
        totalPages={1}
        itemsPerPage={10}
        onSearch={() => { }}
        onFilterChange={() => { }}
        onGroupByChange={() => { }}
        onViewTypeChange={() => { }}
        onPageChange={() => { }}
        onExport={() => { }}
      />

      <div className="pt-24 px-6 flex flex-col gap-6">
        {loading && <p>Loading projects...</p>}
        {error && <p className="text-red-600">Error: {error}</p>}

        {!loading && !error && projects.length > 0 && (
          <>
            {session?.user?.role === "manager" || session?.user?.role === "employee" ||
              session?.user?.role === "team_lead" ? (
              <>
                <h2 className="text-2xl font-semibold mb-2">
                  {projects[0].department_id?.name || "My Department"}
                </h2>
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {projects.map((project) => (
                    <ProjectCard key={project._id} project={project} />
                  ))}
                </div>
              </>
            ) : (
              // Admin: group projects by department
              Object.entries(groupedProjects).map(([deptName, deptProjects]) => (
                <div key={deptName}>
                  <h2 className="text-2xl font-semibold mb-2">{deptName}</h2>
                  <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {deptProjects.map((project) => (
                      <ProjectCard key={project._id} project={project} />
                    ))}
                  </div>
                </div>
              ))
            )}
          </>
        )}

        {!loading && !error && projects.length === 0 && (
          <p className="text-gray-600 text-center">No projects found.</p>
        )}
      </div>
    </div>
  );
};

export default HomePage;
