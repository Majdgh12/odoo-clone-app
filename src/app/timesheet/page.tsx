"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState,useRef } from "react";
import axios from "axios";
import TimesheetHeader from "./components/TimesheetHeader";
import TimesheetGrid from "./components/TimesheetGrid";
import TimesheetForm from "./components/TimesheetForm";
import TimesheetList from "./components/TimesheetList";
import { addDays, addWeeks, addMonths } from "date-fns";
import toast,{Toaster} from "react-hot-toast";

export default function TimesheetPage() {
  const { data: session } = useSession();
  const role = (session?.user as any)?.role;
  const employeeId = (session?.user as any)?.employeeId;
  const departmentId = (session?.user as any)?.departmentId;

  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState("week");
  const [showForm, setShowForm] = useState(false);
  const [timesheets, setTimesheets] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [runningSheetId, setRunningSheetId] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [activeSheet, setActiveSheet] = useState<any | null>(null);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [projects, setProjects] = useState<any[]>([]); // ✅ define this
  const [showSelectors, setShowSelectors] = useState(false);
  const [activeProject, setActiveProject] = useState("");
  const [activeTask, setActiveTask] = useState("");
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [saving, setSaving] = useState(false);
  const previousElapsedRef = useRef(0);

  // 🔁 Fetch timesheets
  useEffect(() => {
    if (!employeeId || !view) return;
    fetchTimesheets();
  }, [employeeId, view, currentDate]);

  const fetchTimesheets = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/api/timesheets/grouped", {
        params: {
          view,
          employee_id: employeeId,
          date: currentDate.toISOString(),
          
        },
        
      });

      const normalized = (res.data.data || []).map((t: any) => ({
        ...t,
        entries: t.entries || t.meta?.entries || {},
      }));

      setTimesheets(normalized);
    } catch (err) {
      console.error("Error fetching timesheets:", err);
      setTimesheets([]);
    } finally {
      setLoading(false);
    }
  };

 
useEffect(() => {
  return () => {
    if (timerRef.current) clearInterval(timerRef.current);
  };
}, []);


  // ▶️ Header Start
const handleStartHeader = async () => {
  let projId = selectedProject;
  let taskId = selectedTask;

  // 🧠 Auto-select the first available timesheet if nothing is selected
  if (!projId && timesheets.length > 0) {
    const firstSheet = timesheets[0];

    const projectObj = firstSheet.project_id;
    const taskObj = firstSheet.task_id;

    projId =
      typeof projectObj === "object" && projectObj !== null
        ? projectObj._id
        : typeof projectObj === "string"
        ? projectObj
        : null;

    taskId =
      typeof taskObj === "object" && taskObj !== null
        ? taskObj._id
        : typeof taskObj === "string"
        ? taskObj
        : null;

    setSelectedProject(projId);
    setSelectedTask(taskId);
  }

  if (!projId) {
    alert("⚠️ No valid project found to start timer. Please add a timesheet first.");
    return;
  }

  // ✅ Start timer cleanly
  setIsRunning(true);
  setElapsed(previousElapsedRef.current || 0);
  setRunningSheetId(null);

  setActiveSheet({
    project_id: projId,
    task_id: taskId,
    startedAt: new Date().toISOString(),
  });

  // 👀 Show dropdown when starting manually
  setShowSelectors(true);

  console.log(`▶️ Timer started on project: ${projId || "none"}, task: ${taskId || "none"}`);
};


  // ▶️ Start from a specific row
// ▶️ Start timer for a specific row
const handleStartForSheet = async (sheet: any) => {
  if (isRunning && runningSheetId === sheet._id) {
    await handlePause();
    return;
  }

  if (isRunning && runningSheetId && runningSheetId !== sheet._id) {
    await handlePause();
  }

  const projId =
    typeof sheet.project_id === "object"
      ? sheet.project_id._id
      : typeof sheet.project_id === "string"
      ? sheet.project_id
      : null;

  const taskId = sheet.task_id?._id || sheet.task_id || sheet.task || null;

  const startedAt = new Date().toISOString();

  setActiveSheet({
    ...sheet,
    project_id: projId,
    task_id: taskId,
    startedAt,
  });

  setSelectedProject(projId);
  setSelectedTask(taskId);
  setRunningSheetId(sheet._id);
  setIsRunning(true);
  setElapsed(0);

  setShowSelectors(true); // ✅ make header dropdowns visible now

  console.log(`▶️ Timer started for sheet ${sheet._id} at ${startedAt}`);
};



