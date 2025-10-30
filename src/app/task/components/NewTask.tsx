'use client';

import React, { useState, useEffect, ChangeEvent } from 'react';
import { X } from 'lucide-react';
import { useSession } from 'next-auth/react';
import PriorityComponent from './PriorityComponent';
import StatusComponent from './StatusComponent';

interface Project {
  _id: string;
  name: string;
}

interface Employee {
  _id: string;
  full_name: string;
  role?: string;
  manager_id?: { _id: string; full_name: string } | string;
  team_lead_id?: { _id: string; full_name: string } | string;
}

interface NewTaskState {
  title: string;
  project: string;
  assign: string;
  due_date: string;
  description: string;
  priority: 'normal' | 'low' | 'high';
  status: 'todo' | 'in_progress' | 'done' | 'blocked';
  showStatusMenu: boolean;
}

interface NewTaskProps {
  onClose: () => void;
  onSave: (task: any) => void;
  defaultProjectId?: string;
  departmentId?: string;
}

const NewTask: React.FC<NewTaskProps> = ({
  onClose,
  onSave,
  defaultProjectId,
  departmentId,
}) => {
  const { data: session } = useSession();
  const [newTask, setNewTask] = useState<NewTaskState>({
    title: '',
    project: defaultProjectId || '',
    assign: '',
    due_date: '',
    description: '',
    priority: 'normal',
    status: 'todo',
    showStatusMenu: false,
  });

  const [projects, setProjects] = useState<Project[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [assignOpen, setAssignOpen] = useState(false);
  const assignRef = React.useRef<HTMLDivElement>(null);
  const userRole = session?.user?.role;
  // Close assign dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (assignRef.current && !assignRef.current.contains(event.target as Node)) {
        setAssignOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch projects and employees
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch projects
        const projRes = await fetch('http://localhost:5000/api/projects');
        const projData = await projRes.json();
        setProjects(Array.isArray(projData) ? projData : projData.data || []);

        // Fetch employees by department
        let empData: any;
        if (departmentId) {
          const empRes = await fetch(`http://localhost:5000/api/employees/department/${departmentId}`);
          empData = await empRes.json();
        } else {
          const empRes = await fetch('http://localhost:5000/api/employees');
          empData = await empRes.json();
        }

        const allEmployees: Employee[] =
          empData.employees || empData.data || (Array.isArray(empData) ? empData : []);

        // Exclude managers/admins
        const filtered = allEmployees.filter(
          (emp) => emp.role !== 'manager' && emp.role !== 'teamlead' && emp.role !== 'admin'
        );

        setEmployees(filtered);
      } catch (err) {
        console.error('Error fetching data:', err);
        setEmployees([]);
      } finally {
        setLoadingProjects(false);
        setLoadingEmployees(false);
      }
    };
    fetchData();
  }, [departmentId]);

  const getEmployeeLabel = (employeeId: string) => {
    const employee = employees.find((emp) => emp._id === employeeId);
    return employee ? employee.full_name : 'Unknown Employee';
  };

  const handleSelectEmployee = (employeeId: string) => {
    setNewTask((prev) => ({ ...prev, assign: employeeId }));
    setAssignOpen(false);
  };

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setNewTask((prev) => ({ ...prev, [name]: value }));
  };

  const handleStatusChange = (
    status: 'todo' | 'in_progress' | 'done' | 'blocked'
  ) => {
    setNewTask((prev) => ({ ...prev, status }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // ✅ Check session and role
    if (!session?.user) {
      alert('User session not found');
      return;
    }
    const userRole = session.user.role || 'employee';
    if (!['manager', 'teamlead', 'admin'].includes(userRole)) {
      alert('You do not have permission to create tasks.');
      return;
    }

    try {
      const payload = {
        title: newTask.title,
        project_id: defaultProjectId || newTask.project,
        assignee: newTask.assign,
        due_date: newTask.due_date ? new Date(newTask.due_date).toISOString() : null,
        description: newTask.description,
        priority: newTask.priority,
        status: newTask.status,
        created_by: session.user.employeeId, // make sure this exists in session
      };

      const token = session.accessToken;
      console.log('Submitting task payload:', payload);
console.log('Token:', token); // if you store JWT in session
      const response = await fetch('http://localhost:5000/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || `HTTP ${response.status}`);
      }

      const created = await response.json();
      onSave(created);
      onClose();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error creating task');
    }
  };
  

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-lg animate-in fade-in slide-in-from-bottom-8">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-xl font-semibold text-gray-800">Create New Task</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto max-h-[80vh]">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Task Title
            </label>
            <input
              type="text"
              name="title"
              value={newTask.title}
              onChange={handleInputChange}
              required
              placeholder="Enter task title..."
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-[#65435c] focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Project
              </label>
              <div className="w-full rounded-lg border border-gray-300 px-3 py-2 ">
                {loadingProjects
                  ? 'Loading...'
                  : projects.find((p) => p._id === newTask.project)?.name || 'Current Project...'}
              </div>
              <input type="hidden" name="project" value={defaultProjectId || newTask.project} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Assign To {departmentId && <span className="text-xs text-gray-400">(Department)</span>}
              </label>
              <div className="relative" ref={assignRef}>
                <button
                  type="button"
                  onClick={() => setAssignOpen((v) => !v)}
                  className="w-full flex items-center justify-between rounded-lg border border-gray-300 px-3 py-2 bg-white text-left"
                >
                  <span className={`truncate ${newTask.assign ? 'text-gray-900' : 'text-gray-400'}`}>
                    {newTask.assign ? getEmployeeLabel(newTask.assign) : 'Select Employee...'}
                  </span>
                  <svg className="w-4 h-4 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M5.23 7.21a.75.75 0 011.06.02L10 11.293l3.71-4.06a.75.75 0 111.12 1.0l-4.25 4.656a.75.75 0 01-1.08 0L5.25 8.28a.75.75 0 01-.02-1.07z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>

                {assignOpen && (
                  <ul className="absolute left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto z-10">
                    {loadingEmployees ? (
                      <li className="px-3 py-2 text-gray-600">Loading...</li>
                    ) : employees.length === 0 ? (
                      <li className="px-3 py-2 text-red-600">No employees found</li>
                    ) : (
                      employees.map((emp) => (
                        <li
                          key={emp._id}
                          onClick={() => handleSelectEmployee(emp._id)}
                          className={`px-3 py-2 cursor-pointer hover:bg-gray-100 ${
                            newTask.assign === emp._id ? 'bg-gray-200' : ''
                          }`}
                        >
                          {emp.full_name}
                        </li>
                      ))
                    )}
                  </ul>
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
            <input
              type="date"
              name="due_date"
              value={newTask.due_date}
              onChange={handleInputChange}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-[#65435c] focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              name="description"
              value={newTask.description}
              onChange={handleInputChange}
              rows={4}
              placeholder="Write a short task description..."
              className="w-full rounded-lg border border-gray-300 px-3 py-2 resize-none focus:ring-2 focus:ring-[#65435c] focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <PriorityComponent
                value={newTask.priority}
                onChange={(priority) => setNewTask((prev) => ({ ...prev, priority }))}
              />
            </div>

            <div>
              <StatusComponent
                value={newTask.status}
                onChange={handleStatusChange}
                showMenu={newTask.showStatusMenu}
                onToggleMenu={() =>
                  setNewTask((prev) => ({ ...prev, showStatusMenu: !prev.showStatusMenu }))
                }
                label="Stage"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-gray-700 bg-gray-200 hover:bg-gray-300 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-[#65435c] text-white font-medium hover:bg-[#55394e] transition-colors"
            >
              Save Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewTask;
