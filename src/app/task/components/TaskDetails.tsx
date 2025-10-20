"use client";
import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import PriorityComponent from "./PriorityComponent";
import StatusComponent from "./StatusComponent";
import { useSession } from "next-auth/react"; // ✅ import session hook

interface Task {
  _id: string;
  name?: string;
  description?: string;
  due_date?: string;
  stage?: "todo" | "in_progress" | "done" | "cancelled";
  priority?: "low" | "normal" | "high";
  project_name?: string;
  assignee_name?: string;
  assignee?: {
    _id?: string;
    full_name?: string;
    job_position?: string;
  };
  status?: "todo" | "in_progress" | "done" | "cancelled";
}

interface TaskDetailsProps {
  task: Task;
  onClose: () => void;
  onSave: (updatedTask: Task) => void;
}

const TaskDetails: React.FC<TaskDetailsProps> = ({ task, onClose, onSave }) => {
  const { data: session } = useSession(); // ✅ access session
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    if (session?.user) {
      setRole(session.user.role as string);
    }
  }, [session]);

  // 🧠 Normalize the incoming task
  const normalizeTask = (t: Task) => ({
    ...t,
    assignee_name:
      t.assignee?.full_name ||
      t.assignee_name ||
      (typeof t.assignee === "string" ? t.assignee : null) ||
      null,
    project_name:
      (t as any).project_id?.name ||
      t.project_name ||
      (typeof (t as any).project_id === "string"
        ? (t as any).project_id
        : null) ||
      null,
  });

  const [taskData, setTaskData] = useState<Task>(normalizeTask(task));
  const [showStageMenu, setShowStageMenu] = useState(false);

  useEffect(() => {
    setTaskData(normalizeTask(task));
  }, [task]);

  const handleStageChange = (
    stage: "todo" | "in_progress" | "done" | "cancelled" | "blocked"
  ) => {
    setTaskData((prev) => ({ ...prev, stage }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { status: taskData.stage };
      const res = await fetch(`http://localhost:5000/api/tasks/${taskData._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (!res.ok || !result.success)
        throw new Error(result.message || "Failed to update task");

      const updatedTask = result.data;
      onSave({
        _id: updatedTask._id,
        name: updatedTask.title,
        description: updatedTask.description,
        due_date: updatedTask.due_date,
        priority: updatedTask.priority,
        stage: updatedTask.status,
        status: updatedTask.status,
      });
      onClose();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error updating task");
    }
  };

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/20 flex items-center justify-center z-50 pointer-events-none">
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[85vh] overflow-y-auto p-6 pointer-events-auto">
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 transition"
          onClick={onClose}
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-semibold text-[#65435c] mb-6 border-b border-gray-100 pb-3">
          Task Details
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Task Name */}
          <div>
            <label className="block text-sm font-medium text-gray-600">
              Task Name
            </label>
            <p className="mt-1 text-gray-900 font-medium bg-gray-50 p-2 rounded-lg shadow-sm">
              {taskData.name || "—"}
            </p>
          </div>

          {/* Project */}
          <div>
            <label className="block text-sm font-medium text-gray-600">
              Project
            </label>
            <p className="mt-1 text-gray-900 bg-gray-50 p-2 rounded-lg shadow-sm">
              {taskData.project_name || "—"}
            </p>
          </div>

          {/* Assignee */}
          <div>
            <label className="block text-sm font-medium text-gray-600">
              Assigned To
            </label>
            <p className="mt-1 text-gray-900 bg-gray-50 p-2 rounded-lg shadow-sm">
              {taskData.assignee_name || "Unassigned"}
            </p>
          </div>

          {/* Deadline */}
          <div>
            <label className="block text-sm font-medium text-gray-600">
              Deadline
            </label>
            <p className="mt-1 text-gray-900 bg-gray-50 p-2 rounded-lg shadow-sm">
              {taskData.due_date
                ? new Date(taskData.due_date).toLocaleDateString()
                : "—"}
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-600">
              Description
            </label>
            <p className="mt-1 text-gray-800 bg-gray-50 p-3 rounded-lg shadow-sm whitespace-pre-wrap">
              {taskData.description || "No description"}
            </p>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Priority
            </label>
            <PriorityComponent value={taskData.priority || "normal"} onChange={() => {}} />
          </div>

          {/* ✅ Status */}
          {role === "employee" ? (
            <StatusComponent
              value={taskData.stage || "todo"}
              onChange={handleStageChange}
              showMenu={showStageMenu}
              onToggleMenu={() => setShowStageMenu(!showStageMenu)}
              label="Status"
            />
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Status
              </label>
              <p className="mt-1 text-gray-900 bg-gray-50 p-2 rounded-lg shadow-sm">
                {taskData.stage || "todo"}
              </p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 text-gray-800 rounded-md font-medium hover:bg-gray-200 transition"
            >
              Close
            </button>

            {role === "employee" && (
              <button
                type="submit"
                className="px-4 py-2 bg-[#65435c] text-white rounded-md font-medium hover:bg-[#55394e] transition"
              >
                Save Status
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskDetails;
