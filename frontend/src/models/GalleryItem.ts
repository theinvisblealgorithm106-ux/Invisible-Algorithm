import mongoose, { Schema, Document } from 'mongoose';

// Photos for the public gallery, managed from the admin panel's Gallery tab.
export interface IGalleryItem extends Document {
  title?: string;
  caption?: string;
  // Either an /api/images/<driveFileId> path from an upload, or any https URL.
  image: string;
  // Set only for uploaded images, so the Drive file can be cleaned up when the
  // item is deleted. Absent for externally-linked images.
  imageFileId?: string;
  album?: string;
  // Names of people in the photo. Free text rather than User references: most
  // people in event photos aren't platform users.
  people: string[];
  takenAt?: Date;
  order: number;
  isPublic: boolean;
  featured: boolean;
  uploadedBy: mongoose.Types.ObjectId;
}

const GalleryItemSchema = new Schema<IGalleryItem>({
  title: { type: String, trim: true },
  caption: { type: String, trim: true },
  image: { type: String, required: true, trim: true },
  imageFileId: { type: String, trim: true },
  album: { type: String, trim: true },
  people: { type: [String], default: [] },
  takenAt: Date,
  order: { type: Number, default: 0 },
  isPublic: { type: Boolean, default: true },
  featured: { type: Boolean, default: false },
  uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

// The public gallery sorts newest-first by default but lets an admin pin an
// explicit order, so both fields are indexed together.
GalleryItemSchema.index({ order: 1, createdAt: -1 });
GalleryItemSchema.index({ album: 1 });

export const GalleryItem = mongoose.models.GalleryItem
  || mongoose.model<IGalleryItem>('GalleryItem', GalleryItemSchema);
