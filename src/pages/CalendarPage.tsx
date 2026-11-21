import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { EventBadge } from '../components/events/EventBadge';
import { EventDetailsModal } from '../dialogs/EventDetailsModal';
import { CampusEvent, EventCategory } from '../types';
import { formatCampusDate, formatLocalDateInput, getCampusCurrentDate, getCampusToday } from '../utils/campusDate';

const eventCategories: EventCategory[] = [
  'spiritual',
  'academic',
  'ormawa',
  'dormitory',
  'seminar',
  'competition',
];

export const CalendarPage: React.FC = () => {
  const { events } = useApp();

  const [currentDate, setCurrentDate] = useState<Date>(getCampusCurrentDate);
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day' | 'agenda'>(() =>
    window.matchMedia('(max-width: 639px)').matches ? 'agenda' : 'month'
  );
  const [selectedCategory, setSelectedCategory] = useState<EventCategory | 'all'>('all');
  const [selectedEvent, setSelectedEvent] = useState<CampusEvent | null>(null);

  // Month calculations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 10 is Nov

  const today = getCampusToday();
  const monthLabel = formatCampusDate(`${year}-${String(month + 1).padStart(2, '0')}-01`, {
    month: 'long',
    year: 'numeric',
  });
  const viewLabels = { month: 'Bulan', week: 'Minggu', day: 'Hari', agenda: 'Agenda' } as const;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sun

  const filteredEvents = events.filter((e) => {
    if (selectedCategory !== 'all' && e.category !== selectedCategory) return false;
    return true;
  });
  const selectedDate = formatLocalDateInput(currentDate);
  const selectedWeekStart = new Date(currentDate);
  selectedWeekStart.setDate(selectedWeekStart.getDate() - selectedWeekStart.getDay());
  const selectedWeekEnd = new Date(selectedWeekStart);
  selectedWeekEnd.setDate(selectedWeekEnd.getDate() + 6);
  const visibleEvents = filteredEvents.filter((event) => {
    if (viewMode === 'day') return event.startDate === selectedDate;
    if (viewMode === 'week') {
      return event.startDate >= formatLocalDateInput(selectedWeekStart) &&
        event.startDate <= formatLocalDateInput(selectedWeekEnd);
    }
    if (viewMode === 'agenda') return event.startDate >= selectedDate;
    return true;
  });

  const handlePrev = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(year, month - 1, 1));
    } else if (viewMode === 'week') {
      const d = new Date(currentDate);
      d.setDate(d.getDate() - 7);
      setCurrentDate(d);
    } else {
      const d = new Date(currentDate);
      d.setDate(d.getDate() - 1);
      setCurrentDate(d);
    }
  };

  const handleNext = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(year, month + 1, 1));
    } else if (viewMode === 'week') {
      const d = new Date(currentDate);
      d.setDate(d.getDate() + 7);
      setCurrentDate(d);
    } else {
      const d = new Date(currentDate);
      d.setDate(d.getDate() + 1);
      setCurrentDate(d);
    }
  };

  const handleToday = () => {
    setCurrentDate(getCampusCurrentDate());
  };

  // Helper to format date YYYY-MM-DD
  const formatYMD = (d: number) => {
    const mStr = String(month + 1).padStart(2, '0');
    const dStr = String(d).padStart(2, '0');
    return `${year}-${mStr}-${dStr}`;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div className="min-w-0">
          <p className="text-xs text-slate-500 dark:text-slate-400">Waktu Indonesia Tengah (WITA)</p>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight mt-1 text-balance">
            Kalender Akademik dan Kegiatan
          </h1>
        </div>

        {/* View Switcher & Category Filter */}
        <div className="flex flex-wrap items-center gap-3">
          <select
            aria-label="Filter kategori kegiatan"
            value={selectedCategory}
            onChange={(e) => {
              const value = e.currentTarget.value;
              if (value === 'all' || eventCategories.includes(value as EventCategory)) {
                setSelectedCategory(value as EventCategory | 'all');
              }
            }}
            className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#142D4E]"
          >
            <option value="all">Semua kategori</option>
            <option value="spiritual">Kerohanian / Chapel</option>
            <option value="academic">Akademik dan teknologi</option>
            <option value="ormawa">ORMAWA / BEM</option>
            <option value="dormitory">Asrama</option>
            <option value="seminar">Seminar</option>
            <option value="competition">Kompetisi</option>
          </select>

          <div className="flex items-center p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 text-xs font-bold">
            {(['month', 'week', 'day', 'agenda'] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setViewMode(mode)}
                aria-pressed={viewMode === mode}
                aria-label={`Tampilkan kegiatan per ${viewLabels[mode].toLowerCase()}`}
                className={`min-h-9 px-3 py-1 rounded-xl transition-colors ${
                  viewMode === mode
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-2xs font-extrabold'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {viewLabels[mode]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Date Navigation Bar */}
      <div className="grid grid-cols-2 items-center gap-3 p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs sm:flex sm:justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleToday} className="whitespace-nowrap text-xs font-bold">
            Hari ini
          </Button>
          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label="Periode sebelumnya"
              onClick={handlePrev}
              className="h-10 w-10 flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#142D4E]"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="Periode berikutnya"
              onClick={handleNext}
              className="h-10 w-10 flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#142D4E]"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <h2 className="col-span-2 text-base sm:text-lg font-black text-slate-900 dark:text-slate-100 capitalize sm:col-span-1">
          {monthLabel}
        </h2>

        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <span className="h-2.5 w-2.5 rounded-full bg-blue-600 inline-block" />
          <span>{filteredEvents.length} kegiatan</span>
        </div>
      </div>

      {/* MONTH VIEW */}
      {viewMode === 'month' && (
        <div className="overflow-x-auto rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
          <div className="min-w-[700px] overflow-hidden">
          {/* Day of Week Headers */}
          <div className="grid grid-cols-7 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-center py-2.5 text-xs font-extrabold uppercase tracking-wider text-slate-400">
            <span>Min</span>
            <span>Sen</span>
            <span>Sel</span>
            <span>Rab</span>
            <span>Kam</span>
            <span>Jum</span>
            <span>Sab</span>
          </div>

          {/* Month Grid Cells */}
          <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            {/* Empty offset padding for first day */}
            {Array.from({ length: firstDayIndex }).map((_, i) => (
              <div key={`empty-${i}`} className="min-h-[110px] p-2 bg-slate-50/30 dark:bg-slate-950/20" />
            ))}

            {/* Days in Month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dateStr = formatYMD(dayNum);
              const isToday = dateStr === today;
              const dayEvents = filteredEvents.filter((e) => e.startDate === dateStr);

              return (
                <div
                  key={dayNum}
                  className={`min-h-[110px] p-2 transition-colors flex flex-col justify-between ${
                    isToday ? 'bg-blue-50/50 dark:bg-blue-950/20 font-bold' : 'hover:bg-slate-50/60 dark:hover:bg-slate-800/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs h-6 w-6 rounded-full flex items-center justify-center font-bold ${
                        isToday
                          ? 'bg-blue-600 text-white'
                          : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {dayNum}
                    </span>
                    {dayEvents.length > 0 && (
                      <span className="text-[10px] text-slate-400 font-normal">
                        {dayEvents.length} kegiatan
                      </span>
                    )}
                  </div>

                  {/* Event Badges inside cell */}
                  <div className="mt-1 space-y-1 flex-1 overflow-y-auto max-h-[80px] no-scrollbar">
                    {dayEvents.map((evt) => (
                      <button
                        type="button"
                        key={evt.id}
                        onClick={() => setSelectedEvent(evt)}
                        aria-label={`Lihat detail ${evt.title}, pukul ${evt.startTime} WITA`}
                        className={`w-full text-left px-1.5 py-0.5 rounded-lg text-[10px] font-semibold truncate cursor-pointer transition-colors hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#142D4E] ${
                          evt.category === 'spiritual'
                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                            : evt.category === 'academic'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                            : evt.category === 'dormitory'
                            ? 'bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-200'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        }`}
                        title={`${evt.title} (${evt.startTime} WITA)`}
                      >
                        {evt.startTime} {evt.title}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
          </div>
        </div>
      )}

      {/* AGENDA / DAY / WEEK VIEW FALLBACK TO ACCORDION LIST */}
      {viewMode !== 'month' && (
        <div className="space-y-4">
          <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 mb-3">
              {viewMode === 'day'
                ? `Kegiatan · ${formatCampusDate(selectedDate, { day: 'numeric', month: 'long', year: 'numeric' })}`
                : viewMode === 'week'
                  ? `Kegiatan pekan ${formatCampusDate(formatLocalDateInput(selectedWeekStart), { day: 'numeric', month: 'short' })}–${formatCampusDate(formatLocalDateInput(selectedWeekEnd), { day: 'numeric', month: 'short', year: 'numeric' })}`
                  : 'Agenda mendatang'}
            </h3>
            <div className="space-y-3">
              {visibleEvents.length === 0 ? (
                <p className="py-6 text-center text-sm text-slate-600">Tidak ada kegiatan pada periode ini.</p>
              ) : visibleEvents.map((evt) => (
                <article
                  key={evt.id}
                  className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-blue-400 bg-slate-50/60 dark:bg-slate-800/40 transition-colors flex items-center justify-between gap-3"
                >
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">
                        {formatCampusDate(evt.startDate, { day: 'numeric', month: 'short', year: 'numeric' })} · {evt.startTime} WITA
                      </span>
                      <EventBadge category={evt.category} />
                      {evt.chapelPoints ? (
                        <Badge variant="purple" className="text-[10px]">
                          +{evt.chapelPoints} Poin Chapel
                        </Badge>
                      ) : null}
                    </div>
                    <h4 className="truncate text-sm font-bold text-slate-900 dark:text-slate-100">{evt.title}</h4>
                    <p className="truncate text-xs text-slate-500">{evt.location} · {evt.organizer}</p>
                  </div>
                  <Button variant="secondary" size="sm" className="shrink-0 text-xs" onClick={() => setSelectedEvent(evt)}>
                    Lihat detail
                  </Button>
                </article>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {selectedEvent && (
        <EventDetailsModal
          event={selectedEvent}
          open={!!selectedEvent}
          onOpenChange={(open) => !open && setSelectedEvent(null)}
        />
      )}
    </div>
  );
};
