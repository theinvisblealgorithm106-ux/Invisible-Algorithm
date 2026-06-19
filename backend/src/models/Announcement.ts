import mongoose, { Schema } from 'mongoose';
import slugify from 'slugify';
import { IAnnouncement } from '../types';

const AnnouncementSchema = new Schema<IAnnouncement>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    slug: {
      type: String,
      unique: true,
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
      maxlength: [10000, 'Content cannot exceed 10000 characters'],
    },
    category: {
      type: String,
      enum: ['general', 'event', 'research', 'partnership', 'opportunity', 'update'],
      default: 'general',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft',
    },
    publishedAt: Date,
    expiresAt: Date,
    featured: {
      type: Boolean,
      default: false,
    },
    pinned: {
      type: Boolean,
      default: false,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    views: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

AnnouncementSchema.index({ slug: 1 });
AnnouncementSchema.index({ status: 1 });
AnnouncementSchema.index({ publishedAt: -1 });
AnnouncementSchema.index({ pinned: 1, featured: 1 });
AnnouncementSchema.index({ title: 'text', content: 'text' });

AnnouncementSchema.pre('save', function (next) {
  if (this.isModified('title') && !this.slug) {
    this.slug = slugify(this.title, { lower: true, strict: true }) + '-' + Date.now();
  }
  if (this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

export const Announcement = mongoose.model<IAnnouncement>('Announcement', AnnouncementSchema);
