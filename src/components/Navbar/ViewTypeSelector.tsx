"use client";

import React, { useState } from 'react';
import { Grid3X3, List, MoreHorizontal } from 'lucide-react';

interface ViewTypeSelectorProps {
    onViewTypeChange: (viewType: 'grid' | 'list' | 'kanban') => void;
}

const ViewTypeSelector: React.FC<ViewTypeSelectorProps> = ({ onViewTypeChange }) => {
    const [selectedView, setSelectedView] = useState<'grid' | 'list' | 'kanban'>('grid');

    const handleViewChange = (viewType: 'grid' | 'list' | 'kanban') => {
        setSelectedView(viewType);
        onViewTypeChange(viewType);
    };

    return (
        <div className="flex items-center bg-gray-200 rounded-lg p-1">
            <button
                onClick={() => handleViewChange('grid')}
                className={`p-2 rounded-md transition-colors ${selectedView === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-gray-300'
                    }`}
                title="Grid View"
            >
                <Grid3X3 className="w-4 h-4 text-black" />
            </button>

            <button
                onClick={() => handleViewChange('list')}
                className={`p-2 rounded-md transition-colors ${selectedView === 'list' ? 'bg-white shadow-sm' : 'hover:bg-gray-300'
                    }`}
                title="List View"
            >
                <List className="w-4 h-4 text-black" />
            </button>

            <button
                onClick={() => handleViewChange('kanban')}
                className={`p-2 rounded-md transition-colors ${selectedView === 'kanban' ? 'bg-white shadow-sm' : 'hover:bg-gray-300'
                    }`}
                title="More Views"
            >
                <MoreHorizontal className="w-4 h-4 text-black" />
            </button>
        </div>
    );
};

export default ViewTypeSelector;