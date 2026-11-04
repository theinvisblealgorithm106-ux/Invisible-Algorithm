import mongoose, { Schema, Document } from 'mongoose';
import slugify from 'slugify';

// Executive team members shown on /team and /team/[slug].
//
// These used to be a hardcoded array in src/lib/team.ts. That array is now
// only seed data: the first request to /api/team copies it into this
// collection if the collection is empty (see src/app/api/team/route.ts), and
// from then on the admin panel (Team tab) is the source of truth.
export interface ITeamMember extends Document {
  slug: string;
  firstName: string;
  lastName?: string;
  role: string;
  school?: string;
  avatar?: string;
  // Tailwind object-position class (e.g. 'object-top') for avatars that
  // crop badly when centered.
  avatarPosition?: string;
  bio?: string;
  socialLinks?: {
    linkedin?: string;
    github?: string;
    twitter?: string;
    website?: string;
  };
  // Display order on the public team page; lower sorts first.
  order: number;
  isActive: boolean;
}

const TeamMemberSchema = new Schema<ITeamMember>({
  slug: { type: String, unique: true },
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, trim: true, default: '' },
  role: { type: String, required: true, trim: true },
  school: { type: String, trim: true },
  avatar: { type: String, trim: true },
  avatarPosition: { type: String, trim: true },
  bio: { type: String },
  socialLinks: {
    linkedin: String,
    github: String,
    twitter: String,
    website: String,
  },
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

// Public URLs are /team/<slug>, so a missing slug is derived from the name.
// Unlike Announcement slugs there's no Date.now() suffix — these are people,
// and a readable, stable URL matters more than guaranteed uniqueness.
TeamMemberSchema.pre('validate', function (next) {
  if (!this.slug) {
    const name = [this.firstName, this.lastName].filter(Boolean).join(' ');
    this.slug = slugify(name, { lower: true, strict: true });
  }
  next();
});

export const TeamMember = mongoose.models.TeamMember
  || mongoose.model<ITeamMember>('TeamMember', TeamMemberSchema);
