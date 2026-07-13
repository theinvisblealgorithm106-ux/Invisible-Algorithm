'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Globe, Linkedin, Github, Twitter } from 'lucide-react';
import { usersApi } from '@/lib/api';
import { User } from '@/types';
import { executiveTeam } from '@/lib/team';
import { getInitials, getRoleBadgeColor, cn } from '@/lib/utils';

const roleLabels: Record<string, string> = {
  super_admin: 'Leadership',
  admin: 'Tech Dept',
  researcher: 'Researcher',
  member: 'Member',
  student: 'Student',
};

export default function TeamMemberPage() {
  const params = useParams();
  const id = params.id as string;

  const staticMember = executiveTeam.find((m) => m.id === id);

  const [member, setMember] = useState<User | null>(null);
  const [loading, setLoading] = useState(!staticMember);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (staticMember) return;

    const fetchMember = async () => {
      setLoading(true);
      try {
        const res = await usersApi.getUserById(id);
        setMember(res.data.data.user ?? res.data.data);
      } catch (err) {
        console.error(err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    fetchMember();
  }, [id, staticMember]);

  const person = staticMember ?? member;

  return (
    <div className="pt-16">
      <section className="section">
        <div className="container-page max-w-4xl">
          <Link href="/team" className="inline-flex items-center gap-2 text-text-tertiary hover:text-text-secondary text-sm mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Team
          </Link>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-10 animate-pulse">
              <div className="w-full aspect-square rounded-2xl bg-bg-elevated" />
              <div className="space-y-4">
                <div className="h-8 bg-bg-elevated rounded w-1/2" />
                <div className="h-4 bg-bg-elevated rounded w-1/3" />
                <div className="h-24 bg-bg-elevated rounded w-full" />
              </div>
            </div>
          ) : notFound || !person ? (
            <div className="text-center py-20">
              <p className="text-text-tertiary">Team member not found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-10 items-start">
              {/* Photo */}
              <div className="w-full">
                {person.avatar ? (
                  <img
                    src={person.avatar}
                    alt={`${person.firstName} ${person.lastName}`}
                    className={cn(
                      'w-full aspect-square rounded-2xl object-cover border-2 border-border',
                      staticMember?.avatarPosition
                    )}
                  />
                ) : (
                  <div className="w-full aspect-square rounded-2xl bg-primary/10 border-2 border-border flex items-center justify-center">
                    <span className="text-primary-light font-semibold text-5xl">
                      {getInitials(person.firstName, person.lastName || person.firstName)}
                    </span>
                  </div>
                )}
              </div>

              {/* Bio */}
              <div>
                <h1 className="heading-lg mb-2">
                  {person.firstName}{person.lastName ? ` ${person.lastName}` : ''}
                </h1>

                <span className={
                  'badge text-xs mb-4 inline-block ' +
                  (staticMember
                    ? 'bg-primary/10 text-primary-light border-primary/20'
                    : getRoleBadgeColor((person as User).role))
                }>
                  {staticMember ? staticMember.role : roleLabels[(person as User).role] || (person as User).role}
                </span>

                {person.school && (
                  <p className="text-sm text-text-tertiary mb-1">{person.school}</p>
                )}

                {!staticMember && (person as User).country && (
                  <div className="flex items-center gap-1.5 text-sm text-text-muted mb-4">
                    <Globe className="w-4 h-4" />
                    {(person as User).country}
                  </div>
                )}

                {person.bio && (
                  <p className="text-text-secondary leading-relaxed mt-5 whitespace-pre-line">{person.bio}</p>
                )}

                {!staticMember && (person as User).socialLinks && Object.values((person as User).socialLinks!).some(Boolean) && (
                  <div className="flex items-center gap-4 mt-6">
                    {(person as User).socialLinks!.linkedin && (
                      <a href={(person as User).socialLinks!.linkedin} target="_blank" rel="noopener noreferrer" className="text-text-muted hover:text-[#0077b5] transition-colors">
                        <Linkedin className="w-5 h-5" />
                      </a>
                    )}
                    {(person as User).socialLinks!.github && (
                      <a href={(person as User).socialLinks!.github} target="_blank" rel="noopener noreferrer" className="text-text-muted hover:text-text-primary transition-colors">
                        <Github className="w-5 h-5" />
                      </a>
                    )}
                    {(person as User).socialLinks!.twitter && (
                      <a href={(person as User).socialLinks!.twitter} target="_blank" rel="noopener noreferrer" className="text-text-muted hover:text-[#1da1f2] transition-colors">
                        <Twitter className="w-5 h-5" />
                      </a>
                    )}
                    {(person as User).socialLinks!.website && (
                      <a href={(person as User).socialLinks!.website} target="_blank" rel="noopener noreferrer" className="text-text-muted hover:text-text-primary transition-colors">
                        <Globe className="w-5 h-5" />
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
