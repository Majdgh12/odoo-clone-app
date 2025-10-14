"use client";

import { useEffect, useState } from "react";
import { isToday, isThisWeek, isThisMonth } from "date-fns";
import {
  DragDropContext,
  Droppable,
  Draggable,
} from "@hello-pangea/dnd";

export default function MyTasks() {
  const [tasks, setTasks] = useState({
    inbox: [],
    today: [],
    thisWeek: [],
    thisMonth: [],
    done: [],
    cancelled: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTasks() {
      try {
        const res = await fetch("http://localhost:5000/api/tasks", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const data = await res.json();

        const grouped = {
          inbox: [],
          today: [],
          thisWeek: [],
          thisMonth: [],
          done: [],
          cancelled: [],
        };

        data.forEach((task) => {
          if (task.stage === "done") grouped.done.push(task);
          else if (task.stage === "cancelled") grouped.cancelled.push(task);
          else {
            const due = new Date(task.due_date);
            if (isToday(due)) grouped.today.push(task);
            else if (isThisWeek(due)) grouped.thisWeek.push(task);
            else if (isThisMonth(due)) grouped.thisMonth.push(task);
            else grouped.inbox.push(task);
          }
        });

        setTasks(grouped);
      } catch (err) {
        console.error("Error fetching tasks:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchTasks();
  }, []);

  if (loading) return <div className="p-4">Loading...</div>;

  // 🔄 Handle drag and drop movement
  const handleDragEnd = (result) => {
    const { source, destination } = result;
    if (!destination) return; // dropped outside any list
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    )
      return;

    const sourceCol = source.droppableId;
    const destCol = destination.droppableId;

    const sourceTasks = Array.from(tasks[sourceCol]);
    const destTasks = Array.from(tasks[destCol]);
    const [movedTask] = sourceTasks.splice(source.index, 1);
    destTasks.splice(destination.index, 0, movedTask);

    setTasks((prev) => ({
      ...prev,
      [sourceCol]: sourceTasks,
      [destCol]: destTasks,
    }));

    // Optionally, update backend (stage or due_date)
    fetch(`http://localhost:5000/api/tasks/${movedTask._id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ stage: destCol }),
    }).catch((err) => console.error("Update failed:", err));
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex flex-col sm:flex-row gap-4 overflow-x-auto p-4">
        {Object.entries(tasks).map(([key, taskList]) => (
          <Droppable droppableId={key} key={key}>
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="min-w-[260px] flex-shrink-0 bg-gray-100 rounded-2xl p-3 shadow-sm"
              >
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-lg font-semibold capitalize">
                    {key.replace(/([A-Z])/g, " $1")}
                  </h2>
                  <span className="text-sm text-gray-500">
                    {taskList.length}
                  </span>
                </div>

                <div className="space-y-2 max-h-[70vh] overflow-y-auto">
                  {taskList.length === 0 ? (
                    <p className="text-gray-400 text-sm italic">No tasks</p>
                  ) : (
                    taskList.map((task, index) => (
                      <Draggable
                        key={task._id}
                        draggableId={task._id}
                        index={index}
                      >
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="bg-white rounded-xl p-3 shadow hover:shadow-md transition"
                          >
                            <h3 className="font-medium text-gray-800">
                              {task.name}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {task.description}
                            </p>
                            <div className="text-xs text-gray-400 mt-1">
                              Due:{" "}
                              {task.due_date
                                ? new Date(task.due_date).toLocaleDateString()
                                : "—"}
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))
                  )}
                  {provided.placeholder}
                </div>
              </div>
            )}
          </Droppable>
        ))}
      </div>
    </DragDropContext>
  );
}
