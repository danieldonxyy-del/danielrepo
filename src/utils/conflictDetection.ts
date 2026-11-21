import { CampusEvent, ConflictResult } from '../types';

/**
 * Parses "YYYY-MM-DD" and "HH:mm" into a comparable minute timestamp.
 * Handled in local Asia/Makassar (WITA) perspective.
 */
function parseEventInterval(dateStr: string, timeStr: string, endDateStr?: string, endTimeStr?: string) {
  if (!dateStr || !timeStr) return null;
  
  const [startYear, startMonth, startDay] = dateStr.split('-').map(Number);
  const [startHour, startMinute] = timeStr.split(':').map(Number);
  if (isNaN(startYear) || isNaN(startMonth) || isNaN(startDay) || isNaN(startHour) || isNaN(startMinute)) {
    return null;
  }

  const startTotalMinutes = new Date(startYear, startMonth - 1, startDay, startHour, startMinute).getTime() / (1000 * 60);

  if (!endTimeStr) {
    // Missing end time -> Incomplete schedule
    return {
      startTotalMinutes,
      endTotalMinutes: null,
      isIncomplete: true,
    };
  }

  const endD = endDateStr || dateStr;
  const [endYear, endMonth, endDay] = endD.split('-').map(Number);
  const [endHour, endMinute] = endTimeStr.split(':').map(Number);
  if (isNaN(endYear) || isNaN(endMonth) || isNaN(endDay) || isNaN(endHour) || isNaN(endMinute)) {
    return {
      startTotalMinutes,
      endTotalMinutes: null,
      isIncomplete: true,
    };
  }

  let endTotalMinutes = new Date(endYear, endMonth - 1, endDay, endHour, endMinute).getTime() / (1000 * 60);

  // Cross midnight on the same date (e.g. 23:00 to 01:00)
  if (endTotalMinutes <= startTotalMinutes && endD === dateStr) {
    endTotalMinutes += 24 * 60;
  }

  return {
    startTotalMinutes,
    endTotalMinutes,
    isIncomplete: false,
  };
}

/**
 * Checks conflict between two individual events.
 */
export function compareEventPair(evtA: CampusEvent, evtB: CampusEvent): ConflictResult {
  // Ignore cancelled or draft events
  if (evtA.status === 'cancelled' || evtB.status === 'cancelled') {
    return {
      hasConflict: false,
      type: 'available',
      message: 'One or both events are cancelled.',
    };
  }

  const intervalA = parseEventInterval(evtA.startDate, evtA.startTime, evtA.endDate, evtA.endTime);
  const intervalB = parseEventInterval(evtB.startDate, evtB.startTime, evtB.endDate, evtB.endTime);

  if (!intervalA || !intervalB || intervalA.isIncomplete || intervalB.isIncomplete) {
    return {
      hasConflict: false,
      type: 'incomplete',
      message: `Incomplete schedule: Missing end time on "${evtA.title}" or "${evtB.title}". Time confirmation required.`,
      conflictingEvents: [evtA, evtB],
    };
  }

  const startA = intervalA.startTotalMinutes;
  const endA = intervalA.endTotalMinutes!;
  const startB = intervalB.startTotalMinutes;
  const endB = intervalB.endTotalMinutes!;

  // 1. DIRECT OVERLAP: (startA < endB) and (startB < endA)
  if (startA < endB && startB < endA) {
    return {
      hasConflict: true,
      type: 'direct',
      message: `Direct Conflict: "${evtA.title}" (${evtA.startTime}-${evtA.endTime}) overlaps with "${evtB.title}" (${evtB.startTime}-${evtB.endTime}) on ${evtA.startDate}.`,
      conflictingEvents: [evtA, evtB],
    };
  }

  // 2. POTENTIAL CONFLICT (gap < 30 minutes between consecutive events)
  const gapAfterA = startB - endA;
  const gapAfterB = startA - endB;

  if (gapAfterA >= 0 && gapAfterA < 30) {
    return {
      hasConflict: true,
      type: 'potential',
      message: `Potential Conflict: Only ${gapAfterA} minutes transition gap between "${evtA.title}" and "${evtB.title}".`,
      conflictingEvents: [evtA, evtB],
    };
  }

  if (gapAfterB >= 0 && gapAfterB < 30) {
    return {
      hasConflict: true,
      type: 'potential',
      message: `Potential Conflict: Only ${gapAfterB} minutes transition gap between "${evtB.title}" and "${evtA.title}".`,
      conflictingEvents: [evtA, evtB],
    };
  }

  // 3. AVAILABLE (gap >= 30 minutes)
  return {
    hasConflict: false,
    type: 'available',
    message: 'No conflicts detected. Sufficient buffer time available.',
  };
}

/**
 * Standardized Conflict Engine for a collection of events (e.g. student's registered agenda).
 * Scans all pairs and classifies conflicts.
 */
export function detectScheduleConflicts(events: CampusEvent[]): {
  directConflicts: ConflictResult[];
  potentialConflicts: ConflictResult[];
  incompleteSchedules: ConflictResult[];
  allResults: ConflictResult[];
} {
  const directConflicts: ConflictResult[] = [];
  const potentialConflicts: ConflictResult[] = [];
  const incompleteSchedules: ConflictResult[] = [];

  const activeEvents = events.filter(e => e.status !== 'cancelled' && e.status !== 'draft');

  for (let i = 0; i < activeEvents.length; i++) {
    for (let j = i + 1; j < activeEvents.length; j++) {
      const res = compareEventPair(activeEvents[i], activeEvents[j]);
      if (res.type === 'direct') {
        directConflicts.push(res);
      } else if (res.type === 'potential') {
        potentialConflicts.push(res);
      } else if (res.type === 'incomplete') {
        incompleteSchedules.push(res);
      }
    }
  }

  return {
    directConflicts,
    potentialConflicts,
    incompleteSchedules,
    allResults: [...directConflicts, ...potentialConflicts, ...incompleteSchedules],
  };
}

/**
 * Checks if a specific target event conflicts with an existing list of enrolled events.
 */
export function checkEventConflictWithList(targetEvent: CampusEvent, enrolledEvents: CampusEvent[]): ConflictResult {
  for (const enrolled of enrolledEvents) {
    if (enrolled.id === targetEvent.id) continue;
    const res = compareEventPair(targetEvent, enrolled);
    if (res.hasConflict || res.type === 'incomplete') {
      return res;
    }
  }

  return {
    hasConflict: false,
    type: 'available',
    message: 'Schedule clear for this activity.',
  };
}
