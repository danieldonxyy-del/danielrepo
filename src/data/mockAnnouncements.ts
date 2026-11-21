import { CampusAnnouncement } from '../types';

export const initialAnnouncements: CampusAnnouncement[] = [
  {
    id: 'anc-001',
    title: 'Midterm Examination Schedule & Attire Regulations (Semester I 2026/2027)',
    content: 'Vice Rector for Academic Affairs announces that Midterm Exams commence next Monday. Students must strictly adhere to university grooming standards: no colored hair, no jewelry, and proper formal buttoned shirts with dark trousers or skirts below the knee. Student Exam Cards must be validated.',
    category: 'academic',
    organizer: 'Academic Administration Bureau (BAA)',
    date: '2026-11-08',
    isPinned: true,
    isRead: false,
    isVerified: true,
    isDemo: true,
    authorName: 'BAA Rectorate'
  },
  {
    id: 'anc-002',
    title: 'Pioneer Chapel Attendance Threshold: Minimum 28 Chapel Points for Clearance',
    content: 'Reminder for all students that spiritual clearance requires at least 28 chapel points prior to Final Exam registration. Ensure your digital pass or barcode is scanned at the entrances before prelude.',
    category: 'spiritual',
    organizer: 'Campus Ministries & Spiritual Affairs',
    date: '2026-11-06',
    isPinned: true,
    isRead: false,
    isVerified: true,
    isDemo: true,
    authorName: 'Pastor Jerry Manoppo'
  },
  {
    id: 'anc-003',
    title: 'Dormitory Curfew Adjustment for Hackathon Participants',
    content: 'Edelweiss, Jasmine, and Crystal Dormitory Deans notify that approved participants in the FIK AI Hackathon have special extension passes granted until 23:00 with signed faculty advisor slips.',
    category: 'dormitory',
    organizer: 'Edelweiss & Jasmine Dormitory Council',
    date: '2026-11-09',
    isPinned: false,
    isRead: true,
    isVerified: true,
    isDemo: true,
    authorName: 'Dean Sarah Rondonuwu'
  },
  {
    id: 'anc-004',
    title: 'BEM Klabat Cup 2026 Volunteer Recruitment Open',
    content: 'Badan Eksekutif Mahasiswa UNKLAB is opening recruitment for committee coordinators across Logistics, Medical, Media, and Refereeing for the upcoming multi-sport championship. Apply via BEM portal by Friday.',
    category: 'ormawa',
    organizer: 'BEM Universitas Klabat',
    date: '2026-11-05',
    isPinned: false,
    isRead: false,
    isVerified: true,
    isDemo: true,
    authorName: 'Ephraim Roring'
  },
  {
    id: 'anc-005',
    title: 'UNKLAB Green Campus Initiative: Single-Use Plastic Ban at Cafeteria',
    content: 'Starting November 15, all cafeteria vendors and student events must eliminate single-use plastic cups and straws. Please bring your personal tumblers to all campus assemblies and student lounges.',
    category: 'university',
    organizer: 'University General Services',
    date: '2026-11-03',
    isPinned: false,
    isRead: true,
    isVerified: true,
    isDemo: true,
    authorName: 'Campus Operations'
  }
];
