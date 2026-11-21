import React, { useState } from 'react';
import { Bookmark, Compass } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { EventCard } from '../components/events/EventCard';
import { EventDetailsModal } from '../dialogs/EventDetailsModal';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { CampusEvent } from '../types';

export const SavedEvents: React.FC = () => {
  const { events, bookmarks } = useApp();
  const navigate = useNavigate();
  const [selectedEvent, setSelectedEvent] = useState<CampusEvent | null>(null);

  const savedEvents = events.filter((e) => bookmarks.includes(e.id));

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Badge variant="amber" className="text-[10px] font-bold">
            PERSONAL BOOKMARKS
          </Badge>
          <span className="text-xs text-slate-400">Stored locally in your profile</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight mt-1">
          Saved Campus Activities ({savedEvents.length})
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Bookmarked events for quick RSVP, scheduling, and digital pass generation.
        </p>
      </div>

      {savedEvents.length === 0 ? (
        <div className="p-16 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-center space-y-3">
          <Bookmark className="h-10 w-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
            No saved events yet
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Click the bookmark icon on any campus event card in Explore Events to pin it to your personal bookmarks.
          </p>
          <Button variant="primary" size="sm" onClick={() => navigate('/events')} className="mt-2 text-xs">
            <Compass className="h-4 w-4 mr-1.5" /> Explore Events
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {savedEvents.map((evt) => (
            <EventCard key={evt.id} event={evt} onViewDetails={setSelectedEvent} />
          ))}
        </div>
      )}

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
