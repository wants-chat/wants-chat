/**
 * Support Ticket Component Generators (React Native)
 *
 * Generates ticket list, ticket detail, and ticket form components for React Native.
 */

export interface TicketOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateTicketList(options: TicketOptions = {}): string {
  const { componentName = 'TicketList', endpoint = '/tickets' } = options;

  return `import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

const ${componentName}: React.FC = () => {
  const navigation = useNavigation();
  const [activeStatus, setActiveStatus] = useState('all');

  const statuses = [
    { value: 'all', label: 'All' },
    { value: 'open', label: 'Open' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'resolved', label: 'Resolved' },
  ];

  const { data: tickets, isLoading } = useQuery({
    queryKey: ['tickets', activeStatus],
    queryFn: async () => {
      const url = '${endpoint}' + (activeStatus !== 'all' ? '?status=' + activeStatus : '');
      const response = await api.get<any>(url);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const handleTicketPress = (ticketId: string) => {
    navigation.navigate('TicketDetail' as never, { id: ticketId } as never);
  };

  const handleNewTicket = () => {
    navigation.navigate('TicketForm' as never);
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'open':
        return { name: 'alert-circle' as const, color: '#F59E0B' };
      case 'in_progress':
        return { name: 'time' as const, color: '#3B82F6' };
      case 'resolved':
        return { name: 'checkmark-circle' as const, color: '#22C55E' };
      case 'closed':
        return { name: 'close-circle' as const, color: '#6B7280' };
      default:
        return { name: 'ticket' as const, color: '#6B7280' };
    }
  };

  const getPriorityBadge = (priority: string) => {
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

  const renderTicket = ({ item: ticket }: { item: any }) => {
    const statusIcon = getStatusIcon(ticket.status);
    const priorityBadge = getPriorityBadge(ticket.priority);

    return (
      <TouchableOpacity
        style={styles.ticketItem}
        onPress={() => handleTicketPress(ticket.id)}
        activeOpacity={0.7}
      >
        <View style={styles.ticketIcon}>
          <Ionicons name={statusIcon.name} size={20} color={statusIcon.color} />
        </View>
        <View style={styles.ticketContent}>
          <View style={styles.ticketHeader}>
            <Text style={styles.ticketNumber}>#{ticket.number || ticket.id.slice(0, 8)}</Text>
            {ticket.priority && (
              <View style={[styles.priorityBadge, { backgroundColor: priorityBadge.bg }]}>
                <Text style={[styles.priorityText, { color: priorityBadge.text }]}>
                  {ticket.priority}
                </Text>
              </View>
            )}
          </View>
          <Text style={styles.ticketSubject} numberOfLines={1}>{ticket.subject}</Text>
          {ticket.last_message && (
            <Text style={styles.ticketPreview} numberOfLines={1}>{ticket.last_message}</Text>
          )}
          <View style={styles.ticketMeta}>
            <Text style={styles.ticketDate}>
              {new Date(ticket.created_at).toLocaleDateString()}
            </Text>
            {ticket.replies_count > 0 && (
              <View style={styles.repliesCount}>
                <Ionicons name="chatbubble-outline" size={12} color="#6B7280" />
                <Text style={styles.repliesText}>{ticket.replies_count}</Text>
              </View>
            )}
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6B7280" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Status Filter */}
      <View style={styles.filterContainer}>
        <FlatList
          horizontal
          data={statuses}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.filterButton,
                activeStatus === item.value && styles.filterButtonActive,
              ]}
              onPress={() => setActiveStatus(item.value)}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  activeStatus === item.value && styles.filterButtonTextActive,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.value}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterList}
        />
        <TouchableOpacity style={styles.newButton} onPress={handleNewTicket}>
          <Ionicons name="add" size={20} color="#FFFFFF" />
          <Text style={styles.newButtonText}>New</Text>
        </TouchableOpacity>
      </View>

      {/* Tickets List */}
      {tickets && tickets.length > 0 ? (
        <FlatList
          data={tickets}
          renderItem={renderTicket}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="ticket-outline" size={48} color="#D1D5DB" />
          <Text style={styles.emptyText}>No tickets found</Text>
          <TouchableOpacity style={styles.createButton} onPress={handleNewTicket}>
            <Text style={styles.createButtonText}>Create a ticket</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    gap: 12,
  },
  filterList: {
    flex: 1,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  filterButtonActive: {
    backgroundColor: '#8B5CF6',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
  },
  newButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#8B5CF6',
    borderRadius: 20,
    gap: 4,
  },
  newButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  listContent: {
    padding: 16,
  },
  ticketItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  ticketIcon: {
    marginTop: 4,
    marginRight: 12,
  },
  ticketContent: {
    flex: 1,
  },
  ticketHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  ticketNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  ticketSubject: {
    fontSize: 15,
    fontWeight: '500',
    color: '#111827',
  },
  ticketPreview: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  ticketMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 8,
  },
  ticketDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  repliesCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  repliesText: {
    fontSize: 12,
    color: '#6B7280',
  },
  separator: {
    height: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  createButton: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#8B5CF6',
    borderRadius: 8,
  },
  createButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
  },
});

export default ${componentName};
`;
}

