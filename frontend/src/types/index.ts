export type UserRole = 'student' | 'member' | 'researcher' | 'admin' | 'super_admin';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  bio?: string;
  school?: string;
  country?: string;
  avatar?: string;
  socialLinks?: {
    linkedin?: string;
    github?: string;
    twitter?: string;
    website?: string;
  };
  interests?: string[];
  isActive: boolean;
  joinedAt: string;
  createdAt: string;
}

export interface Research {
  _id: string;
  title: string;
  slug: string;
  abstract: string;
  content: string;
  authors: Array<{
    user?: string;
    name: string;
    email?: string;
    affiliation?: string;
  }>;
  category: 'artificial-intelligence' | 'machine-learning' | 'computer-science' | 'finance' | 'data-science' | 'other';
  tags: string[];
  status: 'draft' | 'submitted' | 'under-review' | 'published' | 'rejected';
  publishedAt?: string;
  pdfUrl?: string;
  externalUrl?: string;
  doi?: string;
  views: number;
  featured: boolean;
  submittedBy: { firstName: string; lastName: string } | string;
  createdAt: string;
  updatedAt: string;
}

export interface Event {
  _id: string;
  title: string;
  slug: string;
  description: string;
  type: 'workshop' | 'seminar' | 'conference' | 'webinar' | 'competition' | 'meetup' | 'other';
  format: 'in-person' | 'virtual' | 'hybrid';
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  startDate: string;
  endDate: string;
  timezone: string;
  location?: string;
  virtualLink?: string;
  capacity?: number;
  registeredCount: number;
  speakers: Array<{
    name: string;
    bio?: string;
    avatar?: string;
    affiliation?: string;
  }>;
  tags: string[];
  coverImage?: string;
  featured: boolean;
  requiresRegistration: boolean;
  organizer: { firstName: string; lastName: string } | string;
  createdAt: string;
}

export interface Announcement {
  _id: string;
  title: string;
  slug: string;
  content: string;
  category: 'general' | 'event' | 'research' | 'partnership' | 'opportunity' | 'update';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'draft' | 'published' | 'archived';
  publishedAt?: string;
  expiresAt?: string;
  featured: boolean;
  pinned: boolean;
  author: { firstName: string; lastName: string } | string;
  views: number;
  createdAt: string;
}

export interface Application {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  school: string;
  country: string;
  gradeLevel: string;
  age: number;
  interests: string[];
  motivation: string;
  experience: string;
  contributionPlan: string;
  referralSource: string;
  linkedinUrl?: string;
  githubUrl?: string;
  status: 'pending' | 'reviewing' | 'accepted' | 'rejected' | 'waitlisted';
  reviewedBy?: { firstName: string; lastName: string };
  reviewNotes?: string;
  reviewedAt?: string;
  createdAt: string;
}

export interface Partnership {
  _id: string;
  organizationName: string;
  organizationType: 'school' | 'university' | 'company' | 'ngo' | 'government' | 'other';
  country: string;
  logo?: string;
  website?: string;
  status: string;
  partnerSince?: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  errors?: Array<{ field: string; message: string }>;
}

export interface PaginatedData<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    pages: number;
    limit: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
