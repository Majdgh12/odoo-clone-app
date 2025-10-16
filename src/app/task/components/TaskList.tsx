'use client'; // Marks this component as client-side only

import React, { useState, useEffect } from 'react';
import NewTask from './NewTask'; // Adjust the import path as needed

const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);

  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      setError(null);
      try {
        const url = 'http://localhost:5000/api/tasks'; // Fetch all tasks by default
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json', // Basic header, no credentials
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP error! status: ${response.status}, ${errorText}`);
        }

        const data = await response.json();
        setTasks(data);
      } catch (err) {
        setError(err.message || 'Failed to fetch tasks');
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  const handleSaveTask = (newTask) => {
    setTasks((prev) => [...prev, newTask]);
  };

  if (loading) return <div className="p-6 text-center text-gray-700">Loading...</div>;
  if (error) return <div className="p-6 text-center text-red-600">Error: {error}</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6 max-w-9xl mx-auto"> {/* Increased width to max-w-6xl (approx. 1152px) */}
        <div className="mb-6 flex justify-end">
          <button
            onClick={() => setIsNewTaskOpen(true)}
            className="bg-[#65435c] text-white px-4 py-2 rounded text-sm font-medium hover:bg-[#55394e] transition-colors"
          >
            New Task
          </button>
        </div>
        <div className="overflow-x-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}> {/* Constrain height, allow scrolling */}
          <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow">
            <thead>
              <tr className="bg-gray-100 text-left text-gray-600 uppercase text-xs font-semibold">
                <th className="p-4">Title</th>
                <th className="p-4">Project</th>
                <th className="p-4">Assign</th>
                <th className="p-4">Priority</th>
                <th className="p-4">Stage</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <tr key={task._id} className="border-t hover:bg-gray-50">
                  <td className="p-4 text-gray-900">{task.title}</td>
                  <td className="p-4 text-gray-600">{task.project_id ? task.project_id.toString() : '—'}</td>
                  <td className="p-4 text-gray-600">{task.assignee?.full_name || task.assignee?.toString() || 'Unassigned'}</td>
                  <td className="p-4 text-gray-600">{task.priority || '—'}</td>
                  <td className="p-4 text-gray-600">{task.status || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {isNewTaskOpen && <NewTask onClose={() => setIsNewTaskOpen(false)} onSave={handleSaveTask} />}
      </div>
    </div>
  );
};

export default TaskList;