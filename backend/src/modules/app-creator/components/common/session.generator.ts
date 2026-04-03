/**
 * Session Generator
 *
 * Generates session-related components:
 * - SessionList: Display all sessions with filtering
 * - SessionListActive: Display only active/live sessions
 */

import { pascalCase, snakeCase } from 'change-case';
import pluralize from 'pluralize';

export interface SessionListOptions {
  componentName?: string;
  entity?: string;
  endpoint?: string;
  queryKey?: string;
  showFilters?: boolean;
  showActions?: boolean;
  showStatus?: boolean;
  showHost?: boolean;
  showParticipants?: boolean;
}

export interface SessionListActiveOptions {
  componentName?: string;
  entity?: string;
  endpoint?: string;
  queryKey?: string;
  showJoinButton?: boolean;
  showParticipantCount?: boolean;
  showDuration?: boolean;
  maxItems?: number;
}

/**
 * Generate a SessionList component
 */
export function generateSessionList(options: SessionListOptions = {}): string {
  const {
    componentName = 'SessionList',
    entity = 'session',
    showFilters = true,
    showActions = true,
    showStatus = true,
    showHost = true,
    showParticipants = true,
  } = options;

  const tableName = snakeCase(pluralize.plural(entity));
  const endpoint = options.endpoint || `/${tableName}`;
  const queryKey = options.queryKey || tableName;

  return `import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Filter,
  Plus,
  Play,
  Pause,
  Video,
  VideoOff,
  Users,
  Clock,
  Calendar,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  ExternalLink,
  Loader2,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

interface Session {
  id: string;
  title: string;
  description?: string;
  hostId?: string;
  hostName?: string;
  hostAvatar?: string;
  status: 'scheduled' | 'live' | 'ended' | 'cancelled';
  startTime: string;
  endTime?: string;
  duration?: number;
  participantCount?: number;
  maxParticipants?: number;
  type?: string;
  isRecorded?: boolean;
  recordingUrl?: string;
  meetingUrl?: string;
}

interface ${componentName}Props {
  sessions?: Session[];
  className?: string;
  onSessionClick?: (session: Session) => void;
  onJoin?: (session: Session) => void;
}

const STATUS_STYLES: Record<string, { bg: string; dot: string }> = {
  scheduled: {
    bg: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    dot: 'bg-blue-500',
  },
  live: {
    bg: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    dot: 'bg-green-500 animate-pulse',
  },
  ended: {
    bg: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
    dot: 'bg-gray-500',
  },
  cancelled: {
    bg: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    dot: 'bg-red-500',
  },
};

const ${componentName}: React.FC<${componentName}Props> = ({
  sessions: propSessions,
  className,
  onSessionClick,
  onJoin,
}) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; session: Session | null }>({ open: false, session: null });

  const { data: fetchedSessions, isLoading } = useQuery({
    queryKey: ['${queryKey}'],
    queryFn: async () => {
      try {
        const response = await api.get<any>('${endpoint}');
        return Array.isArray(response) ? response : (response?.data || []);
      } catch (err) {
        console.error('Failed to fetch sessions:', err);
        return [];
      }
    },
    enabled: !propSessions,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(\`${endpoint}/\${id}\`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['${queryKey}'] });
    },
  });

  const sessions = propSessions || fetchedSessions || [];

  const sessionTypes = useMemo(() => {
    const types = new Set(sessions.map((s: Session) => s.type).filter(Boolean));
    return Array.from(types);
  }, [sessions]);

  const filteredSessions = useMemo(() => {
    return sessions.filter((session: Session) => {
      const matchesSearch = !searchQuery ||
        session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        session.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = !statusFilter || session.status === statusFilter;
      const matchesType = !typeFilter || session.type === typeFilter;
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [sessions, searchQuery, statusFilter, typeFilter]);

  const handleDeleteConfirm = async () => {
    if (!deleteModal.session) return;
    try {
      await deleteMutation.mutateAsync(deleteModal.session.id);
    } catch (error) {
      console.error('Delete failed:', error);
    }
    setDeleteModal({ open: false, session: null });
  };

  const formatDuration = (minutes?: number) => {
    if (!minutes) return '';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return \`\${mins}m\`;
    return \`\${hours}h \${mins}m\`;
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
    return date.toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className={cn('flex items-center justify-center py-12', className)}>
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <>
      <div className={cn('space-y-4', className)}>
        {/* Header */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Sessions</h2>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search sessions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 w-64"
              />
            </div>

            ${showFilters ? `<select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
            >
              <option value="">All Status</option>
              <option value="scheduled">Scheduled</option>
              <option value="live">Live</option>
              <option value="ended">Ended</option>
              <option value="cancelled">Cancelled</option>
            </select>

            {sessionTypes.length > 0 && (
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
              >
                <option value="">All Types</option>
                {sessionTypes.map((type: string) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            )}` : ''}

            <button
              onClick={() => navigate('/${tableName}/new')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              New Session
            </button>
          </div>
        </div>

        {/* Sessions Grid */}
        {filteredSessions.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
            <Video className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No sessions found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSessions.map((session: Session) => (
              <div
                key={session.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3
                        onClick={() => onSessionClick?.(session) || navigate(\`/${tableName}/\${session.id}\`)}
                        className="font-semibold text-gray-900 dark:text-white truncate cursor-pointer hover:text-blue-600"
                      >
                        {session.title}
                      </h3>
                      {session.type && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">{session.type}</span>
                      )}
                    </div>
                    ${showStatus ? `<span className={cn('inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium rounded-full', STATUS_STYLES[session.status]?.bg)}>
                      <span className={cn('w-1.5 h-1.5 rounded-full', STATUS_STYLES[session.status]?.dot)} />
                      {session.status}
                    </span>` : ''}
                  </div>

                  {session.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                      {session.description}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400 mb-3">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {formatDate(session.startTime)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {formatTime(session.startTime)}
                    </span>
                    {session.duration && (
                      <span>{formatDuration(session.duration)}</span>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                    ${showHost ? `<div className="flex items-center gap-2">
                      {session.hostAvatar ? (
                        <img
                          src={session.hostAvatar}
                          alt={session.hostName}
                          className="w-6 h-6 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                          <Users className="w-3 h-3 text-gray-500" />
                        </div>
                      )}
                      <span className="text-sm text-gray-600 dark:text-gray-400 truncate">
                        {session.hostName || 'Host'}
                      </span>
                    </div>` : '<div />'}

                    ${showParticipants ? `<div className="flex items-center gap-1 text-sm text-gray-500">
                      <Users className="w-4 h-4" />
                      {session.participantCount || 0}
                      {session.maxParticipants && \`/\${session.maxParticipants}\`}
                    </div>` : ''}
                  </div>
                </div>

                {/* Actions */}
                <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                  {session.status === 'live' ? (
                    <button
                      onClick={() => onJoin?.(session) || (session.meetingUrl && window.open(session.meetingUrl, '_blank'))}
                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700"
                    >
                      <Play className="w-4 h-4" />
                      Join Now
                    </button>
                  ) : session.status === 'ended' && session.isRecorded ? (
                    <button
                      onClick={() => session.recordingUrl && window.open(session.recordingUrl, '_blank')}
                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                    >
                      <Video className="w-4 h-4" />
                      Watch Recording
                    </button>
                  ) : session.status === 'scheduled' ? (
                    <span className="text-sm text-gray-500">Starts {formatDate(session.startTime)}</span>
                  ) : (
                    <span className="text-sm text-gray-500 capitalize">{session.status}</span>
                  )}

                  ${showActions ? `<div className="relative">
                    <button
                      onClick={() => setOpenMenu(openMenu === session.id ? null : session.id)}
                      className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg"
                    >
                      <MoreVertical className="w-4 h-4 text-gray-500" />
                    </button>
                    {openMenu === session.id && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setOpenMenu(null)} />
                        <div className="absolute right-0 bottom-full mb-2 z-20 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1">
                          <button
                            onClick={() => { navigate(\`/${tableName}/\${session.id}\`); setOpenMenu(null); }}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                          >
                            <Eye className="w-4 h-4" /> View
                          </button>
                          <button
                            onClick={() => { navigate(\`/${tableName}/\${session.id}/edit\`); setOpenMenu(null); }}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                          >
                            <Edit className="w-4 h-4" /> Edit
                          </button>
                          <button
                            onClick={() => { setDeleteModal({ open: true, session }); setOpenMenu(null); }}
                            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                          >
                            <Trash2 className="w-4 h-4" /> Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>` : ''}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Modal */}
      {deleteModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setDeleteModal({ open: false, session: null })} />
          <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Delete Session</h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  Are you sure you want to delete this session?
                </p>
              </div>
              <button onClick={() => setDeleteModal({ open: false, session: null })} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteModal({ open: false, session: null })} className="px-4 py-2 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                Cancel
              </button>
              <button onClick={handleDeleteConfirm} disabled={deleteMutation.isPending} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50">
                {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ${componentName};
`;
}

/**
 * Generate a SessionListActive component
 */
export function generateSessionListActive(options: SessionListActiveOptions = {}): string {
  const {
    componentName = 'SessionListActive',
    entity = 'session',
    showJoinButton = true,
    showParticipantCount = true,
    showDuration = true,
    maxItems = 5,
  } = options;

  const tableName = snakeCase(pluralize.plural(entity));
  const endpoint = options.endpoint || `/${tableName}/active`;
  const queryKey = options.queryKey || `${tableName}-active`;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Play,
  Users,
  Clock,
  Video,
  Wifi,
  WifiOff,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

interface ActiveSession {
  id: string;
  title: string;
  hostName?: string;
  hostAvatar?: string;
  participantCount?: number;
  maxParticipants?: number;
  startedAt: string;
  duration?: number;
  meetingUrl?: string;
  thumbnailUrl?: string;
  category?: string;
}

interface ${componentName}Props {
  sessions?: ActiveSession[];
  className?: string;
  onJoin?: (session: ActiveSession) => void;
  onViewAll?: () => void;
  title?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  sessions: propSessions,
  className,
  onJoin,
  onViewAll,
  title = 'Live Now',
}) => {
  const navigate = useNavigate();

  const { data: fetchedSessions, isLoading, error } = useQuery({
    queryKey: ['${queryKey}'],
    queryFn: async () => {
      try {
        const response = await api.get<any>('${endpoint}');
        return Array.isArray(response) ? response : (response?.data || []);
      } catch (err) {
        console.error('Failed to fetch active sessions:', err);
        return [];
      }
    },
    enabled: !propSessions,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const sessions = (propSessions || fetchedSessions || []).slice(0, ${maxItems});

  const formatDuration = (startedAt: string) => {
    const start = new Date(startedAt);
    const now = new Date();
    const diffMs = now.getTime() - start.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 60) return \`\${diffMins}m\`;
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return \`\${hours}h \${mins}m\`;
  };

  const handleJoin = (session: ActiveSession) => {
    if (onJoin) {
      onJoin(session);
    } else if (session.meetingUrl) {
      window.open(session.meetingUrl, '_blank');
    } else {
      navigate(\`/${tableName}/\${session.id}\`);
    }
  };

  if (isLoading) {
    return (
      <div className={cn('bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6', className)}>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  if (error || sessions.length === 0) {
    return (
      <div className={cn('bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6', className)}>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-3 h-3 bg-gray-400 rounded-full" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
        </div>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <WifiOff className="w-12 h-12 text-gray-400 mb-3" />
          <p className="text-gray-500 dark:text-gray-400">No active sessions right now</p>
          <p className="text-sm text-gray-400 mt-1">Check back later or browse scheduled sessions</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700', className)}>
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
            <span className="px-2 py-0.5 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 text-xs font-medium rounded-full">
              {sessions.length} Live
            </span>
          </div>
          {onViewAll && (
            <button
              onClick={onViewAll}
              className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
            >
              View All
            </button>
          )}
        </div>
      </div>

      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {sessions.map((session: ActiveSession) => (
          <div
            key={session.id}
            className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
          >
            <div className="flex items-start gap-4">
              {/* Thumbnail */}
              <div className="flex-shrink-0 relative">
                {session.thumbnailUrl ? (
                  <img
                    src={session.thumbnailUrl}
                    alt={session.title}
                    className="w-24 h-16 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-24 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                    <Video className="w-8 h-8 text-gray-400" />
                  </div>
                )}
                <div className="absolute top-1 left-1 px-1.5 py-0.5 bg-red-600 text-white text-xs font-medium rounded">
                  LIVE
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900 dark:text-white truncate">
                  {session.title}
                </h4>

                <div className="flex items-center gap-2 mt-1">
                  {session.hostAvatar ? (
                    <img
                      src={session.hostAvatar}
                      alt={session.hostName}
                      className="w-5 h-5 rounded-full object-cover"
                    />
                  ) : null}
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {session.hostName || 'Host'}
                  </span>
                </div>

                <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                  ${showParticipantCount ? `<span className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {session.participantCount || 0} watching
                  </span>` : ''}
                  ${showDuration ? `<span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDuration(session.startedAt)}
                  </span>` : ''}
                  {session.category && (
                    <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">
                      {session.category}
                    </span>
                  )}
                </div>
              </div>

              ${showJoinButton ? `{/* Join Button */}
              <button
                onClick={() => handleJoin(session)}
                className="flex-shrink-0 inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
              >
                <Play className="w-4 h-4" />
                Join
              </button>` : ''}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

/**
 * Generate session components for a specific domain
 */
export function generateSessionComponents(domain: string): { list: string; active: string } {
  const pascalDomain = pascalCase(domain);

  return {
    list: generateSessionList({
      componentName: `${pascalDomain}SessionList`,
      entity: `${domain}Session`,
    }),
    active: generateSessionListActive({
      componentName: `${pascalDomain}SessionListActive`,
      entity: `${domain}Session`,
    }),
  };
}
