#!/usr/bin/env node
// One-off script to permanently delete a user directly in MongoDB (there is
// no delete-user route in the app — the admin panel can only deactivate).
//
// Usage:
//   node --env-file=.env.local scripts/delete-user.mjs <email> [<email> ...]
//
// Or set MONGODB_URI in the environment yourself before running.

import mongoose from 'mongoose';

const emails = process.argv.slice(2);

if (emails.length === 0) {
  console.error('Usage: node --env-file=.env.local scripts/delete-user.mjs <email> [<email> ...]');
  process.exit(1);
}

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('MONGODB_URI is not set. Run with: node --env-file=.env.local scripts/delete-user.mjs ...');
  process.exit(1);
}

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
}, { strict: false });

const User = mongoose.model('User', UserSchema);

async function main() {
  await mongoose.connect(MONGODB_URI);

  for (const email of emails) {
    const result = await User.deleteOne({ email: email.toLowerCase() });
    console.log(result.deletedCount ? `deleted: ${email}` : `not found: ${email}`);
  }

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
