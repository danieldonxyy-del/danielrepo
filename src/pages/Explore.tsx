import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  Filter,
  Grid3X3,
  ListFilter,
  CalendarDays,
  Sparkles,
  Church,
  Cpu,
  Trophy,
  Home,
  BookOpen,
  X,
  MapPin,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { EventCard } from '../components/events/EventCard';
import { EventBadge } from '../components/events/EventBadge';
import { EventDetailsModal } from '../dialogs/EventDetailsModal';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { CampusEvent, EventCategory } from '../types';
import { formatCampusDate, getCampusToday } from '../utils/campusDate';

export const Explore: React.FC = () => {
  const { events } = useApp();
  const [searchParams] = useSearchParams();
  const today = getCampusToday();

  // Search query & category filter
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<EventCategory | 'all'>('all');

  // Multi-filters
  const [chapelPointsOnly, setChapelPointsOnly] = useState(false);
  const [todayOnly, setTodayOnly] = useState(false);
  const [dormitoryOnly, setDormitoryOnly] = useState(false);
  const [registrationOpenOnly, setRegistrationOpenOnly] = useState(false);

  // Sorting: 'upcoming' | 'recent' | 'popular'
  const [sortBy, setSortBy] = useState<'upcoming' | 'recent' | 'popular'>('upcoming');

  // View Switcher: 'grid' | 'calendar' | 'timeline'
  const [viewMode, setViewMode] = useState<'grid' | 'calendar' | 'timeline'>('grid');

  // Selected event modal
  const [selectedEvent, setSelectedEvent] = useState<CampusEvent | null>(() => {
    const idParam = searchParams.get('id');
    if (idParam) {
      return events.find((e) => e.id === idParam) || null;
    }
    return null;
  });

  const categories: { key: EventCategory | 'all'; label: string; icon: any }[] = [
    { key: 'all', label: 'Semua Kegiatan', icon: Sparkles },
    { key: 'spiritual', label: 'Chapel & Rohani', icon: Church },
    { key: 'academic', label: 'Akademik & Sains', icon: Cpu },
    { key: 'ormawa', label: 'ORMAWA & BEM', icon: Trophy },
    { key: 'dormitory', label: 'Asrama', icon: Home },
    { key: 'seminar', label: 'Seminar', icon: BookOpen },
    { key: 'competition', label: 'Kompetisi', icon: Trophy },
  ];

  // Filter & Sort Logic
  const filteredEvents = useMemo(() => {
    let list = events.filter((e) => e.status !== 'draft');

    if (activeCategory !== 'all') {
      list = list.filter((e) => e.category === activeCategory);
    }

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q) ||
          e.location.toLowerCase().includes(q) ||
          e.organizer.toLowerCase().includes(q)
      );
    }

    if (chapelPointsOnly) {
      list = list.filter((e) => (e.chapelPoints ?? 0) > 0);
    }

    if (todayOnly) {
      list = list.filter((e) => e.startDate === today);
    }

    if (dormitoryOnly) {
      list = list.filter((e) => e.dormitoryOnly === true);
    }

    if (registrationOpenOnly) {
      list = list.filter((e) => !e.capacity || (e.registeredCount || 0) < e.capacity);
    }

    // Sort
    if (sortBy === 'upcoming') {
      list.sort((a, b) => a.startDate.localeCompare(b.startDate));
    } else if (sortBy === 'recent') {
      list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    } else if (sortBy === 'popular') {
      list.sort((a, b) => (b.registeredCount || 0) - (a.registeredCount || 0));
    }

    return list;
  }, [
    events,
    today,
    activeCategory,
    searchQuery,
    chapelPointsOnly,
    todayOnly,
    dormitoryOnly,
    registrationOpenOnly,
    sortBy,
  ]);

  const activeFilterCount =
    (chapelPointsOnly ? 1 : 0) +
    (todayOnly ? 1 : 0) +
    (dormitoryOnly ? 1 : 0) +
    (registrationOpenOnly ? 1 : 0);

  const clearAllFilters = () => {
    setActiveCategory('all');
    setSearchQuery('');
    setChapelPointsOnly(false);
    setTodayOnly(false);
    setDormitoryOnly(false);
    setRegistrationOpenOnly(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* 6.1 Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="text-xs text-slate-500 font-medium">Waktu Indonesia Tengah (WITA)</div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight mt-1 text-balance">
            Eksplorasi Kegiatan Kampus
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Temukan kegiatan akademik, organisasi, asrama, dan pelayanan Pioneer Chapel.
          </p>
        </div>

        {/* Global Search Bar */}
        <div className="relative w-full md:w-80">
          <Search className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            aria-label="Cari kegiatan"
            placeholder="Cari judul, pembicara, lokasi…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111C2E] pl-9 pr-8 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#142D4E] dark:focus:ring-blue-500 shadow-2xs"
          />
          {searchQuery && (
            <button
              type="button"
              aria-label="Hapus pencarian"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-2.5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#142D4E]"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 6.2 Category Filter Tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.key;
          return (
            <button
              key={cat.key}
              type="button"
              onClick={() => setActiveCategory(cat.key)}
              aria-pressed={isActive}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap select-none shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-[#142D4E] text-white shadow-2xs dark:bg-blue-600'
                  : 'bg-white dark:bg-[#111C2E] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Filter Controls, Sorting & View Switcher Bar */}
      <div className="p-3.5 rounded-xl bg-white dark:bg-[#111C2E] border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Additional Multi-Filter Badges */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 mr-1 flex items-center gap-1">
            <Filter className="h-3 w-3" /> Filter Cepat:
          </span>

          <button
            type="button"
            onClick={() => setChapelPointsOnly(!chapelPointsOnly)}
            aria-pressed={chapelPointsOnly}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
              chapelPointsOnly
                ? 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800 font-semibold'
                : 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
            }`}
          >
            Hanya Chapel Points
          </button>

          <button
            type="button"
            onClick={() => setTodayOnly(!todayOnly)}
            aria-pressed={todayOnly}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
              todayOnly
                ? 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800 font-semibold'
                : 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
            }`}
          >
            Hari Ini
          </button>

          <button
            type="button"
            onClick={() => setDormitoryOnly(!dormitoryOnly)}
            aria-pressed={dormitoryOnly}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
              dormitoryOnly
                ? 'bg-blue-100 text-blue-900 border-blue-300 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800 font-semibold'
                : 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
            }`}
          >
            Khusus Asrama
          </button>

          <button
            type="button"
            onClick={() => setRegistrationOpenOnly(!registrationOpenOnly)}
            aria-pressed={registrationOpenOnly}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
              registrationOpenOnly
                ? 'bg-indigo-100 text-indigo-900 border-indigo-300 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800 font-semibold'
                : 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
            }`}
          >
            Pendaftaran Terbuka
          </button>

          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={clearAllFilters}
              aria-label={`Reset ${activeFilterCount} filter aktif`}
              className="text-xs text-rose-600 hover:text-rose-700 font-bold ml-1 cursor-pointer"
            >
              Reset ({activeFilterCount})
            </button>
          )}
        </div>

        {/* Right: Sorting & View Mode Switcher */}
        <div className="flex items-center gap-3 self-end md:self-center">
          {/* 6.3 Sorting */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span className="font-medium text-[11px]">Urutan:</span>
            <select
              aria-label="Urutkan kegiatan"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-2 py-1 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="upcoming">Waktu Terdekat</option>
              <option value="recent">Baru Ditambahkan</option>
              <option value="popular">Paling Diminati</option>
            </select>
          </div>

          {/* 6.4 View Switcher */}
          <div className="flex items-center p-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              aria-label="Tampilan kartu"
              aria-pressed={viewMode === 'grid'}
              className={`p-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-[#111C2E] text-slate-900 dark:text-slate-100 shadow-2xs font-bold'
                  : 'hover:text-slate-800'
              }`}
              title="Tampilan kartu"
            >
              <Grid3X3 className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('calendar')}
              aria-label="Tampilan kelompok tanggal"
              aria-pressed={viewMode === 'calendar'}
              className={`p-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                viewMode === 'calendar'
                  ? 'bg-white dark:bg-[#111C2E] text-slate-900 dark:text-slate-100 shadow-2xs font-bold'
                  : 'hover:text-slate-800'
              }`}
              title="Kelompok Tanggal"
            >
              <CalendarDays className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('timeline')}
              aria-label="Tampilan linimasa"
              aria-pressed={viewMode === 'timeline'}
              className={`p-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                viewMode === 'timeline'
                  ? 'bg-white dark:bg-[#111C2E] text-slate-900 dark:text-slate-100 shadow-2xs font-bold'
                  : 'hover:text-slate-800'
              }`}
              title="Tampilan linimasa"
            >
              <ListFilter className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 6.5 Render Content Based on View Mode */}
      {filteredEvents.length === 0 ? (
        <div className="p-12 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111C2E] text-center space-y-2">
          <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
            <Search className="h-5 w-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
            Tidak ada kegiatan yang sesuai dengan kriteria
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Coba sesuaikan filter kategori, kata kunci pencarian, atau reset filter yang sedang aktif.
          </p>
          <Button variant="secondary" size="sm" onClick={clearAllFilters} className="mt-2 text-xs">
            Reset Semua Filter
          </Button>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredEvents.map((evt) => (
            <EventCard key={evt.id} event={evt} onViewDetails={setSelectedEvent} />
          ))}
        </div>
      ) : viewMode === 'timeline' ? (
        /* TIMELINE VIEW */
        <div className="space-y-4 relative border-l-2 border-slate-300 dark:border-slate-700 pl-5 ml-3">
          {filteredEvents.map((evt) => (
            <div key={evt.id} className="relative group">
              <div className="absolute -left-[27px] top-3.5 h-3.5 w-3.5 rounded-full border-2 border-[#142D4E] dark:border-blue-500 bg-white dark:bg-[#111C2E]" />

              <article
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111C2E] shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-[#142D4E] dark:text-blue-400">
                      {formatCampusDate(evt.startDate, { day: 'numeric', month: 'short', year: 'numeric' })} · {evt.startTime} WITA
                    </span>
                    <EventBadge category={evt.category} />
                    {evt.chapelPoints ? (
                      <Badge variant="gold" className="text-[10px]">
                        +{evt.chapelPoints} Poin Chapel
                      </Badge>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedEvent(evt)}
                    className="text-left text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-[#142D4E] dark:group-hover:text-blue-400 transition-colors truncate focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#142D4E]"
                  >
                    {evt.title}
                  </button>
                  <p className="text-xs text-slate-500 flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                    <span>{evt.location}</span>
                    <span>•</span>
                    <span>{evt.organizer}</span>
                  </p>
                </div>
                <Button size="sm" variant="secondary" className="shrink-0 text-xs" onClick={() => setSelectedEvent(evt)}>
                  Lihat detail
                </Button>
              </article>
            </div>
          ))}
        </div>
      ) : (
        /* CALENDAR GROUP VIEW */
        <div className="space-y-5">
          {Array.from(new Set(filteredEvents.map((e) => e.startDate)))
            .sort()
            .map((dateStr) => {
              const dayEvents = filteredEvents.filter((e) => e.startDate === dateStr);
              return (
                <div key={dateStr} className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
                      {dateStr}
                    </span>
                    <span className="text-xs text-slate-500">{dayEvents.length} agenda terjadwal</span>
                    <div className="flex-1 border-t border-slate-200 dark:border-slate-800" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {dayEvents.map((evt) => (
                      <EventCard key={evt.id} event={evt} onViewDetails={setSelectedEvent} />
                    ))}
                  </div>
                </div>
              );
            })}
        </div>
      )}

      {/* Event Details Modal */}
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

export default Explore;
