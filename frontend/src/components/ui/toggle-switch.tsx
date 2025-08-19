import React from 'react';
import { cn } from '../../lib/utils';

interface ToggleSwitchProps {
  leftLabel: string;
  rightLabel: string;
  value: string;
  onChange: (value: string) => void;
  leftValue: string;
  rightValue: string;
  className?: string;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  leftLabel,
  rightLabel,
  value,
  onChange,
  leftValue,
  rightValue,
  className
}) => {
  return (
    <div className={cn("relative inline-flex items-center bg-gray-100 rounded-full p-1", className)}>
      {/* Background slider */}
      <div
        className={cn(
          "absolute top-1 bottom-1 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 shadow-lg transition-all duration-300 ease-in-out",
          value === leftValue ? "left-1 right-1/2" : "left-1/2 right-1"
        )}
      />
      
      {/* Left option */}
      <button
        type="button"
        onClick={() => onChange(leftValue)}
        className={cn(
          "relative z-10 px-6 py-2 text-sm font-medium rounded-full transition-all duration-300 ease-in-out",
          value === leftValue
            ? "text-white"
            : "text-gray-600 hover:text-gray-800"
        )}
      >
        {leftLabel}
      </button>
      
      {/* Right option */}
      <button
        type="button"
        onClick={() => onChange(rightValue)}
        className={cn(
          "relative z-10 px-6 py-2 text-sm font-medium rounded-full transition-all duration-300 ease-in-out",
          value === rightValue
            ? "text-white"
            : "text-gray-600 hover:text-gray-800"
        )}
      >
        {rightLabel}
      </button>
    </div>
  );
};

export default ToggleSwitch;
