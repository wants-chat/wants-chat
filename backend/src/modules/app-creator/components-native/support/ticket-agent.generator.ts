/**
 * Ticket Agent Component Generators (React Native)
 *
 * Modular components for ticket management, filtering, conversations, and agent replies.
 */

export interface TicketAgentOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateTicketFilters(options: TicketAgentOptions = {}): string {
  const { componentName = 'TicketFilters', endpoint = '/tickets' } = options;

  return `import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface FilterOptions {
  status?: string;
  priority?: string;
  category?: string;
  assignee?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

interface ${componentName}Props {
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
  categories?: { id: string; name: string }[];
  assignees?: { id: string; name: string }[];
  showSearch?: boolean;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  filters,
  onFilterChange,
  categories = [],
  assignees = [],
  showSearch = true,
}) => {
  const statuses = [
    { value: '', label: 'All Status' },
    { value: 'open', label: 'Open' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'pending', label: 'Pending' },
    { value: 'resolved', label: 'Resolved' },
    { value: 'closed', label: 'Closed' },
  ];

  const priorities = [
    { value: '', label: 'All Priority' },
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' },
  ];

  const hasActiveFilters = Object.values(filters).some((v) => v && v !== '');

  const clearFilters = () => {
    onFilterChange({});
  };

  const FilterPill: React.FC<{ label: string; value: string; active: boolean; onPress: () => void }> = ({
    label,
    active,
    onPress,
  }) => (
    <TouchableOpacity
      style={[styles.filterPill, active && styles.filterPillActive]}
      onPress={onPress}
    >
      <Text style={[styles.filterPillText, active && styles.filterPillTextActive]}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="filter" size={16} color="#111827" />
          <Text style={styles.title}>Filters</Text>
        </View>
        {hasActiveFilters && (
          <TouchableOpacity onPress={clearFilters} style={styles.clearButton}>
            <Ionicons name="close" size={14} color="#6B7280" />
            <Text style={styles.clearText}>Clear all</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {showSearch && (
          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Search</Text>
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={16} color="#9CA3AF" />
              <TextInput
                style={styles.searchInput}
                value={filters.search || ''}
                onChangeText={(text) => onFilterChange({ ...filters, search: text })}
                placeholder="Search tickets..."
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </View>
        )}

        <View style={styles.filterSection}>
          <View style={styles.filterLabelRow}>
            <Ionicons name="alert-circle-outline" size={14} color="#6B7280" />
            <Text style={styles.filterLabel}>Status</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.pillsRow}>
              {statuses.map((status) => (
                <FilterPill
                  key={status.value}
                  label={status.label}
                  value={status.value}
                  active={filters.status === status.value}
                  onPress={() => onFilterChange({ ...filters, status: status.value })}
                />
              ))}
            </View>
          </ScrollView>
        </View>

        <View style={styles.filterSection}>
          <View style={styles.filterLabelRow}>
            <Ionicons name="flag-outline" size={14} color="#6B7280" />
            <Text style={styles.filterLabel}>Priority</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.pillsRow}>
              {priorities.map((priority) => (
                <FilterPill
                  key={priority.value}
                  label={priority.label}
                  value={priority.value}
                  active={filters.priority === priority.value}
                  onPress={() => onFilterChange({ ...filters, priority: priority.value })}
                />
              ))}
            </View>
          </ScrollView>
        </View>

        {categories.length > 0 && (
          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.pillsRow}>
                <FilterPill
                  label="All Categories"
                  value=""
                  active={!filters.category}
                  onPress={() => onFilterChange({ ...filters, category: '' })}
                />
                {categories.map((cat) => (
                  <FilterPill
                    key={cat.id}
                    label={cat.name}
                    value={cat.id}
                    active={filters.category === cat.id}
                    onPress={() => onFilterChange({ ...filters, category: cat.id })}
                  />
                ))}
              </View>
            </ScrollView>
          </View>
        )}

        {assignees.length > 0 && (
          <View style={styles.filterSection}>
            <View style={styles.filterLabelRow}>
              <Ionicons name="person-outline" size={14} color="#6B7280" />
              <Text style={styles.filterLabel}>Assignee</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.pillsRow}>
                <FilterPill
                  label="All Assignees"
                  value=""
                  active={!filters.assignee}
                  onPress={() => onFilterChange({ ...filters, assignee: '' })}
                />
                <FilterPill
                  label="Unassigned"
                  value="unassigned"
                  active={filters.assignee === 'unassigned'}
                  onPress={() => onFilterChange({ ...filters, assignee: 'unassigned' })}
                />
                {assignees.map((assignee) => (
                  <FilterPill
                    key={assignee.id}
                    label={assignee.name}
                    value={assignee.id}
                    active={filters.assignee === assignee.id}
                    onPress={() => onFilterChange({ ...filters, assignee: assignee.id })}
                  />
                ))}
              </View>
            </ScrollView>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  clearText: {
    fontSize: 13,
    color: '#6B7280',
  },
  content: {
    padding: 16,
  },
  filterSection: {
    marginBottom: 20,
  },
  filterLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 14,
    color: '#111827',
  },
  pillsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  filterPillActive: {
    backgroundColor: '#8B5CF6',
  },
  filterPillText: {
    fontSize: 13,
    color: '#6B7280',
  },
  filterPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
});

export default ${componentName};
`;
}

