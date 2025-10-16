"use client";

import React, { useEffect, useState, use } from "react";
import { useSession } from "next-auth/react";
import NavbarTask from "@/app/task/components/NavBarTask";
import MyTasks from "@/app/task/MyTask/page";
import NewTask from "@/app/task/components/NewTask";

export default function ProjectDetails({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params); // ✅ unwrap params for Next.js 15
  const { data: session } = useSession();

  const [project, setProject] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  // 🔹 Pagination + Search states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalTasks, setTotalTasks] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (session?.user) fetchProject();
    console.log(session?.user)

  }, [session?.user]);

  const fetchProject = async () => {
    try {
      const token = session?.user?.token || session?.user?.accessToken;

      const res = await fetch(`http://localhost:5000/api/projects/${id}`, {
        headers: {
          "content-type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Failed to fetch project");

      setProject(data.data);
    } catch (err: any) {
      console.error("❌ Fetch project failed:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>Loading project...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;
  if (!project) return <p>No project found.</p>;

  return (
    
    <div className="pt-24">
      {/* ✅ Navbar at the top */}
    <NavbarTask
  totalTasks={totalTasks}
  currentPage={currentPage}
  totalPages={Math.ceil(totalTasks / itemsPerPage) || 1}
  itemsPerPage={itemsPerPage}
  onSearch={(term) => setSearchTerm(term)}
  onFilterChange={() => {}}
  onGroupByChange={() => {}}
  onViewTypeChange={() => {}}
  onPageChange={(page) => setCurrentPage(page)}
  onExport={() => console.log("Export clicked")}
  onNewClick={() => setShowTaskModal(true)} // optional
/>

      

      {/* ✅ Project Info */}
      <div className=" p-6 space-y-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h1 className="text-2xl font-semibold text-[#65435c]">{project.name}</h1>
          <p className="text-gray-600 mt-2">{project.description}</p>
        </div>

        {/* ✅ Project Tasks */}
        <div className="bg-gray-50 p-4 rounded-lg" >
          <h2 className="text-xl font-semibold text-[#65435c] mb-4">Tasks in this Project</h2>

          <MyTasks
            projectId={id}
            page={currentPage}
            limit={itemsPerPage}
            searchTerm={searchTerm}
            onTasksInfoChange={(info) => setTotalTasks(info.totalTasks)}
          />
        </div>
      </div>
      {showTaskModal && (
        <NewTask
          onClose={() => setShowTaskModal(false)}
            onSave={()=> {
              setShowTaskModal(false);
              alert("✅ Task added successfully!");}}
           defaultProjectId={project._id}
             departmentId={project.department_id?._id} 
             settotalTasks={(prev: number) => setTotalTasks(prev + 1)}
            />
          )}
            
    </div>
  );
}
