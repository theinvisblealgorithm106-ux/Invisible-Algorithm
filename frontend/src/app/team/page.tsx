'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Globe, Linkedin, Github, Twitter } from 'lucide-react';
import { usersApi } from '@/lib/api';
import { User } from '@/types';
import { executiveTeam } from '@/lib/team';
import { getInitials, getRoleBadgeColor, cn } from '@/lib/utils';

const roleOrder: Record<string, number> = {
  super_admin: 0,
  admin: 1,
  researcher: 2,
  member: 3,
  student: 4,
};

const roleLabels: Record<string, string> = {
  super_admin: 'Leadership',
  admin: 'Tech Dept',
  researcher: 'Researcher',
  member: 'Member',
  student: 'Student',
};

export default function TeamPage() {
  const [members, setMembers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchMembers = async () => {
      setLoading(true);
      try {
        const params: Record<string, unknown> = { page, limit: 24 };
        if (filter) params.role = filter;
        if (search) params.search = search;
        const res = await usersApi.getMembers(params);
        setMembers(res.data.data.members);
        setTotalPages(res.data.data.pagination.pages);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMembers();
  }, [page, filter, search]);

  return (
    <div className="pt-16">
      {/* Header */}
      <section className="section-sm relative">
        <div className="absolute inset-0 grid-bg opacity-30" />
        <div className="container-page relative">
          <p className="label mb-3">Team</p>
          <h1 className="heading-xl mb-3">Our Global Community</h1>
          <p className="text-text-secondary max-w-xl mb-8">
            Meet the students, researchers, and administrators who make The Invisible Algorithm what it is — driven, curious, and coming from every corner of the world.
          </p>

          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search members..."
              className="input-base max-w-xs py-2"
            />
            {['', 'researcher', 'member'].map((role) => (
              <button
                key={role}
                onClick={() => { setFilter(role); setPage(1); }}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium border transition-all',
                  filter === role
                    ? 'bg-primary/10 text-primary-light border-primary/30'
                    : 'bg-bg-elevated text-text-secondary border-border hover:border-border-hover'
                )}
              >
                {role === '' ? 'All' : roleLabels[role]}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Executive Team */}
      <section className="section-sm border-b border-border">
        <div className="container-page">
          <p className="label mb-3">Leadership</p>
          <h2 className="heading-md mb-8">Executive Team</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {executiveTeam.map((member) => (
              <Link key={member.id} href={`/team/${member.id}`} className="card-hover text-center group block">
                <div className="relative mx-auto w-16 h-16 mb-4">
                  {member.avatar ? (
                    <img
                      src={member.avatar}
                      alt={`${member.firstName} ${member.lastName}`}
                      className={cn(
                        'w-full h-full rounded-full object-cover border-2 border-border group-hover:border-primary/50 transition-colors',
                        member.avatarPosition
                      )}
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-primary/10 border-2 border-border group-hover:border-primary/50 transition-colors flex items-center justify-center">
                      <span className="text-primary-light font-semibold text-lg">
                        {getInitials(member.firstName, member.lastName || member.firstName)}
                      </span>
                    </div>
                  )}
                </div>
                <h3 className="font-semibold text-text-primary text-sm mb-1">
                  {member.firstName}{member.lastName ? ` ${member.lastName}` : ''}
                </h3>
                <span className="badge text-xs bg-primary/10 text-primary-light border-primary/20 mb-2">
                  {member.role}
                </span>
                {member.school && (
                  <p className="text-xs text-text-tertiary mt-2 line-clamp-1">{member.school}</p>
                )}
                {member.bio && (
                  <p className="text-xs text-text-tertiary mt-3 line-clamp-3">{member.bio}</p>
                )}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Members Grid */}
      <section className="section-sm">
        <div className="container-page">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="card animate-pulse">
                  <div className="w-16 h-16 rounded-full bg-bg-elevated mx-auto mb-4" />
                  <div className="h-4 bg-bg-elevated rounded w-2/3 mx-auto mb-2" />
                  <div className="h-3 bg-bg-elevated rounded w-1/2 mx-auto" />
                </div>
              ))}
            </div>
          ) : members.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-text-tertiary">No members found.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {members.map((member) => (
                  <Link key={member.id} href={`/team/${member.id}`} className="card-hover text-center group block">
                    <div className="relative mx-auto w-16 h-16 mb-4">
                      {member.avatar ? (
                        <img
                          src={member.avatar}
                          alt={`${member.firstName} ${member.lastName}`}
                          className="w-full h-full rounded-full object-cover border-2 border-border group-hover:border-primary/50 transition-colors"
                        />
                      ) : (
                        <div className="w-full h-full rounded-full bg-primary/10 border-2 border-border group-hover:border-primary/50 transition-colors flex items-center justify-center">
                          <span className="text-primary-light font-semibold text-lg">
                            {getInitials(member.firstName, member.lastName)}
                          </span>
                        </div>
                      )}
                    </div>

                    <h3 className="font-semibold text-text-primary text-sm mb-1">
                      {member.firstName} {member.lastName}
                    </h3>

                    <span className={cn('badge text-xs mb-2', getRoleBadgeColor(member.role))}>
                      {roleLabels[member.role] || member.role}
                    </span>

                    {member.school && (
                      <p className="text-xs text-text-tertiary mt-2 line-clamp-1">{member.school}</p>
                    )}

                    {member.country && (
                      <div className="flex items-center justify-center gap-1 text-xs text-text-muted mt-1">
                        <Globe className="w-3 h-3" />
                        {member.country}
                      </div>
                    )}

                    {member.bio && (
                      <p className="text-xs text-text-tertiary mt-3 line-clamp-2">{member.bio}</p>
                    )}

                    {member.socialLinks && Object.values(member.socialLinks).some(Boolean) && (
                      <div className="flex items-center justify-center gap-2 mt-3">
                        {member.socialLinks.linkedin && (
                          <a href={member.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="text-text-muted hover:text-[#0077b5] transition-colors">
                            <Linkedin className="w-3.5 h-3.5" />
                          </a>
                        )}
                        {member.socialLinks.github && (
                          <a href={member.socialLinks.github} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="text-text-muted hover:text-text-primary transition-colors">
                            <Github className="w-3.5 h-3.5" />
                          </a>
                        )}
                        {member.socialLinks.twitter && (
                          <a href={member.socialLinks.twitter} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="text-text-muted hover:text-[#1da1f2] transition-colors">
                            <Twitter className="w-3.5 h-3.5" />
                          </a>
                        )}
                        {member.socialLinks.website && (
                          <a href={member.socialLinks.website} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="text-text-muted hover:text-text-primary transition-colors">
                            <Globe className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    )}
                  </Link>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-10">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary px-4 py-2 text-sm disabled:opacity-40">Previous</button>
                  <span className="text-text-tertiary text-sm px-4">Page {page} of {totalPages}</span>
                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="btn-secondary px-4 py-2 text-sm disabled:opacity-40">Next</button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}