export function generateTicketInfo(options: TicketAgentOptions = {}): string {
  const { componentName = 'TicketInfo', endpoint = '/tickets' } = options;

  return `import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface Ticket {
  id: string;
  number?: string;
  subject: string;
  status: string;
  priority: string;
  category?: string;
  created_at: string;
  updated_at?: string;
  requester?: {
    id: string;
    name: string;
    email: string;
    avatar_url?: string;
  };
  assignee?: {
    id: string;
    name: string;
    avatar_url?: string;
  };
  tags?: string[];
}

interface ${componentName}Props {
  ticket: Ticket;
  editable?: boolean;
  assignees?: { id: string; name: string }[];
}

const ${componentName}: React.FC<${componentName}Props> = ({ ticket, editable = false, assignees = [] }) => {
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: (data: Partial<Ticket>) =>
      api.put('${endpoint}/' + ticket.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket', ticket.id] });
    },
  });

  const getStatusStyle = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'open':
        return { bg: '#FEF3C7', text: '#D97706' };
      case 'in_progress':
        return { bg: '#DBEAFE', text: '#2563EB' };
      case 'pending':
        return { bg: '#FFEDD5', text: '#EA580C' };
      case 'resolved':
        return { bg: '#D1FAE5', text: '#059669' };
      case 'closed':
        return { bg: '#F3F4F6', text: '#6B7280' };
      default:
        return { bg: '#F3F4F6', text: '#6B7280' };
    }
  };

  const getPriorityStyle = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'urgent':
        return { bg: '#FEE2E2', text: '#DC2626' };
      case 'high':
        return { bg: '#FFEDD5', text: '#EA580C' };
      case 'medium':
        return { bg: '#FEF3C7', text: '#D97706' };
      default:
        return { bg: '#F3F4F6', text: '#6B7280' };
    }
  };

  const statusStyle = getStatusStyle(ticket.status);
  const priorityStyle = getPriorityStyle(ticket.priority);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Ticket Information</Text>
      </View>

      <View style={styles.content}>
        {/* Status */}
        <View style={styles.row}>
          <View style={styles.labelRow}>
            <Ionicons name="alert-circle-outline" size={16} color="#6B7280" />
            <Text style={styles.label}>Status</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: statusStyle.bg }]}>
            <Text style={[styles.badgeText, { color: statusStyle.text }]}>
              {ticket.status.replace('_', ' ')}
            </Text>
          </View>
        </View>

        {/* Priority */}
        <View style={styles.row}>
          <View style={styles.labelRow}>
            <Ionicons name="flag-outline" size={16} color="#6B7280" />
            <Text style={styles.label}>Priority</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: priorityStyle.bg }]}>
            <Text style={[styles.badgeText, { color: priorityStyle.text, textTransform: 'capitalize' }]}>
              {ticket.priority}
            </Text>
          </View>
        </View>

        {/* Category */}
        {ticket.category && (
          <View style={styles.row}>
            <View style={styles.labelRow}>
              <Ionicons name="folder-outline" size={16} color="#6B7280" />
              <Text style={styles.label}>Category</Text>
            </View>
            <Text style={styles.value}>{ticket.category}</Text>
          </View>
        )}

        {/* Assignee */}
        <View style={styles.row}>
          <View style={styles.labelRow}>
            <Ionicons name="person-outline" size={16} color="#6B7280" />
            <Text style={styles.label}>Assignee</Text>
          </View>
          {ticket.assignee ? (
            <View style={styles.userInfo}>
              {ticket.assignee.avatar_url ? (
                <Image source={{ uri: ticket.assignee.avatar_url }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarInitial}>
                    {ticket.assignee.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
              <Text style={styles.userName}>{ticket.assignee.name}</Text>
            </View>
          ) : (
            <Text style={styles.valueLight}>Unassigned</Text>
          )}
        </View>

        {/* Requester */}
        {ticket.requester && (
          <View style={styles.row}>
            <View style={styles.labelRow}>
              <Ionicons name="person-outline" size={16} color="#6B7280" />
              <Text style={styles.label}>Requester</Text>
            </View>
            <View style={styles.requesterInfo}>
              {ticket.requester.avatar_url ? (
                <Image source={{ uri: ticket.requester.avatar_url }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatarPlaceholder, { backgroundColor: '#F3F4F6' }]}>
                  <Text style={[styles.avatarInitial, { color: '#6B7280' }]}>
                    {ticket.requester.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
              <View>
                <Text style={styles.userName}>{ticket.requester.name}</Text>
                <Text style={styles.userEmail}>{ticket.requester.email}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Created */}
        <View style={styles.row}>
          <View style={styles.labelRow}>
            <Ionicons name="calendar-outline" size={16} color="#6B7280" />
            <Text style={styles.label}>Created</Text>
          </View>
          <Text style={styles.value}>
            {new Date(ticket.created_at).toLocaleString()}
          </Text>
        </View>

        {/* Updated */}
        {ticket.updated_at && (
          <View style={styles.row}>
            <View style={styles.labelRow}>
              <Ionicons name="time-outline" size={16} color="#6B7280" />
              <Text style={styles.label}>Last Updated</Text>
            </View>
            <Text style={styles.value}>
              {new Date(ticket.updated_at).toLocaleString()}
            </Text>
          </View>
        )}

        {/* Tags */}
        {ticket.tags && ticket.tags.length > 0 && (
          <View style={styles.tagsSection}>
            <View style={styles.labelRow}>
              <Ionicons name="pricetag-outline" size={16} color="#6B7280" />
              <Text style={styles.label}>Tags</Text>
            </View>
            <View style={styles.tagsRow}>
              {ticket.tags.map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>

      {updateMutation.isPending && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="small" color="#8B5CF6" />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  content: {
    padding: 16,
    gap: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  label: {
    fontSize: 14,
    color: '#6B7280',
  },
  value: {
    fontSize: 14,
    color: '#111827',
  },
  valueLight: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '500',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  requesterInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  avatarPlaceholder: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F3E8FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8B5CF6',
  },
  userName: {
    fontSize: 14,
    color: '#111827',
  },
  userEmail: {
    fontSize: 12,
    color: '#6B7280',
  },
  tagsSection: {
    gap: 8,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  tag: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  tagText: {
    fontSize: 12,
    color: '#6B7280',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ${componentName};
`;
}

