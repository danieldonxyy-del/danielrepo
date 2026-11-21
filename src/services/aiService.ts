import {
  CampusEvent,
  CampusAnnouncement,
  StudentProfile,
  EventRegistration,
  AIMessage,
  PosterExtractionResult
} from '../types';
import { samplePosterPresets } from '../data/samplePosters';

export interface AIContext {
  page?: string;
  eventId?: string;
  events: CampusEvent[];
  announcements: CampusAnnouncement[];
  student: StudentProfile | null;
  registrations: EventRegistration[];
}

export interface IAIProvider {
  chat(userMessage: string, context: AIContext): Promise<AIMessage>;
  extractPoster(posterInput: File | string): Promise<PosterExtractionResult>;
}

// ----------------------------------------------------
// Strict Domain Locking and Refusal Keywords (Part 28)
// ----------------------------------------------------
const REFUSAL_RESPONSE =
  "I'm KlabatSync AI Assistant. I can only help with information, events, schedules, announcements, and features available within the KlabatSync platform. Please ask me something related to KlabatSync.";

const FORBIDDEN_TOPICS = [
  'write a python', 'write python', 'write code', 'write a program', 'debug this code',
  'solve my homework', 'essay about', 'math problem', 'integral of', 'derive',
  'ignore previous instructions', 'ignore all instructions', 'developer mode',
  'system prompt', 'act as a', 'pretend you are', 'unrestricted gemini',
  'who won the world cup', 'recipe for', 'stock price', 'bitcoin', 'crypto price'
];

