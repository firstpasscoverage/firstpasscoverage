'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import RecommendationBadge from '@/components/RecommendationBadge';

type AdminCoverage = {
  id: number;
  title: string | null;
  writer: string | null;
  draftDate: string | null;
  recommendation: string | null;
  overallScore: number | null;
  calculatedScore: number | null;
  isSample: boolean | null;
  createdAt: string;
  submitterEmail: string | null;
};

type SortField = 'title' | 'writer' | 'calculatedScore' | 'createdAt' | 'recommendation';
type SortDir = 'asc' | 'desc';

export default function AdminCoveragesClient() {
  const [coverages, setCoverages] = useState<AdminCoverage[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [recommendation, setRecommendation] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const fetchCoverages = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (recommendation) params.set('recommendation', recommendation);
    if (dateFrom) params.set('dateFrom', dateFrom);
    if (dateTo) params.set('dateTo', dateTo);

    try {
      const res = await fetch(`/api/admin/coverages?${params}`);
      const data = await res.json();
      setCoverages(data);
    } catch (err) {
      console.error('Failed to fetch coverages:', err);
    } finally {
      setLoading(false);
    }
  }, [search, recommendation, dateFrom, dateTo]);

  useEffect(() => {
    const timeout = setTimeout(fetchCoverages, 300);
    return () => clearTimeout(timeout);
  }, [fetchCoverages]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir(field === 'createdAt' ? 'desc' : 'asc');
    }
  };

  const sorted = [...coverages].sort((a, b) => {
    const dir = sortDir === 'asc' ? 1 : -1;
    switch (sortField) {
      case 'title':
        return dir * (a.title ?? '').localeCompare(b.title ?? '');
      case 'writer':
        return dir * (a.writer ?? '').localeCompare(b.writer ?? '');
      case 'calculatedScore':
        return dir * ((a.calculatedScore ?? 0) - (b.calculatedScore ?? 0));
      case 'recommendation': {
        const order = ['Strong Pass', 'Pass', 'Consider', 'Recommend', 'Strong Recommend'];
        return dir * ((order.indexOf(a.recommendation ?? '') ?? 0) - (order.indexOf(b.recommendation ?? '') ?? 0));
      }
      case 'createdAt':
      default:
        return dir * (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    }
  });

  const sortIndicator = (field: SortField) => {
    if (sortField !== field) return '';
    return sortDir === 'asc' ? ' ↑' : ' ↓';
  };

  const recommendations = ['Strong Pass', 'Pass', 'Consider', 'Recommend', 'Strong Recommend'];

  return (
    <main className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-brand text-3xl font-normal tracking-[-0.3px]">All Coverages</h1>
        <Link href="/admin">
          <Button variant="ghost" size="sm">← Admin</Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <Input
          placeholder="Search title, writer, or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          value={recommendation}
          onChange={(e) => setRecommendation(e.target.value)}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="">All Recommendations</option>
          {recommendations.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Created From</label>
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Created To</label>
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />
        </div>
      </div>

      {/* Count */}
      <p className="text-sm text-muted-foreground mb-4">
        {loading ? 'Loading…' : `${sorted.length} coverage${sorted.length !== 1 ? 's' : ''}`}
      </p>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              <th
                className="pb-2 pr-4 cursor-pointer hover:text-foreground text-muted-foreground font-medium"
                onClick={() => handleSort('title')}
              >
                Title{sortIndicator('title')}
              </th>
              <th
                className="pb-2 pr-4 cursor-pointer hover:text-foreground text-muted-foreground font-medium"
                onClick={() => handleSort('writer')}
              >
                Writer{sortIndicator('writer')}
              </th>
              <th className="pb-2 pr-4 text-muted-foreground font-medium">
                Submitted By
              </th>
              <th
                className="pb-2 pr-4 cursor-pointer hover:text-foreground text-muted-foreground font-medium"
                onClick={() => handleSort('recommendation')}
              >
                Rec{sortIndicator('recommendation')}
              </th>
              <th
                className="pb-2 pr-4 cursor-pointer hover:text-foreground text-muted-foreground font-medium text-right"
                onClick={() => handleSort('calculatedScore')}
              >
                Score{sortIndicator('calculatedScore')}
              </th>
              <th
                className="pb-2 cursor-pointer hover:text-foreground text-muted-foreground font-medium"
                onClick={() => handleSort('createdAt')}
              >
                Created{sortIndicator('createdAt')}
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((c) => (
              <tr key={c.id} className="border-b border-border/50 hover:bg-muted/30">
                <td className="py-3 pr-4">
                  <Link
                    href={`/admin/coverages/${c.id}`}
                    className="text-amber-600 hover:text-amber-500 font-medium"
                  >
                    {c.title?.toUpperCase() || 'Untitled'}
                  </Link>
                  {c.isSample && (
                    <span className="ml-2 text-xs bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">
                      Sample
                    </span>
                  )}
                </td>
                <td className="py-3 pr-4 text-muted-foreground">
                  {c.writer || '—'}
                </td>
                <td className="py-3 pr-4 text-muted-foreground text-xs">
                  {c.submitterEmail || '—'}
                </td>
                <td className="py-3 pr-4">
                  {c.recommendation ? (
                    <RecommendationBadge recommendation={c.recommendation} />
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
                <td className="py-3 pr-4 text-right font-mono text-muted-foreground">
                  {c.calculatedScore ?? '—'}
                </td>
                <td className="py-3 text-muted-foreground text-xs">
                  {new Date(c.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!loading && sorted.length === 0 && (
        <p className="text-center text-muted-foreground py-12">
          No coverages found matching your filters.
        </p>
      )}
    </main>
  );
}
