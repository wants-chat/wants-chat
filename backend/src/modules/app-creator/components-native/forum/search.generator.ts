/**
 * Forum Search Component Generators (React Native)
 *
 * Generates search filters, search results, and member search components for React Native.
 */

export interface SearchOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateSearchFilters(options: SearchOptions = {}): string {
  const { componentName = 'SearchFilters' } = options;

  return `import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface FilterState {
  type: 'all' | 'threads' | 'posts' | 'members';
  category?: string;
  author?: string;
  tags: string[];
  dateRange: 'any' | 'today' | 'week' | 'month' | 'year';
  sortBy: 'relevance' | 'date' | 'replies' | 'views';
}

interface Category {
  id: string;
  name: string;
  slug?: string;
}

interface ${componentName}Props {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  categories?: Category[];
  onClear?: () => void;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  filters,
  onChange,
  categories = [],
  onClear,
}) => {
  const [expanded, setExpanded] = useState(false);

  const typeOptions = [
    { value: 'all', label: 'All', icon: 'funnel-outline' },
    { value: 'threads', label: 'Threads', icon: 'chatbubbles-outline' },
    { value: 'posts', label: 'Posts', icon: 'document-text-outline' },
    { value: 'members', label: 'Members', icon: 'people-outline' },
  ] as const;

  const dateOptions = [
    { value: 'any', label: 'Any time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This week' },
    { value: 'month', label: 'This month' },
    { value: 'year', label: 'This year' },
  ] as const;

  const sortOptions = [
    { value: 'relevance', label: 'Most relevant' },
    { value: 'date', label: 'Most recent' },
    { value: 'replies', label: 'Most replies' },
    { value: 'views', label: 'Most views' },
  ] as const;

  const hasActiveFilters =
    filters.type !== 'all' ||
    filters.category ||
    filters.author ||
    filters.tags.length > 0 ||
    filters.dateRange !== 'any';

  const removeTag = (tag: string) => {
    onChange({ ...filters, tags: filters.tags.filter((t) => t !== tag) });
  };

  return (
    <View style={styles.container}>
      {/* Type Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.typeFilters}
        contentContainerStyle={styles.typeFiltersContent}
      >
        {typeOptions.map(({ value, label, icon }) => (
          <TouchableOpacity
            key={value}
            style={[styles.typeButton, filters.type === value && styles.typeButtonActive]}
            onPress={() => onChange({ ...filters, type: value })}
          >
            <Ionicons
              name={icon as any}
              size={16}
              color={filters.type === value ? '#FFFFFF' : '#6B7280'}
            />
            <Text
              style={[
                styles.typeButtonText,
                filters.type === value && styles.typeButtonTextActive,
              ]}
            >
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Advanced Filters Toggle */}
      <TouchableOpacity
        style={styles.advancedToggle}
        onPress={() => setExpanded(!expanded)}
      >
        <View style={styles.advancedToggleContent}>
          <Ionicons name="options-outline" size={18} color="#6B7280" />
          <Text style={styles.advancedToggleText}>Advanced Filters</Text>
          {hasActiveFilters && <View style={styles.activeDot} />}
        </View>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={18}
          color="#6B7280"
        />
      </TouchableOpacity>

      {/* Expanded Filters */}
      {expanded && (
        <View style={styles.expandedFilters}>
          {/* Date Range */}
          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Date Range</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.optionsScroll}
            >
              {dateOptions.map(({ value, label }) => (
                <TouchableOpacity
                  key={value}
                  style={[
                    styles.optionChip,
                    filters.dateRange === value && styles.optionChipActive,
                  ]}
                  onPress={() => onChange({ ...filters, dateRange: value })}
                >
                  <Text
                    style={[
                      styles.optionChipText,
                      filters.dateRange === value && styles.optionChipTextActive,
                    ]}
                  >
                    {label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Sort By */}
          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Sort By</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.optionsScroll}
            >
              {sortOptions.map(({ value, label }) => (
                <TouchableOpacity
                  key={value}
                  style={[
                    styles.optionChip,
                    filters.sortBy === value && styles.optionChipActive,
                  ]}
                  onPress={() => onChange({ ...filters, sortBy: value as FilterState['sortBy'] })}
                >
                  <Text
                    style={[
                      styles.optionChipText,
                      filters.sortBy === value && styles.optionChipTextActive,
                    ]}
                  >
                    {label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Author */}
          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Author</Text>
            <TextInput
              style={styles.filterInput}
              value={filters.author || ''}
              onChangeText={(text) => onChange({ ...filters, author: text || undefined })}
              placeholder="Filter by username"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* Active Tags */}
          {filters.tags.length > 0 && (
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Tags</Text>
              <View style={styles.tagsContainer}>
                {filters.tags.map((tag) => (
                  <View key={tag} style={styles.tagChip}>
                    <Ionicons name="pricetag" size={12} color="#8B5CF6" />
                    <Text style={styles.tagText}>{tag}</Text>
                    <TouchableOpacity onPress={() => removeTag(tag)}>
                      <Ionicons name="close" size={14} color="#8B5CF6" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Clear Filters */}
          {hasActiveFilters && onClear && (
            <TouchableOpacity style={styles.clearButton} onPress={onClear}>
              <Ionicons name="close-circle-outline" size={18} color="#EF4444" />
              <Text style={styles.clearButtonText}>Clear all filters</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  typeFilters: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  typeFiltersContent: {
    padding: 12,
    gap: 8,
  },
  typeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
  },
  typeButtonActive: {
    backgroundColor: '#8B5CF6',
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  typeButtonTextActive: {
    color: '#FFFFFF',
  },
  advancedToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  advancedToggleContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  advancedToggleText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#8B5CF6',
  },
  expandedFilters: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  filterSection: {
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  optionsScroll: {
    flexDirection: 'row',
  },
  optionChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
  },
  optionChipActive: {
    backgroundColor: '#EDE9FE',
  },
  optionChipText: {
    fontSize: 13,
    color: '#6B7280',
  },
  optionChipTextActive: {
    color: '#8B5CF6',
    fontWeight: '500',
  },
  filterInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#111827',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#EDE9FE',
    borderRadius: 16,
  },
  tagText: {
    fontSize: 13,
    color: '#8B5CF6',
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  clearButtonText: {
    fontSize: 14,
    color: '#EF4444',
  },
});

export default ${componentName};
`;
}

