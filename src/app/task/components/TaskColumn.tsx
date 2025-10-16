'use client';
import React from "react";
import { Droppable, Draggable } from "@hello-pangea/dnd";
import PriorityComponent from "./PriorityComponent";

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
}

export default function TaskColumn({ title, tasks, onTaskClick, columnId }: TaskColumnProps) {
  // helper to safely trim text
  const trimText = (text: string, maxLength: number) => {
    if (!text) return "";
    return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
  };

  return (
   <div
  className="min-w-[300px] flex-shrink-0 bg-[#f8f8f8] rounded-md p-3 border border-gray-200
             flex flex-col" // <--- make column a flex container
  style={{ minHeight: "400px" }} // <--- minimum height for column
>
  {/* Column Header */}
  <div className="flex items-center justify-between mb-2">
    <h2 className="font-semibold text-sm text-gray-800">{title}</h2>
    <span className="text-xs bg-gray-200 text-gray-600 rounded-full px-2 py-[1px]">
      {tasks.length}
    </span>
  </div>

  {/* Progress bar */}
  <div className="w-full h-1 bg-gray-200 rounded-md mb-3">
    <div
      className="h-1 bg-gray-400 rounded-md"
      style={{
        width: `${Math.min(tasks.length * 15, 100)}%`,
      }}
    />
  </div>

  {/* Droppable Area */}
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
                  onClick={() => onTaskClick(task)}
                  className={`bg-white border border-gray-200 rounded-md p-3 text-sm cursor-pointer hover:bg-gray-50 transition-all select-none ${
                    snapshot.isDragging ? "shadow-md border-gray-300" : ""
                  }`}
                  style={{
                    ...provided.draggableProps.style,
                    height: "110px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  {/* Task info */}
                  <div className="flex-1 overflow-hidden">
                    <div className="font-medium text-gray-800 text-[13px] leading-tight">
                      {trimText(task.name || "Untitled task", 15)}
                    </div>
                    {task.description && (
                      <p className="text-gray-500 text-xs mt-1">
                        {trimText(task.description, 35)}
                      </p>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="flex justify-between items-center mt-2 text-[11px] text-gray-500">
                    <span className="truncate">
                      Due:{" "}
                      {task.due_date
                        ? new Date(task.due_date).toLocaleDateString()
                        : "—"}
                    </span>
                    {task.priority && (
                      <PriorityComponent value={task.priority} onChange={() => {}} />
                    )}
                  </div>
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
  )
}