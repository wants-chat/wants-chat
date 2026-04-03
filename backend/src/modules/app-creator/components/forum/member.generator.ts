/**
 * Forum Member Component Generators
 */

export interface MemberOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateMemberList(options: MemberOptions = {}): string {
  const { componentName = 'MemberList', endpoint = '/forum/members' } = options;

  return `import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Loader2, Search, User, MessageSquare, Award, Calendar } from 'lucide-react';
import { api } from '@/lib/api';

const ${componentName}: React.FC = () => {
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('active');

  const { data: members, isLoading } = useQuery({
    queryKey: ['members', sort],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}?sort=' + sort);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const filteredMembers = members?.filter((m: any) =>
    m.name?.toLowerCase().includes(search.toLowerCase()) ||
    m.username?.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search members..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent"
          />
        </div>
        <div className="flex gap-2">
          {['active', 'posts', 'joined'].map((s) => (
            <button
              key={s}
              onClick={() => setSort(s)}
              className={\`px-4 py-2 rounded-lg text-sm font-medium transition-colors \${
                sort === s
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }\`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMembers && filteredMembers.length > 0 ? (
          filteredMembers.map((member: any) => (
            <Link
              key={member.id}
              to={\`/forum/member/\${member.username || member.id}\`}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center gap-4">
                {member.avatar_url ? (
                  <img src={member.avatar_url} alt="" className="w-14 h-14 rounded-full" />
                ) : (
                  <div className="w-14 h-14 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                    <User className="w-7 h-7 text-purple-600" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 dark:text-white truncate">{member.name || member.username}</h3>
                  <p className="text-sm text-gray-500">@{member.username}</p>
                  {member.role && (
                    <span className="inline-block px-2 py-0.5 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 rounded text-xs mt-1">
                      {member.role}
                    </span>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-4 text-center text-sm">
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">{member.post_count || 0}</p>
                  <p className="text-xs text-gray-500">Posts</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">{member.like_count || 0}</p>
                  <p className="text-xs text-gray-500">Likes</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">{member.reputation || 0}</p>
                  <p className="text-xs text-gray-500">Rep</p>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="col-span-full text-center py-12 text-gray-500">
            <User className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            No members found
          </div>
        )}
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

export function generateMemberProfile(options: MemberOptions = {}): string {
  const { componentName = 'MemberProfile', endpoint = '/forum/members' } = options;

  return `import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Loader2, User, Calendar, MessageSquare, Award, MapPin, Globe, Mail, ArrowLeft } from 'lucide-react';
import { api } from '@/lib/api';

