import mongoose, { Schema, Document } from 'mongoose';

export interface IContactMessage extends Document {
  name: string;
  email: string;
  subject: string;
  message: string;
  category: string;
  status: string;
}

const ContactMessageSchema = new Schema<IContactMessage>({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  subject: { type: String, required: true, trim: true },
  message: { type: String, required: true },
  category: { type: String, enum: ['general', 'partnership', 'research', 'media', 'technical', 'other'], default: 'general' },
  status: { type: String, enum: ['unread', 'read', 'replied', 'archived'], default: 'unread' },
}, { timestamps: true });

export const ContactMessage = mongoose.models.ContactMessage || mongoose.model<IContactMessage>('ContactMessage', ContactMessageSchema);
