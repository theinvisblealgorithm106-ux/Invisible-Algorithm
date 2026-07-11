'use client';

import { useState, useEffect } from 'react';
import { Globe, Linkedin, Github, Twitter } from 'lucide-react';
import { usersApi } from '@/lib/api';
import { User } from '@/types';
import { getInitials, getRoleBadgeColor, cn } from '@/lib/utils';

const executiveTeam = [
  {
    id: 'ishita-batra',
    firstName: 'Ishita',
    lastName: 'Batra',
    role: 'Founder',
    avatar: '/team/ishita-batra.jpeg',
    bio: "Growing up, Ishita was caught between two worlds — a computer-scientist father who ranted about bugs and algorithms at dinner, and a mother's side of the family that explained economics using vegetables. Enough questions later, that curiosity turned into The Invisible Algorithm, a youth-led initiative making technology and AI more accessible to students worldwide through workshops, research, and a global community of curious minds.",
  },
  {
    id: 'shriyan',
    firstName: 'Shriyan',
    lastName: '',
    role: 'Executive Team',
    avatar: '/team/shriyan.png',
    bio: "A builder at heart, Shriyan spends his time turning ideas into real projects — robots, games, websites, and personal builds like CogniFlow. Most of his time goes into Onshape, coding, robotics, and 3D printing, with a constant focus on learning how things work and making them better. Currently exploring Unity, AI, and game development.",
  },
  {
    id: 'tanya-mangla',
    firstName: 'Tanya',
    lastName: 'Mangla',
    role: 'Executive Team',
    avatar: '/team/tanya-mangla.jpeg',
    bio: "A Grade 10 student surrounded by finance professionals since childhood, Tanya knew what GST meant before fifth grade. When the family ran out of patience for her questions, she turned to Google — and later ChatGPT and Gemini — to make sense of it all. That curiosity about both finance and AI is exactly why she connects with The Invisible Algorithm's mission.",
  },
  {
    id: 'aarvi-malik',
    firstName: 'Aarvi',
    lastName: 'Malik',
    role: 'Executive Head of Social Media and Outreach',
    school: 'Bal Bharati Public School, Pitampura',
    avatar: '/team/aarvi-malik.jpeg',
    bio: "A Grade 10 student and public speaker since age 3, Aarvi won Best Speaker from India's Ministry of Education and earned an honourable mention at The GOI Peace Foundation Japan International Essay Competition. Through TIA's workshops, she connects brilliant learners globally.",
  },
  {
    id: 'saanvi',
    firstName: 'Saanvi',
    lastName: '',
    role: 'Executive Director of Creative Design',
    school: 'Harold M. Braithwaite (IB Diploma, Canada)',
    avatar: '/team/saanvi.jpeg',
    bio: "Art meant nothing to Saanvi until a Grade 5 art contest, when creating her first piece just clicked — a way to express herself without words. Since then she's explored countless styles and techniques, earning awards along the way and discovering that art, especially fashion, is one of the most powerful ways to show personality and individuality. As Executive Director of Creative Design, she champions imagination and proves art has a heartbeat as long as people keep dreaming and creating.",
  },
];

const roleOrder: Record<string, number> = {
  super_admin: 0,
  admin: 1,
  researcher: 2,
  member: 3,
  student: 4,
};

const roleLabels: Record<string, string> = {
  super_admin: 'Leadership',
  admin: 'Administration',
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
              <div key={member.id} className="card-hover text-center group">
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
              </div>
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
                  <div key={member.id} className="card-hover text-center group">
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
                          <a href={member.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="text-text-muted hover:text-[#0077b5] transition-colors">
                            <Linkedin className="w-3.5 h-3.5" />
                          </a>
                        )}
                        {member.socialLinks.github && (
                          <a href={member.socialLinks.github} target="_blank" rel="noopener noreferrer" className="text-text-muted hover:text-text-primary transition-colors">
                            <Github className="w-3.5 h-3.5" />
                          </a>
                        )}
                        {member.socialLinks.twitter && (
                          <a href={member.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="text-text-muted hover:text-[#1da1f2] transition-colors">
                            <Twitter className="w-3.5 h-3.5" />
                          </a>
                        )}
                        {member.socialLinks.website && (
                          <a href={member.socialLinks.website} target="_blank" rel="noopener noreferrer" className="text-text-muted hover:text-text-primary transition-colors">
                            <Globe className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    )}
                  </div>
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
