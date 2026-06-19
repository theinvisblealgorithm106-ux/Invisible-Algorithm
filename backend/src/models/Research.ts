import mongoose, { Schema } from 'mongoose';
import slugify from 'slugify';
import { IResearch } from '../types';

const ResearchSchema = new Schema<IResearch>(
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
    abstract: {
      type: String,
      required: [true, 'Abstract is required'],
      maxlength: [3000, 'Abstract cannot exceed 3000 characters'],
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
    },
    authors: [
      {
        user: { type: Schema.Types.ObjectId, ref: 'User' },
        name: { type: String, required: true },
        email: String,
        affiliation: String,
      },
    ],
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['artificial-intelligence', 'machine-learning', 'computer-science', 'finance', 'data-science', 'other'],
    },
    tags: [{ type: String, trim: true }],
    status: {
      type: String,
      enum: ['draft', 'submitted', 'under-review', 'published', 'rejected'],
      default: 'draft',
    },
    publishedAt: Date,
    pdfUrl: String,
    externalUrl: String,
    doi: String,
    views: {
      type: Number,
      default: 0,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    submittedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

ResearchSchema.index({ slug: 1 });
ResearchSchema.index({ category: 1 });
ResearchSchema.index({ status: 1 });
ResearchSchema.index({ featured: 1 });
ResearchSchema.index({ publishedAt: -1 });
ResearchSchema.index({ tags: 1 });
ResearchSchema.index({ title: 'text', abstract: 'text', tags: 'text' });

ResearchSchema.pre('save', function (next) {
  if (this.isModified('title') && !this.slug) {
    this.slug = slugify(this.title, { lower: true, strict: true }) + '-' + Date.now();
  }
  if (this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

export const Research = mongoose.model<IResearch>('Research', ResearchSchema);
