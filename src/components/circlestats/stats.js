import React from 'react';
import './stats.css'
const CircleStats = ({ percentage, color,name }) => {
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - percentage / 100);

  return (
    <div className="circle">
      <svg width="85" height="85" viewBox="0 0 120 120">
        {/* The grey half */}
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="transparent"
          stroke="#e0e0e0"
          strokeWidth="8"
        />
        {/* The colored half */}
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="transparent"
          stroke={color}
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
        {/* The text */}
        <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central">
         {percentage}%
        </text>
      </svg>
      {name} 
    </div>
  );
};

export default CircleStats;
