import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Moon,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  Filter,
} from 'lucide-react';
import Header from '../../components/landing/Header';
import { Breadcrumb } from '../../components/ui/breadcrumb';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { BackgroundEffects } from '../../components/ui/BackgroundEffects';
import { useToast } from '../../components/ui/use-toast';
import { SleepLogCard } from '../../components/health/sleep';
import { useSleepLogs, useDeleteSleepLog } from '../../hooks/health/useSleep';
import { useConfirm } from '../../contexts/ConfirmDialogContext';

const SleepHistory: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { confirm } = useConfirm();
  const [searchQuery, setSearchQuery] = useState('');
  const [qualityFilter, setQualityFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Memoize params to prevent infinite re-renders
  const queryParams = useMemo(() => ({
    limit: 50,
    sortBy: 'sleepDate' as const,
    sortOrder: 'desc' as const,
  }), []);

  const { sleepLogs, isLoading, refetch } = useSleepLogs(queryParams);

  const deleteMutation = useDeleteSleepLog();

  // Filter logs
  const filteredLogs = useMemo(() => {
    if (!sleepLogs) return [];

    return sleepLogs.filter((log) => {
      // Search filter
      if (searchQuery) {
        const search = searchQuery.toLowerCase();
        const matchesNotes = log.notes?.toLowerCase().includes(search);
        const matchesTags = log.tags?.some((tag) =>
          tag.toLowerCase().includes(search)
        );
        const matchesDate = log.sleepDate.includes(search);
        if (!matchesNotes && !matchesTags && !matchesDate) return false;
      }

      // Quality filter
      if (qualityFilter !== 'all') {
        const score = log.qualityScore || 0;
        switch (qualityFilter) {
          case 'good':
            if (score < 80) return false;
            break;
          case 'fair':
            if (score < 60 || score >= 80) return false;
            break;
          case 'poor':
            if (score >= 60) return false;
            break;
        }
      }

      return true;
    });
  }, [sleepLogs, searchQuery, qualityFilter]);

  // Paginated logs for list view
  const paginatedLogs = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredLogs.slice(start, start + pageSize);
  }, [filteredLogs, page]);

  const totalPages = Math.ceil(filteredLogs.length / pageSize);

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Sleep Log',
      message: 'Are you sure you want to delete this sleep log?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'destructive',
    });

    if (!confirmed) return;

    try {
      await deleteMutation.mutateAsync(id);
      toast({
        title: 'Sleep log deleted',
        description: 'The sleep log has been removed.',
      });
      refetch();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete sleep log.',
        variant: 'destructive',
      });
    }
  };

  const breadcrumbItems = [
    { label: 'Health', href: '/health' },
    { label: 'Sleep Tracking', href: '/health/sleep' },
    { label: 'History', href: '/health/sleep-history' },
  ];

  return (
    <div className="min-h-screen relative">
      <BackgroundEffects />
      <Header />

      {/* Breadcrumb Navigation */}
      <div className="bg-white/5 backdrop-blur-sm border-b border-white/10 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Breadcrumb items={breadcrumbItems} />
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/health/sleep')}
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Calendar className="w-6 h-6 text-teal-400" />
                Sleep History
              </h1>
              <p className="text-white/60">
                {filteredLogs.length} sleep log{filteredLogs.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <Button
            onClick={() => navigate('/health/add-sleep-log')}
            className="bg-gradient-to-r from-teal-500 to-cyan-500"
          >
            <Plus className="w-4 h-4 mr-2" />
            Log Sleep
          </Button>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <Input
                  placeholder="Search by date, notes, or tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white/5 border-white/20"
                />
              </div>
              <Select value={qualityFilter} onValueChange={setQualityFilter}>
                <SelectTrigger className="w-[180px] bg-white/5 border-white/20">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Quality" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Quality</SelectItem>
                  <SelectItem value="good">Good (80+)</SelectItem>
                  <SelectItem value="fair">Fair (60-79)</SelectItem>
                  <SelectItem value="poor">Poor (&lt;60)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Sleep Logs List */}
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-24 bg-white/10 rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : paginatedLogs.length > 0 ? (
          <>
            <div className="space-y-4">
              {paginatedLogs.map((log) => (
                <SleepLogCard
                  key={log.id}
                  sleepLog={log}
                  onEdit={(id) => navigate(`/health/add-sleep-log?edit=${id}`)}
                  onDelete={handleDelete}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-white/20"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm text-white/60 px-4">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-white/20"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </>
        ) : (
          <Card>
            <CardContent className="py-16 text-center">
              <Moon className="w-16 h-16 mx-auto mb-4 text-white/20" />
              <h3 className="text-lg font-semibold mb-2">No Sleep Logs Found</h3>
              <p className="text-white/60 mb-6">
                {searchQuery || qualityFilter !== 'all'
                  ? 'Try adjusting your filters.'
                  : 'Start tracking your sleep to see your history.'}
              </p>
              <Button
                onClick={() => navigate('/health/add-sleep-log')}
                className="bg-gradient-to-r from-teal-500 to-cyan-500"
              >
                <Plus className="w-4 h-4 mr-2" />
                Log Your First Sleep
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default SleepHistory;