export function generateTicketConversation(options: TicketAgentOptions = {}): string {
  const { componentName = 'TicketConversation', endpoint = '/tickets' } = options;

  return `import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Message {
  id: string;
  content: string;
  created_at: string;
  is_staff?: boolean;
  is_internal?: boolean;
  author?: {
    id: string;
    name: string;
    avatar_url?: string;
    role?: string;
  };
  attachments?: {
    id: string;
    name: string;
    url: string;
    type: string;
    size?: number;
  }[];
}

interface ${componentName}Props {
  messages: Message[];
  showInternal?: boolean;
}

const ${componentName}: React.FC<${componentName}Props> = ({ messages, showInternal = false }) => {
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (messages.length > 0) {
      flatListRef.current?.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const filteredMessages = showInternal
    ? messages
    : messages.filter((m) => !m.is_internal);

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const isImage = (type: string) =>
    type.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'webp'].some((ext) => type.includes(ext));

  const renderMessage = ({ item: message }: { item: Message }) => (
    <View style={[styles.messageContainer, message.is_staff && styles.staffMessageContainer]}>
      {/* Avatar */}
      <View style={styles.avatarContainer}>
        {message.author?.avatar_url ? (
          <Image source={{ uri: message.author.avatar_url }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, message.is_staff ? styles.staffAvatar : styles.userAvatar]}>
            <Ionicons
              name={message.is_staff ? 'headset' : 'person'}
              size={16}
              color={message.is_staff ? '#8B5CF6' : '#6B7280'}
            />
          </View>
        )}
      </View>

      {/* Content */}
      <View style={[styles.messageContent, message.is_staff && styles.staffContent]}>
        <View style={[styles.messageHeader, message.is_staff && styles.staffHeader]}>
          <Text style={styles.authorName}>{message.author?.name || 'Unknown'}</Text>
          {message.is_staff && (
            <View style={styles.staffBadge}>
              <Text style={styles.staffBadgeText}>{message.author?.role || 'Support'}</Text>
            </View>
          )}
          {message.is_internal && (
            <View style={styles.internalBadge}>
              <Text style={styles.internalBadgeText}>Internal</Text>
            </View>
          )}
        </View>

        <View
          style={[
            styles.messageBubble,
            message.is_internal
              ? styles.internalBubble
              : message.is_staff
              ? styles.staffBubble
              : styles.userBubble,
          ]}
        >
          <Text style={styles.messageText}>{message.content}</Text>

          {/* Attachments */}
          {message.attachments && message.attachments.length > 0 && (
            <View style={styles.attachmentsContainer}>
              {message.attachments.map((attachment) => (
                <TouchableOpacity
                  key={attachment.id}
                  style={styles.attachment}
                  onPress={() => Linking.openURL(attachment.url)}
                >
                  {isImage(attachment.type) ? (
                    <Image
                      source={{ uri: attachment.url }}
                      style={styles.attachmentImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={styles.attachmentFile}>
                      <Ionicons name="attach" size={16} color="#6B7280" />
                      <Text style={styles.attachmentName} numberOfLines={1}>
                        {attachment.name}
                      </Text>
                      {attachment.size && (
                        <Text style={styles.attachmentSize}>({formatFileSize(attachment.size)})</Text>
                      )}
                      <Ionicons name="download-outline" size={16} color="#6B7280" />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <Text style={[styles.messageTime, message.is_staff && styles.staffTime]}>
          {new Date(message.created_at).toLocaleString()}
        </Text>
      </View>
    </View>
  );

  if (filteredMessages.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No messages yet</Text>
      </View>
    );
  }

  return (
    <FlatList
      ref={flatListRef}
      data={filteredMessages}
      renderItem={renderMessage}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
      onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
    />
  );
};

const styles = StyleSheet.create({
  listContent: {
    padding: 16,
    gap: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
  },
  messageContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  staffMessageContainer: {
    flexDirection: 'row-reverse',
  },
  avatarContainer: {},
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userAvatar: {
    backgroundColor: '#F3F4F6',
  },
  staffAvatar: {
    backgroundColor: '#F3E8FF',
  },
  messageContent: {
    flex: 1,
    maxWidth: '80%',
  },
  staffContent: {
    alignItems: 'flex-end',
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  staffHeader: {
    flexDirection: 'row-reverse',
  },
  authorName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  staffBadge: {
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  staffBadgeText: {
    fontSize: 11,
    color: '#8B5CF6',
    fontWeight: '500',
  },
  internalBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  internalBadgeText: {
    fontSize: 11,
    color: '#D97706',
    fontWeight: '500',
  },
  messageBubble: {
    padding: 14,
    borderRadius: 16,
  },
  userBubble: {
    backgroundColor: '#F3F4F6',
    borderBottomLeftRadius: 4,
  },
  staffBubble: {
    backgroundColor: '#F3E8FF',
    borderBottomRightRadius: 4,
  },
  internalBubble: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FCD34D',
  },
  messageText: {
    fontSize: 15,
    color: '#111827',
    lineHeight: 22,
  },
  messageTime: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 6,
  },
  staffTime: {
    textAlign: 'right',
  },
  attachmentsContainer: {
    marginTop: 12,
    gap: 8,
  },
  attachment: {},
  attachmentImage: {
    width: 200,
    height: 150,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  attachmentFile: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 8,
  },
  attachmentName: {
    flex: 1,
    fontSize: 13,
    color: '#374151',
  },
  attachmentSize: {
    fontSize: 12,
    color: '#9CA3AF',
  },
});

export default ${componentName};
`;
}