export class MockDemoAIAdapter implements IAIProvider {
  async chat(userMessage: string, context: AIContext): Promise<AIMessage> {
    // Artificial slight delay for realistic responsiveness
    await new Promise((resolve) => setTimeout(resolve, 600));

    const query = userMessage.toLowerCase().trim();

    // Check Prompt Injection / Domain Lock
    for (const forbidden of FORBIDDEN_TOPICS) {
      if (query.includes(forbidden)) {
        return {
          id: 'ai-msg-' + Date.now(),
          sender: 'ai',
          content: REFUSAL_RESPONSE,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isSimulated: true,
        };
      }
    }

    // Casual greeting handling
    if (['hello', 'hi', 'hai', 'halo', 'selamat pagi', 'selamat siang', 'selamat malam'].includes(query)) {
      const studentName = context.student ? context.student.fullName.split(' ')[0] : 'student';
      return {
        id: 'ai-msg-' + Date.now(),
        sender: 'ai',
        content: `Hello ${studentName}! I am your KlabatSync AI Assistant. I can help you check your campus schedule, upcoming UNKLAB chapel points, hackathons, or dormitory announcements. What would you like to explore?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isSimulated: true,
      };
    }

    // 1. Contextual Event Q&A (if on an event detail page or asking about a specific event)
    if (context.eventId) {
      const event = context.events.find((e) => e.id === context.eventId);
      if (event) {
        if (query.includes('jean') || query.includes('wear') || query.includes('baju') || query.includes('pakaian') || query.includes('dress code')) {
          return {
            id: 'ai-msg-' + Date.now(),
            sender: 'ai',
            content: event.dressCode
              ? `The required dress code for **${event.title}** is: *${event.dressCode}*. Please ensure compliance with UNKLAB grooming standards.`
              : 'This information has not been provided in the event announcement. Please contact the organizer.',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isSimulated: true,
            sourceAttributions: [{ title: event.title, module: 'Explore Events', date: event.startDate }],
          };
        }

        if (query.includes('point') || query.includes('chapel') || query.includes('poin')) {
          const pts = event.chapelPoints ?? 0;
          return {
            id: 'ai-msg-' + Date.now(),
            sender: 'ai',
            content: pts > 0
              ? `Yes! Attending **${event.title}** awards **${pts} Chapel Point(s)** upon verified presence scan at Pioneer Chapel.`
              : `No chapel points are awarded for **${event.title}**.`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isSimulated: true,
            sourceAttributions: [{ title: event.title, module: 'Event Details', date: event.startDate }],
          };
        }

        if (query.includes('lokasi') || query.includes('location') || query.includes('where') || query.includes('tempat')) {
          return {
            id: 'ai-msg-' + Date.now(),
            sender: 'ai',
            content: `The venue for **${event.title}** is **${event.location}**.`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isSimulated: true,
            sourceAttributions: [{ title: event.title, module: 'Event Details', date: event.startDate }],
          };
        }

        if (query.includes('duration') || query.includes('how long') || query.includes('berapa lama') || query.includes('jam')) {
          if (event.startTime && event.endTime) {
            return {
              id: 'ai-msg-' + Date.now(),
              sender: 'ai',
              content: `The event is scheduled from **${event.startTime}** to **${event.endTime} WITA** on ${event.startDate}.`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              isSimulated: true,
              sourceAttributions: [{ title: event.title, module: 'Event Details', date: event.startDate }],
            };
          } else {
            return {
              id: 'ai-msg-' + Date.now(),
              sender: 'ai',
              content: 'The end time for this event is currently unspecified by the organizer.',
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              isSimulated: true,
            };
          }
        }
      }
    }

    // 2. Schedule / Agenda queries ("What is my schedule?", "jadwal saya")
    if (query.includes('schedule') || query.includes('agenda') || query.includes('jadwal') || query.includes('tomorrow') || query.includes('besok')) {
      const registeredIds = context.registrations.filter((r) => r.status === 'going').map((r) => r.eventId);
      const myEvents = context.events.filter((e) => registeredIds.includes(e.id));

      if (myEvents.length === 0) {
        return {
          id: 'ai-msg-' + Date.now(),
          sender: 'ai',
          content: 'You currently have no confirmed RSVPs in your personal agenda. Browse **Explore Events** to RSVP for campus activities, chapel services, or seminars.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isSimulated: true,
        };
      }

      const listStr = myEvents
        .slice(0, 4)
        .map((e) => `• **${e.title}** (${e.startDate} at ${e.startTime} WITA - ${e.location})`)
        .join('\n');

      return {
        id: 'ai-msg-' + Date.now(),
        sender: 'ai',
        content: `Here is your upcoming schedule based on the events registered to your account:\n\n${listStr}\n\nYou can view full details in **My Agenda**.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isSimulated: true,
        sourceAttributions: myEvents.map((e) => ({ title: e.title, module: 'My Agenda', date: e.startDate })),
      };
    }

    // 3. Recommendations by faculty or interests ("recommend for fik", "rekomendasi")
    if (query.includes('fik') || query.includes('faculty') || query.includes('fakultas') || query.includes('recommend') || query.includes('rekomendasi')) {
      const studentFaculty = context.student?.faculty || 'FIK';
      const matchingEvents = context.events.filter(
        (e) => !e.eligibleFaculties || e.eligibleFaculties.length === 0 || e.eligibleFaculties.includes(studentFaculty)
      );

      const items = matchingEvents
        .slice(0, 3)
        .map((e) => `• **${e.title}** [${e.category.toUpperCase()}] on ${e.startDate} at ${e.location}`)
        .join('\n');

      return {
        id: 'ai-msg-' + Date.now(),
        sender: 'ai',
        content: `Here are active campus activities aligned with **${studentFaculty}** students:\n\n${items}\n\nAll dates are grounded in live UNKLAB platform data.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isSimulated: true,
        sourceAttributions: matchingEvents.slice(0, 3).map((e) => ({ title: e.title, module: 'Explore Events', date: e.startDate })),
      };
    }

    // 4. Chapel points query
    if (query.includes('chapel') || query.includes('poin')) {
      const chapelEvents = context.events.filter((e) => (e.chapelPoints ?? 0) > 0);
      const list = chapelEvents
        .map((e) => `• **${e.title}** (+${e.chapelPoints} pts) on ${e.startDate} at ${e.location}`)
        .join('\n');

      return {
        id: 'ai-msg-' + Date.now(),
        sender: 'ai',
        content: `Here are upcoming chapel & spiritual activities offering chapel points:\n\n${list}\n\n*Note: Points require verified presence scan at Pioneer Chapel.*`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isSimulated: true,
        sourceAttributions: chapelEvents.map((e) => ({ title: e.title, module: 'Explore Events' })),
      };
    }

    // 5. Announcements query
    if (query.includes('announcement') || query.includes('pengumuman')) {
      const recent = context.announcements.slice(0, 3);
      const list = recent.map((a) => `• **${a.title}** (${a.organizer} · ${a.date})`).join('\n');

      return {
        id: 'ai-msg-' + Date.now(),
        sender: 'ai',
        content: `Latest official announcements published in KlabatSync:\n\n${list}\n\nVisit the **Announcements** page to read the full circulars.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isSimulated: true,
        sourceAttributions: recent.map((a) => ({ title: a.title, module: 'Announcements', date: a.date })),
      };
    }

    // Default grounded helpful response for general campus questions
    return {
      id: 'ai-msg-' + Date.now(),
      sender: 'ai',
      content:
        `I am your KlabatSync Campus Assistant. You can ask me:\n` +
        `• "What is my schedule tomorrow?"\n` +
        `• "Which events offer chapel points?"\n` +
        `• "Recommend activities for FIK students."\n` +
        `• "What are the latest campus announcements?"\n\n` +
        `All information is synchronized with Universitas Klabat live events.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSimulated: true,
    };
  }

  async extractPoster(posterInput: File | string): Promise<PosterExtractionResult> {
    // Artificial extraction scanning delay (approx 1.5s)
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Check if matching preset ID
    if (typeof posterInput === 'string') {
      const preset = samplePosterPresets.find((p) => p.id === posterInput);
      if (preset) {
        return preset.extractionData;
      }
    }

    // If an uploaded custom image file
    const fileName = typeof posterInput === 'string' ? posterInput : posterInput.name;
    const lower = fileName.toLowerCase();

    if (lower.includes('vesper') || lower.includes('spiritual')) {
      return samplePosterPresets[1].extractionData;
    }
    if (lower.includes('dorm') || lower.includes('assembly')) {
      return samplePosterPresets[2].extractionData;
    }

    // Default to FIK Hackathon schema
    return samplePosterPresets[0].extractionData;
  }
}

export class BackendAPIAdapter implements IAIProvider {
  private apiEndpoint: string;

  constructor(apiEndpoint = '/api/ai') {
    this.apiEndpoint = apiEndpoint;
  }

  async chat(userMessage: string, context: AIContext): Promise<AIMessage> {
    try {
      const res = await fetch(`${this.apiEndpoint}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage, context }),
      });
      if (!res.ok) throw new Error('Backend AI unavailable');
      return await res.json();
    } catch {
      // Graceful fallback to MockDemoAIAdapter
      const fallback = new MockDemoAIAdapter();
      return fallback.chat(userMessage, context);
    }
  }

  async extractPoster(posterInput: File | string): Promise<PosterExtractionResult> {
    try {
      const formData = new FormData();
      if (posterInput instanceof File) {
        formData.append('file', posterInput);
      } else {
        formData.append('presetId', posterInput);
      }

      const res = await fetch(`${this.apiEndpoint}/extract-poster`, {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error('Backend poster extraction unavailable');
      return await res.json();
    } catch {
      const fallback = new MockDemoAIAdapter();
      return fallback.extractPoster(posterInput);
    }
  }
}

// Global active AI Service instance (defaults to MockDemoAIAdapter for Front-End Demo)
export const aiService: IAIProvider = new MockDemoAIAdapter();
