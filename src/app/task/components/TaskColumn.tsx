'use client';
import React from "react";
import PriorityComponent from "./PriorityComponent";

interface Task {
  _id: string;
  name: string;
  description?: string;
  due_date?: string;
  stage?: "todo" | "in_progress" | "done" | "cancelled";
  priority?: "low" | "normal" | "high";
}

interface TaskColumnProps {
  title: string;
  tasks: Task[];
  onTaskClick: (task: Task) => void;
}

export default function TaskColumn({ title, tasks, onTaskClick }: TaskColumnProps) {
  // Get column-specific styles
  const getColumnStyles = () => {
    switch (title.toLowerCase()) {
      case "to do":
        return {
          borderColor: "border-gray-200",
          headerColor: "text-gray-700",
        };
      case "in progress":
        return {
          borderColor: "border-yellow-200",
          headerColor: "text-yellow-700",
        };
      case "done":
        return {
          borderColor: "border-green-200",
          headerColor: "text-green-700",
        };
      case "cancelled":
        return {
          borderColor: "border-red-200",
          headerColor: "text-red-700",
        };
      default:
        return {
          borderColor: "border-gray-200",
          headerColor: "text-gray-700",
        };
    }
  };

  const styles = getColumnStyles();

  return (
    <div className={`min-w-[280px] flex-shrink-0 bg-white rounded-2xl p-4 shadow-md border-2 ${styles.borderColor}`}>
      {/* Column Header */}
      <div className="flex justify-between items-center mb-6 pb-2 border-b border-gray-100">
        <h2 className={`text-base font-semibold capitalize ${styles.headerColor}`}>
          {title}
        </h2>
        <span className="text-sm text-gray-400 font-medium bg-gray-100 px-2 py-1 rounded-full">
          {tasks.length}
        </span>
      </div>

      {/* Task List */}
      <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
        {tasks.length === 0 ? (
          <p className="text-gray-400 text-sm italic text-center py-4">No tasks</p>
        ) : (
          tasks.map((task, index) => (
            <div
              key={task._id ? task._id : index}
              className="bg-white border border-gray-100 rounded-xl p-3 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer hover:border-gray-300"
              onClick={() => onTaskClick(task)}
            >
              <h3 className="font-medium text-gray-800 truncate">{task.name}</h3>
              {task.description && (
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">{task.description}</p>
              )}
              <div className="text-xs text-gray-400 mt-2 flex items-center justify-between">
                <span>
                  Due: {task.due_date ? new Date(task.due_date).toLocaleDateString() : "—"}
                </span>
                {task.priority && (
             <PriorityComponent
                 value={task.priority}
                 onChange={() => {}}
                 />
                )}       
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}