// ⏸️ Pause timer and save the elapsed time
const handlePause = async () => {
  if (!activeSheet || saving) return;

  setSaving(true);
  setIsRunning(false);
  if (timerRef.current) {
    clearInterval(timerRef.current);
    timerRef.current = null;
  }

  const now = new Date();
  const startTime = new Date(activeSheet.startedAt);
  if (isNaN(startTime.getTime())) {
    console.warn("⚠️ Invalid start time — skipping save");
    setSaving(false);
    return;
  }

  const diffMs = now.getTime() - startTime.getTime();
  let diffHours = +(diffMs / 3600000).toFixed(4);
  if (diffHours <= 0) diffHours = 0.01; // minimum 36s

  const payload = {
    employee_id: employeeId,
    project_id: activeSheet.project_id,
    task_id: activeSheet.task_id,
    duration: diffHours,
    date: now,
  };

  try {
    console.log("💾 Saving timesheet:", payload);
    if (activeSheet._id) {
      await axios.put(`http://localhost:5000/api/timesheets/${activeSheet._id}`, payload);
    } else {
      await axios.post("http://localhost:5000/api/timesheets", payload);
    }

    toast.success(`✅ Time saved (${(diffHours * 3600).toFixed(0)}s)`);

    // 🧹 Reset state cleanly
    await fetchTimesheets();
    setRunningSheetId(null);
    setActiveSheet(null);
    setElapsed(0);
    setShowSelectors(false);
  } catch (err) {
    console.error("❌ Failed to save timesheet:", err);
    toast.error("Failed to save timesheet!");
  } finally {
    setSaving(false);
  }
};







  // ⏱ Timer ticking
useEffect(() => {
  if (isRunning && activeSheet) {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);
  } else {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }
  

  // Cleanup when unmounting
  return () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };
}, [isRunning, activeSheet]);

  // ⏩ Navigation
  const handlePrev = () => {
    if (view === "day") setCurrentDate((prev) => addDays(prev, -1));
    else if (view === "week") setCurrentDate((prev) => addWeeks(prev, -1));
    else setCurrentDate((prev) => addMonths(prev, -1));
    
  };

  const handleNext = () => {
    if (view === "day") setCurrentDate((prev) => addDays(prev, 1));
    else if (view === "week") setCurrentDate((prev) => addWeeks(prev, 1));
    else setCurrentDate((prev) => addMonths(prev, 1));
  };
  // below other functions
const getId = (val: any) =>
  typeof val === "object" && val?._id ? val._id : typeof val === "string" ? val : null;

// ensure there is a row for this project/task for the current user/period
const ensureTimesheetRow = async (projectId: string, taskId?: string | null) => {
  if (!projectId) return;

  // already exists?
  const exists = timesheets.some((t: any) => {
    const pid = getId(t.project_id) || t.project;   // tolerate grouped shape
    const tid = getId(t.task_id) || t.task || null;
    return pid === projectId && (tid || null) === (taskId || null);
  });
  if (exists) return;

  // create empty row with 0 duration for current date bucket
  await axios.post("http://localhost:5000/api/timesheets", {
    employee_id: employeeId,
    project_id: projectId,
    task_id: taskId || null,
    duration: 0,
    date: currentDate,          // use whichever date the grid is showing
  });

  await fetchTimesheets();      // refresh grid so the new row shows up
};

// 🧠 Safe helper
const safeId = (val: any) =>
  val && typeof val === "object" ? val._id : val || null;

