import React from 'react';
import { PROJECT_STATUS_CONFIG, ProjectStatus } from '@/types/project';
import { ArrowRight, Clock, CheckCircle2 } from 'lucide-react';

interface Props {
  status?: ProjectStatus;
  onStatusChange?: (newStatus: ProjectStatus) => void;
  showActions?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function ProjectStatusBadge({
  status = 'draft',
  onStatusChange,
  showActions = false,
  size = 'md'
}: Props) {
  const config = PROJECT_STATUS_CONFIG[status] || PROJECT_STATUS_CONFIG.draft;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-3 py-1 text-xs',
    lg: 'px-4 py-1.5 text-sm'
  };

  const iconSizeClasses = {
    sm: 'w-2.5 h-2.5',
    md: 'w-3 h-3',
    lg: 'w-3.5 h-3.5'
  };

  const buttonSizeClasses = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-3 py-1 text-xs',
    lg: 'px-4 py-1.5 text-sm'
  };

  return (
    <div className="flex items-center gap-2">
      {/* Current Status Badge - High-end Design */}
      <span
        className={`
          inline-flex items-center gap-1.5
          font-light tracking-[0.15em] uppercase
          ${config.bgColor} ${config.textColor}
          border ${config.borderColor}
          ${sizeClasses[size]}
          transition-all duration-300
        `}
      >
        {status === 'completed' ? (
          <CheckCircle2 className={iconSizeClasses[size]} strokeWidth={1.5} />
        ) : (
          <Clock className={iconSizeClasses[size]} strokeWidth={1.5} />
        )}
        {config.label}
      </span>

      {/* Next Step Button - High-end Design */}
      {showActions && config.nextStatus && onStatusChange && (
        <button
          onClick={() => onStatusChange(config.nextStatus as ProjectStatus)}
          className={`
            inline-flex items-center gap-1.5
            font-light tracking-[0.15em] uppercase
            bg-gradient-to-r from-[#C59C6C] to-[#A67C52]
            hover:shadow-lg text-white
            transition-all duration-300 hover:scale-105
            ${buttonSizeClasses[size]}
          `}
        >
          <span>{config.nextLabel}</span>
          <ArrowRight className={iconSizeClasses[size]} strokeWidth={1.5} />
        </button>
      )}
    </div>
  );
}