export function generateAgentReplyForm(options: TicketAgentOptions = {}): string {
  const { componentName = 'AgentReplyForm', endpoint = '/tickets' } = options;

  return `import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Modal,
  FlatList,
} from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { api } from '@/lib/api';

interface ${componentName}Props {
  ticketId: string;
  onSuccess?: () => void;
  cannedResponses?: { id: string; title: string; content: string }[];
}

const ${componentName}: React.FC<${componentName}Props> = ({
  ticketId,
  onSuccess,
  cannedResponses = [],
}) => {
  const queryClient = useQueryClient();
  const [content, setContent] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [attachments, setAttachments] = useState<any[]>([]);
  const [showCanned, setShowCanned] = useState(false);

  const replyMutation = useMutation({
    mutationFn: async (data: { content: string; is_internal: boolean }) => {
      return api.post('${endpoint}/' + ticketId + '/replies', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket', ticketId] });
      setContent('');
      setAttachments([]);
      setIsInternal(false);
      onSuccess?.();
    },
  });

  const handlePickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ multiple: true });
      if (result.assets) {
        setAttachments([...attachments, ...result.assets]);
      }
    } catch (error) {
      console.error('Error picking file:', error);
    }
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!content.trim()) return;
    replyMutation.mutate({ content: content.trim(), is_internal: isInternal });
  };

  const insertCannedResponse = (response: { title: string; content: string }) => {
    setContent((prev) => (prev ? prev + '\\n\\n' : '') + response.content);
    setShowCanned(false);
  };

  return (
    <View style={styles.container}>
      {/* Type Toggle */}
      <View style={styles.typeToggle}>
        <TouchableOpacity
          style={[styles.typeButton, !isInternal && styles.typeButtonActive]}
          onPress={() => setIsInternal(false)}
        >
          <Ionicons name="eye-outline" size={18} color={!isInternal ? '#8B5CF6' : '#6B7280'} />
          <Text style={[styles.typeButtonText, !isInternal && styles.typeButtonTextActive]}>
            Public Reply
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.typeButton, isInternal && styles.typeButtonInternal]}
          onPress={() => setIsInternal(true)}
        >
          <Ionicons name="eye-off-outline" size={18} color={isInternal ? '#D97706' : '#6B7280'} />
          <Text style={[styles.typeButtonText, isInternal && styles.typeButtonTextInternal]}>
            Internal Note
          </Text>
        </TouchableOpacity>

        {cannedResponses.length > 0 && (
          <TouchableOpacity style={styles.cannedButton} onPress={() => setShowCanned(true)}>
            <Ionicons name="document-text-outline" size={18} color="#6B7280" />
          </TouchableOpacity>
        )}
      </View>

      {/* Input */}
      <TextInput
        style={[styles.input, isInternal && styles.inputInternal]}
        value={content}
        onChangeText={setContent}
        placeholder={isInternal ? 'Add an internal note...' : 'Type your reply...'}
        placeholderTextColor="#9CA3AF"
        multiline
        numberOfLines={4}
        textAlignVertical="top"
      />

      {/* Attachments */}
      {attachments.length > 0 && (
        <View style={styles.attachmentsRow}>
          {attachments.map((file, index) => (
            <View key={index} style={styles.attachmentChip}>
              <Ionicons
                name={file.mimeType?.startsWith('image/') ? 'image' : 'attach'}
                size={14}
                color="#6B7280"
              />
              <Text style={styles.attachmentName} numberOfLines={1}>
                {file.name}
              </Text>
              <TouchableOpacity onPress={() => handleRemoveAttachment(index)}>
                <Ionicons name="close" size={16} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.attachButton} onPress={handlePickFile}>
          <Ionicons name="attach" size={20} color="#6B7280" />
          <Text style={styles.attachButtonText}>Attach</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.submitButton,
            isInternal && styles.submitButtonInternal,
            (!content.trim() || replyMutation.isPending) && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={!content.trim() || replyMutation.isPending}
        >
          {replyMutation.isPending ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="send" size={18} color="#FFFFFF" />
              <Text style={styles.submitButtonText}>
                {isInternal ? 'Add Note' : 'Send Reply'}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Canned Responses Modal */}
      <Modal visible={showCanned} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Canned Responses</Text>
              <TouchableOpacity onPress={() => setShowCanned(false)}>
                <Ionicons name="close" size={24} color="#111827" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={cannedResponses}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.cannedItem}
                  onPress={() => insertCannedResponse(item)}
                >
                  <Text style={styles.cannedItemTitle}>{item.title}</Text>
                  <Text style={styles.cannedItemContent} numberOfLines={2}>
                    {item.content}
                  </Text>
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => <View style={styles.cannedSeparator} />}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  typeToggle: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    gap: 8,
  },
  typeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  typeButtonActive: {
    backgroundColor: '#F3E8FF',
  },
  typeButtonInternal: {
    backgroundColor: '#FEF3C7',
  },
  typeButtonText: {
    fontSize: 14,
    color: '#6B7280',
  },
  typeButtonTextActive: {
    color: '#8B5CF6',
    fontWeight: '500',
  },
  typeButtonTextInternal: {
    color: '#D97706',
    fontWeight: '500',
  },
  cannedButton: {
    marginLeft: 'auto',
    padding: 8,
  },
  input: {
    padding: 16,
    fontSize: 15,
    color: '#111827',
    minHeight: 120,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  inputInternal: {
    backgroundColor: '#FFFBEB',
  },
  attachmentsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  attachmentChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  attachmentName: {
    fontSize: 13,
    color: '#374151',
    maxWidth: 120,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  attachButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
  },
  attachButtonText: {
    fontSize: 14,
    color: '#6B7280',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  submitButtonInternal: {
    backgroundColor: '#D97706',
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  cannedItem: {
    padding: 16,
  },
  cannedItemTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#111827',
  },
  cannedItemContent: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
  },
  cannedSeparator: {
    height: 1,
    backgroundColor: '#E5E7EB',
  },
});

export default ${componentName};
`;
}

