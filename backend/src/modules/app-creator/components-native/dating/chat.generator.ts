/**
 * Dating Chat Component Generators (React Native)
 *
 * Generates chat interfaces specialized for dating applications.
 */

export interface DatingChatOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateChatWindowDating(options: DatingChatOptions = {}): string {
  const { componentName = 'ChatWindowDating', endpoint = '/matches' } = options;

  return `import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Modal,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

const { width } = Dimensions.get('window');

interface Message {
  id: string;
  content: string;
  type: 'text' | 'image' | 'gif' | 'voice' | 'gift' | 'location';
  sender_id: string;
  is_mine: boolean;
  created_at: string;
  read_at?: string;
  reaction?: string;
  media_url?: string;
}

interface MatchProfile {
  id: string;
  name: string;
  photo: string;
  age?: number;
  online?: boolean;
  last_seen?: string;
  verified?: boolean;
  typing?: boolean;
}

interface ${componentName}Props {
  onUnmatch?: () => void;
}

const ${componentName}: React.FC<${componentName}Props> = ({ onUnmatch }) => {
  const route = useRoute();
  const navigation = useNavigation();
  const { matchId } = route.params as { matchId: string };
  const queryClient = useQueryClient();
  const [message, setMessage] = useState('');
  const [showActions, setShowActions] = useState(false);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  // Fetch match profile
  const { data: match, isLoading: matchLoading } = useQuery({
    queryKey: ['match', matchId],
    queryFn: async () => {
      const response = await api.get<MatchProfile>('${endpoint}/' + matchId);
      return response?.data || response;
    },
  });

  // Fetch messages
  const { data: messages, isLoading: messagesLoading } = useQuery({
    queryKey: ['messages', matchId],
    queryFn: async () => {
      const response = await api.get<Message[]>('${endpoint}/' + matchId + '/messages');
      return Array.isArray(response) ? response : (response?.data || []);
    },
    refetchInterval: 3000,
  });

  // Send message mutation
  const sendMutation = useMutation({
    mutationFn: (data: { content: string; type: string; media_url?: string }) =>
      api.post('${endpoint}/' + matchId + '/messages', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', matchId] });
      setMessage('');
    },
  });

  // Send reaction mutation
  const reactMutation = useMutation({
    mutationFn: (data: { message_id: string; reaction: string }) =>
      api.post('${endpoint}/' + matchId + '/messages/' + data.message_id + '/react', {
        reaction: data.reaction,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', matchId] });
    },
  });

  // Unmatch mutation
  const unmatchMutation = useMutation({
    mutationFn: () => api.delete('${endpoint}/' + matchId),
    onSuccess: () => {
      if (onUnmatch) onUnmatch();
      navigation.goBack();
    },
  });

  // Scroll to bottom on new messages
  useEffect(() => {
    if (messages?.length) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  // Send typing indicator
  useEffect(() => {
    if (message.trim()) {
      api.post('${endpoint}/' + matchId + '/typing', { typing: true });
    }
  }, [message, matchId]);

  const handleSend = () => {
    if (message.trim()) {
      sendMutation.mutate({ content: message.trim(), type: 'text' });
    }
  };

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date: string) => {
    const d = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (d.toDateString() === today.toDateString()) return 'Today';
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const groupMessagesByDate = (msgs: Message[]) => {
    const groups: { date: string; messages: Message[] }[] = [];
    let currentDate = '';

    msgs.forEach((msg) => {
      const msgDate = new Date(msg.created_at).toDateString();
      if (msgDate !== currentDate) {
        currentDate = msgDate;
        groups.push({ date: msgDate, messages: [msg] });
      } else {
        groups[groups.length - 1].messages.push(msg);
      }
    });

    return groups;
  };

  if (matchLoading || messagesLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#EC4899" />
      </View>
    );
  }

  if (!match) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="heart" size={64} color="#D1D5DB" />
        <Text style={styles.emptyText}>Match not found</Text>
        <TouchableOpacity style={styles.backLink} onPress={() => navigation.goBack()}>
          <Text style={styles.backLinkText}>Back to Matches</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const groupedMessages = groupMessagesByDate(messages || []);

  const renderMessage = ({ item: msg, index }: { item: Message; index: number }) => {
    const showAvatar = !msg.is_mine && (index === 0 || messages?.[index - 1]?.is_mine);

    return (
      <View style={[styles.messageRow, msg.is_mine && styles.messageRowMine]}>
        {!msg.is_mine && showAvatar && (
          <View style={styles.messageAvatar}>
            {match.photo ? (
              <Image source={{ uri: match.photo }} style={styles.avatarImage} />
            ) : (
              <Ionicons name="person" size={16} color="#D1D5DB" />
            )}
          </View>
        )}
        {!msg.is_mine && !showAvatar && <View style={styles.avatarSpacer} />}

        <View style={styles.messageContent}>
          <View style={[styles.messageBubble, msg.is_mine ? styles.bubbleMine : styles.bubbleTheirs]}>
            {msg.type === 'text' && (
              <Text style={[styles.messageText, msg.is_mine && styles.messageTextMine]}>
                {msg.content}
              </Text>
            )}

            {msg.type === 'image' && msg.media_url && (
              <Image source={{ uri: msg.media_url }} style={styles.messageImage} />
            )}

            {msg.type === 'gif' && msg.media_url && (
              <Image source={{ uri: msg.media_url }} style={styles.messageGif} />
            )}

            {msg.type === 'voice' && (
              <View style={styles.voiceMessage}>
                <TouchableOpacity style={styles.playButton}>
                  <Ionicons name="play" size={16} color="#FFFFFF" />
                </TouchableOpacity>
                <View style={styles.waveform}>
                  <View style={styles.waveformFill} />
                </View>
                <Text style={[styles.voiceDuration, msg.is_mine && styles.voiceDurationMine]}>
                  0:15
                </Text>
              </View>
            )}

            {msg.type === 'gift' && (
              <View style={styles.giftMessage}>
                <Ionicons name="gift" size={48} color="#EAB308" />
                <Text style={[styles.giftText, msg.is_mine && styles.giftTextMine]}>
                  Sent a gift!
                </Text>
              </View>
            )}

            {msg.type === 'location' && (
              <View style={styles.locationMessage}>
                <Ionicons name="location" size={20} color={msg.is_mine ? '#FFFFFF' : '#111827'} />
                <Text style={[styles.locationText, msg.is_mine && styles.locationTextMine]}>
                  Shared location
                </Text>
              </View>
            )}

            {msg.reaction && <Text style={styles.reaction}>{msg.reaction}</Text>}
          </View>

          <View style={[styles.messageMeta, msg.is_mine && styles.messageMetaMine]}>
            <Text style={styles.messageTime}>{formatTime(msg.created_at)}</Text>
            {msg.is_mine && (
              <Ionicons
                name={msg.read_at ? 'checkmark-done' : 'checkmark'}
                size={14}
                color={msg.read_at ? '#3B82F6' : '#9CA3AF'}
              />
            )}
          </View>
        </View>
      </View>
    );
  };

  const renderDateHeader = (date: string) => (
    <View style={styles.dateHeader}>
      <Text style={styles.dateHeaderText}>{formatDate(date)}</Text>
    </View>
  );

  const mediaOptions = [
    { icon: 'camera', label: 'Camera', color: '#8B5CF6' },
    { icon: 'images', label: 'Gallery', color: '#3B82F6' },
    { icon: 'sparkles', label: 'GIF', color: '#22C55E' },
    { icon: 'gift', label: 'Gift', color: '#EAB308' },
    { icon: 'location', label: 'Location', color: '#EF4444' },
  ];

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.profileInfo}
          onPress={() => navigation.navigate('ProfileDetail' as never, { id: match.id } as never)}
        >
          <View style={styles.headerAvatar}>
            {match.photo ? (
              <Image source={{ uri: match.photo }} style={styles.headerAvatarImage} />
            ) : (
              <View style={styles.headerAvatarPlaceholder}>
                <Ionicons name="person" size={20} color="#D1D5DB" />
              </View>
            )}
            {match.online && <View style={styles.onlineDot} />}
          </View>
          <View style={styles.headerText}>
            <View style={styles.nameRow}>
              <Text style={styles.headerName}>{match.name}</Text>
              {match.verified && (
                <Ionicons name="shield-checkmark" size={16} color="#3B82F6" />
              )}
            </View>
            <Text style={styles.headerStatus}>
              {match.typing ? (
                <Text style={styles.typingText}>Typing...</Text>
              ) : match.online ? (
                'Online'
              ) : match.last_seen ? (
                'Last seen ' + formatTime(match.last_seen)
              ) : null}
            </Text>
          </View>
        </TouchableOpacity>

        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="call" size={22} color="#6B7280" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="videocam" size={22} color="#6B7280" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => setShowActions(!showActions)}
          >
            <Ionicons name="ellipsis-vertical" size={22} color="#6B7280" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Actions Menu */}
      {showActions && (
        <View style={styles.actionsMenu}>
          <TouchableOpacity style={styles.actionMenuItem}>
            <Ionicons name="person" size={20} color="#374151" />
            <Text style={styles.actionMenuText}>View Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionMenuItem}>
            <Ionicons name="flag" size={20} color="#374151" />
            <Text style={styles.actionMenuText}>Report</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionMenuItem}
            onPress={() => unmatchMutation.mutate()}
          >
            <Ionicons name="person-remove" size={20} color="#EF4444" />
            <Text style={[styles.actionMenuText, styles.actionMenuTextDanger]}>Unmatch</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages || []}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={() => (
          <View style={styles.matchHeader}>
            <View style={styles.matchAvatarLarge}>
              {match.photo ? (
                <Image source={{ uri: match.photo }} style={styles.matchAvatarLargeImage} />
              ) : (
                <Ionicons name="person" size={40} color="#D1D5DB" />
              )}
            </View>
            <Text style={styles.matchHeaderTitle}>You matched with {match.name}</Text>
            <Text style={styles.matchHeaderSubtitle}>Start the conversation!</Text>
          </View>
        )}
      />

      {/* Media Picker */}
      {showMediaPicker && (
        <View style={styles.mediaPicker}>
          {mediaOptions.map((option) => (
            <TouchableOpacity key={option.label} style={styles.mediaOption}>
              <View style={[styles.mediaOptionIcon, { backgroundColor: option.color + '20' }]}>
                <Ionicons name={option.icon as any} size={24} color={option.color} />
              </View>
              <Text style={styles.mediaOptionLabel}>{option.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Input Area */}
      <View style={styles.inputContainer}>
        <TouchableOpacity
          style={[styles.mediaButton, showMediaPicker && styles.mediaButtonActive]}
          onPress={() => setShowMediaPicker(!showMediaPicker)}
        >
          <Ionicons
            name={showMediaPicker ? 'close' : 'add'}
            size={24}
            color={showMediaPicker ? '#EC4899' : '#6B7280'}
          />
        </TouchableOpacity>

        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            value={message}
            onChangeText={setMessage}
            placeholder={\`Message \${match.name}...\`}
            placeholderTextColor="#9CA3AF"
            multiline
            maxLength={1000}
          />
          <TouchableOpacity style={styles.emojiButton}>
            <Ionicons name="happy" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {message.trim() ? (
          <TouchableOpacity
            style={styles.sendButton}
            onPress={handleSend}
            disabled={sendMutation.isPending}
          >
            <Ionicons name="send" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.micButton, isRecording && styles.micButtonRecording]}
            onPressIn={() => setIsRecording(true)}
            onPressOut={() => setIsRecording(false)}
          >
            <Ionicons name="mic" size={24} color={isRecording ? '#FFFFFF' : '#6B7280'} />
          </TouchableOpacity>
        )}
      </View>

      {/* Recording Indicator */}
      {isRecording && (
        <View style={styles.recordingIndicator}>
          <View style={styles.recordingDot} />
          <Text style={styles.recordingText}>Recording... Release to send</Text>
        </View>
      )}
    </KeyboardAvoidingView>
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    fontSize: 14,
    color: '#EC4899',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  profileInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerAvatar: {
    position: 'relative',
  },
  headerAvatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  headerAvatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  onlineDot: {
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
  headerText: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  headerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  headerStatus: {
    fontSize: 12,
    color: '#6B7280',
  },
  typingText: {
    color: '#EC4899',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 4,
  },
  headerButton: {
    padding: 8,
  },
  actionsMenu: {
    position: 'absolute',
    top: 70,
    right: 16,
    width: 200,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 100,
    paddingVertical: 8,
  },
  actionMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  actionMenuText: {
    fontSize: 14,
    color: '#374151',
  },
  actionMenuTextDanger: {
    color: '#EF4444',
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
  },
  matchHeader: {
    alignItems: 'center',
    paddingVertical: 32,
    marginBottom: 16,
  },
  matchAvatarLarge: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 4,
    borderColor: '#EC4899',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    marginBottom: 12,
  },
  matchAvatarLargeImage: {
    width: '100%',
    height: '100%',
  },
  matchHeaderTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  matchHeaderSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  dateHeader: {
    alignItems: 'center',
    marginVertical: 24,
  },
  dateHeaderText: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 12,
    fontSize: 12,
    color: '#6B7280',
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  messageRowMine: {
    justifyContent: 'flex-end',
  },
  messageAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    overflow: 'hidden',
    marginRight: 8,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarSpacer: {
    width: 40,
  },
  messageContent: {
    maxWidth: '75%',
  },
  messageBubble: {
    padding: 12,
    borderRadius: 20,
  },
  bubbleMine: {
    backgroundColor: '#EC4899',
    borderBottomRightRadius: 4,
  },
  bubbleTheirs: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    color: '#111827',
  },
  messageTextMine: {
    color: '#FFFFFF',
  },
  messageImage: {
    width: 200,
    height: 200,
    borderRadius: 12,
  },
  messageGif: {
    width: 150,
    height: 150,
    borderRadius: 12,
  },
  voiceMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  playButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  waveform: {
    width: 100,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
  },
  waveformFill: {
    width: '30%',
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
  },
  voiceDuration: {
    fontSize: 12,
    color: '#111827',
  },
  voiceDurationMine: {
    color: '#FFFFFF',
  },
  giftMessage: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  giftText: {
    marginTop: 8,
    fontSize: 14,
    color: '#111827',
  },
  giftTextMine: {
    color: '#FFFFFF',
  },
  locationMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  locationText: {
    fontSize: 14,
    color: '#111827',
  },
  locationTextMine: {
    color: '#FFFFFF',
  },
  reaction: {
    position: 'absolute',
    bottom: -8,
    right: 8,
    fontSize: 16,
  },
  messageMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  messageMetaMine: {
    justifyContent: 'flex-end',
  },
  messageTime: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  mediaPicker: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  mediaOption: {
    alignItems: 'center',
    gap: 8,
  },
  mediaOptionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mediaOptionLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 12,
  },
  mediaButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mediaButtonActive: {
    backgroundColor: '#FDF2F8',
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#F3F4F6',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  input: {
    flex: 1,
    maxHeight: 100,
    fontSize: 16,
    color: '#111827',
    paddingVertical: 4,
  },
  emojiButton: {
    padding: 4,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EC4899',
    justifyContent: 'center',
    alignItems: 'center',
  },
  micButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  micButtonRecording: {
    backgroundColor: '#EF4444',
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 8,
    backgroundColor: '#FFFFFF',
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  recordingText: {
    fontSize: 14,
    color: '#EF4444',
  },
});

export default ${componentName};
`;
}
