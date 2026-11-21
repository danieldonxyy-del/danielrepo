import { PosterExtractionResult } from '../types';

export interface SamplePosterPreset {
  id: string;
  name: string;
  tagline: string;
  category: string;
  badgeLabel: string;
  gradient: string;
  accentColor: string;
  headerGraphic: string;
  previewUrl: string;
  extractionData: PosterExtractionResult;
}

export const samplePosterPresets: SamplePosterPreset[] = [
  {
    id: 'preset-fik-hackathon',
    name: 'FIK AI & Cloud Hackathon',
    tagline: 'Code the future of smart campus solutions',
    category: 'academic',
    badgeLabel: 'Complete Specification',
    gradient: 'from-blue-600 via-indigo-700 to-slate-900',
    accentColor: '#38bdf8',
    headerGraphic: 'Cpu',
    previewUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="560" viewBox="0 0 400 560"><rect width="400" height="560" fill="%230f172a"/><rect x="20" y="20" width="360" height="520" rx="16" fill="%231e293b" stroke="%2338bdf8" stroke-width="2"/><text x="200" y="70" fill="%2338bdf8" font-size="14" font-weight="bold" text-anchor="middle" font-family="sans-serif">UNIVERSITAS KLABAT · FIK</text><text x="200" y="110" fill="%23ffffff" font-size="22" font-weight="900" text-anchor="middle" font-family="sans-serif">AI &amp; CLOUD HACKATHON</text><text x="200" y="140" fill="%2394a3b8" font-size="12" text-anchor="middle" font-family="sans-serif">24-Hour Innovation Sprint</text><circle cx="200" cy="220" r="50" fill="%230284c7" opacity="0.2"/><circle cx="200" cy="220" r="30" fill="%2338bdf8"/><text x="200" y="320" fill="%23ffffff" font-size="14" font-weight="bold" text-anchor="middle" font-family="sans-serif">NOV 11-12, 2026</text><text x="200" y="345" fill="%23cbd5e1" font-size="12" text-anchor="middle" font-family="sans-serif">09:00 - 17:00 WITA</text><text x="200" y="380" fill="%2338bdf8" font-size="13" font-weight="bold" text-anchor="middle" font-family="sans-serif">AUDITORIUM GK1 UNKLAB</text><text x="200" y="440" fill="%2394a3b8" font-size="11" text-anchor="middle" font-family="sans-serif">Dress: Smart Casual Polo</text><text x="200" y="460" fill="%2394a3b8" font-size="11" text-anchor="middle" font-family="sans-serif">Chapel Points: None</text><rect x="60" y="485" width="280" height="35" rx="8" fill="%230284c7"/><text x="200" y="508" fill="%23ffffff" font-size="12" font-weight="bold" text-anchor="middle" font-family="sans-serif">REGISTER VIA KLABATSYNC</text></svg>',
    extractionData: {
      title: 'FIK AI & Cloud Innovation Hackathon 2026',
      category: 'academic',
      organizer: 'HMP Informatika (FIK)',
      startDate: '2026-11-11',
      endDate: '2026-11-12',
      startTime: '09:00',
      endTime: '17:00',
      location: 'Auditorium GK1 UNKLAB',
      description: '24-hour sprint bringing together UNKLAB computing students to develop agentic AI prototypes and cloud campus utilities.',
      dressCode: 'Smart Casual (Campus Polo or Faculty Shirt)',
      chapelPoints: 0,
      registrationDeadline: '2026-11-10 23:59',
      capacity: 120,
      requirements: ['Faculty of Computer Science (FIK) Student', 'Bring own laptop with Node.js & Git', 'Teams of 3'],
      eligibleFaculties: ['FIK'],
      eligibleBatches: [2022, 2023, 2024, 2025],
      dormitoryOnly: false,
      contactInfo: 'hmp.ti@student.unklab.ac.id | +62 821-9988-1122',
      uncertainFields: [],
      missingFields: [],
      confidenceScore: 0.98,
      isSimulated: true,
    },
  },
  {
    id: 'preset-youth-vespers',
    name: 'Youth Vespers Service',
    tagline: 'Friday sacred evening fellowship & praise',
    category: 'spiritual',
    badgeLabel: 'Spiritual · Chapel Point',
    gradient: 'from-purple-700 via-violet-800 to-indigo-950',
    accentColor: '#c084fc',
    headerGraphic: 'Sparkles',
    previewUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="560" viewBox="0 0 400 560"><rect width="400" height="560" fill="%231e1b4b"/><rect x="20" y="20" width="360" height="520" rx="16" fill="%232e1065" stroke="%23c084fc" stroke-width="2"/><text x="200" y="70" fill="%23e9d5ff" font-size="13" font-weight="bold" text-anchor="middle" font-family="sans-serif">CAMPUS MINISTRIES UNKLAB</text><text x="200" y="115" fill="%23ffffff" font-size="24" font-weight="900" text-anchor="middle" font-family="sans-serif">YOUTH VESPERS</text><text x="200" y="145" fill="%23c084fc" font-size="14" font-weight="600" text-anchor="middle" font-family="sans-serif">Theme: &quot;Rekindled Faith&quot;</text><circle cx="200" cy="220" r="50" fill="%239333ea" opacity="0.3"/><text x="200" y="235" fill="%23ffffff" font-size="40" text-anchor="middle">✝</text><text x="200" y="320" fill="%23ffffff" font-size="14" font-weight="bold" text-anchor="middle" font-family="sans-serif">FRIDAY, NOV 13, 2026</text><text x="200" y="345" fill="%23e9d5ff" font-size="13" text-anchor="middle" font-family="sans-serif">19:00 - 20:45 WITA</text><text x="200" y="380" fill="%23c084fc" font-size="14" font-weight="bold" text-anchor="middle" font-family="sans-serif">PIONEER CHAPEL UNKLAB</text><text x="200" y="430" fill="%23e9d5ff" font-size="12" text-anchor="middle" font-family="sans-serif">Dress: Formal Sabbath Attire</text><rect x="130" y="445" width="140" height="26" rx="6" fill="%239333ea"/><text x="200" y="462" fill="%23ffffff" font-size="11" font-weight="bold" text-anchor="middle" font-family="sans-serif">1 CHAPEL POINT</text><rect x="60" y="490" width="280" height="35" rx="8" fill="%237e22ce"/><text x="200" y="512" fill="%23ffffff" font-size="12" font-weight="bold" text-anchor="middle" font-family="sans-serif">OPEN TO ALL STUDENTS</text></svg>',
    extractionData: {
      title: 'Friday Evening Youth Vespers: "Rekindled Faith"',
      category: 'spiritual',
      organizer: 'Campus Ministries & Spiritual Affairs',
      startDate: '2026-11-13',
      endDate: '2026-11-13',
      startTime: '19:00',
      endTime: '20:45',
      location: 'Pioneer Chapel UNKLAB',
      description: 'Sacred Friday vespers fellowship with student testimonies, choral worship, and scripture meditation to inaugurate Sabbath hours.',
      dressCode: 'Formal Sabbath Attire (White/Dark suit or modest dress)',
      chapelPoints: 1,
      registrationDeadline: '2026-11-13 18:00',
      capacity: 1500,
      requirements: ['Valid UNKLAB ID', 'Silence mobile phones'],
      eligibleFaculties: [],
      eligibleBatches: [],
      dormitoryOnly: false,
      contactInfo: 'spiritual@student.unklab.ac.id | Pastor Ronald Wagiu',
      uncertainFields: [],
      missingFields: [],
      confidenceScore: 0.99,
      isSimulated: true,
    },
  },
  {
    id: 'preset-dorm-assembly',
    name: 'Dormitory General Assembly',
    tagline: 'Semester hall protocols & curfew briefing',
    category: 'dormitory',
    badgeLabel: 'Incomplete Info Preset',
    gradient: 'from-slate-700 via-gray-800 to-zinc-950',
    accentColor: '#fbbf24',
    headerGraphic: 'Home',
    previewUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="560" viewBox="0 0 400 560"><rect width="400" height="560" fill="%2318181b"/><rect x="20" y="20" width="360" height="520" rx="16" fill="%2327272a" stroke="%23fbbf24" stroke-width="2"/><text x="200" y="70" fill="%23fde047" font-size="13" font-weight="bold" text-anchor="middle" font-family="sans-serif">EDELWEISS &amp; JASMINE HALL</text><text x="200" y="115" fill="%23ffffff" font-size="20" font-weight="900" text-anchor="middle" font-family="sans-serif">GENERAL ASSEMBLY</text><text x="200" y="145" fill="%23a1a1aa" font-size="12" text-anchor="middle" font-family="sans-serif">Mandatory for all Residence Students</text><circle cx="200" cy="220" r="45" fill="%23d97706" opacity="0.3"/><text x="200" y="235" fill="%23ffffff" font-size="36" text-anchor="middle">🏢</text><text x="200" y="320" fill="%23ffffff" font-size="14" font-weight="bold" text-anchor="middle" font-family="sans-serif">WEDNESDAY, NOV 11, 2026</text><text x="200" y="345" fill="%23fbbf24" font-size="13" text-anchor="middle" font-family="sans-serif">Starts at 19:30 WITA (End Time TBA)</text><text x="200" y="385" fill="%23ffffff" font-size="14" font-weight="bold" text-anchor="middle" font-family="sans-serif">EDELWEISS AMPHITHEATER</text><rect x="70" y="420" width="260" height="24" rx="4" fill="%233f3f46"/><text x="200" y="436" fill="%23fbbf24" font-size="11" text-anchor="middle" font-family="sans-serif">⚠ DRESS CODE: NOT SPECIFIED</text><rect x="60" y="485" width="280" height="35" rx="8" fill="%23d97706"/><text x="200" y="508" fill="%23ffffff" font-size="12" font-weight="bold" text-anchor="middle" font-family="sans-serif">DORMITORY RESIDENTS ONLY</text></svg>',
    extractionData: {
      title: 'Dormitory Edelweiss & Jasmine General Assembly',
      category: 'dormitory',
      organizer: 'Edelweiss & Jasmine Dormitory Council',
      startDate: '2026-11-11',
      endDate: '2026-11-11',
      startTime: '19:30',
      endTime: '', // Intentionally Missing per Part 9!
      location: 'Edelweiss Amphitheater & Courtyard',
      description: 'Mandatory residential assembly reviewing quiet hours, room inspections, and floor fellowship.',
      dressCode: '', // Intentionally Missing / Unspecified per Part 9!
      chapelPoints: 0,
      registrationDeadline: '2026-11-11 18:00',
      capacity: 600,
      requirements: ['Dormitory residents only', 'Bring keycard for check-in'],
      eligibleFaculties: [],
      eligibleBatches: [],
      dormitoryOnly: true,
      contactInfo: 'dormitory@student.unklab.ac.id | Deanery Office',
      uncertainFields: ['endTime', 'dressCode'],
      missingFields: ['endTime', 'dressCode'],
      confidenceScore: 0.81,
      isSimulated: true,
    },
  },
];
