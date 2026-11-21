import { CampusEvent, EventCategory } from '../types';
import { initialEvents } from '../data/mockEvents';
import { getCampusToday } from '../utils/campusDate';

const STORAGE_KEY = 'klabatsync_events';

export const eventService = {
  getAllEvents(): CampusEvent[] {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialEvents));
      return initialEvents;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return initialEvents;
    }
  },

  saveEvents(events: CampusEvent[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  },

  getEventById(id: string): CampusEvent | undefined {
    return this.getAllEvents().find((e) => e.id === id);
  },

  createEvent(event: CampusEvent): CampusEvent {
    const events = this.getAllEvents();
    events.unshift(event);
    this.saveEvents(events);
    return event;
  },

  updateEvent(event: CampusEvent): CampusEvent {
    const events = this.getAllEvents();
    const idx = events.findIndex((e) => e.id === event.id);
    if (idx !== -1) {
      events[idx] = event;
      this.saveEvents(events);
    }
    return event;
  },

  deleteEvent(id: string): void {
    const events = this.getAllEvents().filter((e) => e.id !== id);
    this.saveEvents(events);
  },

  filterEvents(params: {
    category?: EventCategory | 'all';
    search?: string;
    dormitoryOnly?: boolean;
    hasChapelPoints?: boolean;
    dateFilter?: 'today' | 'upcoming' | 'all';
  }): CampusEvent[] {
    let list = this.getAllEvents();

    if (params.category && params.category !== 'all') {
      list = list.filter((e) => e.category === params.category);
    }

    if (params.search && params.search.trim() !== '') {
      const q = params.search.toLowerCase();
      list = list.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q) ||
          e.location.toLowerCase().includes(q) ||
          e.organizer.toLowerCase().includes(q)
      );
    }

    if (params.dormitoryOnly) {
      list = list.filter((e) => e.dormitoryOnly === true);
    }

    if (params.hasChapelPoints) {
      list = list.filter((e) => (e.chapelPoints ?? 0) > 0);
    }

    if (params.dateFilter === 'today') {
      list = list.filter((e) => e.startDate === getCampusToday());
    }

    return list;
  },

  resetToDefault(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialEvents));
  },
};
