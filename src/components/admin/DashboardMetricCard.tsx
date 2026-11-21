import React from 'react';
import { LucideIcon } from 'lucide-react';

interface DashboardMetricCardProps {
  label: string;
  value: number | string;
  subtext?: string;
  icon?: LucideIcon;
  variant?: 'default' | 'emerald' | 'purple' | 'amber' | 'blue';
  badge?: string;
  onClick?: () => void;
}

export const DashboardMetricCard: React.FC<DashboardMetricCardProps> = ({
  label,
  value,
  subtext,
  icon: Icon,
  variant = 'default',
  badge,
  onClick,
}) => {
  const valueColorMap = {
    default: 'text-slate-900 dark:text-slate-100',
    emerald: 'text-emerald-600 dark:text-emerald-400',
    purple: 'text-purple-600 dark:text-purple-400',
    amber: 'text-amber-600 dark:text-amber-400',
    blue: 'text-blue-600 dark:text-blue-400',
  };

  return (
    <div
      onClick={onClick}
      className={`p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs transition-all ${
        onClick ? 'cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-xs' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
          {label}
        </span>
        {Icon && <Icon className="h-4 w-4 text-slate-400" />}
      </div>

      <div className={`text-2xl sm:text-3xl font-black mt-2 tracking-tight ${valueColorMap[variant]}`}>
        {value}
      </div>

      <div className="flex items-center justify-between gap-2 mt-1">
        {subtext && <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{subtext}</p>}
        {badge && (
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 shrink-0">
            {badge}
          </span>
        )}
      </div>
    </div>
  );
};

export default DashboardMetricCard;