export function generateTicketReplies(options: TicketAgentOptions = {}): string {
  const { componentName = 'TicketReplies', endpoint = '/tickets' } = options;

  return `import React from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface Reply {
  id: string;
  content: string;
  created_at: string;
  is_staff?: boolean;
  author?: {
    name: string;
    avatar_url?: string;
  };
}

interface ${componentName}Props {
  ticketId: string;
  limit?: number;
}

const ${componentName}: React.FC<${componentName}Props> = ({ ticketId, limit }) => {
  const { data: replies, isLoading } = useQuery({
    queryKey: ['ticket-replies', ticketId],
    queryFn: async () => {
      const url = '${endpoint}/' + ticketId + '/replies' + (limit ? '?limit=' + limit : '');
      const response = await api.get<any>(url);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#6B7280" />
      </View>
    );
  }

  if (!replies || replies.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="chatbubbles-outline" size={40} color="#D1D5DB" />
        <Text style={styles.emptyText}>No replies yet</Text>
      </View>
    );
  }

  const renderReply = ({ item: reply }: { item: Reply }) => (
    <View style={styles.replyItem}>
      <View style={styles.replyAvatar}>
        {reply.author?.avatar_url ? (
          <Image source={{ uri: reply.author.avatar_url }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, reply.is_staff ? styles.staffAvatar : styles.userAvatar]}>
            <Ionicons
              name={reply.is_staff ? 'headset' : 'person'}
              size={14}
              color={reply.is_staff ? '#8B5CF6' : '#6B7280'}
            />
          </View>
        )}
      </View>
      <View style={styles.replyContent}>
        <View style={styles.replyHeader}>
          <Text style={styles.authorName}>{reply.author?.name || 'Unknown'}</Text>
          {reply.is_staff && (
            <View style={styles.staffBadge}>
              <Text style={styles.staffBadgeText}>Support</Text>
            </View>
          )}
          <View style={styles.timeContainer}>
            <Ionicons name="time-outline" size={12} color="#9CA3AF" />
            <Text style={styles.replyTime}>
              {new Date(reply.created_at).toLocaleString()}
            </Text>
          </View>
        </View>
        <Text style={styles.replyText}>{reply.content}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="chatbubbles" size={18} color="#111827" />
        <Text style={styles.title}>Replies ({replies.length})</Text>
      </View>
      <FlatList
        data={replies}
        renderItem={renderReply}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  loadingContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 12,
    fontSize: 15,
    color: '#6B7280',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    gap: 8,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  replyItem: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  replyAvatar: {},
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userAvatar: {
    backgroundColor: '#F3F4F6',
  },
  staffAvatar: {
    backgroundColor: '#F3E8FF',
  },
  replyContent: {
    flex: 1,
  },
  replyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 6,
  },
  authorName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  staffBadge: {
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  staffBadgeText: {
    fontSize: 11,
    color: '#8B5CF6',
    fontWeight: '500',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  replyTime: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  replyText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  separator: {
    height: 1,
    backgroundColor: '#E5E7EB',
  },
});

export default ${componentName};
`;
}

