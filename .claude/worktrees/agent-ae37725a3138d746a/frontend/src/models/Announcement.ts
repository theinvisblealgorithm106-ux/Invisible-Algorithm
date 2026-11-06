import mongoose, { Schema, Document } from 'mongoose';
import slugify from 'slugify';

export interface IAnnouncement extends Document {
  title: string;
  slug: string;
  content: string;
  category: 'general' | 'event' | 'research' | 'partnership' | 'opportunity' | 'update';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'draft' | 'published' | 'archived';
  publishedAt?: Date;
  featured?: boolean;
  pinned?: boolean;
  author: mongoose.Types.ObjectId;
  views: number;
}

const AnnouncementSchema = new Schema<IAnnouncement>({
  title: { type: String, required: true, trim: true },
  slug: { type: String, unique: true },
  content: { type: String, required: true },
  category: {
    type: String,
    enum: ['general', 'event', 'research', 'partnership', 'opportunity', 'update'],
    default: 'general',
  },
  priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
  status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft' },
  publishedAt: Date,
  featured: Boolean,
  pinned: Boolean,
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  views: { type: Number, default: 0 },
}, { timestamps: true });

AnnouncementSchema.pre('save', function (next) {
  if (!this.slug) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

export const Announcement = mongoose.models.Announcement || mongoose.model<IAnnouncement>('Announcement', AnnouncementSchema);
