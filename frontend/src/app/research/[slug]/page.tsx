import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, Eye, Download, ExternalLink, User } from 'lucide-react';
import { formatDate, formatCategory } from '@/lib/utils';
import { client } from '@/sanity/client';
import { researchDetailQuery } from '@/sanity/queries';
import type { SanityResearchDetail } from '@/sanity/types';

interface Props {
  params: Promise<{ slug: string }>;
}

async function getResearch(slug: string): Promise<SanityResearchDetail | null> {
  try {
    const data = await client.fetch(researchDetailQuery, { slug });
    return data || null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const paper = await getResearch(slug);
  if (!paper) return { title: 'Not Found' };
  return {
    title: paper.title,
    description: paper.abstract?.slice(0, 160),
  };
}

export default async function ResearchDetailPage({ params }: Props) {
  const { slug } = await params;
  const paper = await getResearch(slug);

  if (!paper) notFound();

  return (
    <div className="pt-16">
      <section className="section">
        <div className="container-page max-w-4xl">
          <Link href="/research" className="inline-flex items-center gap-2 text-text-tertiary hover:text-text-secondary text-sm mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Research
          </Link>

          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-wrap gap-2 mb-5">
              <span className="badge bg-primary/10 text-primary-light border-primary/20">
                {formatCategory(paper.category)}
              </span>
              {paper.featured && (
                <span className="badge bg-accent/10 text-accent border-accent/20">Featured</span>
              )}
              {paper.doi && (
                <span className="badge bg-bg-elevated text-text-tertiary border-border font-mono text-xs">
                  DOI: {paper.doi}
                </span>
              )}
            </div>

            <h1 className="heading-xl mb-6 text-balance">{paper.title}</h1>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-text-tertiary border-y border-border py-5 mb-8">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {paper.publishedAt ? formatDate(paper.publishedAt) : formatDate(paper.createdAt)}
              </div>
              <div className="flex items-center gap-1.5">
                <Eye className="w-4 h-4" />
                {paper.views} views
              </div>
              {paper.authors?.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <User className="w-4 h-4" />
                  {paper.authors.map((a: { name: string }) => a.name).join(', ')}
                </div>
              )}
            </div>

            {/* Tags */}
            {paper.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-8">
                {paper.tags.map((tag: string) => (
                  <span key={tag} className="text-xs bg-bg-elevated text-text-tertiary px-3 py-1 rounded-full border border-border">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Links */}
            <div className="flex flex-wrap gap-3 mb-10">
              {paper.pdfUrl && (
                <a href={paper.pdfUrl} target="_blank" rel="noopener noreferrer" className="btn-primary text-sm">
                  <Download className="w-4 h-4" /> Download PDF
                </a>
              )}
              {paper.externalUrl && (
                <a href={paper.externalUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary text-sm">
                  <ExternalLink className="w-4 h-4" /> View Source
                </a>
              )}
            </div>
          </div>

          {/* Abstract */}
          <div className="card mb-8">
            <h2 className="font-semibold text-text-primary mb-3 text-sm uppercase tracking-wider text-text-muted">Abstract</h2>
            <p className="text-text-secondary leading-relaxed">{paper.abstract}</p>
          </div>

          {/* Authors */}
          {paper.authors?.length > 0 && (
            <div className="mt-12 pt-8 border-t border-border">
              <h2 className="heading-sm mb-5">Authors</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {paper.authors.map((author: { name: string; affiliation?: string; email?: string }, i: number) => (
                  <div key={i} className="card-glass flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-primary-light text-sm font-semibold">
                        {author.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-text-primary text-sm">{author.name}</p>
                      {author.affiliation && (
                        <p className="text-xs text-text-tertiary mt-0.5">{author.affiliation}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
