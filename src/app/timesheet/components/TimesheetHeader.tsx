"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { Play, Square } from "lucide-react";
import { format } from "date-fns";
import NewTask from "@/app/task/components/NewTask";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";


interface Project {
  _id: string;
  name: string;
}
interface Task {
  _id: string;
  title?: string;
  name?: string;
  project_id?: string;
}

interface TimesheetHeaderProps {
  onStart: () => void;
  onPause: () => void;
  isRunning: boolean;
  elapsed: number;
  currentDate: Date;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  view: string;
  setView: (v: string) => void;
  role: string;
  employeeId: string;
  departmentId: string;
  activeProject?: string | null;
  activeTask?: string | null;
  onProjectChange: (id: string) => void;
  onTaskChange: (id: string) => void;
  onSwitchContext?: (projectId: string, taskId: string) => void;
  onProjectsLoaded?: (projects: Project[]) => void;
  timesheets?: any[];
  showSelectors: boolean;
  setShowSelectors: (v: boolean) => void;
  onEnsureRow?: (projectId: string, taskId?: string | null) => Promise<void>;
}
interface NewTaskProps {
  onClose: () => void;
  onSave: (task: any) => void;
  defaultProjectId?: string;
  departmentId?: string;
  mode?: string;         
  employeeId?: string;    
}



export default function TimesheetHeader({
  onStart,
  onPause,
  isRunning,
  elapsed,
  currentDate,
  onPrev,
  onNext,
  onToday,
  view,
  setView,
  departmentId,
  activeProject,
  activeTask,
  onProjectChange,
  onTaskChange,
  onSwitchContext,
  onProjectsLoaded,
  timesheets,
  showSelectors,
  setShowSelectors,
  onEnsureRow,
}: TimesheetHeaderProps) {
  const { data: session, status } = useSession();
  const employeeId = (session?.user as any)?.employeeId;
  const role = (session?.user as any)?.role;

  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedTask, setSelectedTask] = useState("");
  const [isStopping, setIsStopping] = useState(false);
  const [showNewTaskModal, setShowNewTaskModal] = useState(false); 
  // 🧩 sync selection
  useEffect(() => {
    setSelectedProject(activeProject || "");
    setSelectedTask(activeTask || "");
  }, [activeProject, activeTask]);

  
  // 🧩 derive unique projects from timesheets

useEffect(() => {
  if (!timesheets?.length) {
    setProjects([]);
    return;
  }

  // 🧩 derive unique projects
  const uniqueProjects = Array.from(
    new Map(
      timesheets.map((t, idx) => {
        let proj: any;
        if (t.project_id && typeof t.project_id === "object") {
          proj = t.project_id;
        } else if (
          typeof t.project_id === "string" &&
          /^[0-9a-fA-F]{24}$/.test(t.project_id)
        ) {
          proj = {
            _id: t.project_id,
            name: t.project_name || t.project || "Unnamed Project",
          };
        } else if (t.project_name) {
          proj = { _id: `fake-${idx}`, name: t.project_name };
        } else if (t.project) {
          proj = { _id: `fake-${idx}`, name: t.project };
        } else {
          proj = { _id: `unknown-${idx}`, name: "Unnamed Project" };
        }
        return [proj._id, proj];
      })
    ).values()
  );

  setProjects(uniqueProjects);
}, [timesheets]);



  // 🧩 fetch tasks
 // 🧠 Fetch tasks when selected project changes
