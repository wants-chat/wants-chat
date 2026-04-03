/**
 * Social Messaging Component Generators (React Native)
 *
 * Generates message list, chat interface, and notification components for React Native.
 */

export interface MessagingOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateMessageList(options: MessagingOptions = {}): string {
  const { componentName = 'MessageList', endpoint = '/conversations' } = options;

  return `import React from 'react';
import {
  View,
  Text,
  TextInput,
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
  const [searchQuery, setSearchQuery] = React.useState('');

  const { data: conversations, isLoading } = useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}');
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const handleConversationPress = (conversationId: string) => {
    navigation.navigate('Chat' as never, { id: conversationId } as never);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const filteredConversations = conversations?.filter((conv: any) => {
    const name = conv.participant_name || conv.name || '';
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const renderConversation = ({ item: conv }: { item: any }) => (
    <TouchableOpacity
      style={styles.conversationItem}
      onPress={() => handleConversationPress(conv.id)}
      activeOpacity={0.7}
    >
      <View style={styles.avatarContainer}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {(conv.participant_name || conv.name || '?').charAt(0).toUpperCase()}
          </Text>
        </View>
      </View>

      <View style={styles.conversationContent}>
        <View style={styles.conversationHeader}>
          <Text style={styles.participantName} numberOfLines={1}>
            {conv.participant_name || conv.name}
          </Text>
          <Text style={styles.timestamp}>
            {formatDate(conv.last_message_at || conv.updated_at)}
          </Text>
        </View>
        <Text style={styles.lastMessage} numberOfLines={1}>
          {conv.last_message || conv.preview}
        </Text>
      </View>

      {conv.unread_count > 0 && (
        <View style={styles.unreadBadge}>
          <Text style={styles.unreadText}>{conv.unread_count}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6B7280" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Messages</Text>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={18} color="#9CA3AF" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search messages..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {filteredConversations && filteredConversations.length > 0 ? (
        <FlatList
          data={filteredConversations}
          renderItem={renderConversation}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="chatbubbles-outline" size={48} color="#D1D5DB" />
          <Text style={styles.emptyText}>No conversations yet</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 14,
    color: '#111827',
  },
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  conversationContent: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  participantName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    flex: 1,
  },
  timestamp: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 8,
  },
  lastMessage: {
    fontSize: 14,
    color: '#6B7280',
  },
  unreadBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  unreadText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  separator: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginLeft: 76,
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
});

export default ${componentName};
`;
}

