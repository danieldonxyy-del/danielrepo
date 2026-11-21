import { CampusEvent, StudentProfile, EligibilityStatus } from '../types';

export interface EligibilityEvaluation {
  status: EligibilityStatus;
  reasons: string[];
  badgeColor: string;
  badgeLabel: string;
}

export function evaluateEligibility(
  event: CampusEvent,
  student: StudentProfile | null
): EligibilityEvaluation {
  // If no restrictions at all, it's open to all
  const hasFacultyLimit = event.eligibleFaculties && event.eligibleFaculties.length > 0;
  const hasBatchLimit = event.eligibleBatches && event.eligibleBatches.length > 0;
  const hasDormLimit = event.dormitoryOnly === true;

  if (!hasFacultyLimit && !hasBatchLimit && !hasDormLimit) {
    return {
      status: 'open_to_all',
      reasons: ['Open to all UNKLAB students.'],
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
      badgeLabel: 'Open to All',
    };
  }

  // If student profile is missing or incomplete
  if (!student) {
    return {
      status: 'requires_verification',
      reasons: ['Student profile not identified. Sign in with UNKLAB account to verify.'],
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
      badgeLabel: 'Verification Needed',
    };
  }

  const disqualifications: string[] = [];
  const qualifications: string[] = [];

  // 1. Dormitory check
  if (hasDormLimit) {
    if (student.residenceStatus !== 'dormitory') {
      disqualifications.push('Restricted to dormitory residents only.');
    } else {
      qualifications.push(`Dormitory resident verified (${student.dormitoryBuilding || 'On-campus'}).`);
    }
  }

  // 2. Faculty check
  if (hasFacultyLimit) {
    if (!event.eligibleFaculties!.includes(student.faculty)) {
      disqualifications.push(
        `Limited to faculties: ${event.eligibleFaculties!.join(', ')} (Your faculty: ${student.faculty}).`
      );
    } else {
      qualifications.push(`Faculty verified (${student.faculty}).`);
    }
  }

  // 3. Batch check
  if (hasBatchLimit) {
    if (!event.eligibleBatches!.includes(student.batch)) {
      disqualifications.push(
        `Limited to batch(es): ${event.eligibleBatches!.join(', ')} (Your batch: ${student.batch}).`
      );
    } else {
      qualifications.push(`Batch verified (${student.batch}).`);
    }
  }

  if (disqualifications.length > 0) {
    return {
      status: 'not_eligible',
      reasons: disqualifications,
      badgeColor: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800',
      badgeLabel: 'Not Eligible',
    };
  }

  return {
    status: 'eligible',
    reasons: qualifications,
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800',
    badgeLabel: 'Eligible',
  };
}
