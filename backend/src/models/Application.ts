import mongoose, { Schema } from 'mongoose';
import { IApplication } from '../types';

const ApplicationSchema = new Schema<IApplication>(
  {
    applicant: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
    },
    school: {
      type: String,
      required: [true, 'School is required'],
      trim: true,
    },
    country: {
      type: String,
      required: [true, 'Country is required'],
      trim: true,
    },
    gradeLevel: {
      type: String,
      required: [true, 'Grade level is required'],
    },
    age: {
      type: Number,
      required: [true, 'Age is required'],
      min: [10, 'Minimum age is 10'],
      max: [30, 'Maximum age is 30'],
    },
    interests: {
      type: [String],
      required: [true, 'At least one interest is required'],
    },
    motivation: {
      type: String,
      required: [true, 'Motivation statement is required'],
      minlength: [100, 'Motivation must be at least 100 characters'],
      maxlength: [2000, 'Motivation cannot exceed 2000 characters'],
    },
    experience: {
      type: String,
      required: [true, 'Experience description is required'],
      maxlength: [2000, 'Experience cannot exceed 2000 characters'],
    },
    contributionPlan: {
      type: String,
      required: [true, 'Contribution plan is required'],
      minlength: [100, 'Contribution plan must be at least 100 characters'],
      maxlength: [2000, 'Contribution plan cannot exceed 2000 characters'],
    },
    referralSource: {
      type: String,
      required: [true, 'Referral source is required'],
    },
    linkedinUrl: String,
    githubUrl: String,
    status: {
      type: String,
      enum: ['pending', 'reviewing', 'accepted', 'rejected', 'waitlisted'],
      default: 'pending',
    },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewNotes: String,
    reviewedAt: Date,
  },
  { timestamps: true }
);

ApplicationSchema.index({ email: 1 });
ApplicationSchema.index({ status: 1 });
ApplicationSchema.index({ createdAt: -1 });

export const Application = mongoose.model<IApplication>('Application', ApplicationSchema);