export function generateChatInterface(options: MessagingOptions = {}): string {
  const { componentName = 'ChatInterface', endpoint = '/messages' } = options;

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

  const { data: messages, isLoading } = useQuery({
    queryKey: ['messages', id],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}?conversation_id=' + id);
      return Array.isArray(response) ? response : (response?.data || []);
    },
    refetchInterval: 5000, // Poll for new messages
  });

  const sendMutation = useMutation({
    mutationFn: (content: string) =>
      api.post('${endpoint}', {
        conversation_id: id,
        content,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', id] });
      setMessage('');
    },
  });

  useEffect(() => {
    if (messages?.length) {
      flatListRef.current?.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const handleSend = () => {
    if (message.trim()) {
      sendMutation.mutate(message.trim());
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderMessage = ({ item: msg }: { item: any }) => (
    <View
      style={[
        styles.messageContainer,
        msg.is_mine ? styles.myMessageContainer : styles.theirMessageContainer,
      ]}
    >
      <View
        style={[
          styles.messageBubble,
          msg.is_mine ? styles.myMessageBubble : styles.theirMessageBubble,
        ]}
      >
        <Text
          style={[
            styles.messageText,
            msg.is_mine ? styles.myMessageText : styles.theirMessageText,
          ]}
        >
          {msg.content}
        </Text>
        <Text
          style={[
            styles.messageTime,
            msg.is_mine ? styles.myMessageTime : styles.theirMessageTime,
          ]}
        >
          {formatTime(msg.created_at)}
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
        <View style={styles.headerAvatar}>
          <View style={styles.avatarPlaceholder} />
        </View>
        <Text style={styles.headerTitle}>Conversation</Text>
        <TouchableOpacity style={styles.moreButton}>
          <Ionicons name="ellipsis-vertical" size={20} color="#111827" />
        </TouchableOpacity>
      </View>

      {/* Messages */}
      {messages && messages.length > 0 ? (
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          inverted={false}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        />
      ) : (
        <View style={styles.emptyMessages}>
          <Text style={styles.emptyText}>No messages yet. Start the conversation!</Text>
        </View>
      )}

      {/* Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={message}
          onChangeText={setMessage}
          placeholder="Type a message..."
          placeholderTextColor="#9CA3AF"
          multiline
          maxLength={1000}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            (!message.trim() || sendMutation.isPending) && styles.sendButtonDisabled,
          ]}
          onPress={handleSend}
          disabled={!message.trim() || sendMutation.isPending}
        >
          <Ionicons name="send" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
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
  headerAvatar: {
    marginRight: 12,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3B82F6',
  },
  headerTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  moreButton: {
    padding: 8,
  },
  messagesList: {
    padding: 16,
    flexGrow: 1,
  },
  emptyMessages: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  messageContainer: {
    marginBottom: 12,
  },
  myMessageContainer: {
    alignItems: 'flex-end',
  },
  theirMessageContainer: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  myMessageBubble: {
    backgroundColor: '#2563EB',
    borderBottomRightRadius: 4,
  },
  theirMessageBubble: {
    backgroundColor: '#F3F4F6',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  myMessageText: {
    color: '#FFFFFF',
  },
  theirMessageText: {
    color: '#111827',
  },
  messageTime: {
    fontSize: 12,
    marginTop: 4,
  },
  myMessageTime: {
    color: '#BFDBFE',
  },
  theirMessageTime: {
    color: '#6B7280',
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
    minHeight: 40,
    maxHeight: 120,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 20,
    fontSize: 16,
    color: '#111827',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#2563EB',
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

export function generateNotificationList(options: { componentName?: string; endpoint?: string } = {}): string {
  const { componentName = 'NotificationList', endpoint = '/notifications' } = options;

  return `import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

const ${componentName}: React.FC = () => {
  const queryClient = useQueryClient();

  const { data: notifications, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}');
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => api.put('${endpoint}/' + id, { read: true }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => api.put('${endpoint}/mark-all-read', {}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const getIcon = (type: string): { name: keyof typeof Ionicons.glyphMap; color: string } => {
    switch (type) {
      case 'like':
        return { name: 'heart', color: '#EF4444' };
      case 'comment':
        return { name: 'chatbubble', color: '#3B82F6' };
      case 'follow':
        return { name: 'person-add', color: '#22C55E' };
      case 'mention':
        return { name: 'at', color: '#8B5CF6' };
      default:
        return { name: 'notifications', color: '#6B7280' };
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const unreadCount = notifications?.filter((n: any) => !n.read).length || 0;

  const renderNotification = ({ item: notif }: { item: any }) => {
    const icon = getIcon(notif.type);
    return (
      <TouchableOpacity
        style={[
          styles.notificationItem,
          !notif.read && styles.unreadNotification,
        ]}
        onPress={() => !notif.read && markReadMutation.mutate(notif.id)}
        activeOpacity={0.7}
      >
        <View style={[styles.iconContainer, { backgroundColor: icon.color + '20' }]}>
          <Ionicons name={icon.name} size={20} color={icon.color} />
        </View>
        <View style={styles.notificationContent}>
          <Text style={styles.notificationMessage}>
            {notif.message || notif.content}
          </Text>
          <Text style={styles.notificationTime}>{formatDate(notif.created_at)}</Text>
        </View>
        {!notif.read && <View style={styles.unreadDot} />}
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
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <Ionicons name="notifications" size={20} color="#111827" />
          <Text style={styles.title}>Notifications</Text>
          {unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity
            style={styles.markAllButton}
            onPress={() => markAllReadMutation.mutate()}
          >
            <Ionicons name="checkmark-done" size={16} color="#2563EB" />
            <Text style={styles.markAllText}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>

      {notifications && notifications.length > 0 ? (
        <FlatList
          data={notifications}
          renderItem={renderNotification}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="notifications-outline" size={48} color="#D1D5DB" />
          <Text style={styles.emptyText}>No notifications</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  unreadBadge: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  unreadBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  markAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  markAllText: {
    fontSize: 14,
    color: '#2563EB',
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    gap: 12,
  },
  unreadNotification: {
    backgroundColor: '#EFF6FF',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationContent: {
    flex: 1,
  },
  notificationMessage: {
    fontSize: 14,
    color: '#111827',
    lineHeight: 20,
  },
  notificationTime: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2563EB',
    marginTop: 6,
  },
  separator: {
    height: 1,
    backgroundColor: '#E5E7EB',
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
});

export default ${componentName};
`;
}
