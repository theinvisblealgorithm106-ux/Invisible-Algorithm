import mongoose, { Schema, Document } from 'mongoose';

export interface IApplication extends Document {
  firstName: string;
  lastName: string;
  email: string;
  school: string;
  country: string;
  gradeLevel: string;
  age: number;
  interests: string[];
  motivation: string;
  experience: string;
  contributionPlan: string;
  referralSource: string;
  linkedinUrl?: string;
  githubUrl?: string;
  status: string;
  reviewNotes?: string;
  reviewedAt?: Date;
}

const ApplicationSchema = new Schema<IApplication>({
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  school: { type: String, required: true, trim: true },
  country: { type: String, required: true, trim: true },
  gradeLevel: { type: String, required: true },
  age: { type: Number, required: true, min: 10, max: 30 },
  interests: { type: [String], required: true },
  motivation: { type: String, required: true, minlength: 100, maxlength: 2000 },
  experience: { type: String, required: true, maxlength: 2000 },
  contributionPlan: { type: String, required: true, minlength: 100, maxlength: 2000 },
  referralSource: { type: String, required: true },
  linkedinUrl: String,
  githubUrl: String,
  status: { type: String, enum: ['pending', 'reviewing', 'accepted', 'rejected', 'waitlisted'], default: 'pending' },
  reviewNotes: String,
  reviewedAt: Date,
}, { timestamps: true });

export const Application = mongoose.models.Application || mongoose.model<IApplication>('Application', ApplicationSchema);
