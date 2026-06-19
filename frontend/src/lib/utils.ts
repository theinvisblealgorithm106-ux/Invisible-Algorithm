import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow, isValid } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date, formatStr = 'MMM d, yyyy'): string {
  const d = new Date(date);
  if (!isValid(d)) return 'Invalid date';
  return format(d, formatStr);
}

export function formatDatetime(date: string | Date): string {
  const d = new Date(date);
  if (!isValid(d)) return 'Invalid date';
  return format(d, 'MMM d, yyyy · h:mm a');
}

export function timeAgo(date: string | Date): string {
  const d = new Date(date);
  if (!isValid(d)) return '';
  return formatDistanceToNow(d, { addSuffix: true });
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength).trim() + '…';
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function formatCategory(category: string): string {
  return category
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export const RESEARCH_CATEGORIES = [
  { value: 'artificial-intelligence', label: 'Artificial Intelligence' },
  { value: 'machine-learning', label: 'Machine Learning' },
  { value: 'computer-science', label: 'Computer Science' },
  { value: 'finance', label: 'Finance & Economics' },
  { value: 'data-science', label: 'Data Science' },
  { value: 'other', label: 'Other' },
];

export const EVENT_TYPES = [
  { value: 'workshop', label: 'Workshop' },
  { value: 'seminar', label: 'Seminar' },
  { value: 'conference', label: 'Conference' },
  { value: 'webinar', label: 'Webinar' },
  { value: 'competition', label: 'Competition' },
  { value: 'meetup', label: 'Meetup' },
  { value: 'other', label: 'Other' },
];

export const INTERESTS = [
  'Artificial Intelligence',
  'Machine Learning',
  'Deep Learning',
  'Computer Vision',
  'Natural Language Processing',
  'Data Science',
  'Financial Technology',
  'Blockchain',
  'Cybersecurity',
  'Robotics',
  'Quantum Computing',
  'Business Strategy',
  'Entrepreneurship',
  'Economics',
  'Mathematics',
  'Statistics',
];

export const GRADE_LEVELS = [
  '9th Grade',
  '10th Grade',
  '11th Grade',
  '12th Grade',
  '1st Year University',
  '2nd Year University',
  '3rd Year University',
  '4th Year University',
  'Graduate Student',
  'Other',
];

export const REFERRAL_SOURCES = [
  'Social Media (LinkedIn)',
  'Social Media (Instagram)',
  'Social Media (Twitter/X)',
  'Friend or Classmate',
  'Teacher or Mentor',
  'School Newsletter',
  'Research Publication',
  'Event or Conference',
  'Internet Search',
  'Other',
];

export function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

export function getRoleBadgeColor(role: string): string {
  const colors: Record<string, string> = {
    super_admin: 'bg-red-500/10 text-red-400 border-red-500/20',
    admin: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    researcher: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    member: 'bg-primary/10 text-primary-light border-primary/20',
    student: 'bg-text-tertiary/10 text-text-tertiary border-text-tertiary/20',
  };
  return colors[role] || colors.student;
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    accepted: 'bg-success/10 text-success border-success/20',
    published: 'bg-success/10 text-success border-success/20',
    upcoming: 'bg-primary/10 text-primary-light border-primary/20',
    active: 'bg-success/10 text-success border-success/20',
    pending: 'bg-warning/10 text-warning border-warning/20',
    reviewing: 'bg-info/10 text-info border-info/20',
    'under-review': 'bg-info/10 text-info border-info/20',
    rejected: 'bg-error/10 text-error border-error/20',
    cancelled: 'bg-error/10 text-error border-error/20',
    completed: 'bg-text-tertiary/10 text-text-tertiary border-text-tertiary/20',
    draft: 'bg-text-tertiary/10 text-text-tertiary border-text-tertiary/20',
    waitlisted: 'bg-accent/10 text-accent border-accent/20',
    ongoing: 'bg-accent/10 text-accent border-accent/20',
  };
  return colors[status] || 'bg-text-tertiary/10 text-text-tertiary border-text-tertiary/20';
}
