import { TeamMember } from '@/models/TeamMember';
import { executiveTeam } from '@/lib/team';

// One-time migration of the hardcoded executive team (src/lib/team.ts) into
// the TeamMember collection, so the admin panel has something to edit.
//
// Runs on the first GET /api/team. Once any member exists — even if an admin
// later deletes them all — this must not re-seed, or deleted people would
// reappear. A marker document would be cleaner, but the realistic case is
// "collection is empty because we just deployed", so an emptiness check is
// enough here; the `seeded` flag in the returned value is only for logging.
export async function seedTeamIfEmpty(): Promise<boolean> {
  const existing = await TeamMember.estimatedDocumentCount();
  if (existing > 0) return false;

  await TeamMember.insertMany(
    executiveTeam.map((member, index) => ({
      slug: member.id,
      firstName: member.firstName,
      lastName: member.lastName || '',
      role: member.role,
      school: member.school,
      avatar: member.avatar,
      avatarPosition: member.avatarPosition,
      bio: member.bio,
      order: index,
      isActive: true,
    })),
    // Tolerate a concurrent seed from a parallel request: a duplicate-slug
    // race should not 500 the public team page.
    { ordered: false }
  ).catch(() => []);

  return true;
}
