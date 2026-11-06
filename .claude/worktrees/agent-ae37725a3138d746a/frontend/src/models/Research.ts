import mongoose, { Schema, Document } from 'mongoose';
import slugify from 'slugify';

export interface IResearch extends Document {
  title: string;
  slug: string;
  abstract: string;
  content?: string;
  authors: { name: string; email?: string; affiliation?: string }[];
  category: 'artificial-intelligence' | 'machine-learning' | 'computer-science' | 'finance' | 'data-science' | 'other';
  tags: string[];
  status: 'draft' | 'submitted' | 'under-review' | 'published' | 'rejected';
  publishedAt?: Date;
  pdfUrl?: string;
  externalUrl?: string;
  views: number;
  featured: boolean;
  submittedBy?: mongoose.Types.ObjectId;
}

const ResearchSchema = new Schema<IResearch>({
  title: { type: String, required: true, trim: true },
  slug: { type: String, unique: true },
  abstract: { type: String, required: true },
  content: String,
  authors: [{
    name: { type: String, required: true },
    email: String,
    affiliation: String,
  }],
  category: {
    type: String,
    enum: ['artificial-intelligence', 'machine-learning', 'computer-science', 'finance', 'data-science', 'other'],
    required: true,
  },
  tags: [String],
  status: {
    type: String,
    enum: ['draft', 'submitted', 'under-review', 'published', 'rejected'],
    default: 'draft',
  },
  publishedAt: Date,
  pdfUrl: String,
  externalUrl: String,
  views: { type: Number, default: 0 },
  featured: { type: Boolean, default: false },
  submittedBy: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

ResearchSchema.pre('save', function (next) {
  if (!this.slug) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

export const Research = mongoose.models.Research || mongoose.model<IResearch>('Research', ResearchSchema);
