import React, { useState } from 'react';
import {
  Bookmark,
  Calendar,
  MapPin,
  Sparkles,
  Ticket,
  AlertTriangle,
  Share2,
} from 'lucide-react';
import { CampusEvent } from '../../types';
import { useApp } from '../../context/AppContext';
import { PosterCanvas } from './PosterCanvas';
import { EventBadge } from './EventBadge';
import { Button } from '../ui/button';
import { evaluateEligibility } from '../../utils/eligibility';
import { checkEventConflictWithList } from '../../utils/conflictDetection';
import { DigitalPassModal } from '../attendance/DigitalPassModal';
import { toast } from 'sonner';

interface EventCardProps {
  event: CampusEvent;
  onViewDetails: (event: CampusEvent) => void;
}

export const EventCard: React.FC<EventCardProps> = ({ event, onViewDetails }) => {
  const {
    student,
    events,
    bookmarks,
    toggleBookmark,
    setRSVP,
    getEventRSVP,
    getEventRegistration,
    setIsGlobalAIChatOpen,
    setGlobalAIChatContextEventId,
  } = useApp();

  const [passOpen, setPassOpen] = useState(false);

  const isSaved = bookmarks.includes(event.id);
  const currentRSVP = getEventRSVP(event.id);
  const registration = getEventRegistration(event.id);
  const eligibility = evaluateEligibility(event, student);

  // Check schedule conflict with other enrolled events
  const registeredEvents = events.filter((e) => {
    const reg = getEventRegistration(e.id);
    return reg && reg.status === 'going' && e.id !== event.id;
  });
  const conflict = checkEventConflictWithList(event, registeredEvents);

  const handleRSVP = (status: 'going' | 'interested' | 'none') => {
    if (eligibility.status === 'not_eligible') {
      toast.error('Anda belum memenuhi persyaratan untuk mengikuti kegiatan ini.');
      return;
    }
    setRSVP(event.id, status);
    if (status === 'going') {
      toast.success(`Pendaftaran untuk ${event.title} berhasil. Tiket digital tersedia.`);
    } else if (status === 'interested') {
      toast.info(`Anda menandai ${event.title} sebagai kegiatan yang diminati.`);
    } else {
      toast.info(`Pendaftaran untuk ${event.title} dibatalkan.`);
    }
  };

  const handleAskAI = () => {
    setGlobalAIChatContextEventId(event.id);
    setIsGlobalAIChatOpen(true);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.origin + `/events?id=${event.id}`);
    toast.success('Tautan kegiatan disalin.');
  };

  return (
    <>
      <div className="group relative flex flex-col rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111C2E] shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 transition-colors duration-150 overflow-hidden">
        {/* Poster Canvas Header */}
        <div className="relative">
          <PosterCanvas
            title={event.title}
            category={event.category}
            organizer={event.organizer}
            date={event.startDate}
            time={event.startTime}
            posterGradient={event.posterGradient}
            isCompact={false}
          />

          {/* Quick Bookmark Button */}
          <button
            type="button"
            onClick={() => {
              toggleBookmark(event.id);
              toast(isSaved ? 'Kegiatan dihapus dari simpanan' : 'Kegiatan disimpan!');
            }}
            className="absolute top-2.5 right-2.5 z-20 h-9 w-9 rounded-lg bg-slate-900/60 backdrop-blur-xs text-white hover:bg-slate-900/80 flex items-center justify-center transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D6A84B]"
            aria-label={isSaved ? 'Hapus kegiatan dari simpanan' : 'Simpan kegiatan'}
          >
            <Bookmark className={`h-3.5 w-3.5 ${isSaved ? 'fill-amber-400 text-amber-400' : 'text-white'}`} />
          </button>

          {/* Chapel Points Ribbon */}
          {event.chapelPoints ? (
            <div className="absolute bottom-2.5 left-2.5 z-20">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50/95 text-amber-900 border border-amber-300 dark:bg-amber-950/90 dark:text-amber-300 dark:border-amber-700 shadow-2xs flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-[#D6A84B]" /> +{event.chapelPoints} Chapel Point
              </span>
            </div>
          ) : null}
        </div>

        {/* Card Body */}
        <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
          <div>
            {/* Category, Status & Conflict Indicators */}
            <div className="flex flex-wrap items-center gap-1.5 mb-2">
              <EventBadge category={event.category} />
              <span className={`text-[10px] font-semibold px-2 py-0.2 rounded border ${eligibility.badgeColor}`}>
                {eligibility.badgeLabel}
              </span>

              {/* Conflict indicator if overlapping */}
              {conflict.hasConflict && (
                <span
                  className="text-[10px] font-bold px-2 py-0.2 rounded bg-amber-50 text-amber-800 border border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800 flex items-center gap-1"
                  title={conflict.message}
                >
                  <AlertTriangle className="h-3 w-3" /> Bentrok Jadwal
                </span>
              )}
            </div>

            {/* Event Title */}
            <button
              type="button"
              onClick={() => onViewDetails(event)}
              className="text-left text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-[#142D4E] dark:group-hover:text-blue-400 transition-colors line-clamp-2 leading-snug focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#142D4E]"
            >
              {event.title}
            </button>

            {/* Metadata (Time, Location, Organizer) */}
            <div className="mt-2.5 space-y-1 text-xs text-slate-500 dark:text-slate-400 font-medium">
              <div className="flex items-center gap-2">
                <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <span>
                  {event.startDate} · {event.startTime} {event.endTime ? `- ${event.endTime}` : ''} WITA
                </span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{event.location}</span>
              </div>
              {event.dressCode && (
                <div className="text-[11px] text-slate-400 truncate">
                  <span className="font-semibold text-slate-500 dark:text-slate-300">Pakaian:</span> {event.dressCode}
                </div>
              )}
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
              {/* RSVP Action */}
              {currentRSVP === 'going' ? (
                <div className="flex items-center gap-1.5 flex-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRSVP('none')}
                    className="text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                    title="Batal RSVP"
                  >
                    Batal
                  </Button>
                  {registration && (
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => setPassOpen(true)}
                      className="flex-1 text-xs font-semibold gap-1 shadow-2xs"
                    >
                      <Ticket className="h-3.5 w-3.5" /> Tiket digital
                    </Button>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-1.5 flex-1">
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => handleRSVP('going')}
                    className="flex-1 text-xs font-semibold"
                  >
                    RSVP Ikut
                  </Button>
                  <Button
                    size="sm"
                    variant={currentRSVP === 'interested' ? 'secondary' : 'outline'}
                    onClick={() => handleRSVP(currentRSVP === 'interested' ? 'none' : 'interested')}
                    className="text-xs"
                    title="Tandai tertarik"
                  >
                    {currentRSVP === 'interested' ? 'Diminati ✓' : 'Minati'}
                  </Button>
                </div>
              )}

              {/* Ask AI Contextual Q&A */}
              <button
                type="button"
                onClick={handleAskAI}
                aria-label="Tanya AI tentang kegiatan ini"
                className="h-9 w-9 rounded-lg flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 transition-colors shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#142D4E]"
                title="Tanya AI seputar kegiatan ini"
              >
                <Sparkles className="h-3.5 w-3.5 text-[#D6A84B]" />
              </button>

              {/* Share */}
              <button
                type="button"
                onClick={handleShare}
                aria-label="Salin tautan kegiatan"
                className="h-9 w-9 rounded-lg flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 transition-colors shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#142D4E]"
                title="Salin tautan kegiatan"
              >
                <Share2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Digital Pass Modal when clicked */}
      {registration && (
        <DigitalPassModal
          open={passOpen}
          onOpenChange={setPassOpen}
          event={event}
          registration={registration}
          student={student}
        />
      )}
    </>
  );
};