export function generateSearchResults(options: SearchOptions = {}): string {
  const { componentName = 'SearchResults', endpoint = '/forum/search' } = options;

  return `import React from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface SearchResult {
  id: string;
  type: 'thread' | 'post' | 'member';
  title?: string;
  content?: string;
  name?: string;
  username?: string;
  avatar_url?: string;
  thread_id?: string;
  thread_title?: string;
  category_name?: string;
  author_name?: string;
  created_at: string;
  reply_count?: number;
  view_count?: number;
  post_count?: number;
}

interface ${componentName}Props {
  query: string;
  filters?: {
    type?: string;
    category?: string;
    author?: string;
    dateRange?: string;
    sortBy?: string;
  };
}

const ${componentName}: React.FC<${componentName}Props> = ({ query, filters = {} }) => {
  const navigation = useNavigation<any>();

  const { data, isLoading } = useQuery({
    queryKey: ['search', query, filters],
    queryFn: async () => {
      const params = new URLSearchParams({ q: query, ...filters });
      const response = await api.get<any>('${endpoint}?' + params.toString());
      return response?.data || response;
    },
    enabled: query.length > 0,
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const results = data?.results || [];
  const total = data?.total || 0;

  const handleResultPress = (result: SearchResult) => {
    if (result.type === 'thread') {
      navigation.navigate('ThreadDetail', { threadId: result.id });
    } else if (result.type === 'post') {
      navigation.navigate('ThreadDetail', { threadId: result.thread_id });
    } else if (result.type === 'member') {
      navigation.navigate('MemberProfile', { memberId: result.username || result.id });
    }
  };

  const renderResult = ({ item: result }: { item: SearchResult }) => {
    if (result.type === 'thread') {
      return (
        <TouchableOpacity
          style={styles.resultCard}
          onPress={() => handleResultPress(result)}
          activeOpacity={0.7}
        >
          <View style={[styles.typeIcon, styles.threadIcon]}>
            <Ionicons name="chatbubbles-outline" size={20} color="#8B5CF6" />
          </View>
          <View style={styles.resultContent}>
            <View style={styles.typeLabel}>
              <Text style={styles.typeLabelText}>Thread</Text>
              {result.category_name && (
                <>
                  <Text style={styles.separator}>in</Text>
                  <Text style={styles.categoryText}>{result.category_name}</Text>
                </>
              )}
            </View>
            <Text style={styles.resultTitle} numberOfLines={2}>{result.title}</Text>
            <View style={styles.resultMeta}>
              <Text style={styles.metaText}>{result.author_name}</Text>
              <Text style={styles.metaSeparator}>-</Text>
              <Text style={styles.metaText}>{formatDate(result.created_at)}</Text>
              <Text style={styles.metaSeparator}>-</Text>
              <Text style={styles.metaText}>{result.reply_count || 0} replies</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </TouchableOpacity>
      );
    }

    if (result.type === 'post') {
      return (
        <TouchableOpacity
          style={styles.resultCard}
          onPress={() => handleResultPress(result)}
          activeOpacity={0.7}
        >
          <View style={[styles.typeIcon, styles.postIcon]}>
            <Ionicons name="document-text-outline" size={20} color="#3B82F6" />
          </View>
          <View style={styles.resultContent}>
            <View style={styles.typeLabel}>
              <Text style={[styles.typeLabelText, styles.postLabel]}>Post</Text>
              <Text style={styles.separator}>in</Text>
              <Text style={styles.threadTitleText} numberOfLines={1}>
                {result.thread_title}
              </Text>
            </View>
            <Text style={styles.resultContent} numberOfLines={2}>
              {result.content}
            </Text>
            <View style={styles.resultMeta}>
              <Text style={styles.metaText}>{result.author_name}</Text>
              <Text style={styles.metaSeparator}>-</Text>
              <Text style={styles.metaText}>{formatDate(result.created_at)}</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </TouchableOpacity>
      );
    }

    if (result.type === 'member') {
      return (
        <TouchableOpacity
          style={styles.resultCard}
          onPress={() => handleResultPress(result)}
          activeOpacity={0.7}
        >
          {result.avatar_url ? (
            <Image source={{ uri: result.avatar_url }} style={styles.memberAvatar} />
          ) : (
            <View style={styles.memberAvatarPlaceholder}>
              <Ionicons name="person" size={24} color="#8B5CF6" />
            </View>
          )}
          <View style={styles.resultContent}>
            <View style={styles.typeLabel}>
              <Text style={[styles.typeLabelText, styles.memberLabel]}>Member</Text>
            </View>
            <Text style={styles.memberName}>{result.name || result.username}</Text>
            <Text style={styles.memberUsername}>@{result.username}</Text>
          </View>
          <View style={styles.memberStats}>
            <Text style={styles.statValue}>{result.post_count || 0}</Text>
            <Text style={styles.statLabel}>posts</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </TouchableOpacity>
      );
    }

    return null;
  };

  if (!query) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="search-outline" size={64} color="#D1D5DB" />
        <Text style={styles.emptyTitle}>Start searching</Text>
        <Text style={styles.emptyText}>
          Enter a search term to find threads, posts, and members
        </Text>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B5CF6" />
      </View>
    );
  }

  if (results.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="search-outline" size={64} color="#D1D5DB" />
        <Text style={styles.emptyTitle}>No results found</Text>
        <Text style={styles.emptyText}>Try adjusting your search or filters</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.resultsCount}>
        Found <Text style={styles.countBold}>{total}</Text> results for "{query}"
      </Text>

      <FlatList
        data={results}
        renderItem={renderResult}
        keyExtractor={(item) => \`\${item.type}-\${item.id}\`}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
  },
  resultsCount: {
    fontSize: 14,
    color: '#6B7280',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  countBold: {
    fontWeight: '600',
    color: '#111827',
  },
  listContent: {
    paddingHorizontal: 16,
  },
  resultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  typeIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  threadIcon: {
    backgroundColor: '#EDE9FE',
  },
  postIcon: {
    backgroundColor: '#DBEAFE',
  },
  resultContent: {
    flex: 1,
  },
  typeLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  typeLabelText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#8B5CF6',
    textTransform: 'uppercase',
  },
  postLabel: {
    color: '#3B82F6',
  },
  memberLabel: {
    color: '#10B981',
  },
  separator: {
    height: 12,
  },
  categoryText: {
    fontSize: 11,
    color: '#6B7280',
  },
  threadTitleText: {
    fontSize: 11,
    color: '#6B7280',
    flex: 1,
  },
  resultTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  resultMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#6B7280',
  },
  metaSeparator: {
    fontSize: 12,
    color: '#D1D5DB',
  },
  memberAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  memberAvatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EDE9FE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  memberName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  memberUsername: {
    fontSize: 13,
    color: '#6B7280',
  },
  memberStats: {
    alignItems: 'flex-end',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  statLabel: {
    fontSize: 11,
    color: '#6B7280',
  },
});

export default ${componentName};
`;
}

