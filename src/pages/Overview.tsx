import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Compass,
  ArrowRight,
  Info,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { EventBadge } from '../components/events/EventBadge';
import { EventDetailsModal } from '../dialogs/EventDetailsModal';
import { CampusEvent } from '../types';
import { detectScheduleConflicts } from '../utils/conflictDetection';
import { formatCampusDate, getCampusToday } from '../utils/campusDate';

export const Overview: React.FC = () => {
  const { student, events, registrations, setIsGlobalAIChatOpen } = useApp();
  const navigate = useNavigate();

  const [selectedEvent, setSelectedEvent] = useState<CampusEvent | null>(null);

  // Dynamic Metrics derived strictly from application state
  const goingRegs = registrations.filter((r) => r.status === 'going');
  const goingEventIds = goingRegs.map((r) => r.eventId);
  const enrolledEvents = events.filter((e) => goingEventIds.includes(e.id));

  // Conflicts among registered events
  const conflictReport = detectScheduleConflicts(enrolledEvents);
  const totalConflicts = conflictReport.directConflicts.length + conflictReport.potentialConflicts.length;
  const today = getCampusToday();
  const todayLabel = formatCampusDate(today, {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const todayEvents = events.filter((e) => e.startDate === today);

  // Upcoming activities
  const upcomingEvents = events
    .filter((e) => e.startDate >= today)
    .sort((a, b) => a.startDate.localeCompare(b.startDate))
    .slice(0, 4);

  // Dynamic Campus Activity Intelligence advice
  const generateIntelligenceInsights = () => {
    const list: { type: 'conflict' | 'info' | 'recommend'; text: string; actionText?: string; action?: () => void }[] = [];

    if (conflictReport.directConflicts.length > 0) {
      list.push({
        type: 'conflict',
        text: `Konflik Jadwal: Ditemukan ${conflictReport.directConflicts.length} kegiatan yang tumpang tindih secara langsung pada agenda pribadi Anda.`,
        actionText: 'Lihat Agenda',
        action: () => navigate('/agenda'),
      });
    }

    if (conflictReport.potentialConflicts.length > 0) {
      list.push({
        type: 'conflict',
        text: `Jadwal Berdekatan: ${conflictReport.potentialConflicts.length} kegiatan memiliki jeda kurang dari 30 menit.`,
        actionText: 'Cek Kalender',
        action: () => navigate('/calendar'),
      });
    }

    const fikEvents = events.filter((e) => e.eligibleFaculties?.includes(student.faculty));
    if (fikEvents.length > 0) {
      list.push({
        type: 'recommend',
        text: `Rekomendasi Fakultas: "${fikEvents[0].title}" relevan dengan prodi Anda (${student.faculty}). Pendaftaran sedang dibuka.`,
        actionText: 'Eksplorasi',
        action: () => navigate('/events'),
      });
    }

    if (student.residenceStatus === 'dormitory') {
      const dormEvt = events.find((e) => e.dormitoryOnly);
      if (dormEvt) {
        list.push({
          type: 'info',
          text: `Pemberitahuan Asrama: "${dormEvt.title}" wajib bagi mahasiswa penghuni ${student.dormitoryBuilding || 'Asrama'}.`,
          actionText: 'Detail',
          action: () => setSelectedEvent(dormEvt),
        });
      }
    }

    return list;
  };

  const insights = generateIntelligenceInsights();

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* 1. Personalized Welcome Header (Compact & Clear) */}
      <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-[#111C2E] p-5 sm:p-6 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                Universitas Klabat · Semester Ganjil
              </span>
              <span className="text-xs text-slate-600 font-medium capitalize">{todayLabel}</span>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Selamat datang kembali, {student.fullName}
            </h1>

            <div className="flex flex-wrap items-center gap-2.5 text-xs text-slate-600 dark:text-slate-400 font-medium pt-0.5">
              <span>NIM: <strong className="text-slate-800 dark:text-slate-200">{student.nim}</strong></span>
              <span className="text-slate-300">•</span>
              <span>{student.faculty} ({student.studyProgram}) · Angkatan {student.batch}</span>
              <span className="text-slate-300">•</span>
              <span>Asrama: {student.dormitoryBuilding} Hall</span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2.5 self-start lg:self-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsGlobalAIChatOpen(true)}
              className="text-xs font-semibold"
            >
              <Sparkles className="h-3.5 w-3.5 mr-1.5 text-[#D6A84B]" />
              Tanya AI Kampus
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/events')}
              className="text-xs font-semibold"
            >
              <Compass className="h-3.5 w-3.5 mr-1.5" />
              Eksplorasi Kegiatan
            </Button>
          </div>
        </div>
      </div>

      {/* 2. Compact Meaningful Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-[#111C2E] p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Kegiatan aktif</span>
            <Calendar className="h-4 w-4 text-[#142D4E] dark:text-blue-400" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 dark:text-slate-100">
            {events.filter((e) => e.startDate >= today).length}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">Jadwal terbuka kampus</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-[#111C2E] p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Hari ini</span>
            <Clock className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 dark:text-slate-100">
            {todayEvents.length}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">Agenda terjadwal hari ini</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-[#111C2E] p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Pendaftaran diikuti</span>
            <CheckCircle2 className="h-4 w-4 text-[#142D4E] dark:text-blue-400" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 dark:text-slate-100">
            {goingRegs.length}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">Tiket digital tersedia</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-[#111C2E] p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Status jadwal</span>
            <AlertTriangle className={`h-4 w-4 ${totalConflicts > 0 ? 'text-amber-500' : 'text-emerald-500'}`} />
          </div>
          <div className={`mt-2 text-lg font-black ${totalConflicts > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
            {totalConflicts > 0 ? `${totalConflicts} Tumpang Tindih` : 'Bebas Bentrok'}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {totalConflicts > 0 ? 'Perlu penyesuaian agenda' : 'Jadwal kuliah & kegiatan aman'}
          </p>
        </div>
      </div>

      {/* 3. Integrated Schedule Intelligence & Recommendations */}
      {insights.length > 0 && (
        <div className="space-y-2.5">
          {insights.map((item, idx) => (
            <div
              key={idx}
              className={`p-3.5 rounded-xl border text-xs flex items-center justify-between gap-3 ${
                item.type === 'conflict'
                  ? 'bg-amber-50/90 border-amber-300 dark:bg-amber-950/30 dark:border-amber-800 text-amber-900 dark:text-amber-200'
                  : 'bg-white border-slate-200 dark:bg-[#111C2E] dark:border-slate-800 text-slate-800 dark:text-slate-200 shadow-2xs'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {item.type === 'conflict' ? (
                  <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
                ) : (
                  <Info className="h-4 w-4 text-[#142D4E] dark:text-blue-400 shrink-0" />
                )}
                <span className="leading-relaxed truncate">{item.text}</span>
              </div>
              {item.actionText && (
                <button
                  type="button"
                  onClick={item.action}
                  className="text-xs font-bold text-[#142D4E] dark:text-blue-400 hover:underline shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#142D4E]"
                >
                  {item.actionText} →
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 4. Main Section: Today's Schedule (Primary Priority) & Weekly Agenda */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Today's Schedule (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between pb-1">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Jadwal Hari Ini · <span className="capitalize">{todayLabel}</span>
              </h2>
              <p className="text-xs text-slate-500">Timeline kegiatan akademik dan peribadatan kampus.</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate('/agenda')} className="text-xs">
              Semua agenda
            </Button>
          </div>

          <div className="space-y-2.5">
            {todayEvents.length === 0 ? (
              <div className="p-8 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111C2E] text-center text-slate-400 text-xs">
                Tidak ada agenda terjadwal untuk hari ini.
              </div>
            ) : (
              todayEvents.map((evt) => {
                const isEnrolled = goingEventIds.includes(evt.id);
                return (
                  <article
                    key={evt.id}
                    className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111C2E] hover:border-slate-300 dark:hover:border-slate-700 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs group"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      {/* Time Pill */}
                      <div className="flex flex-col items-center justify-center h-11 w-14 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 shrink-0 font-bold border border-slate-200/60 dark:border-slate-700/60">
                        <span className="text-xs font-mono">{evt.startTime}</span>
                        <span className="text-[9px] text-slate-500 font-semibold">WITA</span>
                      </div>

                      <div className="space-y-0.5 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <EventBadge category={evt.category} />
                          {evt.chapelPoints ? (
                            <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-50 text-amber-900 border border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800">
                              +{evt.chapelPoints} Poin Chapel
                            </span>
                          ) : null}
                          {isEnrolled && (
                            <Badge variant="success" className="text-[10px]">
                              RSVP Terdaftar
                            </Badge>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => setSelectedEvent(evt)}
                          className="block max-w-full truncate text-left text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-[#142D4E] dark:group-hover:text-blue-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#142D4E]"
                        >
                          {evt.title}
                        </button>
                        <p className="text-[11px] text-slate-500 truncate">
                          {evt.location} • {evt.organizer}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setSelectedEvent(evt)}
                        className="text-xs"
                      >
                        Lihat detail
                      </Button>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </div>

        {/* Weekly Agenda (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between pb-1">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Agenda Pekan Ini
              </h2>
              <p className="text-xs text-slate-500">Kegiatan mendatang lintas fakultas.</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate('/events')} className="text-xs">
              Semua kegiatan ({events.length})
            </Button>
          </div>

          <div className="space-y-2.5">
            {upcomingEvents.map((evt) => (
              <article
                key={evt.id}
                className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111C2E] hover:border-slate-300 dark:hover:border-slate-700 transition-colors flex items-center justify-between shadow-2xs group"
              >
                <div className="space-y-0.5 min-w-0 pr-2">
                  <div className="flex items-center gap-1.5">
                    <EventBadge category={evt.category} />
                    <span className="text-[10px] text-slate-500 font-mono font-medium">
                      {formatCampusDate(evt.startDate, { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedEvent(evt)}
                    className="block max-w-full truncate text-left text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-[#142D4E] dark:group-hover:text-blue-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#142D4E]"
                  >
                    {evt.title}
                  </button>
                  <p className="text-[11px] text-slate-500 truncate">{evt.location}</p>
                </div>
                <ArrowRight aria-hidden="true" className="h-4 w-4 text-slate-400 group-hover:text-[#142D4E] dark:group-hover:text-blue-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
              </article>
            ))}
          </div>
        </div>
      </div>

      {/* Selected Event Details Modal */}
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

export default Overview;
