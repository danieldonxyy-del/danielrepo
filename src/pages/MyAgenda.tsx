import React, { useState } from 'react';
import {
  CalendarCheck,
  Calendar,
  Clock,
  MapPin,
  AlertTriangle,
  PlusCircle,
  Ticket,
  Download,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { EventBadge } from '../components/events/EventBadge';
import { EventDetailsModal } from '../dialogs/EventDetailsModal';
import { DigitalPassModal } from '../components/attendance/DigitalPassModal';
import { CampusEvent, EventRegistration } from '../types';
import { detectScheduleConflicts } from '../utils/conflictDetection';
import { formatCampusDate, getCampusToday } from '../utils/campusDate';
import { toast } from 'sonner';

export const MyAgenda: React.FC = () => {
  const {
    student,
    events,
    agendaEvents,
    registrations,
    setRSVP,
    getEventRegistration,
    createPersonalAgendaEvent,
    deletePersonalAgendaEvent,
    isDemoMode,
  } =
    useApp();

  const [activeTab, setActiveTab] = useState<'attending' | 'interested' | 'all'>('attending');
  const [selectedEvent, setSelectedEvent] = useState<CampusEvent | null>(null);
  const [activePassRegistration, setActivePassRegistration] = useState<{
    event: CampusEvent;
    registration: EventRegistration;
  } | null>(null);

  // New Personal Event Modal
  const [isAddPersonalOpen, setIsAddPersonalOpen] = useState(false);
  const [personalTitle, setPersonalTitle] = useState('');
  const [personalDate, setPersonalDate] = useState(getCampusToday);
  const [personalStartTime, setPersonalStartTime] = useState('10:00');
  const [personalEndTime, setPersonalEndTime] = useState('11:30');
  const [personalLocation, setPersonalLocation] = useState('');

  // Filter student registrations
  const goingRegs = registrations.filter((r) => r.status === 'going');
  const interestedRegs = registrations.filter((r) => r.status === 'interested');

  const goingEventIds = goingRegs.map((r) => r.eventId);
  const interestedEventIds = interestedRegs.map((r) => r.eventId);

  const attendingEvents = [
    ...events.filter((e) => goingEventIds.includes(e.id)),
    ...agendaEvents,
  ];
  const interestedEvents = events.filter((e) => interestedEventIds.includes(e.id));

  // Centralized Conflict Engine (Part 21)
  const conflictReport = detectScheduleConflicts(attendingEvents);

  const handleCreatePersonalEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!personalTitle.trim()) return;

    createPersonalAgendaEvent({
      title: personalTitle,
      description: 'Waktu belajar pribadi atau kegiatan kelompok mahasiswa.',
      category: 'academic',
      organizer: student.fullName,
      startDate: personalDate,
      endDate: personalDate,
      startTime: personalStartTime,
      endTime: personalEndTime,
      location: personalLocation,
      status: 'published',
      isVerified: true,
      isDemo: isDemoMode,
    });

    setIsAddPersonalOpen(false);
    setPersonalTitle('');
    toast.success(`Kegiatan "${personalTitle}" ditambahkan ke agenda Anda.`);
  };

  const handleExportCalendar = () => {
    const icsContent =
      'BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Universitas Klabat//KlabatSync//EN\n' +
      attendingEvents
        .map(
          (e) =>
            `BEGIN:VEVENT\nSUMMARY:${e.title}\nLOCATION:${e.location}\nDESCRIPTION:${e.description}\nEND:VEVENT`
        )
        .join('\n') +
      '\nEND:VCALENDAR';

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'KlabatSync_Student_Agenda.ics');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Agenda berhasil diekspor dalam format iCalendar (.ics).');
  };

  const displayedEvents =
    activeTab === 'attending'
      ? attendingEvents
      : activeTab === 'interested'
      ? interestedEvents
      : [...attendingEvents, ...interestedEvents];

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="purple" className="text-[10px] font-bold">
              Agenda Mahasiswa
            </Badge>
            <span className="text-xs text-slate-500 dark:text-slate-400">Waktu Indonesia Tengah (WITA)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight mt-1">
            Agenda Saya
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Kelola kegiatan pribadi, pendaftaran, dan jadwal kegiatan kampus.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExportCalendar} className="text-xs font-semibold">
            <Download className="h-4 w-4 mr-1.5" /> Ekspor kalender (.ics)
          </Button>
          <Button variant="primary" size="sm" onClick={() => setIsAddPersonalOpen(true)} className="text-xs font-bold">
            <PlusCircle className="h-4 w-4 mr-1.5" /> Tambah kegiatan pribadi
          </Button>
        </div>
      </div>

      {/* Schedule Conflict Warning Banners (from centralized conflict engine) */}
      {conflictReport.directConflicts.length > 0 && (
        <div role="status" className="p-4 rounded-3xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-900 dark:text-rose-200 space-y-2">
          <div className="flex items-center gap-2 font-black text-sm text-rose-700 dark:text-rose-400">
            <AlertTriangle className="h-5 w-5" />
            <span>Jadwal kegiatan bertumpang tindih.</span>
          </div>
          {conflictReport.directConflicts.map((c, i) => (
            <div key={i} className="pl-7 leading-relaxed font-medium">
              • {c.message}
            </div>
          ))}
        </div>
      )}

      {conflictReport.potentialConflicts.length > 0 && (
        <div role="status" className="p-4 rounded-3xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-xs text-amber-900 dark:text-amber-200 space-y-2">
          <div className="flex items-center gap-2 font-black text-sm text-amber-700 dark:text-amber-400">
            <Clock className="h-5 w-5" />
            <span>Jeda antar kegiatan kurang dari 30 menit.</span>
          </div>
          {conflictReport.potentialConflicts.map((c, i) => (
            <div key={i} className="pl-7 leading-relaxed font-medium">
              • {c.message}
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          type="button"
          aria-pressed={activeTab === 'attending'}
          onClick={() => setActiveTab('attending')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition-colors ${
            activeTab === 'attending'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Diikuti ({attendingEvents.length})
        </button>
        <button
          type="button"
          aria-pressed={activeTab === 'interested'}
          onClick={() => setActiveTab('interested')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition-colors ${
            activeTab === 'interested'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Tertarik ({interestedEvents.length})
        </button>
        <button
          type="button"
          aria-pressed={activeTab === 'all'}
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition-colors ${
            activeTab === 'all'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Semua kegiatan ({attendingEvents.length + interestedEvents.length})
        </button>
      </div>

      {/* Events List */}
      <div className="space-y-4">
        {displayedEvents.length === 0 ? (
          <div className="p-16 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-center space-y-3">
            <CalendarCheck className="h-10 w-10 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">
              Tidak ada kegiatan dalam kategori ini.
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Jelajahi kegiatan kampus untuk mendaftar atau menandai kegiatan yang Anda minati.
            </p>
          </div>
        ) : (
          displayedEvents.map((evt) => {
            const reg = getEventRegistration(evt.id);
            const isGoing = reg?.status === 'going';

            return (
              <div
                key={evt.id}
                className="p-5 rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs hover:shadow-md transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <EventBadge category={evt.category} />
                    {isGoing ? (
                      <Badge variant="success" className="text-[10px]">
                        Terdaftar · Tiket digital tersedia
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-[10px]">
                        Ditandai tertarik
                      </Badge>
                    )}
                    {evt.chapelPoints ? (
                      <Badge variant="purple" className="text-[10px]">
                        +{evt.chapelPoints} Poin Chapel
                      </Badge>
                    ) : null}
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedEvent(evt)}
                    className="text-left text-base font-extrabold text-slate-900 dark:text-slate-100 hover:text-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#142D4E]"
                  >
                    {evt.title}
                  </button>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-medium">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-blue-500" />                       {formatCampusDate(evt.startDate, { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-slate-400" /> {evt.startTime} {evt.endTime ? `- ${evt.endTime}` : ''} WITA
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-purple-500" /> {evt.location}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                  {isGoing && reg && (
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => setActivePassRegistration({ event: evt, registration: reg })}
                      className="text-xs font-bold gap-1 shadow-sm"
                    >
                      <Ticket className="h-3.5 w-3.5" /> Tiket digital
                    </Button>
                  )}

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedEvent(evt)}
                    className="text-xs font-semibold"
                  >
                    Lihat detail
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      if (agendaEvents.some((agendaEvent) => agendaEvent.id === evt.id)) {
                        deletePersonalAgendaEvent(evt.id);
                      } else {
                        setRSVP(evt.id, 'none');
                      }
                      toast.info(`Kegiatan "${evt.title}" dihapus dari agenda.`);
                    }}
                    className="text-xs text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                    title="Hapus dari agenda"
                  >
                    Hapus
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Personal Event Modal */}
      {isAddPersonalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Tutup form kegiatan pribadi"
            onClick={() => setIsAddPersonalOpen(false)}
            className="fixed inset-0 z-40 cursor-default bg-slate-900/60 backdrop-blur-sm"
          />
          <form
            onSubmit={handleCreatePersonalEvent}
            role="dialog"
            aria-modal="true"
            aria-labelledby="personal-agenda-title"
            className="relative z-50 w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4"
          >
            <h3 id="personal-agenda-title" className="text-base font-extrabold text-slate-900 dark:text-slate-100">
              Tambah kegiatan pribadi atau kelompok
            </h3>

            <div className="space-y-1.5">
              <label htmlFor="personal-title" className="text-xs font-bold text-slate-700 dark:text-slate-300">Nama kegiatan</label>
              <input
                id="personal-title"
                type="text"
                required
                placeholder="Contoh: diskusi tugas kelompok"
                name="title"
                value={personalTitle}
                onChange={(e) => setPersonalTitle(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs text-slate-900 dark:text-slate-100"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1">
                <label htmlFor="personal-date" className="text-xs font-bold text-slate-700 dark:text-slate-300">Tanggal</label>
                <input
                  id="personal-date"
                  type="date"
                  required
                  name="date"
                  value={personalDate}
                  onChange={(e) => setPersonalDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="personal-start-time" className="text-xs font-bold text-slate-700 dark:text-slate-300">Mulai</label>
                <input
                  id="personal-start-time"
                  type="time"
                  required
                  name="startTime"
                  value={personalStartTime}
                  onChange={(e) => setPersonalStartTime(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="personal-end-time" className="text-xs font-bold text-slate-700 dark:text-slate-300">Selesai</label>
                <input
                  id="personal-end-time"
                  type="time"
                  required
                  name="endTime"
                  value={personalEndTime}
                  onChange={(e) => setPersonalEndTime(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="personal-location" className="text-xs font-bold text-slate-700 dark:text-slate-300">Lokasi</label>
              <input
                id="personal-location"
                type="text"
                name="location"
                placeholder="Lokasi kegiatan"
                value={personalLocation}
                onChange={(e) => setPersonalLocation(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs text-slate-900 dark:text-slate-100"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <Button type="button" variant="secondary" size="sm" onClick={() => setIsAddPersonalOpen(false)}>
                Batal
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Simpan ke agenda
              </Button>
            </div>
          </form>
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

      {/* Digital Pass Modal */}
      {activePassRegistration && (
        <DigitalPassModal
          open={!!activePassRegistration}
          onOpenChange={(open) => !open && setActivePassRegistration(null)}
          event={activePassRegistration.event}
          registration={activePassRegistration.registration}
          student={student}
        />
      )}
    </div>
  );
};
