// src/pages/ProminentInventory/components/UndoButton.tsx
import React, { useEffect, useState } from 'react';

interface UndoButtonProps {
  onUndo: () => void;
  onTimeout: () => void;
  timeoutDuration?: number;
}

const UndoButton: React.FC<UndoButtonProps> = ({ 
  onUndo, 
  onTimeout, 
  timeoutDuration = 30 
}) => {
  console.log('UndoButton rendering');
  const [timeLeft, setTimeLeft] = useState(timeoutDuration);

  useEffect(() => {
    setTimeLeft(timeoutDuration); // Reset countdown when component mounts or timeoutDuration changes
    
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeoutDuration, onTimeout]);

  return (
    <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
      <button
        onClick={onUndo}
        className="flex items-center space-x-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M7.707 3.293a1 1 0 010 1.414L5.414 7H11a7 7 0 017 7v2a1 1 0 11-2 0v-2a5 5 0 00-5-5H5.414l2.293 2.293a1 1 0 11-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
            clipRule="evenodd"
          />
        </svg>
        <span>Undo last movement</span>
      </button>
      <span className="text-sm text-gray-500 dark:text-gray-400">
        {timeLeft}s
      </span>
    </div>
  );
};

export default UndoButton;