export function generateReplyForm(options: TicketAgentOptions = {}): string {
  const { componentName = 'ReplyForm', endpoint = '/tickets' } = options;

  return `import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { api } from '@/lib/api';

interface ${componentName}Props {
  ticketId: string;
  placeholder?: string;
  onSuccess?: () => void;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  ticketId,
  placeholder = 'Type your reply...',
  onSuccess,
}) => {
  const queryClient = useQueryClient();
  const [content, setContent] = useState('');
  const [attachments, setAttachments] = useState<any[]>([]);

  const replyMutation = useMutation({
    mutationFn: (data: { content: string }) =>
      api.post('${endpoint}/' + ticketId + '/replies', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket', ticketId] });
      queryClient.invalidateQueries({ queryKey: ['ticket-replies', ticketId] });
      setContent('');
      setAttachments([]);
      onSuccess?.();
    },
  });

  const handlePickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ multiple: true });
      if (result.assets) {
        setAttachments([...attachments, ...result.assets]);
      }
    } catch (error) {
      console.error('Error picking file:', error);
    }
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!content.trim()) return;
    replyMutation.mutate({ content: content.trim() });
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={content}
        onChangeText={setContent}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        multiline
        numberOfLines={3}
        textAlignVertical="top"
      />

      {attachments.length > 0 && (
        <View style={styles.attachmentsRow}>
          {attachments.map((file, index) => (
            <View key={index} style={styles.attachmentChip}>
              <Ionicons name="attach" size={14} color="#6B7280" />
              <Text style={styles.attachmentName} numberOfLines={1}>
                {file.name}
              </Text>
              <TouchableOpacity onPress={() => handleRemoveAttachment(index)}>
                <Ionicons name="close" size={16} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      <View style={styles.actions}>
        <TouchableOpacity style={styles.attachButton} onPress={handlePickFile}>
          <Ionicons name="attach" size={20} color="#6B7280" />
          <Text style={styles.attachButtonText}>Attach files</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.submitButton,
            (!content.trim() || replyMutation.isPending) && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={!content.trim() || replyMutation.isPending}
        >
          {replyMutation.isPending ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="send" size={18} color="#FFFFFF" />
              <Text style={styles.submitButtonText}>Send Reply</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  input: {
    padding: 16,
    fontSize: 15,
    color: '#111827',
    minHeight: 100,
  },
  attachmentsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
  },
  attachmentChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  attachmentName: {
    fontSize: 13,
    color: '#374151',
    maxWidth: 120,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  attachButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
  },
  attachButtonText: {
    fontSize: 14,
    color: '#6B7280',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default ${componentName};
`;
}
