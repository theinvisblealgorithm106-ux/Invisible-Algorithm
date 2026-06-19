import mongoose, { Schema } from 'mongoose';
import { INewsletter } from '../types';

const NewsletterSchema = new Schema<INewsletter>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    firstName: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    subscribedAt: {
      type: Date,
      default: Date.now,
    },
    unsubscribedAt: Date,
  },
  { timestamps: true }
);

NewsletterSchema.index({ email: 1 });
NewsletterSchema.index({ isActive: 1 });

export const Newsletter = mongoose.model<INewsletter>('Newsletter', NewsletterSchema);
