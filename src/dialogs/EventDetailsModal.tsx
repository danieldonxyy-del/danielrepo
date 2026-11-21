import React, { useState } from 'react';
import {
  Calendar,
  MapPin,
  Sparkles,
  Ticket,
  Bookmark,
  Share2,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { Dialog } from '../components/ui/dialog';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { PosterCanvas } from '../components/events/PosterCanvas';
import { EventBadge } from '../components/events/EventBadge';
import { CampusEvent, AIMessage } from '../types';
import { useApp } from '../context/AppContext';
import { evaluateEligibility } from '../utils/eligibility';
import { checkEventConflictWithList } from '../utils/conflictDetection';
import { DigitalPassModal } from '../components/attendance/DigitalPassModal';
import { aiService } from '../services/aiService';
import { toast } from 'sonner';

interface EventDetailsModalProps {
  event: CampusEvent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EventDetailsModal: React.FC<EventDetailsModalProps> = ({
  event,
  open,
  onOpenChange,
}) => {
  const {
    student,
    events,
    announcements,
    registrations,
    bookmarks,
    toggleBookmark,
    setRSVP,
    getEventRSVP,
    getEventRegistration,
  } = useApp();

  const [passOpen, setPassOpen] = useState(false);
  const [qaLoading, setQaLoading] = useState(false);
  const [qaMessages, setQaMessages] = useState<AIMessage[]>([]);

  if (!event) return null;

  const isSaved = bookmarks.includes(event.id);
  const currentRSVP = getEventRSVP(event.id);
  const registration = getEventRegistration(event.id);
  const eligibility = evaluateEligibility(event, student);

  const registeredEvents = events.filter((e) => {
    const reg = getEventRegistration(e.id);
    return reg && reg.status === 'going' && e.id !== event.id;
  });
  const conflict = checkEventConflictWithList(event, registeredEvents);

  const handleRSVP = (status: 'going' | 'interested' | 'none') => {
    if (eligibility.status === 'not_eligible') {
      toast.error('You do not meet the eligibility requirements for this event.');
      return;
    }
    setRSVP(event.id, status);
    if (status === 'going') {
      toast.success(`RSVP confirmed for ${event.title}! Digital pass generated.`);
    } else {
      toast.info(`RSVP updated.`);
    }
  };

  const handleAskQuickQ = async (queryText: string) => {
    const userMsg: AIMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      content: queryText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setQaMessages((prev) => [...prev, userMsg]);
    setQaLoading(true);

    try {
      const resp = await aiService.chat(queryText, {
        eventId: event.id,
        events,
        announcements,
        student,
        registrations,
      });
      setQaMessages((prev) => [...prev, resp]);
    } catch {
      toast.error('AI assistant currently offline');
    } finally {
      setQaLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange} className="max-w-3xl p-0 overflow-hidden">
        {/* Modal Header Poster */}
        <div className="relative">
          <PosterCanvas
            title={event.title}
            category={event.category}
            organizer={event.organizer}
            date={event.startDate}
            time={event.startTime}
            posterGradient={event.posterGradient}
            isCompact={true}
          />
        </div>

        <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6 bg-white dark:bg-slate-900">
          {/* Title & Category Badges */}
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <EventBadge category={event.category} />
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${eligibility.badgeColor}`}>
                {eligibility.badgeLabel}
              </span>
              {event.chapelPoints ? (
                <Badge variant="purple" className="text-xs font-bold">
                  +{event.chapelPoints} Chapel Point
                </Badge>
              ) : null}
              {event.dormitoryOnly && (
                <Badge variant="secondary" className="text-xs">
                  Dormitory Residents Only
                </Badge>
              )}
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 leading-tight">
              {event.title}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
              Organized by <span className="font-bold text-slate-700 dark:text-slate-300">{event.organizer}</span>
            </p>
          </div>

          {/* Schedule Conflict Banner if any */}
          {conflict.hasConflict && (
            <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-800 dark:text-rose-200">
              <AlertTriangle className="h-5 w-5 shrink-0 text-rose-600 mt-0.5" />
              <div>
                <span className="font-bold">Schedule Overlap Alert:</span>
                <p className="mt-0.5">{conflict.message}</p>
              </div>
            </div>
          )}

          {/* Key Facts Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">Date &amp; Time</span>
              <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-blue-500" />
                <span>{event.startDate} {event.endDate !== event.startDate ? `to ${event.endDate}` : ''}</span>
              </div>
              <div className="text-slate-500 dark:text-slate-400 pl-5">
                {event.startTime} {event.endTime ? `- ${event.endTime}` : '(End time unspecified)'} WITA
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">Venue Location</span>
              <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-purple-500" />
                <span>{event.location}</span>
              </div>
              <div className="text-slate-500 dark:text-slate-400 pl-5">
                Universitas Klabat Main Campus
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">Dress Code</span>
              <div className="font-semibold text-slate-800 dark:text-slate-200">
                {event.dressCode || 'Not specified by organizer'}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">Registration &amp; Capacity</span>
              <div className="font-semibold text-slate-800 dark:text-slate-200">
                {event.registeredCount || 0} / {event.capacity || 'Open'} registered
              </div>
              {event.registrationDeadline && (
                <div className="text-[11px] text-slate-400">Deadline: {event.registrationDeadline}</div>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Description</h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
              {event.description}
            </p>
          </div>

          {/* Rundown if available */}
          {event.rundown && event.rundown.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Event Rundown</h4>
              <div className="space-y-1.5 border-l-2 border-blue-500/30 pl-3">
                {event.rundown.map((item, idx) => (
                  <div key={idx} className="text-xs flex items-baseline gap-2">
                    <span className="font-mono font-bold text-blue-600 dark:text-blue-400 text-[11px] shrink-0">
                      {item.time}
                    </span>
                    <span className="text-slate-700 dark:text-slate-300">{item.activity}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Requirements & Eligibility Reasons */}
          {eligibility.reasons.length > 0 && (
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <Info className="h-3.5 w-3.5 text-blue-500" /> Eligibility Status &amp; Notes
              </h4>
              <ul className="text-xs space-y-1 text-slate-600 dark:text-slate-400 pl-4 list-disc">
                {eligibility.reasons.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Part 7.3: Contextual AI Event Q&A Panel */}
          <div className="p-4 rounded-3xl bg-linear-to-br from-purple-50/70 to-blue-50/50 dark:from-purple-950/20 dark:to-blue-950/20 border border-purple-200/60 dark:border-purple-800/60 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold">
                  <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    Ask KlabatSync AI about this event
                  </h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    Instant verified answers from this event's published details.
                  </p>
                </div>
              </div>
              <Badge variant="purple" className="text-[9px]">
                Ground Truth
              </Badge>
            </div>

            {/* Suggested quick Q pills */}
            <div className="flex flex-wrap gap-1.5">
              {[
                'Can I wear jeans?',
                'Does this provide chapel points?',
                'Where exactly is the venue?',
                'How long will it last?',
              ].map((sugg, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleAskQuickQ(sugg)}
                  className="px-2.5 py-1 rounded-xl bg-white dark:bg-slate-800 border border-purple-200 dark:border-purple-800 text-[10px] font-semibold text-purple-700 dark:text-purple-300 hover:bg-purple-100/70 transition-colors"
                >
                  {sugg}
                </button>
              ))}
            </div>

            {/* Conversation Q&A history snippet */}
            {qaMessages.length > 0 && (
              <div className="space-y-2 max-h-48 overflow-y-auto p-2 bg-white/80 dark:bg-slate-900/80 rounded-2xl border border-purple-100 dark:border-purple-900/40 text-xs">
                {qaMessages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex gap-2 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`p-2.5 rounded-xl max-w-[85%] ${
                        m.sender === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-purple-50 text-slate-800 dark:bg-purple-950/60 dark:text-purple-100'
                      }`}
                    >
                      {m.content}
                    </div>
                  </div>
                ))}
                {qaLoading && (
                  <div className="text-[10px] text-purple-600 animate-pulse">
                    KlabatSync AI is verifying event rules...
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Organizer Contact */}
          {event.contact && (
            <div className="text-xs text-slate-500 border-t border-slate-100 dark:border-slate-800 pt-3 flex flex-wrap items-center gap-4">
              <span className="font-bold text-slate-700 dark:text-slate-300">Organizer Contact:</span>
              <span>{event.contact.name}</span>
              {event.contact.email && <span>{event.contact.email}</span>}
              {event.contact.phone && <span>{event.contact.phone}</span>}
            </div>
          )}

          {/* Action Footer */}
          <div className="border-t border-slate-100 dark:border-slate-800 pt-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  toggleBookmark(event.id);
                  toast(isSaved ? 'Removed from bookmarks' : 'Added to bookmarks!');
                }}
                className="h-10 w-10 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                <Bookmark className={`h-4 w-4 ${isSaved ? 'fill-amber-400 text-amber-400' : ''}`} />
              </button>

              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.origin + `/events?id=${event.id}`);
                  toast.success('Event link copied!');
                }}
                className="h-10 w-10 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                <Share2 className="h-4 w-4" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              {currentRSVP === 'going' ? (
                <>
                  <Button variant="outline" size="sm" onClick={() => handleRSVP('none')}>
                    Cancel RSVP
                  </Button>
                  {registration && (
                    <Button variant="primary" size="sm" onClick={() => setPassOpen(true)}>
                      <Ticket className="h-4 w-4 mr-1.5" /> View Digital Pass
                    </Button>
                  )}
                </>
              ) : (
                <>
                  <Button
                    variant={currentRSVP === 'interested' ? 'secondary' : 'outline'}
                    size="sm"
                    onClick={() => handleRSVP(currentRSVP === 'interested' ? 'none' : 'interested')}
                  >
                    {currentRSVP === 'interested' ? 'Interested ✓' : 'Interested'}
                  </Button>
                  <Button variant="primary" size="sm" onClick={() => handleRSVP('going')}>
                    RSVP Going
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </Dialog>

      {/* Digital Pass if accessed */}
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
