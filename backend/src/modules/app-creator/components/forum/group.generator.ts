/**
 * Forum Group Component Generators
 */

export interface GroupOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateGroupMembers(options: GroupOptions = {}): string {
  const { componentName = 'GroupMembers', endpoint = '/forum/groups' } = options;

  return `import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import {
  Loader2, Search, User, Users, UserPlus, UserMinus, Crown,
  Shield, MoreVertical, Mail, Ban, Clock, ChevronDown, Filter,
  Check, X
} from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface GroupMember {
  id: string;
  user_id: string;
  name?: string;
  username: string;
  avatar_url?: string;
  role: 'owner' | 'admin' | 'moderator' | 'member';
  joined_at: string;
  last_active?: string;
  is_online?: boolean;
  post_count?: number;
  reputation?: number;
}

interface Group {
  id: string;
  name: string;
  member_count: number;
  is_admin?: boolean;
}

interface ${componentName}Props {
  groupId?: string;
  showRoleManagement?: boolean;
  maxItems?: number;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  groupId,
  showRoleManagement = false,
  maxItems,
}) => {
  const params = useParams<{ groupId: string }>();
  const activeGroupId = groupId || params.groupId;
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'name' | 'role'>('recent');
  const [selectedMember, setSelectedMember] = useState<string | null>(null);

  const { data: group } = useQuery({
    queryKey: ['group', activeGroupId],
    queryFn: async () => {
      const response = await api.get<Group>('${endpoint}/' + activeGroupId);
      return response?.data || response;
    },
    enabled: !!activeGroupId,
  });

  const { data: members, isLoading } = useQuery({
    queryKey: ['group-members', activeGroupId, roleFilter, sortBy],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (roleFilter !== 'all') params.set('role', roleFilter);
      params.set('sort', sortBy);
      if (maxItems) params.set('limit', maxItems.toString());

      const response = await api.get<GroupMember[]>(
        '${endpoint}/' + activeGroupId + '/members?' + params.toString()
      );
      return Array.isArray(response) ? response : (response?.data || []);
    },
    enabled: !!activeGroupId,
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ memberId, role }: { memberId: string; role: string }) =>
      api.put('${endpoint}/' + activeGroupId + '/members/' + memberId, { role }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group-members', activeGroupId] });
      toast.success('Role updated');
      setSelectedMember(null);
    },
    onError: () => toast.error('Failed to update role'),
  });

  const removeMemberMutation = useMutation({
    mutationFn: (memberId: string) =>
      api.delete('${endpoint}/' + activeGroupId + '/members/' + memberId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group-members', activeGroupId] });
      queryClient.invalidateQueries({ queryKey: ['group', activeGroupId] });
      toast.success('Member removed');
    },
    onError: () => toast.error('Failed to remove member'),
  });

  const getRoleIcon = (role: GroupMember['role']) => {
    switch (role) {
      case 'owner':
        return <Crown className="w-4 h-4 text-yellow-500" />;
      case 'admin':
        return <Shield className="w-4 h-4 text-red-500" />;
      case 'moderator':
        return <Shield className="w-4 h-4 text-blue-500" />;
      default:
        return null;
    }
  };

  const getRoleBadgeStyles = (role: GroupMember['role']) => {
    switch (role) {
      case 'owner':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'admin':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'moderator':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400';
    }
  };

  const filteredMembers = members?.filter(
    (m) =>
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
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Users className="w-5 h-5" />
            Members
            {group && (
              <span className="text-sm font-normal text-gray-500">
                ({group.member_count})
              </span>
            )}
          </h2>

          {showRoleManagement && group?.is_admin && (
            <button className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700">
              <UserPlus className="w-4 h-4" />
              Invite
            </button>
          )}
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search members..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent text-sm"
            />
          </div>

          <div className="flex gap-2">
            {/* Role Filter */}
            <div className="relative">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="appearance-none pl-3 pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent text-sm cursor-pointer"
              >
                <option value="all">All Roles</option>
                <option value="owner">Owners</option>
                <option value="admin">Admins</option>
                <option value="moderator">Moderators</option>
                <option value="member">Members</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>

            {/* Sort */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="appearance-none pl-3 pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent text-sm cursor-pointer"
              >
                <option value="recent">Recently Joined</option>
                <option value="name">Name</option>
                <option value="role">Role</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Members List */}
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {filteredMembers && filteredMembers.length > 0 ? (
          filteredMembers.map((member) => (
            <div
              key={member.id}
              className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              {/* Avatar */}
              <Link
                to={\`/forum/member/\${member.username || member.user_id}\`}
                className="relative flex-shrink-0"
              >
                {member.avatar_url ? (
                  <img
                    src={member.avatar_url}
                    alt=""
                    className="w-12 h-12 rounded-full"
                  />
                ) : (
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-purple-600" />
                  </div>
                )}
                {member.is_online && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full" />
                )}
              </Link>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Link
                    to={\`/forum/member/\${member.username || member.user_id}\`}
                    className="font-medium text-gray-900 dark:text-white hover:text-purple-600 truncate"
                  >
                    {member.name || member.username}
                  </Link>
                  {getRoleIcon(member.role)}
                  <span
                    className={\`px-2 py-0.5 rounded text-xs font-medium capitalize \${getRoleBadgeStyles(member.role)}\`}
                  >
                    {member.role}
                  </span>
                </div>
                <p className="text-sm text-gray-500">@{member.username}</p>
                <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Joined {new Date(member.joined_at).toLocaleDateString()}
                  </span>
                  {member.post_count !== undefined && (
                    <span>{member.post_count} posts</span>
                  )}
                </div>
              </div>

              {/* Actions */}
              {showRoleManagement && group?.is_admin && member.role !== 'owner' && (
                <div className="relative">
                  <button
                    onClick={() =>
                      setSelectedMember(selectedMember === member.id ? null : member.id)
                    }
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                  >
                    <MoreVertical className="w-5 h-5 text-gray-500" />
                  </button>

                  {selectedMember === member.id && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setSelectedMember(null)}
                      />
                      <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
                        <div className="py-1">
                          <p className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">
                            Change Role
                          </p>
                          {['admin', 'moderator', 'member'].map((role) => (
                            <button
                              key={role}
                              onClick={() =>
                                updateRoleMutation.mutate({
                                  memberId: member.id,
                                  role,
                                })
                              }
                              className={\`flex items-center justify-between w-full px-4 py-2 text-sm text-left hover:bg-gray-50 dark:hover:bg-gray-700 capitalize \${
                                member.role === role
                                  ? 'text-purple-600 bg-purple-50 dark:bg-purple-900/20'
                                  : 'text-gray-700 dark:text-gray-300'
                              }\`}
                            >
                              {role}
                              {member.role === role && (
                                <Check className="w-4 h-4" />
                              )}
                            </button>
                          ))}
                        </div>
                        <div className="border-t border-gray-200 dark:border-gray-700 py-1">
                          <button
                            onClick={() => {
                              if (confirm('Remove this member from the group?')) {
                                removeMemberMutation.mutate(member.id);
                              }
                            }}
                            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                          >
                            <Ban className="w-4 h-4" />
                            Remove from group
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {!showRoleManagement && (
                <Link
                  to={\`/forum/member/\${member.username || member.user_id}\`}
                  className="text-sm text-purple-600 hover:text-purple-700"
                >
                  View Profile
                </Link>
              )}
            </div>
          ))
        ) : (
          <div className="py-12 text-center text-gray-500">
            <Users className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
            <p>No members found</p>
          </div>
        )}
      </div>

      {/* Load More */}
      {maxItems && members && members.length >= maxItems && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 text-center">
          <Link
            to={\`/forum/group/\${activeGroupId}/members\`}
            className="text-sm text-purple-600 hover:text-purple-700 font-medium"
          >
            View all members
          </Link>
        </div>
      )}
    </div>
  );
};

export default ${componentName};
`;
}

