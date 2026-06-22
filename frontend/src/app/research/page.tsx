'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Search, Filter, ArrowRight, BookOpen, Eye, Calendar } from 'lucide-react';
import { researchApi } from '@/lib/api';
import { Research } from '@/types';
import { formatDate, formatCategory, getStatusColor, RESEARCH_CATEGORIES, truncate } from '@/lib/utils';
import { cn } from '@/lib/utils';

export default function ResearchPage() {
  const [research, setResearch] = useState<Research[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchResearch = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, unknown> = { page, limit: 12 };
      if (search) params.search = search;
      if (category) params.category = category;

      const res = await researchApi.getAll(params);
      setResearch(res.data.data.research);
      setTotalPages(res.data.data.pagination.pages);
      setTotal(res.data.data.pagination.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, search, category]);

  useEffect(() => {
    fetchResearch();
  }, [fetchResearch]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchResearch();
  };

  return (
    <div className="pt-16">
      {/* Header */}
      <section className="section-sm relative">
        <div className="absolute inset-0 grid-bg opacity-30" />
        <div className="container-page relative">
          <p className="label mb-3">Research</p>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div>
              <h1 className="heading-xl mb-3">Student Research Publications</h1>
              <p className="text-text-secondary max-w-xl">
                Original research conducted and published by members of The Invisible Algorithm across AI, ML, CS, and finance.
              </p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-text-primary">{total}</p>
              <p className="text-text-tertiary text-sm">Publications</p>
            </div>
          </div>

          {/* Search + Filter */}
          <div className="flex flex-col sm:flex-row gap-3">
            <form onSubmit={handleSearch} className="flex-1 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search papers, topics, authors..."
                className="input-base pl-10"
              />
            </form>
            <div className="relative">
              <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
              <select
                value={category}
                onChange={(e) => { setCategory(e.target.value); setPage(1); }}
                className="input-base pl-10 pr-8 appearance-none min-w-[200px]"
              >
                <option value="">All Categories</option>
                {RESEARCH_CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Research Grid */}
      <section className="section-sm">
        <div className="container-page">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="card animate-pulse">
                  <div className="h-4 bg-bg-elevated rounded w-1/3 mb-4" />
                  <div className="h-5 bg-bg-elevated rounded w-full mb-2" />
                  <div className="h-5 bg-bg-elevated rounded w-3/4 mb-4" />
                  <div className="h-16 bg-bg-elevated rounded mb-4" />
                  <div className="h-4 bg-bg-elevated rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : research.length === 0 ? (
            <div className="text-center py-20">
              <BookOpen className="w-12 h-12 text-text-muted mx-auto mb-4" />
              <h3 className="heading-sm mb-2">No research found</h3>
              <p className="text-text-tertiary">Try adjusting your search or filters.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {research.map((paper) => (
                  <Link key={paper._id} href={`/research/${paper.slug}`} className="card-hover group flex flex-col">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <span className="badge bg-primary/10 text-primary-light border-primary/20 text-xs">
                        {formatCategory(paper.category)}
                      </span>
                      {paper.featured && (
                        <span className="badge bg-accent/10 text-accent border-accent/20 text-xs">
                          Featured
                        </span>
                      )}
                    </div>

                    <h2 className="font-semibold text-text-primary group-hover:text-primary-light transition-colors mb-2 line-clamp-2">
                      {paper.title}
                    </h2>

                    <p className="text-sm text-text-secondary mb-4 line-clamp-3 flex-1">
                      {truncate(paper.abstract, 180)}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {paper.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="text-xs bg-bg-elevated text-text-tertiary px-2 py-0.5 rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-xs text-text-muted mt-auto pt-4 border-t border-border">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {paper.publishedAt ? formatDate(paper.publishedAt) : formatDate(paper.createdAt)}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Eye className="w-3.5 h-3.5" />
                        {paper.views} views
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-10">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="btn-secondary px-4 py-2 text-sm disabled:opacity-40"
                  >
                    Previous
                  </button>
                  <span className="text-text-tertiary text-sm px-4">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="btn-secondary px-4 py-2 text-sm disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Submit CTA */}
      <section className="section-sm border-t border-border">
        <div className="container-page text-center">
          <h2 className="heading-md mb-3">Have research to share?</h2>
          <p className="text-text-secondary mb-6 max-w-md mx-auto">
            Members can submit original research papers for review and publication on our platform.
          </p>
          <Link href="/submit" className="btn-primary">
            Submit Research <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
