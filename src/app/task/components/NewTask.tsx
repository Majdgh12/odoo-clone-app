'use client';
import React, { useState, useEffect, ChangeEvent } from 'react';
import { X } from 'lucide-react';
import PriorityComponent from './PriorityComponent';
import StatusComponent from './StatusComponent';

// Define interfaces (adjust if your actual interfaces differ)
interface Project {
  _id: string;
  name: string;
}

interface Employee {
  _id: string;
  full_name: string;
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
}

const NewTask: React.FC<NewTaskProps> = ({ onClose, onSave }) => {
  const [newTask, setNewTask] = useState<NewTaskState>({
    title: '',
    project: '',
    assign: '',
    due_date: '',
    description: '',
    priority: 'normal',
    status: 'todo',
    showStatusMenu: false,
  });
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState<boolean>(true);
  const [errorProjects, setErrorProjects] = useState<string | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState<boolean>(true);
  const [errorEmployees, setErrorEmployees] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      setLoadingProjects(true);
      setErrorProjects(null);
      try {
        const response = await fetch('http://localhost:5000/api/projects');
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const data = await response.json();
        console.log('Projects API Response:', data);
        // Handle various response formats
        const projectsData = Array.isArray(data) ? data : data.data || data.projects || [];
        if (!projectsData.length) {
          throw new Error('No projects found or invalid data format');
        }
        setProjects(projectsData);
      } catch (err) {
        console.error('Fetch Projects Error:', err);
        setErrorProjects(err.message || 'Error loading projects');
        setProjects([]);
      } finally {
        setLoadingProjects(false);
      }
    };

    fetchProjects();
  }, []);

  useEffect(() => {
    const fetchEmployees = async () => {
      setLoadingEmployees(true);
      setErrorEmployees(null);
      try {
        const response = await fetch('http://localhost:5000/api/employees');
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const data = await response.json();
        console.log('Raw Employees Response:', data);

        let employeesData = [];
        if (Array.isArray(data)) {
          employeesData = data;
        } else if (data.data && Array.isArray(data.data)) {
          employeesData = data.data;
        } else if (data.employees && Array.isArray(data.employees)) {
          employeesData = data.employees;
        } else {
          console.warn('Unexpected employees response format:', data);
          employeesData = [];
        }

        console.log('Parsed Employees Data:', employeesData);
        if (employeesData.length === 0) {
          console.warn('No employees found in response');
        }
        setEmployees(employeesData);
      } catch (err) {
        console.error('Fetch Employees Error:', err);
        setErrorEmployees(`Error loading employees: ${err.message}`);
        setEmployees([]);
      } finally {
        setLoadingEmployees(false);
      }
    };

    fetchEmployees();
  }, []);

  const handleInputChange = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ): void => {
    const { name, value } = event.target;
    setNewTask((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleStatusChange = (status: "todo" | "in_progress" | "done" | "blocked" | "cancelled") => {
    setNewTask((prev) => ({
      ...prev,
      status: status as NewTaskState['status'],
    }));
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTask.title,
          project_id: newTask.project || null,
          assignee: newTask.assign || null,
          due_date: newTask.due_date ? new Date(newTask.due_date).toISOString() : null,
          description: newTask.description || '',
          priority: newTask.priority || 'normal',
          status: newTask.status || 'todo',
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, ${errorText}`);
      }

      const createdTask = await response.json();
      onSave(createdTask);
      onClose();
    } catch (err) {
      alert(err.message || 'Failed to create task');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded-lg shadow-lg w-screen max-w-none h-[95vh] mx-6 sm:mx-12 lg:mx-24">
        <h2 className="text-2xl font-semibold text-gray-900 mb-1">New Task</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <input
              type="text"
              name="title"
              value={newTask.title}
              onChange={handleInputChange}
              className="mt-1 p-3 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-[#65435c] focus:border-transparent"
              placeholder="Task Title..."
              required
            />
          </div>
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700 w-24">Project</label>
            {loadingProjects ? (
              <p className="p-3 text-gray-600">Loading projects...</p>
            ) : errorProjects ? (
              <p className="p-3 text-red-600">{errorProjects}</p>
            ) : (
              <select
                name="project"
                value={newTask.project}
                onChange={handleInputChange}
                className="flex-1 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#65435c] focus:border-transparent"
                required
              >
                <option value="">Select Project...</option>
                {projects.length > 0 ? (
                  projects.map((proj) => (
                    <option key={proj._id} value={proj._id}>
                      {proj.name}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>
                    No projects available
                  </option>
                )}
              </select>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700 w-24">Assign</label>
            {loadingEmployees ? (
              <p className="p-3 text-gray-600">Loading employees...</p>
            ) : errorEmployees ? (
              <p className="p-3 text-red-600">{errorEmployees}</p>
            ) : (
              <select
                name="assign"
                value={newTask.assign}
                onChange={handleInputChange}
                className="flex-1 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#65435c] focus:border-transparent"
              >
                <option value="">Select Employee...</option>
                {employees.length > 0 ? (
                  employees.map((emp) => (
                    <option key={emp._id} value={emp._id}>
                      {emp.full_name}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>
                    No employees available
                  </option>
                )}
              </select>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <label className="block text-sm font-medium text-gray-700">Deadline</label>
            <input
              type="date"
              name="due_date"
              value={newTask.due_date}
              onChange={handleInputChange}
              className="mt-1 p-3 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-[#65435c] focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              name="description"
              value={newTask.description}
              onChange={handleInputChange}
              className="mt-1 p-3 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-[#65435c] focus:border-transparent h-32 resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <PriorityComponent
              value={newTask.priority}
              onChange={(priority) => setNewTask((prev) => ({ ...prev, priority }))}
            />
          </div>
          
          {/* Using StatusComponent */}
          <StatusComponent
            value={newTask.status}
            onChange={handleStatusChange}
            showMenu={newTask.showStatusMenu}
            onToggleMenu={() => setNewTask((prev) => ({ ...prev, showStatusMenu: !prev.showStatusMenu }))}
            label="Stage"
          />

          <div className="flex justify-end space-x-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded text-sm font-medium hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#65435c] text-white rounded text-sm font-medium hover:bg-[#55394e] transition-colors"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewTask;