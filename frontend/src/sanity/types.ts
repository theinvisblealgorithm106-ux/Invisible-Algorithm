export interface SanityResearch {
  _id: string;
  title: string;
  slug: string;
  authorName?: string;
  school?: string;
  abstract?: string;
  category: string;
  tags: string[];
  featured: boolean;
  publishedAt?: string;
  createdAt: string;
  views: number;
  pdfUrl?: string;
}

export interface SanityResearchDetail extends SanityResearch {
  externalUrl?: string;
  doi?: string;
  authors: { name: string; affiliation?: string }[];
}

export interface SanityEvent {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  startDate: string;
  type: string;
  format: string;
  location?: string;
  featured: boolean;
  status: string;
  requiresRegistration: boolean;
  registeredCount: number;
}

export interface SanityEventDetail {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  startDate: string;
  type: string;
  format: string;
  location?: string;
  featured: boolean;
  status: string;
  requiresRegistration: boolean;
  registeredCount: number;
  capacity: null;
  timezone: string;
  virtualLink?: string | null;
  speakers: { name: string; affiliation?: string; bio?: string }[];
  tags: string[];
}

export interface SanityAnnouncement {
  _id: string;
  title: string;
  content?: string;
  category: string;
  pinned: boolean;
  featured: boolean;
  publishedAt?: string;
}
