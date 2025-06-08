'use client';

import React, { ReactNode } from 'react';

interface BiCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
  onClick?: () => void;
  isClickable?: boolean;
  userRole?: string[];
}

const BiCard: React.FC<BiCardProps> = ({
  title,
  value,
  icon,
  trend,
  color = 'blue',
  onClick,
  isClickable = true,
  userRole = ['AdminFull']
}) => {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    green: 'bg-green-50 border-green-200 text-green-700',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-700',
    red: 'bg-red-50 border-red-200 text-red-700',
    purple: 'bg-purple-50 border-purple-200 text-purple-700',
  };

  const handleClick = () => {
    if (isClickable && onClick) {
      onClick();
    }
  };

  return (
    <div 
      className={`rounded-lg border p-4 shadow-sm ${colorClasses[color]} ${isClickable ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
      onClick={handleClick}
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-sm font-medium mb-1">{title}</h3>
          <p className="text-2xl font-bold">{value}</p>
          
          {trend && (
            <div className="flex items-center mt-2">
              <span className={trend.isPositive ? 'text-green-600' : 'text-red-600'}>
                {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
              </span>
              <span className="text-xs text-gray-500 ml-1">vs last month</span>
            </div>
          )}
        </div>
        
        {icon && (
          <div className="text-2xl opacity-70">
            {icon}
          </div>
        )}
      </div>
      
      {!isClickable && (
        <div className="mt-2 text-xs text-gray-500">
          View only
        </div>
      )}
    </div>
  );
};

export default BiCard;
