import mongoose, { Schema } from 'mongoose';
import slugify from 'slugify';
import { IEvent } from '../types';

const EventSchema = new Schema<IEvent>(
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
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: [5000, 'Description cannot exceed 5000 characters'],
    },
    type: {
      type: String,
      required: [true, 'Event type is required'],
      enum: ['workshop', 'seminar', 'conference', 'webinar', 'competition', 'meetup', 'other'],
    },
    format: {
      type: String,
      required: [true, 'Format is required'],
      enum: ['in-person', 'virtual', 'hybrid'],
      default: 'virtual',
    },
    status: {
      type: String,
      enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
      default: 'upcoming',
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
    },
    timezone: {
      type: String,
      default: 'UTC',
    },
    location: String,
    virtualLink: String,
    capacity: Number,
    registeredCount: {
      type: Number,
      default: 0,
    },
    registrations: [
      {
        user: { type: Schema.Types.ObjectId, ref: 'User' },
        name: { type: String, required: true },
        email: { type: String, required: true },
        registeredAt: { type: Date, default: Date.now },
      },
    ],
    speakers: [
      {
        name: { type: String, required: true },
        bio: String,
        avatar: String,
        affiliation: String,
      },
    ],
    tags: [{ type: String, trim: true }],
    coverImage: String,
    featured: {
      type: Boolean,
      default: false,
    },
    requiresRegistration: {
      type: Boolean,
      default: true,
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
    organizer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

EventSchema.index({ slug: 1 });
EventSchema.index({ status: 1 });
EventSchema.index({ startDate: 1 });
EventSchema.index({ featured: 1 });
EventSchema.index({ type: 1 });
EventSchema.index({ title: 'text', description: 'text' });

EventSchema.pre('save', function (next) {
  if (this.isModified('title') && !this.slug) {
    this.slug = slugify(this.title, { lower: true, strict: true }) + '-' + Date.now();
  }
  next();
});

export const Event = mongoose.model<IEvent>('Event', EventSchema);
