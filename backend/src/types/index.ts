import { Request } from 'express';
import { Document, Types } from 'mongoose';

export type UserRole = 'student' | 'member' | 'researcher' | 'admin' | 'super_admin';

export interface IUser extends Document {
  _id: Types.ObjectId;
  email: string;
  password: string;
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
  isEmailVerified: boolean;
  emailVerificationToken?: string;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  refreshToken?: string;
  lastLogin?: Date;
  joinedAt: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
  fullName: string;
}

export interface IApplication extends Document {
  _id: Types.ObjectId;
  applicant?: Types.ObjectId;
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
  reviewedBy?: Types.ObjectId;
  reviewNotes?: string;
  reviewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IResearch extends Document {
  _id: Types.ObjectId;
  title: string;
  slug: string;
  abstract: string;
  content: string;
  authors: Array<{
    user?: Types.ObjectId;
    name: string;
    email?: string;
    affiliation?: string;
  }>;
  category: 'artificial-intelligence' | 'machine-learning' | 'computer-science' | 'finance' | 'data-science' | 'other';
  tags: string[];
  status: 'draft' | 'submitted' | 'under-review' | 'published' | 'rejected';
  publishedAt?: Date;
  pdfUrl?: string;
  externalUrl?: string;
  doi?: string;
  views: number;
  featured: boolean;
  submittedBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IEvent extends Document {
  _id: Types.ObjectId;
  title: string;
  slug: string;
  description: string;
  type: 'workshop' | 'seminar' | 'conference' | 'webinar' | 'competition' | 'meetup' | 'other';
  format: 'in-person' | 'virtual' | 'hybrid';
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  startDate: Date;
  endDate: Date;
  timezone: string;
  location?: string;
  virtualLink?: string;
  capacity?: number;
  registeredCount: number;
  registrations: Array<{
    user?: Types.ObjectId;
    name: string;
    email: string;
    registeredAt: Date;
  }>;
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
  isPublic: boolean;
  organizer: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAnnouncement extends Document {
  _id: Types.ObjectId;
  title: string;
  slug: string;
  content: string;
  category: 'general' | 'event' | 'research' | 'partnership' | 'opportunity' | 'update';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'draft' | 'published' | 'archived';
  publishedAt?: Date;
  expiresAt?: Date;
  featured: boolean;
  pinned: boolean;
  author: Types.ObjectId;
  views: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPartnership extends Document {
  _id: Types.ObjectId;
  organizationName: string;
  organizationType: 'school' | 'university' | 'company' | 'ngo' | 'government' | 'other';
  country: string;
  contactName: string;
  contactEmail: string;
  contactTitle?: string;
  description?: string;
  status: 'prospect' | 'active' | 'inactive' | 'rejected';
  partnerSince?: Date;
  logo?: string;
  website?: string;
  notes?: string;
  managedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface INewsletter extends Document {
  _id: Types.ObjectId;
  email: string;
  firstName?: string;
  isActive: boolean;
  subscribedAt: Date;
  unsubscribedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IContactMessage extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  subject: string;
  message: string;
  category: 'general' | 'partnership' | 'research' | 'media' | 'technical' | 'other';
  status: 'unread' | 'read' | 'replied' | 'archived';
  repliedBy?: Types.ObjectId;
  repliedAt?: Date;
  ipAddress?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthRequest extends Request {
  user?: IUser;
}

export interface JwtPayload {
  userId: string;
  role: UserRole;
  type: 'access' | 'refresh';
}

export interface PaginationOptions {
  page: number;
  limit: number;
  sort?: string;
}

export interface PaginatedResult<T> {
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

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  errors?: Array<{ field: string; message: string }>;
}
