'use client';
import React from "react";
import { Droppable, Draggable } from "@hello-pangea/dnd";
import PriorityComponent from "./PriorityComponent";
import { Trash2 } from "lucide-react";

interface Task {
  _id: string;
  name: string;
  description?: string;
  due_date?: string;
  stage?: "todo" | "in_progress" | "done" | "blocked";
  priority?: "low" | "normal" | "high";
}

interface TaskColumnProps {
  title: string;
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  columnId: string;
  onDeleteTask?: (taskId: string) => void; // callback to update parent state
}

export default function TaskColumn({ title, tasks, onTaskClick, columnId, onDeleteTask }: TaskColumnProps) {
  const trimText = (text: string, maxLength: number) => {
    if (!text) return "";
    return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
  };

  const handleDelete = async (taskId: string) => {
    if (!confirm("Are you sure you want to delete this task?")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/tasks/${taskId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete task");
      alert("Task deleted successfully!");
      if (onDeleteTask) onDeleteTask(taskId);
    } catch (err: any) {
      console.error("❌ delete task error:", err);
      alert(err.message || "Failed to delete task");
    }
  };

  return (
    <div
      className="min-w-[300px] flex-shrink-0 bg-[#f8f8f8] rounded-md p-3 border border-gray-200 flex flex-col"
      style={{ minHeight: "400px" }}
    >
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-semibold text-sm text-gray-800">{title}</h2>
        <span className="text-xs bg-gray-200 text-gray-600 rounded-full px-2 py-[1px]">
          {tasks.length}
        </span>
      </div>

      <div className="w-full h-1 bg-gray-200 rounded-md mb-3">
        <div
          className="h-1 bg-gray-400 rounded-md"
          style={{ width: `${Math.min(tasks.length * 15, 100)}%` }}
        />
      </div>

      <Droppable droppableId={columnId}>
        {(provided, snapshot) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className={`flex-1 space-y-2 transition-colors duration-200 overflow-y-auto ${
              snapshot.isDraggingOver ? "bg-gray-100 rounded-md p-1" : ""
            }`}
          >
            {tasks.length === 0 ? (
              <p className="text-gray-400 text-xs italic text-center py-4">No tasks</p>
            ) : (
              tasks.map((task, index) => (
                <Draggable key={task._id} draggableId={task._id} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={`bg-white border border-gray-200 rounded-md p-3 text-sm cursor-pointer hover:bg-gray-50 transition-all select-none relative ${
                        snapshot.isDragging ? "shadow-md border-gray-300" : ""
                      }`}
                    >
                      {/* Task info */}
                      <div className="flex-1 overflow-hidden" onClick={() => onTaskClick(task)}>
                        <div className="font-medium text-gray-800 text-[13px] leading-tight">
                          {trimText(task.name || "Untitled task", 15)}
                        </div>
                        {task.description && (
                          <p className="text-gray-500 text-xs mt-1">{trimText(task.description, 35)}</p>
                        )}
                      </div>

                      {/* Footer */}
                      <div className="flex justify-between items-center mt-2 text-[11px] text-gray-500">
                        <span className="truncate">
                          Due: {task.due_date ? new Date(task.due_date).toLocaleDateString() : "—"}
                        </span>
                        {task.priority && <PriorityComponent value={task.priority} onChange={() => {}} />}
                      </div>

                      {/* Delete button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // prevent opening task modal
                          handleDelete(task._id);
                        }}
                        className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                        title="Delete task"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </Draggable>
              ))
            )}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}