export function generateGroupCard(options: GroupOptions = {}): string {
  const { componentName = 'GroupCard' } = options;

  return `import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Lock, Globe, MessageSquare, Calendar } from 'lucide-react';

interface Group {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  cover_url?: string;
  icon_url?: string;
  color?: string;
  member_count: number;
  post_count: number;
  is_private: boolean;
  is_member?: boolean;
  created_at: string;
}

interface ${componentName}Props {
  group: Group;
  variant?: 'default' | 'compact';
}

const ${componentName}: React.FC<${componentName}Props> = ({ group, variant = 'default' }) => {
  if (variant === 'compact') {
    return (
      <Link
        to={\`/forum/group/\${group.slug || group.id}\`}
        className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 transition-colors"
      >
        {group.icon_url ? (
          <img src={group.icon_url} alt="" className="w-10 h-10 rounded-lg object-cover" />
        ) : (
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: (group.color || '#8B5CF6') + '20' }}
          >
            <Users className="w-5 h-5" style={{ color: group.color || '#8B5CF6' }} />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-gray-900 dark:text-white truncate">
              {group.name}
            </h3>
            {group.is_private ? (
              <Lock className="w-3 h-3 text-gray-400" />
            ) : (
              <Globe className="w-3 h-3 text-gray-400" />
            )}
          </div>
          <p className="text-sm text-gray-500">{group.member_count} members</p>
        </div>
        {group.is_member && (
          <span className="px-2 py-0.5 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded text-xs">
            Joined
          </span>
        )}
      </Link>
    );
  }

  return (
    <Link
      to={\`/forum/group/\${group.slug || group.id}\`}
      className="block bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow"
    >
      {/* Cover */}
      <div
        className="h-24 bg-gradient-to-r from-purple-500 to-pink-500"
        style={group.cover_url ? { backgroundImage: \`url(\${group.cover_url})\`, backgroundSize: 'cover' } : undefined}
      />

      <div className="p-4 -mt-8">
        {/* Icon */}
        <div className="flex items-end gap-3 mb-3">
          {group.icon_url ? (
            <img
              src={group.icon_url}
              alt=""
              className="w-16 h-16 rounded-xl object-cover border-4 border-white dark:border-gray-800 shadow-lg"
            />
          ) : (
            <div
              className="w-16 h-16 rounded-xl flex items-center justify-center border-4 border-white dark:border-gray-800 shadow-lg"
              style={{ backgroundColor: group.color || '#8B5CF6' }}
            >
              <Users className="w-8 h-8 text-white" />
            </div>
          )}
          {group.is_member && (
            <span className="px-2 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-lg text-xs font-medium">
              Member
            </span>
          )}
        </div>

        {/* Info */}
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-semibold text-gray-900 dark:text-white">{group.name}</h3>
          {group.is_private ? (
            <Lock className="w-4 h-4 text-gray-400" />
          ) : (
            <Globe className="w-4 h-4 text-gray-400" />
          )}
        </div>

        {group.description && (
          <p className="text-sm text-gray-500 line-clamp-2 mb-3">{group.description}</p>
        )}

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            {group.member_count.toLocaleString()}
          </span>
          <span className="flex items-center gap-1">
            <MessageSquare className="w-4 h-4" />
            {group.post_count.toLocaleString()}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            {new Date(group.created_at).toLocaleDateString()}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default ${componentName};
`;
}

