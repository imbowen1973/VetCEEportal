'use client';

import React from 'react';
import { FiPieChart, FiUsers, FiFileText, FiDollarSign, FiCheckSquare, FiBook } from 'react-icons/fi';

interface ChartCardProps {
  title: string;
  chartType: 'bar' | 'line' | 'pie' | 'doughnut';
  data: any;
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
  isClickable?: boolean;
  onClick?: () => void;
  userRole?: string[];
}

const ChartCard: React.FC<ChartCardProps> = ({
  title,
  chartType,
  data,
  color = 'blue',
  isClickable = true,
  onClick,
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

  // Placeholder for chart rendering
  const renderChart = () => {
    return (
      <div className="h-40 flex items-center justify-center">
        {chartType === 'bar' && <FiPieChart className="text-4xl opacity-50" />}
        {chartType === 'line' && <FiPieChart className="text-4xl opacity-50" />}
        {chartType === 'pie' && <FiPieChart className="text-4xl opacity-50" />}
        {chartType === 'doughnut' && <FiPieChart className="text-4xl opacity-50" />}
        <span className="ml-2 text-sm text-gray-500">Chart visualization will be implemented here</span>
      </div>
    );
  };

  return (
    <div 
      className={`rounded-lg border p-4 shadow-sm ${colorClasses[color]} ${isClickable ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
      onClick={handleClick}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-sm font-medium">{title}</h3>
        {!isClickable && (
          <div className="text-xs text-gray-500">
            View only
          </div>
        )}
      </div>
      
      {renderChart()}
      
      <div className="mt-2 text-xs text-right">
        <span className="text-gray-500">Last updated: Today</span>
      </div>
    </div>
  );
};

export default ChartCard;
