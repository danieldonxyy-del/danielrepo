import React from 'react';
import {
  Calendar,
  Sparkles,
  Cpu,
  Church,
  Home,
  Trophy,
  BookOpen,
  Activity,
  LucideIcon
} from 'lucide-react';
import { EventCategory } from '../../types';

interface PosterCanvasProps {
  title: string;
  category: EventCategory;
  organizer: string;
  date: string;
  time?: string;
  location?: string;
  posterGradient?: string;
  posterIcon?: string;
  className?: string;
  isCompact?: boolean;
}

const categoryIcons: Record<EventCategory, LucideIcon> = {
  spiritual: Church,
  academic: Cpu,
  ormawa: Trophy,
  dormitory: Home,
  seminar: BookOpen,
  competition: Activity,
};

const defaultGradients: Record<EventCategory, string> = {
  spiritual: 'from-violet-900 via-indigo-950 to-purple-950',
  academic: 'from-blue-900 via-cyan-950 to-slate-950',
  ormawa: 'from-amber-900 via-orange-950 to-zinc-950',
  dormitory: 'from-slate-800 via-zinc-900 to-neutral-950',
  seminar: 'from-teal-900 via-emerald-950 to-slate-950',
  competition: 'from-emerald-900 via-green-950 to-slate-950',
};

export const PosterCanvas: React.FC<PosterCanvasProps> = ({
  title,
  category,
  organizer,
  date,
  time,
  posterGradient,
  className = '',
  isCompact = false,
}) => {
  const IconComponent = categoryIcons[category] || Sparkles;
  const gradient = posterGradient || defaultGradients[category];

  return (
    <div
      className={`relative overflow-hidden select-none bg-linear-to-br ${gradient} text-white flex flex-col justify-between p-4 rounded-2xl shadow-inner ${className}`}
      style={{ minHeight: isCompact ? '140px' : '220px' }}
    >
      {/* Decorative Geometric Background Pattern */}
      <div className="absolute inset-0 opacity-15 pointer-events-none">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id={`pat-${category}`} width="30" height="30" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.5" fill="currentColor" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill={`url(#pat-${category})`} />
        </svg>
      </div>

      {/* Decorative Glow Orb */}
      <div className="absolute -top-10 -right-10 w-36 h-36 rounded-full bg-white/10 blur-2xl pointer-events-none" />

      {/* Top Header */}
      <div className="relative z-10 flex items-center justify-between">
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-white/80 flex items-center gap-1.5">
          <IconComponent className="h-3.5 w-3.5 text-amber-300" />
          <span>{organizer.slice(0, 24)}</span>
        </span>
        <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/15 backdrop-blur-xs border border-white/20">
          UNKLAB
        </span>
      </div>

      {/* Center Poster Title & Visual Artwork */}
      <div className="relative z-10 my-auto py-2">
        <div className="mb-1">
          <span className="text-[10px] uppercase font-bold tracking-wider text-amber-300">
            {category.toUpperCase()}
          </span>
        </div>
        <h4
          className={`font-black leading-tight tracking-tight text-white drop-shadow-md ${
            isCompact ? 'text-sm line-clamp-2' : 'text-base sm:text-lg line-clamp-3'
          }`}
        >
          {title}
        </h4>
      </div>

      {/* Bottom Footer Info */}
      <div className="relative z-10 pt-2 border-t border-white/15 flex items-center justify-between text-[11px] text-white/90">
        <div className="flex items-center gap-1 font-medium">
          <Calendar className="h-3.5 w-3.5 text-amber-300" />
          <span>{date}</span>
        </div>
        {time && <span className="text-[10px] font-semibold text-white/80">{time} WITA</span>}
      </div>
    </div>
  );
};
