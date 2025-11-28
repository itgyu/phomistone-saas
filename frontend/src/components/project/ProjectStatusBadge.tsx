import React from 'react';
import { PROJECT_STATUS_CONFIG, ProjectStatus } from '@/types/project';
import { ArrowRight, Clock, CheckCircle2 } from 'lucide-react';

interface Props {
  status?: ProjectStatus; // Make optional
  onStatusChange?: (newStatus: ProjectStatus) => void;
  showActions?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function ProjectStatusBadge({
  status = 'draft', // Default to 'draft'
  onStatusChange,
  showActions = false,
  size = 'md'
}: Props) {
  // Safe config access with fallback
  const config = PROJECT_STATUS_CONFIG[status] || PROJECT_STATUS_CONFIG.draft;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-xs',
    lg: 'px-4 py-1.5 text-sm'
  };

  const iconSizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  };

  const buttonSizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-xs',
    lg: 'px-4 py-1.5 text-sm'
  };

  return (
    <div className="flex items-center gap-2">
      {/* 현재 상태 배지 */}
      <span className={`inline-flex items-center gap-1.5 rounded-full font-semibold ${config.bgColor} ${config.textColor} border ${config.borderColor} ${sizeClasses[size]}`}>
        {status === 'completed' ? (
          <CheckCircle2 className={iconSizeClasses[size]} />
        ) : (
          <Clock className={iconSizeClasses[size]} />
        )}
        {config.label}
      </span>

      {/* 다음 단계 버튼 */}
      {showActions && config.nextStatus && onStatusChange && (
        <button
          onClick={() => onStatusChange(config.nextStatus as ProjectStatus)}
          className={`inline-flex items-center gap-1.5 bg-gradient-to-r from-[#C59C6C] to-[#A67C52] hover:shadow-lg text-white rounded-full font-semibold transition-all hover:scale-105 ${buttonSizeClasses[size]}`}
        >
          <span>{config.nextLabel}</span>
          <ArrowRight className={iconSizeClasses[size]} />
        </button>
      )}
    </div>
  );
}
