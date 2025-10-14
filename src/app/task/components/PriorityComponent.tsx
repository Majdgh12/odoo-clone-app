'use client';
import React from "react";

interface PriorityProps {
  value: "low" | "normal" | "high";
  onChange: (newPriority: "low" | "normal" | "high") => void;
}

const PriorityComponent: React.FC<PriorityProps> = ({ value, onChange }) => {
  return (
    <div className="flex items-center space-x-2">
      {[1, 2, 3].map((i) => {
        const filled =
          (value === "low" && i <= 1) ||
          (value === "normal" && i <= 2) ||
          (value === "high" && i <= 3);
        const priority = i === 1 ? "low" : i === 2 ? "normal" : "high";
        return (
          <span
            key={i}
            className={`cursor-pointer text-2xl transition ${
              filled ? "text-yellow-500" : "text-gray-300"
            }`}
            onClick={() => onChange(priority)}
          >
            ★
          </span>
        );
      })}
    </div>
  );
};

export default PriorityComponent;