// 🔄 switch the current running timer context to a new project/task
// 🔄 switch the current running timer context to a new project/task
const switchTimerContext = async (newProjectId: string, newTaskId?: string | null) => {
  if (!isRunning || !activeSheet) return;

  console.log("🔄 Switching context to:", newProjectId, newTaskId);

  const now = new Date();

  // 1️⃣ Compute how long user spent on the previous project before switching
  const startTime = new Date(activeSheet.startedAt || activeSheet.switchedAt || now);
  const diffMs = now.getTime() - startTime.getTime();
  let diffHours = +(diffMs / 3600000).toFixed(4);
  if (diffHours <= 0) diffHours = 0.01;

  // 2️⃣ Save that duration for the old active sheet
  try {
    const payload = {
      employee_id: employeeId,
      project_id: activeSheet.project_id,
      task_id: activeSheet.task_id,
      duration: diffHours,
      date: now,
    };

    if (activeSheet._id && !activeSheet._id.startsWith("temp")) {
      await axios.put(`http://localhost:5000/api/timesheets/${activeSheet._id}`, payload);
    } else {
      await axios.post(`http://localhost:5000/api/timesheets`, payload);
    }
    toast.success("Timer switched to new project/task!");

    console.log(`✅ Saved ${diffHours.toFixed(2)}h for previous sheet`);
  } catch (err) {
    console.warn("⚠️ Couldn’t save old timesheet during switch:", err);
  }

  // 3️⃣ Keep elapsed time — don’t reset timer
  previousElapsedRef.current = elapsed;

  // 4️⃣ Find or create target sheet
  const exists = timesheets.some((t) => {
    const pid = safeId(t.project_id) || t.project;
    const tid = safeId(t.task_id) || t.task || null;
    return pid === newProjectId && (tid || null) === (newTaskId || null);
  });

  if (!exists) {
    const projectName =
      projects.find((p) => p._id === newProjectId)?.name ||
      timesheets.find((t) => getId(t.project_id) === newProjectId)?.project_name ||
      "Unnamed Project";

    const taskTitle =
      timesheets.find((t) => getId(t.task_id) === newTaskId)?.task_title ||
      "New Task";

    const newRow = {
      _id: `temp-${Date.now()}`,
      project_id: { _id: newProjectId, name: projectName },
      task_id: newTaskId ? { _id: newTaskId, title: taskTitle } : null,
      entries: {},
      total: 0,
    };

    setTimesheets((prev) => [...prev, newRow]);
  }

  // 5️⃣ Switch the active sheet reference

  setActiveSheet({
    project_id: newProjectId,
    task_id: newTaskId,
    startedAt: now.toISOString(), // new starting point for diff next time
  });

  setRunningSheetId(`temp-${newProjectId}-${newTaskId}||"none"`);

  // 6️⃣ Continue timer tick
  if (!timerRef.current) {
    timerRef.current = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);
  }

  console.log("⏱ Timer continues on new context, no reset!");
};




  return (
    <div className="pt-24 px-6 max-w-6xl mx-auto space-y-6">
      <Toaster position="bottom-right"/>
     <TimesheetHeader
  view={view}
  setView={setView}
  onStart={handleStartHeader}
  onPause={handlePause}
  isRunning={isRunning}
  elapsed={elapsed}
  currentDate={currentDate}
  onPrev={handlePrev}
  onNext={handleNext}
  onToday={() => setCurrentDate(new Date())}
  role={role}
  employeeId={employeeId}
  departmentId={departmentId}
  activeProject={selectedProject}
  activeTask={selectedTask}
  onProjectChange={setSelectedProject}
  onTaskChange={setSelectedTask}
  onProjectsLoaded={setProjects}
  timesheets={timesheets} 
  showSelectors={showSelectors}            // 👈 ADD THIS
  setShowSelectors={setShowSelectors}
  onEnsureRow={ensureTimesheetRow}
  onSwitchContext={switchTimerContext}
  
/>


      {currentDate && (
        <TimesheetGrid
          timesheets={timesheets}
          view={view}
          onStartTimer={handleStartForSheet}
          currentDate={currentDate}
          onAddLine={() => setShowForm(true)}
          isRunning={isRunning}
          runningSheetId={runningSheetId}
          activeSheet={activeSheet}
        />
      )}

      {showForm && (
        <TimesheetForm
          role={role}
          employeeId={employeeId}
          onTimesheetCreated={() => {
            fetchTimesheets();
            setShowForm(false);
          }}
          onClose={() => setShowForm(false)}
        />
      )}

      <TimesheetList />
    </div>
  );
}
