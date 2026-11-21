import React from 'react';
import { EventCategory } from '../../types';
import { Badge } from '../ui/badge';

interface EventBadgeProps {
  category: EventCategory;
  className?: string;
}

export const EventBadge: React.FC<EventBadgeProps> = ({ category, className }) => {
  const configs: Record<EventCategory, { label: string; variant: 'purple' | 'blue' | 'amber' | 'secondary' | 'teal' | 'success' }> = {
    spiritual: { label: 'Kerohanian', variant: 'purple' },
    academic: { label: 'Akademik', variant: 'blue' },
    ormawa: { label: 'ORMAWA', variant: 'amber' },
    dormitory: { label: 'Asrama', variant: 'secondary' },
    seminar: { label: 'Seminar', variant: 'teal' },
    competition: { label: 'Kompetisi', variant: 'success' },
  };

  const current = configs[category] || { label: category, variant: 'secondary' };

  return (
    <Badge variant={current.variant} className={`capitalize text-[10px] font-bold ${className}`}>
      {current.label}
    </Badge>
  );
};
