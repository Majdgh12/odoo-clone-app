'use client';
import React, { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import TaskColumn from "../components/TaskColumn";
import TaskDetails from "../components/TaskDetails";

interface Task {
  _id: string;
  name: string;
  description?: string;
  due_date?: string;
  stage?: "todo" | "in_progress" | "done" | "blocked";
  priority?: "low" | "normal" | "high";
  status?: "todo" | "in_progress" | "done" | "blocked";
  project_name?: string;
  assignee_name?: string;
  
}


export default function MyTasks({
  projectId,
  page=1,
  limit=10,
  searchTerm="",
  onTasksInfoChange,

}: {projectId?: string, page?: number, limit?: number, searchTerm?: string, onTasksInfoChange?:(info:{totalTasks:number})=>void}) {
  const [tasks, setTasks] = useState({
    todo: [] as Task[],
    in_progress: [] as Task[],
    done: [] as Task[],
    blocked: [] as Task[],
  });

  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const mapStatusToStage = (status: string) => {
    switch (status) {
      case "todo": return "todo";
      case "in_progress": return "in_progress";
      case "done": return "done";
      case "blocked": return "blocked";
      default: return "todo";
    }
  };

  // Handle drag and drop
  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    // If dropped outside any column or same position
    if (!destination || 
        (destination.droppableId === source.droppableId && 
         destination.index === source.index)) {
      return;
    }

    const sourceColumn = source.droppableId as keyof typeof tasks;
    const destColumn = destination.droppableId as keyof typeof tasks;

    try {
      const taskToUpdate = tasks[sourceColumn].find(task => task._id === draggableId);
      if (!taskToUpdate) return;

      const newStatus = destColumn as Task["status"];

      // Update backend WITHOUT AUTH
      const res = await fetch(`http://localhost:5000/api/tasks/${draggableId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.message || "Failed to update task status");
      }

      // Update frontend state - ensure task is only in one column
      setTasks(prev => {
        const newTasks = { ...prev };
        
        // Remove from ALL columns first to prevent duplicates
        Object.keys(newTasks).forEach(column => {
          newTasks[column as keyof typeof newTasks] = newTasks[column as keyof typeof newTasks].filter(
            task => task._id !== draggableId
          );
        });
        
        // Add to destination column with updated status
        const updatedTask = {
          ...taskToUpdate,
          status: newStatus,
          stage: mapStatusToStage(newStatus || "todo")
        };
        
        newTasks[destColumn].splice(destination.index, 0, updatedTask);
        return newTasks;
      });

    } catch (err) {
      console.error("Error updating task status:", err);
      alert("Failed to update task status");
    }
  };

  const updateTaskInColumns = (updatedTask: Task) => {
    setTasks((prev) => {
      const newTasks = { ...prev };
      
      // Remove task from ALL columns first
      for (const col in newTasks) {
        newTasks[col as keyof typeof newTasks] = newTasks[col as keyof typeof newTasks].filter(
          t => t._id !== updatedTask._id
        );
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
        const query=new URLSearchParams();
        if(page) query.append('page', page.toString());
        if(limit) query.append('limit', limit.toString());
        if(searchTerm) query.append('search', searchTerm);

        const url=projectId
          ? `http://localhost:5000/api/tasks?project_id=${projectId}`
          : `http://localhost:5000/api/tasks`;
        const res = await fetch(url, {
          headers: { "Content-Type": "application/json" },
        });
        const data = await res.json();

        const grouped = {
          todo: [] as Task[],
          in_progress: [] as Task[],
          done: [] as Task[],
          blocked: [] as Task[],
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
            project_name: task.project_id?.name || "-",
            assignee_name: task.assignee?.full_name || "Unassigned",
            
          };

          // Group by status - ensure each task only goes to one column
          const columnKey = status as keyof typeof grouped;
          if (grouped.hasOwnProperty(columnKey)) {
            grouped[columnKey].push(taskWithStage);
          } else {
            grouped.todo.push(taskWithStage);
          }
        });

        setTasks(grouped);
        if(onTasksInfoChange) onTasksInfoChange({totalTasks: data.length});
      } catch (err) {
        console.error("Error fetching tasks:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchTasks();
  }, [projectId,page,limit,searchTerm]);

  const columns = [
    { id: "todo", title: "To Do", tasks: tasks.todo },
    { id: "in_progress", title: "In Progress", tasks: tasks.in_progress },
    { id: "done", title: "Done", tasks: tasks.done },
    { id: "blocked", title: "Blocked", tasks: tasks.blocked },
  ];

  if (loading) return <div className="p-8 text-gray-500">Loading...</div>;

  return (
    <DragDropContext onDragEnd={handleDragEnd} enableDefaultSensors>
      <div className="p-6 flex gap-6 overflow-x-auto bg-[#fdfdfd]">
        {columns.map(col => (
          <TaskColumn
            key={col.id}
            title={col.title}
            tasks={col.tasks}
            onTaskClick={task => setSelectedTask(task)}
            columnId={col.id}
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
    </DragDropContext>
  );
}