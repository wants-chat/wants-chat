/**
 * Dating Chat Component Generators
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
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Loader2, Send, ArrowLeft, MoreVertical, Heart, Image,
  Mic, Gift, Smile, Phone, Video, Shield, Flag, UserX,
  Sparkles, Camera, MapPin, X, Check, CheckCheck
} from 'lucide-react';
import { api } from '@/lib/api';

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
  const { matchId } = useParams<{ matchId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState('');
  const [showActions, setShowActions] = useState(false);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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
      navigate('/matches');
    },
  });

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSendMedia = (type: string, url: string) => {
    sendMutation.mutate({ content: '', type, media_url: url });
    setShowMediaPicker(false);
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
    const groups: Record<string, Message[]> = {};
    msgs.forEach((msg) => {
      const date = new Date(msg.created_at).toDateString();
      if (!groups[date]) groups[date] = [];
      groups[date].push(msg);
    });
    return groups;
  };

  if (matchLoading || messagesLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
      </div>
    );
  }

  if (!match) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <Heart className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
        <p className="text-gray-500 dark:text-gray-400">Match not found</p>
        <Link to="/matches" className="mt-4 text-pink-500 hover:underline">
          Back to Matches
        </Link>
      </div>
    );
  }

  const groupedMessages = groupMessagesByDate(messages || []);

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="flex-shrink-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/matches')}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
            >
              <ArrowLeft className="w-5 h-5 text-gray-500" />
            </button>

            <div
              onClick={() => navigate('/profiles/' + match.id)}
              className="flex items-center gap-3 cursor-pointer"
            >
              <div className="relative">
                <div className="w-10 h-10 rounded-full overflow-hidden">
                  <img src={match.photo} alt={match.name} className="w-full h-full object-cover" />
                </div>
                {match.online && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-1">
                  <h2 className="font-semibold text-gray-900 dark:text-white">{match.name}</h2>
                  {match.verified && (
                    <Shield className="w-4 h-4 text-blue-500" />
                  )}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {match.typing ? (
                    <span className="text-pink-500">Typing...</span>
                  ) : match.online ? (
                    'Online'
                  ) : match.last_seen ? (
                    'Last seen ' + formatTime(match.last_seen)
                  ) : null}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
              <Phone className="w-5 h-5 text-gray-500" />
            </button>
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
              <Video className="w-5 h-5 text-gray-500" />
            </button>
            <div className="relative">
              <button
                onClick={() => setShowActions(!showActions)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
              >
                <MoreVertical className="w-5 h-5 text-gray-500" />
              </button>

              {showActions && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
                  <button className="w-full px-4 py-2 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    View Profile
                  </button>
                  <button className="w-full px-4 py-2 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2">
                    <Flag className="w-4 h-4" />
                    Report
                  </button>
                  <button
                    onClick={() => unmatchMutation.mutate()}
                    className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                  >
                    <UserX className="w-4 h-4" />
                    Unmatch
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Match Header */}
        <div className="text-center mb-8 pt-4">
          <div className="inline-block">
            <div className="w-24 h-24 mx-auto rounded-full overflow-hidden border-4 border-pink-500 mb-3">
              <img src={match.photo} alt={match.name} className="w-full h-full object-cover" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              You matched with {match.name}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Start the conversation!
            </p>
          </div>
        </div>

        {/* Message Groups */}
        {Object.entries(groupedMessages).map(([date, msgs]) => (
          <div key={date}>
            {/* Date Divider */}
            <div className="flex items-center justify-center my-6">
              <span className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded-full text-xs text-gray-500 dark:text-gray-400">
                {formatDate(msgs[0].created_at)}
              </span>
            </div>

            {/* Messages */}
            {msgs.map((msg, idx) => {
              const showAvatar = !msg.is_mine && (idx === 0 || msgs[idx - 1]?.is_mine);

              return (
                <div
                  key={msg.id}
                  className={\`flex mb-2 \${msg.is_mine ? 'justify-end' : 'justify-start'}\`}
                >
                  {!msg.is_mine && showAvatar && (
                    <div className="w-8 h-8 rounded-full overflow-hidden mr-2 flex-shrink-0">
                      <img src={match.photo} alt="" className="w-full h-full object-cover" />
                    </div>
                  )}
                  {!msg.is_mine && !showAvatar && <div className="w-8 mr-2" />}

                  <div className={\`max-w-[75%] group \${msg.is_mine ? 'order-1' : ''}\`}>
                    {/* Message Bubble */}
                    <div
                      className={\`relative px-4 py-2 rounded-2xl \${
                        msg.is_mine
                          ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-br-sm'
                          : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-sm shadow-sm'
                      }\`}
                    >
                      {/* Content */}
                      {msg.type === 'text' && <p>{msg.content}</p>}

                      {msg.type === 'image' && (
                        <img
                          src={msg.media_url}
                          alt=""
                          className="rounded-lg max-w-full"
                        />
                      )}

                      {msg.type === 'gif' && (
                        <img
                          src={msg.media_url}
                          alt=""
                          className="rounded-lg max-w-[200px]"
                        />
                      )}

                      {msg.type === 'voice' && (
                        <div className="flex items-center gap-2">
                          <button className="p-2 rounded-full bg-white/20">
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </button>
                          <div className="w-32 h-1 bg-white/30 rounded-full">
                            <div className="w-1/3 h-full bg-white rounded-full" />
                          </div>
                          <span className="text-xs">0:15</span>
                        </div>
                      )}

                      {msg.type === 'gift' && (
                        <div className="text-center py-2">
                          <Gift className="w-12 h-12 mx-auto text-yellow-400 mb-2" />
                          <p className="text-sm">Sent a gift!</p>
                        </div>
                      )}

                      {msg.type === 'location' && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-5 h-5" />
                          <span>Shared location</span>
                        </div>
                      )}

                      {/* Reaction */}
                      {msg.reaction && (
                        <span className="absolute -bottom-3 right-2 text-lg">
                          {msg.reaction}
                        </span>
                      )}
                    </div>

                    {/* Time & Read Status */}
                    <div className={\`flex items-center gap-1 mt-1 text-xs text-gray-400 \${
                      msg.is_mine ? 'justify-end' : 'justify-start'
                    }\`}>
                      <span>{formatTime(msg.created_at)}</span>
                      {msg.is_mine && (
                        msg.read_at ? (
                          <CheckCheck className="w-3 h-3 text-blue-500" />
                        ) : (
                          <Check className="w-3 h-3" />
                        )
                      )}
                    </div>

                    {/* Quick Reactions (hidden by default, shown on hover) */}
                    <div className={\`absolute \${msg.is_mine ? 'left-0 -translate-x-full pl-2' : 'right-0 translate-x-full pr-2'} top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity\`}>
                      <div className="flex bg-white dark:bg-gray-700 rounded-full shadow-lg p-1">
                        {['❤️', '😂', '😮', '😢', '🔥'].map((emoji) => (
                          <button
                            key={emoji}
                            onClick={() => reactMutation.mutate({ message_id: msg.id, reaction: emoji })}
                            className="p-1 hover:scale-125 transition-transform"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}

        <div ref={messagesEndRef} />
      </div>

      {/* Media Picker */}
      {showMediaPicker && (
        <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
          <div className="flex justify-around">
            <button className="flex flex-col items-center gap-1 p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                <Camera className="w-6 h-6 text-purple-500" />
              </div>
              <span className="text-xs text-gray-600 dark:text-gray-400">Camera</span>
            </button>
            <button className="flex flex-col items-center gap-1 p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <Image className="w-6 h-6 text-blue-500" />
              </div>
              <span className="text-xs text-gray-600 dark:text-gray-400">Gallery</span>
            </button>
            <button className="flex flex-col items-center gap-1 p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-green-500" />
              </div>
              <span className="text-xs text-gray-600 dark:text-gray-400">GIF</span>
            </button>
            <button className="flex flex-col items-center gap-1 p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl">
              <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center">
                <Gift className="w-6 h-6 text-yellow-500" />
              </div>
              <span className="text-xs text-gray-600 dark:text-gray-400">Gift</span>
            </button>
            <button className="flex flex-col items-center gap-1 p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <MapPin className="w-6 h-6 text-red-500" />
              </div>
              <span className="text-xs text-gray-600 dark:text-gray-400">Location</span>
            </button>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="flex-shrink-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowMediaPicker(!showMediaPicker)}
            className={\`p-2 rounded-full transition-colors \${
              showMediaPicker ? 'bg-pink-100 dark:bg-pink-900/30 text-pink-500' : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500'
            }\`}
          >
            {showMediaPicker ? <X className="w-6 h-6" /> : <Image className="w-6 h-6" />}
          </button>

          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={\`Message \${match.name}...\`}
              className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-pink-500 text-gray-900 dark:text-white placeholder-gray-500 pr-10"
            />
            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <Smile className="w-5 h-5" />
            </button>
          </div>

          {message.trim() ? (
            <button
              onClick={handleSend}
              disabled={sendMutation.isPending}
              className="p-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-full hover:shadow-lg transition-shadow disabled:opacity-50"
            >
              <Send className="w-5 h-5" />
            </button>
          ) : (
            <button
              onMouseDown={() => setIsRecording(true)}
              onMouseUp={() => setIsRecording(false)}
              onMouseLeave={() => setIsRecording(false)}
              className={\`p-3 rounded-full transition-all \${
                isRecording
                  ? 'bg-red-500 text-white scale-110'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600'
              }\`}
            >
              <Mic className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Recording Indicator */}
        {isRecording && (
          <div className="flex items-center justify-center gap-2 mt-2 text-red-500">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-sm">Recording... Release to send</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ${componentName};
`;
}
