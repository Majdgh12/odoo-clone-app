"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Navbar from "@/components/NavbarProject";
import ProjectCard from "@/components/ProjectCard";
import { useRouter } from "next/navigation";
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
  tasks?: any[];
}

const HomePage = () => {
  const { data: session,status } = useSession();
  const userRole = session?.user.role;
  const userId = session?.user.id;
  const departmentId = session?.user.departmentId;
const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (status === "unauthenticated") {
      alert("Session expired. Please log in again.");
      router.push("/"); // redirect to login page
    }
  }, [status, router]);

  // ✅ fetch all project IDs first (assuming /api/projects returns them)
  const fetchProjects = async () => {
    if (!session?.user) return;
    setLoading(true);
    setError(null);

    try {
      let endpoint = "http://localhost:5000/api/projects";

      if (userRole === "manager" && departmentId) {
        endpoint = `http://localhost:5000/api/projects?departmentId=${departmentId}`;
      }

      const res = await fetch(endpoint, { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch projects list");

      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      let projectList: Project[] = data.data || [];

      // ✅ If employee or team lead → fetch project details one by one
      if (userRole === "employee" || userRole === "team_lead") {
        const filtered: Project[] = [];

        for (const p of projectList) {
          const detailRes = await fetch(`http://localhost:5000/api/projects/${p._id}`);
          const detailData = await detailRes.json();

          if (detailData.success) {
            const project = detailData.data;
            const isMember =
              project.members?.some((m: any) => m._id === userId) ||
              project.team_lead_id?._id === userId;

            if (isMember) filtered.push(project);
          }
        }

        projectList = filtered;
      }
       console.log("📦 Projects fetched:", projectList);
      setProjects(projectList);
    } catch (err: any) {
      console.error("❌ Failed to fetch projects:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [session?.user]);

  // ✅ Group by department for admin
  const groupedProjects: Record<string, Project[]> = {};
  if (userRole === "admin") {
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
        onSearch={() => {}}
        onFilterChange={() => {}}
        onGroupByChange={() => {}}
        onViewTypeChange={() => {}}
        onPageChange={() => {}}
        onExport={() => {}}
      />

      <div className="pt-24 px-6 flex flex-col gap-6">
        {loading && <p>Loading projects...</p>}
        {error && <p className="text-red-600">Error: {error}</p>}

        {!loading && !error && projects.length > 0 && (
          <>
            {userRole === "manager" && (
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
            )}

            {userRole === "admin" &&
              Object.entries(groupedProjects).map(([deptName, deptProjects]) => (
                <div key={deptName}>
                  <h2 className="text-2xl font-semibold mb-2">{deptName}</h2>
                  <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {deptProjects.map((project) => (
                      <ProjectCard key={project._id} project={project} />
                    ))}
                  </div>
                </div>
              ))}

            {(userRole === "employee" || userRole === "team_lead") && (
              <>
                <h2 className="text-2xl font-semibold mb-2">My Projects</h2>
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {projects.map((project) => (
                    <ProjectCard key={project._id} project={project} />
                  ))}
                </div>
              </>
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
