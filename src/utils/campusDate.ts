const CAMPUS_TIME_ZONE = 'Asia/Makassar';

export function getCampusToday(): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: CAMPUS_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));

  return `${values.year}-${values.month}-${values.day}`;
}

export function getCampusCurrentDate(): Date {
  const [year, month, day] = getCampusToday().split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function formatCampusDate(
  date: string | Date,
  options: Intl.DateTimeFormatOptions
): string {
  const value = typeof date === 'string' ? new Date(`${date}T12:00:00+08:00`) : date;

  return new Intl.DateTimeFormat('id-ID', {
    ...options,
    timeZone: CAMPUS_TIME_ZONE,
  }).format(value);
}

export function formatLocalDateInput(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}
