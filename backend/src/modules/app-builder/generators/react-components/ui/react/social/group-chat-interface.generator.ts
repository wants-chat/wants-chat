import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateGroupChatInterface = (
  resolved: ResolvedComponent,
  variant: 'standard' | 'detailed' | 'compact' = 'standard'
) => {
  const dataSource = resolved.dataSource;

  const getField = (fieldName: string): string => {
    const mapping = resolved.fieldMappings.find(m => m.targetField === fieldName);
    if (mapping?.sourceField) {
      return `propData?.${mapping.sourceField}`;
    }
    // Return undefined/empty for missing data - let component handle gracefully
    // For ID fields
    if (fieldName === 'id' || fieldName.endsWith('Id')) {
      return `propData?.id || ${dataName}?._id`;
    }
    // For array fields
    if (fieldName.match(/items|steps|updates|timeline|list|array|images|products|users|orders|features|links|stats|statistics|metrics|categories|tags|members|avatars|methods|examples|reviews|comments|notifications|messages|events|courses|lessons|modules|posts|articles|videos|photos|data|results|activities|cards|testimonials|faqs|questions|answers|options|choices|variants|attributes|filters|transactions|invoices|payments|receipts|shipments|deliveries/i)) {
      return `propData?.${fieldName} || ([] as any[])`;
    }
    // For object fields
    if (fieldName.match(/address|metadata|config|settings|tracking|gallery/i)) {
      return `propData?.${fieldName} || ({} as any)`;
    }
    // For scalar values - return empty string as fallback
    return `propData?.${fieldName} || ''`;
  };

  // Parse data source for clean prop naming (sanitize to camelCase)
  const sanitizeVariableName = (name: string): string => {
    // Replace dots and underscores with camelCase
    return name
      .split(/[._]/)
      .map((part, index) => {
        if (index === 0) {
          return part;
        }
        return part.charAt(0).toUpperCase() + part.slice(1);
      })
      .join('');
  };

  const getDataPath = () => {
    if (!dataSource || dataSource.trim() === '') return 'data';
    const parts = dataSource.split('.');
    const lastPart = parts[parts.length - 1];
    return lastPart ? sanitizeVariableName(lastPart) : 'data';
  };

  const dataName = getDataPath();

  // Get API route for data fetching
  const getApiRoute = () => {
    if (resolved.actions && resolved.actions.length > 0) {
      const fetchAction = resolved.actions.find((a: any) => a.type === 'fetch');
      if (fetchAction?.serverFunction?.route) {
        return fetchAction.serverFunction.route.replace(/^\/api\/v1\//, '/');
      }
    }
    return `/${dataSource || 'chat'}`;
  };

  const apiRoute = getApiRoute();
  const entity = dataSource?.split('.').pop() || 'chat';

  const commonImports = `
import React, { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';
import { Loader2 } from 'lucide-react';`;

  const variants = {
    standard: `
${commonImports}
import { Send, Paperclip, Users, Settings, LogOut, Volume2, VolumeX, Image as ImageIcon } from 'lucide-react';

interface Message {
  id: number;
  sender: {
    id: number;
    name: string;
    avatar: string;
  };
  content: string;
  timestamp: string;
  type: string;
  isOwn: boolean;
}

interface Member {
  id: number;
  name: string;
  avatar: string;
  role: string;
  status: string;
  lastSeen: string;
}

interface StandardGroupChatProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

const StandardGroupChat: React.FC<StandardGroupChatProps> = ({ ${dataName}: propData, className }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [showMembers, setShowMembers] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  // Fetch data from API if no props data provided
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      try {
        const response = await api.get<any>('${apiRoute}');
        return response?.data || response;
      } catch (err) {
        console.error('Failed to fetch chat data:', err);
        return {};
      }
    },
    enabled: !propData,
    retry: 1,
  });

  // Mutation for sending messages
  const sendMessageMutation = useMutation({
    mutationFn: async (messageContent: string) => {
      const response = await api.post<any>('${apiRoute}', { content: messageContent });
      return response?.data || response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['${entity}'] });
    },
  });

  // Use prop data if available, otherwise use fetched data
  const ${dataName} = propData || fetchedData || {};

  // Loading state
  if (isLoading && !propData) {
    return (
      <div className={cn("flex flex-col h-screen max-h-[800px] items-center justify-center", className)}>
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <p className="mt-2 text-gray-500">Loading chat...</p>
      </div>
    );
  }

  const chatData = ${dataName} || {};

  const title = ${getField('standardTitle')};
  const subtitle = ${getField('standardSubtitle')};
  const groupName = ${getField('groupName')};
  const groupAvatar = ${getField('groupAvatar')};
  const memberCount = ${getField('memberCount')};
  const initialMessages = ${getField('messages')};
  const members = ${getField('members')};
  const messagePlaceholder = ${getField('messagePlaceholder')};
  const sendButton = ${getField('sendButton')};
  const addMembersButton = ${getField('addMembersButton')};
  const groupSettingsButton = ${getField('groupSettingsButton')};
  const leaveGroupButton = ${getField('leaveGroupButton')};
  const muteButton = ${getField('muteButton')};
  const unmuteButton = ${getField('unmuteButton')};
  const membersLabel = ${getField('membersLabel')};
  const onlineLabel = ${getField('onlineLabel')};
  const adminLabel = ${getField('adminLabel')};

  useEffect(() => {
    setMessages(initialMessages);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message: Message = {
      id: Date.now(),
      sender: {
        id: 5,
        name: 'You',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop'
      },
      content: newMessage,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      type: 'text',
      isOwn: true
    };

    // Send via API mutation
    sendMessageMutation.mutate(newMessage.trim());
    setMessages(prev => [...prev, message]);
    setNewMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleMute = () => {
    console.log(\`Group \${isMuted ? 'unmuted' : 'muted'}\`);
    setIsMuted(!isMuted);
  };

  const handleLeaveGroup = () => {
    console.log('Leave group clicked');
  };

  const handleGroupSettings = () => {
    console.log('Group settings clicked');
  };

  const handleAddMembers = () => {
    console.log('Add members clicked');
  };

  const handleAttachment = () => {
    console.log('Attachment clicked');
  };

  return (
    <div className={cn("flex flex-col h-screen max-h-[800px]", className)}>
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{title}</h2>
        <p className="text-gray-600 dark:text-gray-400">{subtitle}</p>
      </div>

      <Card className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="border-b dark:border-gray-700 p-4 flex items-center justify-between bg-white dark:bg-gray-800">
          <div className="flex items-center gap-3">
            <img src={groupAvatar} alt={groupName} className="w-12 h-12 rounded-full object-cover" />
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white">{groupName}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{memberCount} {membersLabel}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowMembers(!showMembers)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
            >
              <Users className="h-5 w-5" />
            </button>
            <button
              onClick={toggleMute}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
            >
              {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            </button>
            <button
              onClick={handleGroupSettings}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
            >
              <Settings className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Messages */}
          <div className="flex-1 flex flex-col">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-3",
                    message.isOwn && "flex-row-reverse"
                  )}
                >
                  {!message.isOwn && (
                    <img
                      src={message.sender.avatar}
                      alt={message.sender.name}
                      className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                    />
                  )}
                  <div className={cn("flex flex-col", message.isOwn && "items-end")}>
                    {!message.isOwn && (
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                        {message.sender.name}
                      </span>
                    )}
                    <div
                      className={cn(
                        "max-w-md px-4 py-2 rounded-2xl",
                        message.isOwn
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                      )}
                    >
                      <p className="text-sm">{message.content}</p>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {message.timestamp}
                    </span>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t dark:border-gray-700 p-4 bg-white dark:bg-gray-800">
              <div className="flex items-end gap-2">
                <button
                  onClick={handleAttachment}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
                >
                  <Paperclip className="h-5 w-5" />
                </button>
                <div className="flex-1">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={messagePlaceholder}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={1}
                  />
                </div>
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Members Sidebar */}
          {showMembers && (
            <div className="w-64 border-l dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 overflow-y-auto">
              <div className="p-4">
                <h4 className="font-bold text-gray-900 dark:text-white mb-4">
                  {membersLabel} ({memberCount})
                </h4>
                <button
                  onClick={handleAddMembers}
                  className="w-full mb-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  {addMembersButton}
                </button>
                <div className="space-y-3">
                  {members.map((member) => (
                    <div key={member.id} className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={member.avatar}
                          alt={member.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        {member.status === 'online' && (
                          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {member.name}
                          </p>
                          {member.role === 'Admin' && (
                            <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded">
                              {adminLabel}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {member.status === 'online' ? onlineLabel : member.lastSeen}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  onClick={handleLeaveGroup}
                  className="w-full mt-4 px-4 py-2 bg-red-100 hover:bg-red-200 dark:bg-red-900 dark:hover:bg-red-800 text-red-700 dark:text-red-300 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  {leaveGroupButton}
                </button>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default StandardGroupChat;
    `,

    detailed: `
${commonImports}
import { Send, Paperclip, Users, Settings, LogOut, Volume2, VolumeX, Image as ImageIcon, File, Video, Search, MoreVertical, Pin } from 'lucide-react';

interface Message {
  id: number;
  sender: {
    id: number;
    name: string;
    avatar: string;
  };
  content: string;
  timestamp: string;
  type: string;
  isOwn: boolean;
}

interface Member {
  id: number;
  name: string;
  avatar: string;
  role: string;
  status: string;
  lastSeen: string;
}

interface SharedMedia {
  id: number;
  type: string;
  url?: string;
  thumbnail?: string;
  name?: string;
  size?: string;
  sender: string;
  date: string;
}

interface DetailedGroupChatProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

const DetailedGroupChat: React.FC<DetailedGroupChatProps> = ({ ${dataName}: propData, className }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [showSidebar, setShowSidebar] = useState(true);
  const [sidebarTab, setSidebarTab] = useState<'members' | 'media'>('members');
  const [isMuted, setIsMuted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  // Fetch data from API if no props data provided
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      try {
        const response = await api.get<any>('${apiRoute}');
        return response?.data || response;
      } catch (err) {
        console.error('Failed to fetch chat data:', err);
        return {};
      }
    },
    enabled: !propData,
    retry: 1,
  });

  // Mutation for sending messages
  const sendMessageMutation = useMutation({
    mutationFn: async (messageContent: string) => {
      const response = await api.post<any>('${apiRoute}', { content: messageContent });
      return response?.data || response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['${entity}'] });
    },
  });

  // Use prop data if available, otherwise use fetched data
  const ${dataName} = propData || fetchedData || {};

  // Loading state
  if (isLoading && !propData) {
    return (
      <div className={cn("flex flex-col h-screen max-h-[800px] items-center justify-center", className)}>
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <p className="mt-2 text-gray-500">Loading chat...</p>
      </div>
    );
  }

  const chatData = ${dataName} || {};

  const title = ${getField('detailedTitle')};
  const subtitle = ${getField('detailedSubtitle')};
  const groupName = ${getField('groupName')};
  const groupAvatar = ${getField('groupAvatar')};
  const groupDescription = ${getField('groupDescription')};
  const memberCount = ${getField('memberCount')};
  const createdDate = ${getField('createdDate')};
  const initialMessages = ${getField('messages')};
  const members = ${getField('members')};
  const sharedMedia = ${getField('sharedMedia')};
  const messagePlaceholder = ${getField('messagePlaceholder')};
  const sendButton = ${getField('sendButton')};
  const addMembersButton = ${getField('addMembersButton')};
  const groupSettingsButton = ${getField('groupSettingsButton')};
  const leaveGroupButton = ${getField('leaveGroupButton')};
  const muteButton = ${getField('muteButton')};
  const unmuteButton = ${getField('unmuteButton')};
  const viewMediaButton = ${getField('viewMediaButton')};
  const membersLabel = ${getField('membersLabel')};
  const onlineLabel = ${getField('onlineLabel')};
  const adminLabel = ${getField('adminLabel')};
  const sharedMediaLabel = ${getField('sharedMediaLabel')};
  const photosLabel = ${getField('photosLabel')};
  const filesLabel = ${getField('filesLabel')};

  useEffect(() => {
    setMessages(initialMessages);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message: Message = {
      id: Date.now(),
      sender: {
        id: 5,
        name: 'You',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop'
      },
      content: newMessage,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      type: 'text',
      isOwn: true
    };

    // Send via API mutation
    sendMessageMutation.mutate(newMessage.trim());
    setMessages(prev => [...prev, message]);
    setNewMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleMute = () => {
    console.log(\`Group \${isMuted ? 'unmuted' : 'muted'}\`);
    setIsMuted(!isMuted);
  };

  const handleLeaveGroup = () => {
    console.log('Leave group clicked');
  };

  const handleGroupSettings = () => {
    console.log('Group settings clicked');
  };

  const handleAddMembers = () => {
    console.log('Add members clicked');
  };

  const handleAttachment = () => {
    console.log('Attachment clicked');
  };

  const handleMediaClick = (media: SharedMedia) => {
    console.log('Media clicked:', media);
  };

  const handleMemberClick = (member: Member) => {
    console.log('Member clicked:', member);
  };

  return (
    <div className={cn("flex flex-col h-screen max-h-[800px]", className)}>
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{title}</h2>
        <p className="text-gray-600 dark:text-gray-400">{subtitle}</p>
      </div>

      <Card className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="border-b dark:border-gray-700 p-4 flex items-center justify-between bg-white dark:bg-gray-800">
          <div className="flex items-center gap-3">
            <img src={groupAvatar} alt={groupName} className="w-12 h-12 rounded-full object-cover" />
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white">{groupName}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{memberCount} {membersLabel}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400">
              <Search className="h-5 w-5" />
            </button>
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
            >
              <Users className="h-5 w-5" />
            </button>
            <button
              onClick={toggleMute}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
            >
              {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            </button>
            <button
              onClick={handleGroupSettings}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
            >
              <Settings className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Messages */}
          <div className="flex-1 flex flex-col">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-3 group",
                    message.isOwn && "flex-row-reverse"
                  )}
                >
                  {!message.isOwn && (
                    <img
                      src={message.sender.avatar}
                      alt={message.sender.name}
                      className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                    />
                  )}
                  <div className={cn("flex flex-col", message.isOwn && "items-end")}>
                    {!message.isOwn && (
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                        {message.sender.name}
                      </span>
                    )}
                    <div className="flex items-center gap-2">
                      {message.isOwn && (
                        <button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                          <MoreVertical className="h-4 w-4 text-gray-400" />
                        </button>
                      )}
                      <div
                        className={cn(
                          "max-w-md px-4 py-2 rounded-2xl",
                          message.isOwn
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                        )}
                      >
                        <p className="text-sm">{message.content}</p>
                      </div>
                      {!message.isOwn && (
                        <button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                          <MoreVertical className="h-4 w-4 text-gray-400" />
                        </button>
                      )}
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {message.timestamp}
                    </span>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t dark:border-gray-700 p-4 bg-white dark:bg-gray-800">
              <div className="flex items-end gap-2">
                <button
                  onClick={handleAttachment}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
                >
                  <Paperclip className="h-5 w-5" />
                </button>
                <div className="flex-1">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={messagePlaceholder}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={2}
                  />
                </div>
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          {showSidebar && (
            <div className="w-80 border-l dark:border-gray-700 bg-white dark:bg-gray-800 overflow-y-auto flex flex-col">
              {/* Group Info */}
              <div className="p-6 border-b dark:border-gray-700 text-center">
                <img src={groupAvatar} alt={groupName} className="w-24 h-24 rounded-full object-cover mx-auto mb-4" />
                <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-2">{groupName}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{groupDescription}</p>
                <p className="text-xs text-gray-500 dark:text-gray-500">{createdDate}</p>
              </div>

              {/* Tabs */}
              <div className="flex border-b dark:border-gray-700">
                <button
                  onClick={() => setSidebarTab('members')}
                  className={cn(
                    "flex-1 px-4 py-3 text-sm font-medium transition-colors",
                    sidebarTab === 'members'
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  )}
                >
                  {membersLabel}
                </button>
                <button
                  onClick={() => setSidebarTab('media')}
                  className={cn(
                    "flex-1 px-4 py-3 text-sm font-medium transition-colors",
                    sidebarTab === 'media'
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  )}
                >
                  {sharedMediaLabel}
                </button>
              </div>

              {/* Tab Content */}
              <div className="flex-1 overflow-y-auto p-4">
                {sidebarTab === 'members' ? (
                  <div>
                    <button
                      onClick={handleAddMembers}
                      className="w-full mb-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      {addMembersButton}
                    </button>
                    <div className="space-y-3">
                      {members.map((member) => (
                        <button
                          key={member.id}
                          onClick={() => handleMemberClick(member)}
                          className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          <div className="relative">
                            <img
                              src={member.avatar}
                              alt={member.name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                            {member.status === 'online' && (
                              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800" />
                            )}
                          </div>
                          <div className="flex-1 text-left min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                {member.name}
                              </p>
                              {member.role === 'Admin' && (
                                <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded">
                                  {adminLabel}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {member.status === 'online' ? onlineLabel : member.lastSeen}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div>
                    <h4 className="font-semibold text-sm text-gray-900 dark:text-white mb-3">
                      {photosLabel} & {filesLabel}
                    </h4>
                    <div className="grid grid-cols-3 gap-2">
                      {sharedMedia.map((media) => (
                        <button
                          key={media.id}
                          onClick={() => handleMediaClick(media)}
                          className="aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 hover:opacity-75 transition-opacity"
                        >
                          {media.type === 'image' ? (
                            <img src={media.thumbnail} alt="Shared media" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center p-2">
                              <File className="h-8 w-8 text-gray-400 mb-1" />
                              <p className="text-xs text-gray-600 dark:text-gray-400 text-center truncate w-full">
                                {media.name}
                              </p>
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="p-4 border-t dark:border-gray-700 space-y-2">
                <button
                  onClick={handleLeaveGroup}
                  className="w-full px-4 py-2 bg-red-100 hover:bg-red-200 dark:bg-red-900 dark:hover:bg-red-800 text-red-700 dark:text-red-300 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  {leaveGroupButton}
                </button>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default DetailedGroupChat;
    `,

    compact: `
${commonImports}
import { Send, Users, MoreVertical, X } from 'lucide-react';

interface Message {
  id: number;
  sender: {
    id: number;
    name: string;
    avatar: string;
  };
  content: string;
  timestamp: string;
  type: string;
  isOwn: boolean;
}

interface CompactGroupChatProps {
  ${dataName}?: any;
  className?: string;
  onClose?: () => void;
}

const CompactGroupChat: React.FC<CompactGroupChatProps> = ({ ${dataName}: propData, className, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  // Fetch data from API if no props data provided
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      try {
        const response = await api.get<any>('${apiRoute}');
        return response?.data || response;
      } catch (err) {
        console.error('Failed to fetch chat data:', err);
        return {};
      }
    },
    enabled: !propData,
    retry: 1,
  });

  // Mutation for sending messages
  const sendMessageMutation = useMutation({
    mutationFn: async (messageContent: string) => {
      const response = await api.post<any>('${apiRoute}', { content: messageContent });
      return response?.data || response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['${entity}'] });
    },
  });

  // Use prop data if available, otherwise use fetched data
  const ${dataName} = propData || fetchedData || {};

  // Loading state
  if (isLoading && !propData) {
    return (
      <div className={cn("w-80 flex items-center justify-center bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4", className)}>
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
      </div>
    );
  }

  const chatData = ${dataName} || {};

  const title = ${getField('compactTitle')};
  const groupName = ${getField('groupName')};
  const groupAvatar = ${getField('groupAvatar')};
  const memberCount = ${getField('memberCount')};
  const initialMessages = ${getField('messages')};
  const messagePlaceholder = ${getField('messagePlaceholder')};
  const membersLabel = ${getField('membersLabel')};

  useEffect(() => {
    setMessages(initialMessages);
  }, []);

  useEffect(() => {
    if (!isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isMinimized]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message: Message = {
      id: Date.now(),
      sender: {
        id: 5,
        name: 'You',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop'
      },
      content: newMessage,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      type: 'text',
      isOwn: true
    };

    // Send via API mutation
    sendMessageMutation.mutate(newMessage.trim());
    setMessages(prev => [...prev, message]);
    setNewMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      console.log('Chat closed');
    }
  };

  return (
    <div className={cn("w-80 flex flex-col bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden", className)}>
      {/* Header */}
      <div
        onClick={() => setIsMinimized(!isMinimized)}
        className="bg-blue-600 p-3 flex items-center justify-between cursor-pointer"
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <img src={groupAvatar} alt={groupName} className="w-8 h-8 rounded-full object-cover" />
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-white text-sm truncate">{groupName}</h3>
            <p className="text-xs text-blue-100">{memberCount} {membersLabel}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsMinimized(!isMinimized);
            }}
            className="p-1 hover:bg-blue-700 rounded text-white"
          >
            <MoreVertical className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleClose();
            }}
            className="p-1 hover:bg-blue-700 rounded text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="flex-1 h-96 overflow-y-auto p-3 space-y-3 bg-gray-50 dark:bg-gray-900">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex gap-2",
                  message.isOwn && "flex-row-reverse"
                )}
              >
                {!message.isOwn && (
                  <img
                    src={message.sender.avatar}
                    alt={message.sender.name}
                    className="w-6 h-6 rounded-full object-cover flex-shrink-0"
                  />
                )}
                <div className={cn("flex flex-col", message.isOwn && "items-end")}>
                  {!message.isOwn && (
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-0.5 px-2">
                      {message.sender.name}
                    </span>
                  )}
                  <div
                    className={cn(
                      "max-w-[200px] px-3 py-2 rounded-2xl",
                      message.isOwn
                        ? "bg-blue-600 text-white"
                        : "bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    )}
                  >
                    <p className="text-xs">{message.content}</p>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 px-2">
                    {message.timestamp}
                  </span>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t dark:border-gray-700 p-3 bg-white dark:bg-gray-800">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={messagePlaceholder}
                className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
                className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CompactGroupChat;
    `
  };

  return variants[variant] || variants.standard;
};