export function generateTicketDetail(options: TicketOptions = {}): string {
  const { componentName = 'TicketDetail', endpoint = '/tickets' } = options;

  return `import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

const ${componentName}: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { id } = route.params as { id: string };
  const queryClient = useQueryClient();
  const [message, setMessage] = useState('');
  const flatListRef = useRef<FlatList>(null);

  const { data: ticket, isLoading } = useQuery({
    queryKey: ['ticket', id],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}/' + id);
      return response?.data || response;
    },
  });

  const replyMutation = useMutation({
    mutationFn: (content: string) =>
      api.post('${endpoint}/' + id + '/replies', { content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket', id] });
      setMessage('');
    },
  });

  useEffect(() => {
    if (ticket?.messages?.length) {
      flatListRef.current?.scrollToEnd({ animated: true });
    }
  }, [ticket?.messages]);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleSend = () => {
    if (message.trim()) {
      replyMutation.mutate(message.trim());
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'open':
        return { bg: '#FEF3C7', text: '#D97706', label: 'Open' };
      case 'in_progress':
        return { bg: '#DBEAFE', text: '#2563EB', label: 'In Progress' };
      case 'resolved':
        return { bg: '#D1FAE5', text: '#059669', label: 'Resolved' };
      case 'closed':
        return { bg: '#F3F4F6', text: '#6B7280', label: 'Closed' };
      default:
        return { bg: '#F3F4F6', text: '#6B7280', label: status };
    }
  };

  const renderMessage = ({ item: msg }: { item: any }) => (
    <View style={[styles.messageContainer, msg.is_staff && styles.staffMessageContainer]}>
      <View style={styles.messageAvatar}>
        <View style={[styles.avatar, msg.is_staff ? styles.staffAvatar : styles.userAvatar]}>
          <Ionicons
            name={msg.is_staff ? 'headset' : 'person'}
            size={16}
            color={msg.is_staff ? '#8B5CF6' : '#6B7280'}
          />
        </View>
      </View>
      <View style={styles.messageContent}>
        <View style={styles.messageHeader}>
          <Text style={styles.messageSender}>{msg.author_name || (msg.is_staff ? 'Support' : 'You')}</Text>
          {msg.is_staff && (
            <View style={styles.staffBadge}>
              <Text style={styles.staffBadgeText}>Support</Text>
            </View>
          )}
        </View>
        <View style={[styles.messageBubble, msg.is_staff ? styles.staffBubble : styles.userBubble]}>
          <Text style={styles.messageText}>{msg.content}</Text>
        </View>
        <Text style={styles.messageTime}>
          {new Date(msg.created_at).toLocaleString()}
        </Text>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6B7280" />
      </View>
    );
  }

  if (!ticket) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="#D1D5DB" />
        <Text style={styles.emptyText}>Ticket not found</Text>
        <TouchableOpacity style={styles.backLink} onPress={handleBack}>
          <Text style={styles.backLinkText}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const statusBadge = getStatusBadge(ticket.status);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.ticketNumber}>#{ticket.number || ticket.id.slice(0, 8)}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusBadge.bg }]}>
            <Text style={[styles.statusText, { color: statusBadge.text }]}>{statusBadge.label}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.moreButton}>
          <Ionicons name="ellipsis-vertical" size={20} color="#111827" />
        </TouchableOpacity>
      </View>

      {/* Ticket Subject */}
      <View style={styles.subjectContainer}>
        <Text style={styles.subject}>{ticket.subject}</Text>
        <Text style={styles.createdAt}>
          Created {new Date(ticket.created_at).toLocaleDateString()}
        </Text>
      </View>

      {/* Messages */}
      {ticket.messages && ticket.messages.length > 0 ? (
        <FlatList
          ref={flatListRef}
          data={ticket.messages}
          renderItem={renderMessage}
          keyExtractor={(item, index) => item.id || index.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.messagesContent}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        />
      ) : (
        <View style={styles.noMessages}>
          <Text style={styles.noMessagesText}>No messages yet</Text>
        </View>
      )}

      {/* Reply Input */}
      {ticket.status !== 'resolved' && ticket.status !== 'closed' && (
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={message}
            onChangeText={setMessage}
            placeholder="Type your reply..."
            placeholderTextColor="#9CA3AF"
            multiline
            maxLength={2000}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!message.trim() || replyMutation.isPending) && styles.sendButtonDisabled,
            ]}
            onPress={handleSend}
            disabled={!message.trim() || replyMutation.isPending}
          >
            {replyMutation.isPending ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Ionicons name="send" size={20} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        </View>
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
    padding: 32,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  backLink: {
    marginTop: 16,
  },
  backLinkText: {
    fontSize: 16,
    color: '#8B5CF6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  ticketNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '500',
  },
  moreButton: {
    padding: 8,
  },
  subjectContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  subject: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  createdAt: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  messagesContent: {
    padding: 16,
    flexGrow: 1,
  },
  noMessages: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noMessagesText: {
    fontSize: 16,
    color: '#6B7280',
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  staffMessageContainer: {
    flexDirection: 'row-reverse',
  },
  messageAvatar: {
    marginHorizontal: 8,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
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
    maxWidth: '75%',
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8,
  },
  messageSender: {
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
    fontSize: 12,
    color: '#8B5CF6',
    fontWeight: '500',
  },
  messageBubble: {
    padding: 12,
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
  messageText: {
    fontSize: 15,
    color: '#111827',
    lineHeight: 22,
  },
  messageTime: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 12,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 22,
    fontSize: 16,
    color: '#111827',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});

export default ${componentName};
`;
}