export function generateGroupList(options: GroupOptions = {}): string {
  const { componentName = 'GroupList', endpoint = '/forum/groups' } = options;

  return `import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  Loader2, Search, Users, Plus, Lock, Globe,
  MessageSquare, Filter, Grid, List
} from 'lucide-react';
import { api } from '@/lib/api';

interface Group {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  cover_url?: string;
  icon_url?: string;
  color?: string;
  member_count: number;
  post_count: number;
  is_private: boolean;
  is_member?: boolean;
  created_at: string;
}

interface ${componentName}Props {
  filter?: 'all' | 'my-groups' | 'discover';
}

const ${componentName}: React.FC<${componentName}Props> = ({ filter = 'all' }) => {
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'popular' | 'recent' | 'name'>('popular');

  const { data: groups, isLoading } = useQuery({
    queryKey: ['groups', filter, sortBy],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set('filter', filter);
      params.set('sort', sortBy);

      const response = await api.get<Group[]>('${endpoint}?' + params.toString());
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const filteredGroups = groups?.filter(
    (g) =>
      g.name.toLowerCase().includes(search.toLowerCase()) ||
      g.description?.toLowerCase().includes(search.toLowerCase())
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search groups..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent"
          />
        </div>

        <div className="flex gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent text-sm"
          >
            <option value="popular">Most Popular</option>
            <option value="recent">Recently Created</option>
            <option value="name">Name A-Z</option>
          </select>

          <div className="flex border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={\`p-2 \${viewMode === 'grid' ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'}\`}
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={\`p-2 \${viewMode === 'list' ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'}\`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>

          <Link
            to="/forum/groups/create"
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            <Plus className="w-4 h-4" />
            Create
          </Link>
        </div>
      </div>

      {/* Groups */}
      {filteredGroups && filteredGroups.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredGroups.map((group) => (
              <Link
                key={group.id}
                to={\`/forum/group/\${group.slug || group.id}\`}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div
                  className="h-20 bg-gradient-to-r from-purple-500 to-pink-500"
                  style={group.cover_url ? { backgroundImage: \`url(\${group.cover_url})\`, backgroundSize: 'cover' } : undefined}
                />
                <div className="p-4 -mt-6">
                  {group.icon_url ? (
                    <img
                      src={group.icon_url}
                      alt=""
                      className="w-12 h-12 rounded-xl object-cover border-2 border-white dark:border-gray-800 shadow"
                    />
                  ) : (
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center border-2 border-white dark:border-gray-800 shadow"
                      style={{ backgroundColor: group.color || '#8B5CF6' }}
                    >
                      <Users className="w-6 h-6 text-white" />
                    </div>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                      {group.name}
                    </h3>
                    {group.is_private ? (
                      <Lock className="w-4 h-4 text-gray-400" />
                    ) : (
                      <Globe className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                  {group.description && (
                    <p className="text-sm text-gray-500 line-clamp-2 mt-1">
                      {group.description}
                    </p>
                  )}
                  <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {group.member_count}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" />
                      {group.post_count}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 divide-y divide-gray-200 dark:divide-gray-700">
            {filteredGroups.map((group) => (
              <Link
                key={group.id}
                to={\`/forum/group/\${group.slug || group.id}\`}
                className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                {group.icon_url ? (
                  <img src={group.icon_url} alt="" className="w-14 h-14 rounded-xl object-cover" />
                ) : (
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: group.color || '#8B5CF6' }}
                  >
                    <Users className="w-7 h-7 text-white" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {group.name}
                    </h3>
                    {group.is_private ? (
                      <Lock className="w-4 h-4 text-gray-400" />
                    ) : (
                      <Globe className="w-4 h-4 text-gray-400" />
                    )}
                    {group.is_member && (
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded text-xs">
                        Joined
                      </span>
                    )}
                  </div>
                  {group.description && (
                    <p className="text-sm text-gray-500 line-clamp-1 mt-0.5">
                      {group.description}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-6 text-sm text-gray-500">
                  <div className="text-center">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {group.member_count}
                    </p>
                    <p className="text-xs">Members</p>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {group.post_count}
                    </p>
                    <p className="text-xs">Posts</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )
      ) : (
        <div className="text-center py-12 text-gray-500">
          <Users className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No groups found
          </h3>
          <p>Create a group or adjust your search filters</p>
        </div>
      )}
    </div>
  );
};

export default ${componentName};
`;
}
