'use client';
import React, { useEffect, useState } from "react";
import TaskColumn from "../components/TaskColumn";
import TaskDetails from "../components/TaskDetails";

interface Task {
  _id: string;
  name: string;
  description?: string;
  due_date?: string;
  stage?: "todo" | "in_progress" | "done" | "cancelled";
  priority?: "low" | "normal" | "high";
  status?: "todo" | "in_progress" | "done" | "cancelled";
}

export default function MyTasks() {
  const [tasks, setTasks] = useState({
    todo: [] as Task[],
    in_progress: [] as Task[],
    done: [] as Task[],
    cancelled: [] as Task[],
  });

  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const mapStatusToStage = (status: string) => {
    switch (status) {
      case "todo": return "todo";
      case "in_progress": return "in_progress";
      case "done": return "done";
      case "cancelled": return "cancelled";
      default: return "todo";
    }
  };

  const updateTaskInColumns = (updatedTask: Task) => {
    setTasks((prev) => {
      const newTasks = { ...prev };
      
      // Remove task from all columns
      for (const col in newTasks) {
        newTasks[col as keyof typeof newTasks] = newTasks[col as keyof typeof newTasks].filter(t => t._id !== updatedTask._id);
      }

      // Add task to the correct status column
      const status = updatedTask.status || "todo";
      const columnKey = status as keyof typeof newTasks;
      
      if (newTasks.hasOwnProperty(columnKey)) {
        newTasks[columnKey].push({ 
          ...updatedTask, 
          stage: mapStatusToStage(status) 
        });
      }

      return newTasks;
    });
  };

  useEffect(() => {
    async function fetchTasks() {
      try {
        const res = await fetch("http://localhost:5000/api/tasks", {
          headers: { 
            "Content-Type": "application/json", 
            Authorization: `Bearer ${localStorage.getItem("token")}` 
          },
        });
        const data = await res.json();

        const grouped = {
          todo: [] as Task[],
          in_progress: [] as Task[],
          done: [] as Task[],
          cancelled: [] as Task[],
        };

        data.forEach((task: any) => {
          const status = task.status || "todo";
          const stage = mapStatusToStage(status);
          
          const taskWithStage: Task = {
            _id: task._id,
            name: task.title,
            description: task.description,
            due_date: task.due_date,
            stage,
            priority: task.priority || "normal",
            status: status,
          };

          // Group by status
          const columnKey = status as keyof typeof grouped;
          if (grouped.hasOwnProperty(columnKey)) {
            grouped[columnKey].push(taskWithStage);
          } else {
            // Fallback to todo if status is unknown
            grouped.todo.push(taskWithStage);
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

  const columns = [
    { id: "todo", title: "To Do", tasks: tasks.todo },
    { id: "in_progress", title: "In Progress", tasks: tasks.in_progress },
    { id: "done", title: "Done", tasks: tasks.done },
    { id: "cancelled", title: "Cancelled", tasks: tasks.cancelled },
  ];

  if (loading) return <div className="p-8 text-gray-500">Loading...</div>;

  return (
    <div className="p-6 flex gap-6 overflow-x-auto bg-[#fdfdfd]">
      {columns.map(col => (
        <TaskColumn
          key={col.id}
          title={col.title}
          tasks={col.tasks}
          onTaskClick={task => setSelectedTask(task)}
        />
      ))}

      {selectedTask && (
        <TaskDetails
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onSave={updateTaskInColumns}
        />
      )}
    </div>
  );
}