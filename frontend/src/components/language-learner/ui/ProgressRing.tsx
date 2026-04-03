import React, { useEffect, useState } from 'react';

interface ProgressRingProps {
  progress: number; // 0-100
  size?: number;
  strokeWidth?: number;
  color?: string;
  backgroundColor?: string;
  showPercentage?: boolean;
  animated?: boolean;
  label?: string;
  className?: string;
}

const ProgressRing: React.FC<ProgressRingProps> = ({
  progress,
  size = 120,
  strokeWidth = 8,
  color = '#47bdff',
  backgroundColor = '#e5e7eb',
  showPercentage = true,
  animated = true,
  label,
  className = ''
}) => {
  const [currentProgress, setCurrentProgress] = useState(animated ? 0 : progress);
  
  useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => {
        setCurrentProgress(progress);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setCurrentProgress(progress);
    }
  }, [progress, animated]);

  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (currentProgress / 100) * circumference;

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
        style={{ transform: 'rotate(-90deg)' }}
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
          fill="none"
          className="dark:stroke-gray-700"
        />
        
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={animated ? 'transition-all duration-700 ease-out' : ''}
          style={{
            strokeDashoffset: offset
          }}
        />
      </svg>
      
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {showPercentage && (
          <span className="text-2xl font-bold text-gray-900 dark:text-white">
            {Math.round(currentProgress)}%
          </span>
        )}
        {label && (
          <span className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            {label}
          </span>
        )}
      </div>
    </div>
  );
};

export default ProgressRing;