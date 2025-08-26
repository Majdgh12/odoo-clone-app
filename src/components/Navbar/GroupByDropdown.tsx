"use client";

import React, { useState } from 'react';
import { ChevronDown, Users, Plus } from 'lucide-react';

interface GroupByDropdownProps {
    onGroupByChange: (groupBy: string) => void;
}

const GroupByDropdown: React.FC<GroupByDropdownProps> = ({ onGroupByChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedGroupBy, setSelectedGroupBy] = useState('Manager');

    const groupOptions = [
        'Manager',
        'Department',
        'Job Position',
        'Start Date',
        'Tags'
    ];

    const handleGroupBySelect = (option: string) => {
        setSelectedGroupBy(option);
        onGroupByChange(option);
        setIsOpen(false);
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium"
            >
                <Users className="w-4 h-4" />
                <span>Group By</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                    <div className="p-2">
                        {groupOptions.map((option) => (
                            <button
                                key={option}
                                onClick={() => handleGroupBySelect(option)}
                                className={`w-full text-left px-3 py-2 rounded-md text-sm hover:bg-gray-100 ${selectedGroupBy === option ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                                    }`}
                            >
                                {option}
                            </button>
                        ))}

                        <hr className="my-2" />

                        <button className="flex items-center space-x-2 w-full text-left px-3 py-2 rounded-md text-sm text-blue-600 hover:bg-blue-50">
                            <Plus className="w-4 h-4" />
                            <span>Add Custom Group</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GroupByDropdown;