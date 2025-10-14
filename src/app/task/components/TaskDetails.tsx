"use client";
import React, { useState } from "react";
import PriorityComponent from "./PriorityComponent";
import StatusComponent from "./StatusComponent";

interface Task {
  _id: string;
  name?: string;
  description?: string;
  due_date?: string;
  stage?: "todo" | "in_progress" | "done" | "cancelled";
  priority?: "low" | "normal" | "high";
  project_name?: string;
  assignee_name?: string;
  status?: "todo" | "in_progress" | "done" | "cancelled";
}

interface TaskDetailsProps {
  task: Task;
  onClose: () => void;
  onSave: (updatedTask: Task) => void;
}

const TaskDetails: React.FC<TaskDetailsProps> = ({ task, onClose, onSave }) => {
  const [taskData, setTaskData] = useState<Task>({ ...task });
  const [showStageMenu, setShowStageMenu] = useState(false);

  // Handle changing stage
  const handleStageChange = (stage: "todo" | "in_progress" | "done" | "cancelled" | "blocked") => {
    setTaskData((prev) => ({ ...prev, stage: stage as Task["stage"] }));
  };

  // Save stage updates
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-2xl shadow-lg w-screen max-w-lg h-[80vh] mx-4 overflow-y-auto">
        <h2 className="text-2xl font-semibold mb-5 text-gray-800">
          Task Details
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Task Name */}
          <div>
            <label className="block text-sm font-medium text-gray-600">
              Task Name
            </label>
            <p className="mt-1 text-gray-900 font-medium bg-gray-50 p-2 rounded-md">
              {taskData.name || "—"}
            </p>
          </div>

          {/* Project Name */}
          <div>
            <label className="block text-sm font-medium text-gray-600">
              Project
            </label>
            <p className="mt-1 text-gray-900 bg-gray-50 p-2 rounded-md">
              {taskData.project_name || "—"}
            </p>
          </div>

          {/* Assignee */}
          <div>
            <label className="block text-sm font-medium text-gray-600">
              Assigned To
            </label>
            <p className="mt-1 text-gray-900 bg-gray-50 p-2 rounded-md">
              {taskData.assignee_name || "You"}
            </p>
          </div>

          {/* Deadline */}
          <div>
            <label className="block text-sm font-medium text-gray-600">
              Deadline
            </label>
            <p className="mt-1 text-gray-900 bg-gray-50 p-2 rounded-md">
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
            <p className="mt-1 text-gray-800 bg-gray-50 p-3 rounded-md whitespace-pre-wrap">
              {taskData.description || "No description"}
            </p>
          </div>

          {/* Priority (read-only visual) */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Priority
            </label>
            <PriorityComponent
              value={taskData.priority || "normal"}
              onChange={() => {}}
            />
          </div>

          {/* Stage (editable) using StatusComponent */}
          <StatusComponent
            value={taskData.stage || "todo"}
            onChange={handleStageChange}
            showMenu={showStageMenu}
            onToggleMenu={() => setShowStageMenu(!showStageMenu)}
            label="Status"
          />

          {/* Buttons */}
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md font-medium hover:bg-gray-300 transition"
            >
              Close
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#65435c] text-white rounded-md font-medium hover:bg-[#55394e] transition"
            >
              Save Status
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskDetails;