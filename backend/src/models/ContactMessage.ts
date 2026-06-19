import mongoose, { Schema } from 'mongoose';
import { IContactMessage } from '../types';

const ContactMessageSchema = new Schema<IContactMessage>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
      maxlength: [200, 'Subject cannot exceed 200 characters'],
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      maxlength: [5000, 'Message cannot exceed 5000 characters'],
    },
    category: {
      type: String,
      enum: ['general', 'partnership', 'research', 'media', 'technical', 'other'],
      default: 'general',
    },
    status: {
      type: String,
      enum: ['unread', 'read', 'replied', 'archived'],
      default: 'unread',
    },
    repliedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    repliedAt: Date,
    ipAddress: String,
  },
  { timestamps: true }
);

ContactMessageSchema.index({ status: 1 });
ContactMessageSchema.index({ createdAt: -1 });
ContactMessageSchema.index({ email: 1 });

export const ContactMessage = mongoose.model<IContactMessage>('ContactMessage', ContactMessageSchema);