export function generateTicketForm(options: TicketOptions = {}): string {
  const { componentName = 'TicketForm', endpoint = '/tickets' } = options;

  return `import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useMutation } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

const ${componentName}: React.FC = () => {
  const navigation = useNavigation();
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState('medium');
  const [message, setMessage] = useState('');
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showPriorityPicker, setShowPriorityPicker] = useState(false);

  const categories = [
    { value: 'billing', label: 'Billing' },
    { value: 'technical', label: 'Technical Issue' },
    { value: 'account', label: 'Account' },
    { value: 'feature', label: 'Feature Request' },
    { value: 'other', label: 'Other' },
  ];

  const priorities = [
    { value: 'low', label: 'Low', color: '#6B7280' },
    { value: 'medium', label: 'Medium', color: '#D97706' },
    { value: 'high', label: 'High', color: '#EA580C' },
    { value: 'urgent', label: 'Urgent', color: '#DC2626' },
  ];

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('${endpoint}', data),
    onSuccess: (response: any) => {
      Alert.alert('Success', 'Your ticket has been created', [
        {
          text: 'OK',
          onPress: () => {
            const ticketId = response?.data?.id || response?.id;
            if (ticketId) {
              navigation.navigate('TicketDetail' as never, { id: ticketId } as never);
            } else {
              navigation.goBack();
            }
          },
        },
      ]);
    },
    onError: () => {
      Alert.alert('Error', 'Failed to create ticket. Please try again.');
    },
  });

  const handleBack = () => {
    navigation.goBack();
  };

  const handleSubmit = () => {
    if (!subject.trim()) {
      Alert.alert('Error', 'Please enter a subject');
      return;
    }
    if (!message.trim()) {
      Alert.alert('Error', 'Please enter a message');
      return;
    }

    createMutation.mutate({
      subject: subject.trim(),
      category,
      priority,
      message: message.trim(),
    });
  };

  const getCategoryLabel = () => {
    const cat = categories.find((c) => c.value === category);
    return cat?.label || 'Select category';
  };

  const getPriorityLabel = () => {
    const p = priorities.find((pr) => pr.value === priority);
    return p?.label || 'Medium';
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="close" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Ticket</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Subject */}
        <View style={styles.field}>
          <Text style={styles.label}>Subject *</Text>
          <TextInput
            style={styles.input}
            value={subject}
            onChangeText={setSubject}
            placeholder="Brief description of your issue"
            placeholderTextColor="#9CA3AF"
            maxLength={200}
          />
        </View>

        {/* Category and Priority */}
        <View style={styles.row}>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>Category</Text>
            <TouchableOpacity
              style={styles.picker}
              onPress={() => setShowCategoryPicker(!showCategoryPicker)}
            >
              <Text style={[styles.pickerText, !category && styles.pickerPlaceholder]}>
                {getCategoryLabel()}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#6B7280" />
            </TouchableOpacity>
            {showCategoryPicker && (
              <View style={styles.pickerOptions}>
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat.value}
                    style={[
                      styles.pickerOption,
                      category === cat.value && styles.pickerOptionActive,
                    ]}
                    onPress={() => {
                      setCategory(cat.value);
                      setShowCategoryPicker(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.pickerOptionText,
                        category === cat.value && styles.pickerOptionTextActive,
                      ]}
                    >
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>Priority</Text>
            <TouchableOpacity
              style={styles.picker}
              onPress={() => setShowPriorityPicker(!showPriorityPicker)}
            >
              <Text style={styles.pickerText}>{getPriorityLabel()}</Text>
              <Ionicons name="chevron-down" size={20} color="#6B7280" />
            </TouchableOpacity>
            {showPriorityPicker && (
              <View style={styles.pickerOptions}>
                {priorities.map((p) => (
                  <TouchableOpacity
                    key={p.value}
                    style={[
                      styles.pickerOption,
                      priority === p.value && styles.pickerOptionActive,
                    ]}
                    onPress={() => {
                      setPriority(p.value);
                      setShowPriorityPicker(false);
                    }}
                  >
                    <View style={[styles.priorityDot, { backgroundColor: p.color }]} />
                    <Text
                      style={[
                        styles.pickerOptionText,
                        priority === p.value && styles.pickerOptionTextActive,
                      ]}
                    >
                      {p.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* Message */}
        <View style={styles.field}>
          <Text style={styles.label}>Message *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={message}
            onChangeText={setMessage}
            placeholder="Describe your issue in detail..."
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={6}
            textAlignVertical="top"
            maxLength={5000}
          />
        </View>
      </ScrollView>

      {/* Submit Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.submitButton, createMutation.isPending && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={createMutation.isPending}
        >
          {createMutation.isPending ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Text style={styles.submitButtonText}>Submit Ticket</Text>
              <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  field: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#FFFFFF',
  },
  textArea: {
    minHeight: 150,
  },
  row: {
    flexDirection: 'row',
    gap: 16,
  },
  picker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  pickerText: {
    fontSize: 16,
    color: '#111827',
  },
  pickerPlaceholder: {
    color: '#9CA3AF',
  },
  pickerOptions: {
    position: 'absolute',
    top: 76,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 10,
  },
  pickerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  pickerOptionActive: {
    backgroundColor: '#F3E8FF',
  },
  pickerOptionText: {
    fontSize: 15,
    color: '#374151',
  },
  pickerOptionTextActive: {
    color: '#8B5CF6',
    fontWeight: '500',
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8B5CF6',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default ${componentName};
`;
}