const ${componentName}: React.FC = () => {
  const { memberId } = useParams<{ memberId: string }>();

  const { data: member, isLoading } = useQuery({
    queryKey: ['member', memberId],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}/' + memberId);
      return response?.data || response;
    },
  });

  const { data: recentPosts } = useQuery({
    queryKey: ['member-posts', memberId],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}/' + memberId + '/posts?limit=5');
      return Array.isArray(response) ? response : (response?.data || []);
    },
    enabled: !!member,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!member) {
    return <div className="text-center py-12 text-gray-500">Member not found</div>;
  }

  return (
    <div className="space-y-6">
      <Link to="/forum/members" className="flex items-center gap-2 text-gray-500 hover:text-gray-700">
        <ArrowLeft className="w-4 h-4" />
        Back to Members
      </Link>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-purple-500 to-pink-500" />
        <div className="px-6 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12">
            {member.avatar_url ? (
              <img src={member.avatar_url} alt="" className="w-24 h-24 rounded-full border-4 border-white dark:border-gray-800" />
            ) : (
              <div className="w-24 h-24 bg-purple-100 dark:bg-purple-900/30 rounded-full border-4 border-white dark:border-gray-800 flex items-center justify-center">
                <User className="w-12 h-12 text-purple-600" />
              </div>
            )}
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{member.name || member.username}</h1>
              <p className="text-gray-500">@{member.username}</p>
            </div>
            {member.role && (
              <span className="px-3 py-1 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 rounded-full text-sm font-medium">
                {member.role}
              </span>
            )}
          </div>

          {member.bio && (
            <p className="mt-4 text-gray-600 dark:text-gray-400">{member.bio}</p>
          )}

          <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-500">
            {member.location && (
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {member.location}
              </span>
            )}
            {member.website && (
              <a href={member.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-purple-600 hover:text-purple-700">
                <Globe className="w-4 h-4" />
                Website
              </a>
            )}
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              Joined {new Date(member.created_at).toLocaleDateString()}
            </span>
          </div>

          <div className="grid grid-cols-4 gap-4 mt-6 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{member.post_count || 0}</p>
              <p className="text-sm text-gray-500">Posts</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{member.thread_count || 0}</p>
              <p className="text-sm text-gray-500">Threads</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{member.like_count || 0}</p>
              <p className="text-sm text-gray-500">Likes</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{member.reputation || 0}</p>
              <p className="text-sm text-gray-500">Reputation</p>
            </div>
          </div>
        </div>
      </div>

      {member.badges && member.badges.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Award className="w-5 h-5" />
            Badges
          </h2>
          <div className="flex flex-wrap gap-2">
            {member.badges.map((badge: any) => (
              <span key={badge.id} className="px-3 py-1 bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 rounded-full text-sm">
                {badge.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {recentPosts && recentPosts.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Recent Activity
          </h2>
          <div className="space-y-3">
            {recentPosts.map((post: any) => (
              <Link
                key={post.id}
                to={\`/forum/thread/\${post.thread_id}\`}
                className="block p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors"
              >
                <p className="text-gray-900 dark:text-white font-medium truncate">{post.thread_title}</p>
                <p className="text-sm text-gray-500 line-clamp-1">{post.content}</p>
                <p className="text-xs text-gray-400 mt-1">{new Date(post.created_at).toLocaleString()}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ${componentName};
`;
}

export function generateLeaderboard(options: MemberOptions = {}): string {
  const { componentName = 'Leaderboard', endpoint = '/forum/leaderboard' } = options;

  return `import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Loader2, Trophy, Medal, Award, User, TrendingUp } from 'lucide-react';
import { api } from '@/lib/api';

const ${componentName}: React.FC = () => {
  const [period, setPeriod] = useState<'week' | 'month' | 'all'>('month');

  const { data: leaderboard, isLoading } = useQuery({
    queryKey: ['leaderboard', period],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}?period=' + period);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Medal className="w-6 h-6 text-amber-600" />;
      default:
        return <span className="w-6 text-center font-bold text-gray-500">{rank}</span>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Leaderboard
        </h2>
        <div className="flex gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          {(['week', 'month', 'all'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={\`px-3 py-1 rounded-md text-sm font-medium transition-colors \${
                period === p
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }\`}
            >
              {p === 'all' ? 'All Time' : p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {leaderboard && leaderboard.length > 0 ? (
          leaderboard.map((member: any, index: number) => (
            <Link
              key={member.id}
              to={\`/forum/member/\${member.username || member.id}\`}
              className={\`flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors \${
                index < 3 ? 'bg-gradient-to-r from-transparent to-yellow-50/30 dark:to-yellow-900/10' : ''
              }\`}
            >
              <div className="w-8 flex justify-center">{getRankIcon(index + 1)}</div>
              {member.avatar_url ? (
                <img src={member.avatar_url} alt="" className="w-10 h-10 rounded-full" />
              ) : (
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-purple-600" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 dark:text-white truncate">{member.name || member.username}</p>
                <p className="text-sm text-gray-500">@{member.username}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-gray-900 dark:text-white">{member.points || member.reputation || 0}</p>
                <p className="text-xs text-gray-500">points</p>
              </div>
            </Link>
          ))
        ) : (
          <div className="p-8 text-center text-gray-500">No data available</div>
        )}
      </div>
    </div>
  );
};

export default ${componentName};
`;
}
