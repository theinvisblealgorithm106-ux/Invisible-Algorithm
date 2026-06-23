import mongoose, { Schema, Document } from 'mongoose';
import slugify from 'slugify';

export interface IEvent extends Document {
  title: string;
  slug: string;
  description: string;
  type: string;
  format: string;
  status: string;
  startDate: Date;
  endDate: Date;
  location?: string;
  capacity?: number;
  registeredCount: number;
  registrations: { name: string; email: string; registeredAt: Date }[];
  speakers: { name: string; bio?: string; affiliation?: string }[];
  tags: string[];
  coverImage?: string;
  featured: boolean;
  isPublic: boolean;
  organizer: mongoose.Types.ObjectId;
}

const EventSchema = new Schema<IEvent>({
  title: { type: String, required: true, trim: true },
  slug: { type: String, unique: true },
  description: { type: String, required: true },
  type: { type: String, required: true, enum: ['workshop', 'seminar', 'conference', 'webinar', 'competition', 'meetup', 'other'] },
  format: { type: String, enum: ['in-person', 'virtual', 'hybrid'], default: 'virtual' },
  status: { type: String, enum: ['upcoming', 'ongoing', 'completed', 'cancelled'], default: 'upcoming' },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  location: String,
  capacity: Number,
  registeredCount: { type: Number, default: 0 },
  registrations: [{ name: { type: String, required: true }, email: { type: String, required: true }, registeredAt: { type: Date, default: Date.now } }],
  speakers: [{ name: { type: String, required: true }, bio: String, affiliation: String }],
  tags: [String],
  coverImage: String,
  featured: { type: Boolean, default: false },
  isPublic: { type: Boolean, default: true },
  organizer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

EventSchema.pre('save', function (next) {
  if (this.isModified('title') && !this.slug) {
    this.slug = slugify(this.title, { lower: true, strict: true }) + '-' + Date.now();
  }
  next();
});

export const Event = mongoose.models.Event || mongoose.model<IEvent>('Event', EventSchema);
