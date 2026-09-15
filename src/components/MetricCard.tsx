import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  id: string;
  title: string;
  value: string | number;
  subValue?: string;
  subValueColor?: string;
  description: string;
  icon: LucideIcon;
  variant?: 'default' | 'danger' | 'warning' | 'success';
}

export const MetricCard: React.FC<MetricCardProps> = ({
  id,
  title,
  value,
  subValue,
  subValueColor = 'text-gray-500',
  description,
  icon: Icon,
  variant = 'default',
}) => {
  const getColors = () => {
    switch (variant) {
      case 'danger':
        return {
          bg: 'bg-rose-50/50',
          border: 'border-rose-100',
          text: 'text-rose-700',
          iconBg: 'bg-rose-100/60 text-rose-600',
        };
      case 'warning':
        return {
          bg: 'bg-amber-50/50',
          border: 'border-amber-100',
          text: 'text-amber-700',
          iconBg: 'bg-amber-100/60 text-amber-600',
        };
      case 'success':
        return {
          bg: 'bg-emerald-50/50',
          border: 'border-emerald-100',
          text: 'text-emerald-700',
          iconBg: 'bg-emerald-100/60 text-emerald-600',
        };
      default:
        return {
          bg: 'bg-white',
          border: 'border-gray-200/80',
          text: 'text-gray-900',
          iconBg: 'bg-gray-100 text-gray-600',
        };
    }
  };

  const colors = getColors();

  return (
    <div
      id={id}
      className={`relative p-5 rounded-xl border ${colors.bg} ${colors.border} transition-all duration-200 hover:shadow-sm`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-xs font-medium tracking-wide text-gray-500 uppercase">{title}</p>
          <div className="flex items-baseline space-x-2">
            <span className={`text-2xl font-bold tracking-tight ${colors.text}`}>{value}</span>
            {subValue && (
              <span className={`text-xs font-medium ${subValueColor}`}>{subValue}</span>
            )}
          </div>
        </div>
        <div className={`p-2.5 rounded-lg ${colors.iconBg}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <p className="mt-3 text-xs text-gray-500 leading-normal">{description}</p>
    </div>
  );
};
