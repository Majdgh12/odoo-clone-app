"use client";

import React, { useState } from 'react';
import { Plus, Download, Settings, MoreVertical } from 'lucide-react';

interface ActionButtonsProps {
    onNewEmployee: () => void;
    onExport: () => void;
    onSettings: () => void;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
    onNewEmployee,
    onExport,
    onSettings
}) => {
    const [showMoreActions, setShowMoreActions] = useState(false);

    return (
        <div className="flex items-center space-x-2">
   
         {/* Export Button */}
            <button
                onClick={onExport}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                title="Export"
            >
                <Download className="w-4 h-4" />
            </button>

            {/* Settings Button */}
            <button
                onClick={onSettings}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                title="Settings"
            >
                <Settings className="w-4 h-4" />
            </button>

            {/* More Actions Dropdown */}
            <div className="relative">
                <button
                    onClick={() => setShowMoreActions(!showMoreActions)}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                    title="More Actions"
                >
                    <MoreVertical className="w-4 h-4" />
                </button>

                {showMoreActions && (
                    <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                        <div className="p-2">
                            <button className="w-full text-left px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-100">
                                Bulk Edit
                            </button>
                            <button className="w-full text-left px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-100">
                                Import Employees
                            </button>
                            <button className="w-full text-left px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-100">
                                Archive Selected
                            </button>
                            <hr className="my-2" />
                            <button className="w-full text-left px-3 py-2 rounded-md text-sm text-red-600 hover:bg-red-50">
                                Delete Selected
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ActionButtons;