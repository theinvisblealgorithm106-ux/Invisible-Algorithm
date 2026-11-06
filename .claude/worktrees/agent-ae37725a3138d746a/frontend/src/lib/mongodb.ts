import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI!;

declare global {
  // eslint-disable-next-line no-var
  var mongoose: { conn: mongoose.Connection | null; promise: Promise<mongoose.Connection> | null };
}

if (!global.mongoose) global.mongoose = { conn: null, promise: null };

export async function connectDB() {
  if (global.mongoose.conn) return global.mongoose.conn;
  if (!global.mongoose.promise) {
    global.mongoose.promise = mongoose.connect(MONGODB_URI).then(m => m.connection);
  }
  global.mongoose.conn = await global.mongoose.promise;
  return global.mongoose.conn;
}
