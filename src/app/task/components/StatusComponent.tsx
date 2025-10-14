"use client";
import React from "react";

interface StatusOption {
  value: string;
  label: string;
  color: string;
}

interface StatusComponentProps {
  value: "todo" | "in_progress" | "done" | "cancelled" ;
  onChange: (value: "todo" | "in_progress" | "done" | "cancelled" ) => void;
  showMenu: boolean;
  onToggleMenu: () => void;
  label?: string;
}

const StatusComponent: React.FC<StatusComponentProps> = ({
  value,
  onChange,
  showMenu,
  onToggleMenu,
  label = "Stage"
}) => {
  const statusOptions: StatusOption[] = [
    { value: 'todo', label: 'To Do', color: 'bg-gray-300 text-gray-800' },
    { value: 'in_progress', label: 'In Progress', color: 'bg-yellow-100 text-yellow-700' },
    { value: 'done', label: 'Done', color: 'bg-green-100 text-green-700' },
    { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-700' },
  ];

  const getStatusColor = (status: string) => {
    const option = statusOptions.find(opt => opt.value === status);
    return option ? option.color : 'bg-gray-300 text-gray-800';
  };

  const getStatusLabel = (status: string) => {
    const option = statusOptions.find(opt => opt.value === status);
    return option ? option.label : 'To Do';
  };

  const handleStatusChange = (newValue: string) => {
    onChange(newValue as "todo" | "in_progress" | "done" | "cancelled");
    onToggleMenu();
  };

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <button
        type="button"
        onClick={onToggleMenu}
        className={`px-4 py-2 rounded-full text-sm font-medium w-full text-center ${getStatusColor(value)}`}
      >
        {getStatusLabel(value)}
      </button>

      {showMenu && (
        <div className="absolute mt-2 bg-white border border-gray-200 rounded-lg shadow-md w-48 z-10">
          {statusOptions.map((status) => (
            <button
              key={status.value}
              type="button"
              onClick={() => handleStatusChange(status.value)}
              className={`flex items-center w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${status.color}`}
            >
              {status.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default StatusComponent;