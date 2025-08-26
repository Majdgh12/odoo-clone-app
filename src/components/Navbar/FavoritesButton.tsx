"use client";

import React, { useState } from 'react';
import { Star, ChevronDown } from 'lucide-react';

interface FavoritesButtonProps {
    onFavoriteToggle: () => void;
}

const FavoritesButton: React.FC<FavoritesButtonProps> = ({ onFavoriteToggle }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium"
            >
                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                <span>Favorites</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                    <div className="p-4">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold text-gray-800 text-sm">Favorites</h3>
                            <button className="text-blue-600 hover:text-blue-700 text-sm">
                                Save current search
                            </button>
                        </div>

                        <div className="text-center py-8 text-gray-500">
                            <Star className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                            <p className="text-sm">No favorites saved yet</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FavoritesButton;