useEffect(() => {
  if (!selectedProject) {
    setTasks([]);
    return;
  }

  const projectIdForFetch = selectedProject;
  if (!/^[0-9a-fA-F]{24}$/.test(projectIdForFetch)) {
    console.warn("⚠️ Not a valid ObjectId:", projectIdForFetch);
    setTasks([]);
    return;
  }

  axios
    .get(`http://localhost:5000/api/tasks?project_id=${projectIdForFetch}`)
    .then((res) => setTasks(res.data.data || res.data || []))
    .catch((err) => console.error("❌ Tasks load error:", err));
}, [selectedProject]);

  // notify parent
  useEffect(() => onProjectChange(selectedProject), [selectedProject]);
  useEffect(() => onTaskChange(selectedTask), [selectedTask]);

  // timer format
  const formatTime = (sec: number) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return `${h.toString().padStart(2, "0")}:${m
      .toString()
      .padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // handle start/pause click
const handleStartClick = () => {
  onStart();
  setShowSelectors(true);

  // 🧠 Auto-select first available project if none selected
  if (!selectedProject && projects.length > 0) {
    const firstProject = projects[0];
    setSelectedProject(firstProject._id);
  }
};



const handlePauseClick = async () => {
  if (isStopping) return; // ⛔ Prevent multiple fast clicks
  setIsStopping(true);

  try {
    await onPause(); // ✅ Wait for backend to save
    setShowSelectors(false);
  } finally {
    setIsStopping(false);
  }
};



 return (
  <div className="flex flex-wrap items-center justify-between bg-white border border-gray-200 rounded-lg px-4 py-3 shadow-sm gap-4">
    {/* Left: Timer Controls */}
    <div className="flex items-center gap-4">
      <button
        onClick={isRunning ? handlePauseClick : handleStartClick}
        className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium text-[13px] transition-colors duration-150 shadow-sm ${
          isRunning
            ? "bg-red-600 hover:bg-red-700 text-white"
            : "bg-[#65435c] hover:bg-[#55394e] text-white"
        }
        `}
      >
        {isRunning ? <Square size={14} /> : <Play size={14} />}
        {isRunning ? "Stop" : "Start"}
      </button>

      <span className="font-mono text-[15px] text-gray-800">{formatTime(elapsed)}</span>
    </div>

    {/* Middle: Project & Task selectors */}
{showSelectors && (
  <div className="flex items-center gap-3 transition-all duration-200">
    {/* Project dropdown */}
    <select
      className="border border-gray-300 rounded-md px-2.5 py-1.5 text-[13px] text-gray-800 focus:ring-1 focus:ring-[#65435c] focus:border-[#65435c] min-w-[160px]"
      value={selectedProject}
      onChange={async (e) => {
        const newProj = e.target.value;
        setSelectedProject(newProj);
        setSelectedTask("");

        if (isRunning && onSwitchContext) {
          // timer running → switch context only
          onSwitchContext(newProj, "");
        } else if (onEnsureRow && newProj) {
          // timer NOT running → ensure a plain project row exists
          await onEnsureRow(newProj, null);
        }
      }}
    >
      <option value="">Select Project</option>
      {projects.map((p) => (
        <option key={p._id} value={p._id}>
          {p.name}
        </option>
      ))}
    </select>

    {/* Task dropdown */}
    <div className="relative">
      <select
        className="border border-gray-300 rounded-md px-2.5 py-1.5 text-[13px] text-gray-800 focus:ring-1 focus:ring-[#65435c] focus:border-[#65435c] min-w-[180px] appearance-none"
        value={selectedTask}
        onChange={async (e) => {
          if (e.target.value === "__new__") {
            setShowNewTaskModal(true);
            return;
          }

          const newTask = e.target.value;
          setSelectedTask(newTask);

          if (isRunning && onSwitchContext) {
            // running → switch timer context
            onSwitchContext(selectedProject, newTask);
          } else if (onEnsureRow && selectedProject && newTask) {
            // not running → ensure "project | task" row exists
            await onEnsureRow(selectedProject, newTask);
          }
        }}
        disabled={!selectedProject}
      >
        <option value="">Select Task</option>
        {tasks.map((t) => (
          <option key={t._id} value={t._id}>
            {t.title || t.name}
          </option>
        ))}
        {selectedProject && <option value="__new__">➕ Add New Task</option>}
      </select>
    </div>
  </div>
)}


    {/* Right: Date Controls */}
    <div className="flex items-center gap-2 text-[13px]">
      <button
        onClick={onPrev}
        className="px-2 py-1 border border-gray-300 rounded-md hover:bg-gray-100 transition"
        title="Previous"
      >
        ‹
      </button>
      <span className="font-medium w-28 text-center text-gray-800">
        {format(currentDate, "EEE, MMM dd")}
      </span>
      <button
        onClick={onNext}
        className="px-2 py-1 border border-gray-300 rounded-md hover:bg-gray-100 transition"
        title="Next"
      >
        ›
      </button>
      <button
        onClick={onToday}
        className="px-2 py-1 border border-gray-300 rounded-md hover:bg-gray-100 transition"
      >
        Today
      </button>

      <select
        className="border border-gray-300 rounded-md px-2 py-1 text-[13px] text-gray-700 focus:ring-1 focus:ring-[#65435c] focus:border-[#65435c]"
        value={view}
        onChange={(e) => setView(e.target.value)}
      >
        <option value="day">Day</option>
        <option value="week">Week</option>
        <option value="month">Month</option>
      </select>
    </div>
    {/* 🆕 New Task Modal */}
{showNewTaskModal && (
<NewTask
  defaultProjectId={selectedProject}
  departmentId={departmentId}
  mode="timesheet"
  onClose={() => setShowNewTaskModal(false)}
  onSave={async (newTask) => {
    const token = (session as any)?.accessToken;

    try {
      // 🧩 STEP 1: Assign the logged-in employee to the created task
      const updated = await axios.put(
        `http://localhost:5000/api/tasks/${newTask._id}`,
        { assignee: employeeId },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // 🧩 STEP 2: Update UI (dropdown + select)
      const task = updated.data.data || updated.data || newTask;

      setTasks((prev) => [...prev, task]);
      setSelectedTask(task._id);

      // 🧩 STEP 3: Sync with timer context if active
      if (isRunning && onSwitchContext) {
        onSwitchContext(selectedProject, task._id);
      }

      toast.success("✅ Task assigned to you automatically!");
    } catch (err) {
      console.error("❌ Error assigning task:", err);
      toast.error("Failed to assign task to you.");
    } finally {
      setShowNewTaskModal(false);
    }
  }}
/>

)}


  </div>
  
);

}