export function generateMemberSearch(options: SearchOptions = {}): string {
  const { componentName = 'MemberSearch', endpoint = '/forum/members/search' } = options;

  return `import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface Member {
  id: string;
  name?: string;
  username: string;
  avatar_url?: string;
  role?: string;
  post_count: number;
  is_online?: boolean;
}

interface ${componentName}Props {
  onSelect?: (member: Member) => void;
  selectedIds?: string[];
  placeholder?: string;
  multiple?: boolean;
  maxSelections?: number;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  onSelect,
  selectedIds = [],
  placeholder = 'Search members...',
  multiple = false,
  maxSelections = 10,
}) => {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const { data: members, isLoading } = useQuery({
    queryKey: ['member-search', debouncedQuery, roleFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (debouncedQuery) params.set('q', debouncedQuery);
      if (roleFilter) params.set('role', roleFilter);
      params.set('limit', '20');

      const response = await api.get<Member[]>('${endpoint}?' + params.toString());
      return Array.isArray(response) ? response : (response?.data || []);
    },
    enabled: debouncedQuery.length >= 2,
  });

  const handleSelect = useCallback(
    (member: Member) => {
      if (multiple && selectedIds.length >= maxSelections && !selectedIds.includes(member.id)) {
        return;
      }
      onSelect?.(member);
    },
    [onSelect, multiple, selectedIds, maxSelections]
  );

  const isSelected = (memberId: string) => selectedIds.includes(memberId);

  const roles = ['admin', 'moderator', 'member', 'vip'];

  const renderMember = ({ item: member }: { item: Member }) => {
    const selected = isSelected(member.id);
    const disabled = multiple && selectedIds.length >= maxSelections && !selected;

    return (
      <TouchableOpacity
        style={[
          styles.memberItem,
          selected && styles.memberItemSelected,
          disabled && styles.memberItemDisabled,
        ]}
        onPress={() => !disabled && handleSelect(member)}
        disabled={disabled}
        activeOpacity={0.7}
      >
        <View style={styles.avatarContainer}>
          {member.avatar_url ? (
            <Image source={{ uri: member.avatar_url }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person" size={20} color="#8B5CF6" />
            </View>
          )}
          {member.is_online && <View style={styles.onlineIndicator} />}
        </View>

        <View style={styles.memberInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.memberName}>{member.name || member.username}</Text>
            {member.role && (
              <View style={styles.roleBadge}>
                <Text style={styles.roleBadgeText}>{member.role}</Text>
              </View>
            )}
          </View>
          <Text style={styles.memberUsername}>@{member.username}</Text>
        </View>

        <View style={styles.statsContainer}>
          <Text style={styles.statValue}>{member.post_count}</Text>
          <Text style={styles.statLabel}>posts</Text>
        </View>

        {selected && (
          <Ionicons name="checkmark-circle" size={24} color="#8B5CF6" />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Search Input */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          value={query}
          onChangeText={setQuery}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery('')}>
            <Ionicons name="close-circle" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        )}
      </View>

      {/* Role Filter */}
      {query.length >= 2 && (
        <View style={styles.roleFilterContainer}>
          <TouchableOpacity
            style={[styles.roleChip, !roleFilter && styles.roleChipActive]}
            onPress={() => setRoleFilter('')}
          >
            <Text style={[styles.roleChipText, !roleFilter && styles.roleChipTextActive]}>
              All
            </Text>
          </TouchableOpacity>
          {roles.map((role) => (
            <TouchableOpacity
              key={role}
              style={[styles.roleChip, roleFilter === role && styles.roleChipActive]}
              onPress={() => setRoleFilter(role)}
            >
              <Text
                style={[styles.roleChipText, roleFilter === role && styles.roleChipTextActive]}
              >
                {role.charAt(0).toUpperCase() + role.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Results */}
      {query.length >= 2 && (
        <>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#8B5CF6" />
            </View>
          ) : members && members.length > 0 ? (
            <FlatList
              data={members}
              renderItem={renderMember}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="person-outline" size={40} color="#D1D5DB" />
              <Text style={styles.emptyText}>No members found</Text>
            </View>
          )}

          {multiple && selectedIds.length > 0 && (
            <View style={styles.selectionInfo}>
              <Text style={styles.selectionText}>
                {selectedIds.length} of {maxSelections} selected
              </Text>
            </View>
          )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 12,
    marginHorizontal: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    color: '#111827',
  },
  roleFilterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    flexWrap: 'wrap',
  },
  roleChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
  },
  roleChipActive: {
    backgroundColor: '#EDE9FE',
  },
  roleChipText: {
    fontSize: 13,
    color: '#6B7280',
  },
  roleChipTextActive: {
    color: '#8B5CF6',
    fontWeight: '500',
  },
  loadingContainer: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  emptyContainer: {
    paddingVertical: 48,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 12,
  },
  listContent: {
    padding: 16,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  memberItemSelected: {
    backgroundColor: '#EDE9FE',
    borderColor: '#C4B5FD',
  },
  memberItemDisabled: {
    opacity: 0.5,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EDE9FE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#22C55E',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  memberInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  memberName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  roleBadge: {
    backgroundColor: '#EDE9FE',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  roleBadgeText: {
    fontSize: 11,
    color: '#8B5CF6',
    fontWeight: '500',
  },
  memberUsername: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  statsContainer: {
    alignItems: 'flex-end',
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  statLabel: {
    fontSize: 11,
    color: '#6B7280',
  },
  selectionInfo: {
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    alignItems: 'center',
  },
  selectionText: {
    fontSize: 13,
    color: '#6B7280',
  },
});

export default ${componentName};
`;
}
