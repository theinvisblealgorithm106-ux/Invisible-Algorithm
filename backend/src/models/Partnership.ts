import mongoose, { Schema } from 'mongoose';
import { IPartnership } from '../types';

const PartnershipSchema = new Schema<IPartnership>(
  {
    organizationName: {
      type: String,
      required: [true, 'Organization name is required'],
      trim: true,
    },
    organizationType: {
      type: String,
      enum: ['school', 'university', 'company', 'ngo', 'government', 'other'],
      required: [true, 'Organization type is required'],
    },
    country: {
      type: String,
      required: [true, 'Country is required'],
      trim: true,
    },
    contactName: {
      type: String,
      required: [true, 'Contact name is required'],
      trim: true,
    },
    contactEmail: {
      type: String,
      required: [true, 'Contact email is required'],
      lowercase: true,
      trim: true,
    },
    contactTitle: String,
    description: String,
    status: {
      type: String,
      enum: ['prospect', 'active', 'inactive', 'rejected'],
      default: 'prospect',
    },
    partnerSince: Date,
    logo: String,
    website: String,
    notes: String,
    managedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

PartnershipSchema.index({ status: 1 });
PartnershipSchema.index({ country: 1 });
PartnershipSchema.index({ organizationType: 1 });

export const Partnership = mongoose.model<IPartnership>('Partnership', PartnershipSchema);
