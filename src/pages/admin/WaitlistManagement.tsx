import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Loader } from '@/components/ui/Loader';
import { Badge } from '@/components/ui/Badge';
import { BackButton } from '@/components/ui/BackButton';
import { waitlistApi } from '@/lib/api/waitlist';
import { showToast } from '@/lib/hooks/useToast';
import { handleApiError } from '@/lib/api/axios';
import { QUERY_KEYS, ROUTES, WAITLIST_INTEREST_LABELS } from '@/constants';
import { formatDate } from '@/lib/utils/formatters';
import { ListChecks, Download, Trash2 } from 'lucide-react';
import type { WaitlistEntry, WaitlistInterest } from '@/types';

const PAGE_SIZE = 50;

const csvCell = (value: string | number | null | undefined) => `"${String(value ?? '').replace(/"/g, '""')}"`;

export const WaitlistManagement: React.FC = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = React.useState('');
  const [interest, setInterest] = React.useState<WaitlistInterest | ''>('');
  const [page, setPage] = React.useState(0);
  const [exporting, setExporting] = React.useState(false);

  React.useEffect(() => { setPage(0); }, [search, interest]);

  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.WAITLIST_ENTRIES, search, interest, page],
    queryFn: () => waitlistApi.getEntries(page * PAGE_SIZE, PAGE_SIZE, search, interest || undefined),
  });

  const entries = data?.items ?? [];
  const total = data?.total ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const removeMutation = useMutation({
    mutationFn: waitlistApi.removeEntry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.WAITLIST_ENTRIES] });
      showToast('Removed from waitlist.', 'success');
    },
    onError: (error) => showToast(handleApiError(error), 'error'),
  });

  const handleExport = async () => {
    setExporting(true);
    try {
      const all: WaitlistEntry[] = [];
      for (let skip = 0; ; skip += 1000) {
        const batch = await waitlistApi.getEntries(skip, 1000, search, interest || undefined);
        all.push(...batch.items);
        if (all.length >= batch.total || batch.items.length === 0) break;
      }
      const header = ['Position', 'Name', 'Email', 'Interest', 'Location', 'Referral source', 'Joined'];
      const rows = all.map((e, i) =>
        [i + 1, e.name, e.email, e.interest, e.location, e.referral_source, e.created_at].map(csvCell).join(','),
      );
      const blob = new Blob([[header.join(','), ...rows].join('\n')], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `atlo-waitlist-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      showToast(handleApiError(error), 'error');
    } finally {
      setExporting(false);
    }
  };

  return (
    <Layout>
      <div className="container-custom py-12">
        <BackButton to={ROUTES.ADMIN_DASHBOARD} label="Admin Dashboard" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <ListChecks className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Waitlist</h1>
              <p className="text-gray-600">{total.toLocaleString()} sign-up{total === 1 ? '' : 's'}</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleExport} disabled={exporting || total === 0}>
            {exporting ? <Loader size="sm" className="mr-2" /> : <Download className="h-4 w-4 mr-2" />}
            Export CSV
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex flex-col sm:flex-row gap-3">
              <Input
                placeholder="Search name, email or area"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="sm:max-w-xs"
              />
              <select
                value={interest}
                onChange={(e) => setInterest(e.target.value as WaitlistInterest | '')}
                className="h-10 rounded-md border border-input bg-background px-3 text-sm font-normal"
              >
                <option value="">All interests</option>
                {Object.entries(WAITLIST_INTEREST_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8"><Loader size="lg" /></div>
            ) : entries.length === 0 ? (
              <p className="text-center text-gray-500 py-10">No waitlist sign-ups found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 border-b">
                      <th className="py-2 pr-4 font-medium">#</th>
                      <th className="py-2 pr-4 font-medium">Name</th>
                      <th className="py-2 pr-4 font-medium">Email</th>
                      <th className="py-2 pr-4 font-medium">Interest</th>
                      <th className="py-2 pr-4 font-medium">Area</th>
                      <th className="py-2 pr-4 font-medium">Source</th>
                      <th className="py-2 pr-4 font-medium">Joined</th>
                      <th className="py-2" />
                    </tr>
                  </thead>
                  <tbody>
                    {entries.map((entry, i) => (
                      <tr key={entry.id} className="border-b border-gray-100 last:border-0">
                        <td className="py-3 pr-4 text-gray-400">{page * PAGE_SIZE + i + 1}</td>
                        <td className="py-3 pr-4 font-medium">{entry.name}</td>
                        <td className="py-3 pr-4">{entry.email}</td>
                        <td className="py-3 pr-4">
                          <Badge className="bg-primary/10 text-primary">{WAITLIST_INTEREST_LABELS[entry.interest]}</Badge>
                        </td>
                        <td className="py-3 pr-4 text-gray-600">{entry.location || '—'}</td>
                        <td className="py-3 pr-4 text-gray-600">{entry.referral_source || '—'}</td>
                        <td className="py-3 pr-4 text-gray-500 whitespace-nowrap">{formatDate(entry.created_at)}</td>
                        <td className="py-3 text-right">
                          <Button
                            size="sm"
                            variant="ghost"
                            aria-label={`Remove ${entry.email}`}
                            onClick={() => removeMutation.mutate(entry.id)}
                            disabled={removeMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {pageCount > 1 && (
              <div className="flex items-center justify-between pt-4 mt-2 border-t">
                <Button size="sm" variant="outline" onClick={() => setPage(p => p - 1)} disabled={page === 0}>Previous</Button>
                <span className="text-sm text-gray-500">Page {page + 1} of {pageCount}</span>
                <Button size="sm" variant="outline" onClick={() => setPage(p => p + 1)} disabled={page + 1 >= pageCount}>Next</Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};
