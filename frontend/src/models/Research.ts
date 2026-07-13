import mongoose, { Schema, Document } from 'mongoose';
import slugify from 'slugify';

export interface IResearch extends Document {
  title: string;
  slug: string;
  abstract: string;
  content: string;
  authors: { name: string; email?: string; affiliation?: string }[];
  category: string;
  tags: string[];
  status: string;
  publishedAt?: Date;
  pdfUrl?: string;
  pdfDriveFileId?: string;
  externalUrl?: string;
  views: number;
  featured: boolean;
  submittedBy: mongoose.Types.ObjectId;
}

const ResearchSchema = new Schema<IResearch>({
  title: { type: String, required: true, trim: true },
  slug: { type: String, unique: true },
  abstract: { type: String, required: true },
  content: { type: String, required: true },
  authors: [{ name: { type: String, required: true }, email: String, affiliation: String }],
  category: { type: String, required: true, enum: ['artificial-intelligence', 'machine-learning', 'computer-science', 'finance', 'data-science', 'other'] },
  tags: [String],
  status: { type: String, enum: ['draft', 'submitted', 'under-review', 'published', 'rejected'], default: 'draft' },
  publishedAt: Date,
  pdfUrl: String,
  pdfDriveFileId: String,
  externalUrl: String,
  views: { type: Number, default: 0 },
  featured: { type: Boolean, default: false },
  submittedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

ResearchSchema.index({ title: 'text', abstract: 'text', tags: 'text' });

ResearchSchema.pre('save', function (next) {
  if (this.isModified('title') && !this.slug) {
    this.slug = slugify(this.title, { lower: true, strict: true }) + '-' + Date.now();
  }
  if (this.status === 'published' && !this.publishedAt) this.publishedAt = new Date();
  next();
});

export const Research = mongoose.models.Research || mongoose.model<IResearch>('Research', ResearchSchema);
