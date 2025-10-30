"use client";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import { Trash2 } from "lucide-react";

interface Timesheet {
  _id: string;
  employee_id?: { _id: string; full_name: string };
  project_id?: { _id: string; name: string };
  task_id?: { _id: string; title?: string; name?: string };
  duration: number;
}

export default function TimesheetSummaryView() {
  const { data: session } = useSession();
  const [timesheets, setTimesheets] = useState<Timesheet[]>([]);
  const [selectedProject, setSelectedProject] = useState<{ [emp: string]: string }>({});
  const [selectedTask, setSelectedTask] = useState<{ [emp: string]: string }>({});
  const [loading, setLoading] = useState(true);

  const role = (session?.user as any)?.role;
  const employeeId = (session?.user as any)?._id;
  const departmentId = (session?.user as any)?.department?._id;

useEffect(() => {
  if (!session?.user) return;

  const role = (session.user as any)?.role;
  // 🧠 Only fetch for roles that should see it
  if (["admin", "manager"].includes(role)) {
    fetchTimesheetsByRole();
  }
}, [session]);
 if (role === "employee") return null;
  const fetchTimesheetsByRole = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/api/timesheets/all/role", {
        params: { role, employee_id: employeeId, department_id: departmentId },
      });
      setTimesheets(res.data.data || []);
    } catch (err) {
      console.error("❌ Failed to fetch timesheets by role", err);
      setTimesheets([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (employeeName: string, projectId: string, taskId?: string) => {
    try {
      const empObj = timesheets.find(
        (t) => t.employee_id?.full_name === employeeName
      )?.employee_id;

      if (!empObj?._id) return alert("Employee ID not found.");

      const confirmMsg = taskId
        ? "Delete all timesheets for this specific task?"
        : "Delete all timesheets for this project?";
      if (!confirm(confirmMsg)) return;

      await axios.delete("http://localhost:5000/api/timesheets/delete/by-selection", {
        params: {
          employee_id: empObj._id,
          project_id: projectId,
          task_id: taskId || "",
        },
      });

      alert("✅ Timesheets deleted successfully!");
      fetchTimesheetsByRole();
    } catch (err) {
      console.error("❌ Delete error:", err);
      alert("Failed to delete timesheets.");
    }
  };

  if (loading)
    return <div className="text-center text-gray-500 py-6 text-[13px]">Loading timesheets...</div>;

  if (!timesheets.length)
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500 text-[13px]">
        No timesheets found.
      </div>
    );

  // 🧠 Group timesheets by employee
  const grouped = timesheets.reduce((acc: any, t) => {
    const emp = t.employee_id?.full_name || "Unknown Employee";
    if (!acc[emp]) acc[emp] = [];
    acc[emp].push(t);
    return acc;
  }, {});

  return (
    <div className="bg-white rounded-lg border shadow-sm overflow-x-auto">
      <table className="min-w-full text-[13px] text-gray-700 border-collapse">
        {/* Header */}
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr className="text-center font-semibold text-gray-600">
            <th className="p-2.5 text-left sticky left-0 bg-white z-10 shadow-sm">Employee</th>
            <th className="p-2.5 text-left">Project</th>
            <th className="p-2.5 text-left">Task</th>
            <th className="p-2.5 text-center">Duration (hrs)</th>
            <th className="p-2.5 text-center bg-gray-100">Total (hrs)</th>
          </tr>
        </thead>

        {/* Body */}
        <tbody>
          {Object.entries(grouped).map(([employee, empTimesheets]: any, idx) => {
            const projects = [
              ...new Map(
                empTimesheets
                  .filter((t: Timesheet) => t.project_id)
                  .map((t: Timesheet) => [t.project_id?._id, t.project_id])
              ).values(),
            ];

            const selectedProj = selectedProject[employee];
            const tasks = empTimesheets
              .filter(
                (t: Timesheet) =>
                  t.project_id?._id === selectedProj && t.task_id
              )
              .map((t: Timesheet) => t.task_id);

            const selectedTaskId = selectedTask[employee];
            const duration =
              empTimesheets.find(
                (t: Timesheet) =>
                  t.project_id?._id === selectedProj &&
                  (!selectedTaskId || t.task_id?._id === selectedTaskId)
              )?.duration || 0;
            const total = empTimesheets.reduce(
              (sum: number, t: Timesheet) => sum + (t.duration || 0),
              0
            );

            const rowBg = idx % 2 === 0 ? "bg-white" : "bg-gray-50";

            return (
              <tr
                key={employee}
                className={`${rowBg} hover:bg-gray-100 transition-colors duration-100`}
              >
                {/* Employee */}
                <td className="p-2.5 border-b font-medium text-gray-900 sticky left-0 bg-inherit z-10 shadow-sm">
                  {employee}
                </td>

                {/* Project Dropdown + Delete */}
                <td className="p-2.5 border-b">
                  <div className="flex items-center gap-2">
                    <select
                      className="border rounded px-2 py-1 w-full text-gray-700 focus:ring-1 focus:ring-[#65435c] focus:border-[#65435c] transition text-[13px]"
                      value={selectedProj || ""}
                      onChange={(e) =>
                        setSelectedProject((prev) => ({
                          ...prev,
                          [employee]: e.target.value,
                        }))
                      }
                    >
                      <option value="">Select Project</option>
                      {projects.map((p: any) => (
                        <option key={p._id} value={p._id}>
                          {p.name}
                        </option>
                      ))}
                    </select>

                    <button
                      disabled={!selectedProj}
                      onClick={() => handleDelete(employee, selectedProj)}
                      className={`p-1.5 rounded border text-[13px] transition ${
                        selectedProj
                          ? "hover:bg-red-100 text-red-600 border-red-200"
                          : "text-gray-400 border-gray-200 cursor-not-allowed"
                      }`}
                      title="Delete all timesheets for this project"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>

                {/* Task Dropdown + Delete */}
                <td className="p-2.5 border-b">
                  <div className="flex items-center gap-2">
                    <select
                      className="border rounded px-2 py-1 w-full text-gray-700 focus:ring-1 focus:ring-[#65435c] focus:border-[#65435c] transition text-[13px]"
                      value={selectedTaskId || ""}
                      onChange={(e) =>
                        setSelectedTask((prev) => ({
                          ...prev,
                          [employee]: e.target.value,
                        }))
                      }
                      disabled={!selectedProj}
                    >
                      <option value="">Select Task</option>
                      {tasks.map((t: any, i: number) => (
                        <option key={`${t._id}-${i}`} value={t._id}>
                          {t.title || t.name}
                        </option>
                      ))}
                    </select>

                    <button
                      disabled={!selectedTaskId}
                      onClick={() =>
                        handleDelete(employee, selectedProj, selectedTaskId)
                      }
                      className={`p-1.5 rounded border text-[13px] transition ${
                        selectedTaskId
                          ? "hover:bg-red-100 text-red-600 border-red-200"
                          : "text-gray-400 border-gray-200 cursor-not-allowed"
                      }`}
                      title="Delete all timesheets for this task"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>

                {/* Duration */}
                <td className="p-2.5 border-b text-center text-gray-800 font-medium">
                  {duration.toFixed(2)}
                </td>

                {/* Total */}
                <td className="p-2.5 border-b text-center font-semibold text-gray-900 bg-gray-50">
                  {total.toFixed(2)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
