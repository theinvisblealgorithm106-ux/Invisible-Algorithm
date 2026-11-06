import mongoose, { Schema, Document } from 'mongoose';

export interface IApplication extends Document {
  firstName: string;
  lastName: string;
  email: string;
  school: string;
  country: string;
  gradeLevel: string;
  age?: number;
  interests: string[];
  motivation?: string;
  experience?: string;
  contributionPlan?: string;
  referralSource?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  status: 'pending' | 'reviewing' | 'accepted' | 'rejected' | 'waitlisted';
  reviewNotes?: string;
  reviewedAt?: Date;
}

const ApplicationSchema = new Schema<IApplication>({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  school: { type: String, required: true },
  country: { type: String, required: true },
  gradeLevel: { type: String, required: true },
  age: { type: Number, min: 10, max: 30 },
  interests: [String],
  motivation: { type: String, minlength: 100, maxlength: 2000 },
  experience: String,
  contributionPlan: String,
  referralSource: String,
  linkedinUrl: String,
  githubUrl: String,
  status: {
    type: String,
    enum: ['pending', 'reviewing', 'accepted', 'rejected', 'waitlisted'],
    default: 'pending',
  },
  reviewNotes: String,
  reviewedAt: Date,
}, { timestamps: true });

export const Application = mongoose.models.Application || mongoose.model<IApplication>('Application', ApplicationSchema);
