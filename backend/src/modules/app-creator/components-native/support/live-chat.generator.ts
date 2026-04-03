/**
 * Live Chat Component Generators (React Native)
 *
 * Generates live chat and chat widget components for React Native.
 */

export interface LiveChatOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateLiveChat(options: LiveChatOptions = {}): string {
  const { componentName = 'LiveChat', endpoint = '/chat' } = options;

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
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'agent' | 'bot';
  timestamp: string;
  agent_name?: string;
}

const ${componentName}: React.FC = () => {
  const queryClient = useQueryClient();
  const [message, setMessage] = useState('');
  const flatListRef = useRef<FlatList>(null);

  const { data: session } = useQuery({
    queryKey: ['chat-session'],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}/session');
      return response?.data || response;
    },
  });

  const { data: messages = [] } = useQuery({
    queryKey: ['chat-messages', session?.id],
    queryFn: async () => {
      if (!session?.id) return [];
      const response = await api.get<any>('${endpoint}/messages?session_id=' + session.id);
      return Array.isArray(response) ? response : (response?.data || []);
    },
    enabled: !!session?.id,
    refetchInterval: 3000,
  });

  const sendMutation = useMutation({
    mutationFn: (content: string) =>
      api.post('${endpoint}/messages', { session_id: session?.id, content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-messages'] });
      setMessage('');
    },
  });

  useEffect(() => {
    if (messages.length > 0) {
      flatListRef.current?.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const handleSend = () => {
    if (message.trim()) {
      sendMutation.mutate(message.trim());
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderMessage = ({ item: msg }: { item: Message }) => {
    const isUser = msg.sender === 'user';

    return (
      <View style={[styles.messageContainer, isUser && styles.userMessageContainer]}>
        {!isUser && (
          <View style={styles.avatarContainer}>
            <View style={[styles.avatar, msg.sender === 'bot' ? styles.botAvatar : styles.agentAvatar]}>
              <Ionicons
                name={msg.sender === 'bot' ? 'hardware-chip' : 'headset'}
                size={16}
                color={msg.sender === 'bot' ? '#6B7280' : '#8B5CF6'}
              />
            </View>
          </View>
        )}
        <View style={styles.messageContent}>
          {!isUser && msg.agent_name && (
            <Text style={styles.agentName}>{msg.agent_name}</Text>
          )}
          <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.otherBubble]}>
            <Text style={[styles.messageText, isUser && styles.userMessageText]}>
              {msg.content}
            </Text>
          </View>
          <Text style={[styles.messageTime, isUser && styles.userMessageTime]}>
            {formatTime(msg.timestamp)}
          </Text>
        </View>
        {isUser && (
          <View style={styles.avatarContainer}>
            <View style={[styles.avatar, styles.userAvatar]}>
              <Ionicons name="person" size={16} color="#FFFFFF" />
            </View>
          </View>
        )}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerAvatar}>
          <View style={styles.supportAvatar}>
            <Ionicons name="hardware-chip" size={20} color="#8B5CF6" />
          </View>
          <View style={styles.onlineIndicator} />
        </View>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Support Chat</Text>
          <Text style={styles.headerStatus}>Online</Text>
        </View>
        <TouchableOpacity style={styles.headerButton}>
          <Ionicons name="ellipsis-vertical" size={20} color="#6B7280" />
        </TouchableOpacity>
      </View>

      {/* Messages */}
      {messages.length > 0 ? (
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIcon}>
            <Ionicons name="chatbubbles-outline" size={48} color="#D1D5DB" />
          </View>
          <Text style={styles.emptyText}>Start a conversation</Text>
          <Text style={styles.emptySubtext}>We're here to help!</Text>
        </View>
      )}

      {/* Input */}
      <View style={styles.inputContainer}>
        <TouchableOpacity style={styles.attachButton}>
          <Ionicons name="attach" size={24} color="#6B7280" />
        </TouchableOpacity>
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
          {sendMutation.isPending ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Ionicons name="send" size={20} color="#FFFFFF" />
          )}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    gap: 12,
  },
  headerAvatar: {
    position: 'relative',
  },
  supportAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F3E8FF',
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
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  headerStatus: {
    fontSize: 14,
    color: '#22C55E',
  },
  headerButton: {
    padding: 8,
  },
  messagesContent: {
    padding: 16,
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#374151',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-end',
  },
  userMessageContainer: {
    flexDirection: 'row-reverse',
  },
  avatarContainer: {
    marginHorizontal: 8,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userAvatar: {
    backgroundColor: '#8B5CF6',
  },
  botAvatar: {
    backgroundColor: '#F3F4F6',
  },
  agentAvatar: {
    backgroundColor: '#F3E8FF',
  },
  messageContent: {
    maxWidth: '70%',
  },
  agentName: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
    marginLeft: 4,
  },
  messageBubble: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  userBubble: {
    backgroundColor: '#8B5CF6',
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    backgroundColor: '#F3F4F6',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    color: '#111827',
    lineHeight: 22,
  },
  userMessageText: {
    color: '#FFFFFF',
  },
  messageTime: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
    marginLeft: 4,
  },
  userMessageTime: {
    textAlign: 'right',
    marginLeft: 0,
    marginRight: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 8,
  },
  attachButton: {
    padding: 8,
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

export function generateChatWidget(options: LiveChatOptions = {}): string {
  const { componentName = 'ChatWidget', endpoint = '/chat' } = options;

  return `import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Animated,
  Dimensions,
  Modal,
} from 'react-native';
import { useMutation } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const ${componentName}: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Hi! How can I help you today?',
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const flatListRef = useRef<FlatList>(null);
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  const sendMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await api.post('${endpoint}/bot', { message: content });
      return response?.data || response;
    },
    onSuccess: (data) => {
      if (data?.reply) {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            content: data.reply,
            sender: 'bot',
            timestamp: new Date(),
          },
        ]);
      }
    },
  });

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: isOpen ? 0 : SCREEN_HEIGHT,
      useNativeDriver: true,
      tension: 65,
      friction: 11,
    }).start();
  }, [isOpen]);

  useEffect(() => {
    if (messages.length > 0 && isOpen) {
      flatListRef.current?.scrollToEnd({ animated: true });
    }
  }, [messages, isOpen]);

  const handleOpen = () => setIsOpen(true);
  const handleClose = () => setIsOpen(false);

  const handleSend = () => {
    if (!message.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: message.trim(),
      sender: 'user',
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    sendMutation.mutate(message.trim());
    setMessage('');
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderMessage = ({ item: msg }: { item: Message }) => {
    const isUser = msg.sender === 'user';

    return (
      <View style={[styles.messageContainer, isUser && styles.userMessageContainer]}>
        {!isUser && (
          <View style={styles.botAvatar}>
            <Ionicons name="hardware-chip" size={14} color="#6B7280" />
          </View>
        )}
        <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.botBubble]}>
          <Text style={[styles.messageText, isUser && styles.userMessageText]}>{msg.content}</Text>
        </View>
        {isUser && (
          <View style={styles.userAvatar}>
            <Ionicons name="person" size={14} color="#FFFFFF" />
          </View>
        )}
      </View>
    );
  };

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <TouchableOpacity style={styles.fabButton} onPress={handleOpen} activeOpacity={0.8}>
          <Ionicons name="chatbubbles" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      )}

      {/* Chat Modal */}
      <Modal visible={isOpen} animationType="none" transparent>
        <View style={styles.modalOverlay}>
          <Animated.View
            style={[
              styles.chatContainer,
              { transform: [{ translateY: slideAnim }] },
            ]}
          >
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerAvatar}>
                <Ionicons name="hardware-chip" size={20} color="#FFFFFF" />
              </View>
              <View style={styles.headerContent}>
                <Text style={styles.headerTitle}>Support</Text>
                <Text style={styles.headerStatus}>Online</Text>
              </View>
              <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
                <Ionicons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {/* Messages */}
            <FlatList
              ref={flatListRef}
              data={messages}
              renderItem={renderMessage}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.messagesContent}
              showsVerticalScrollIndicator={false}
              onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
            />

            {/* Loading indicator */}
            {sendMutation.isPending && (
              <View style={styles.typingContainer}>
                <View style={styles.botAvatar}>
                  <Ionicons name="hardware-chip" size={14} color="#6B7280" />
                </View>
                <View style={styles.typingBubble}>
                  <ActivityIndicator size="small" color="#6B7280" />
                </View>
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
                maxLength={500}
              />
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  (!message.trim() || sendMutation.isPending) && styles.sendButtonDisabled,
                ]}
                onPress={handleSend}
                disabled={!message.trim() || sendMutation.isPending}
              >
                <Ionicons name="send" size={18} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  fabButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  chatContainer: {
    height: SCREEN_HEIGHT * 0.75,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#8B5CF6',
    gap: 12,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  headerStatus: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  closeButton: {
    padding: 8,
  },
  messagesContent: {
    padding: 16,
    flexGrow: 1,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-end',
  },
  userMessageContainer: {
    flexDirection: 'row-reverse',
  },
  botAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 6,
  },
  userAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 6,
  },
  messageBubble: {
    maxWidth: '75%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
  },
  botBubble: {
    backgroundColor: '#F3F4F6',
    borderBottomLeftRadius: 4,
  },
  userBubble: {
    backgroundColor: '#8B5CF6',
    borderBottomRightRadius: 4,
  },
  messageText: {
    fontSize: 15,
    color: '#111827',
    lineHeight: 20,
  },
  userMessageText: {
    color: '#FFFFFF',
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  typingBubble: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 18,
    borderBottomLeftRadius: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 8,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 20,
    fontSize: 15,
    color: '#111827',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
