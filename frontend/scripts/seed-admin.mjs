#!/usr/bin/env node
// One-off script to create/update a user directly in MongoDB (there is no
// /register or admin "create user" route in the app, so this is the only
// way to get an account with a given role).
//
// Usage:
//   node --env-file=.env.local scripts/seed-admin.mjs <email> <password> <firstName> <lastName> [role]
//
// role defaults to "super_admin" if omitted. Valid roles: student, member,
// researcher, admin, super_admin.
//
// Or set MONGODB_URI in the environment yourself before running.

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const VALID_ROLES = ['student', 'member', 'researcher', 'admin', 'super_admin'];
const [, , email, password, firstName, lastName, roleArg] = process.argv;
const role = roleArg || 'super_admin';

if (!email || !password || !firstName || !lastName) {
  console.error('Usage: node --env-file=.env.local scripts/seed-admin.mjs <email> <password> <firstName> <lastName> [role]');
  process.exit(1);
}

if (!VALID_ROLES.includes(role)) {
  console.error(`Invalid role "${role}". Must be one of: ${VALID_ROLES.join(', ')}`);
  process.exit(1);
}

if (password.length < 8) {
  console.error('Password must be at least 8 characters.');
  process.exit(1);
}

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('MONGODB_URI is not set. Run with: node --env-file=.env.local scripts/seed-admin.mjs ...');
  process.exit(1);
}

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 8, select: false },
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  role: { type: String, enum: ['student', 'member', 'researcher', 'admin', 'super_admin'], default: 'student' },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const User = mongoose.model('User', UserSchema);

async function main() {
  await mongoose.connect(MONGODB_URI);

  const hashed = await bcrypt.hash(password, 12);
  const user = await User.findOneAndUpdate(
    { email: email.toLowerCase() },
    { email: email.toLowerCase(), password: hashed, firstName, lastName, role, isActive: true },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  console.log(`${user.role} ready: ${user.email}`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
