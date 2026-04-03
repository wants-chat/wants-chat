import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateCommentThread = (
  resolved: ResolvedComponent,
  variant: 'nested' | 'flat' | 'compact' = 'nested'
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
    return `/${dataSource || 'comments'}`;
  };

  const apiRoute = getApiRoute();
  const entity = dataSource || 'comments';

  const commonImports = `
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';`;

  const variants = {
    nested: `
${commonImports}
import { Heart, MessageCircle, MoreVertical, Flag, Edit, Trash2 } from 'lucide-react';

interface Comment {
  id: number;
  author: {
    name: string;
    avatar: string;
    role: string;
  };
  text: string;
  timestamp: string;
  likes: number;
  isLiked: boolean;
  isEdited: boolean;
  canEdit: boolean;
  canDelete: boolean;
  replies: Comment[];
}

interface NestedThreadProps {
  ${dataName}?: any;
  className?: string;
  onLike?: (commentId: number, isLiked: boolean) => void;
  onReply?: (commentId: number, replyText: string) => void;
  onEdit?: (commentId: number, newText: string) => void;
  onDelete?: (commentId: number) => void;
  onReport?: (commentId: number, reason: string) => void;
  onAuthorClick?: (authorName: string) => void;
}

const NestedCommentThread: React.FC<NestedThreadProps> = ({
  ${dataName}: propData,
  className,
  onLike,
  onReply,
  onEdit,
  onDelete,
  onReport,
  onAuthorClick
}) => {
  const [likedComments, setLikedComments] = useState<number[]>([]);
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [editingComment, setEditingComment] = useState<number | null>(null);
  const [editText, setEditText] = useState('');
  const [replyText, setReplyText] = useState('');
  const [showReplies, setShowReplies] = useState<number[]>([]);
  const [showMenu, setShowMenu] = useState<number | null>(null);

  // Dynamic data fetching
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || []);
    },
    enabled: !propData,
    retry: 1,
  });

  const ${dataName} = propData || fetchedData || {};

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const threadData = ${dataName} || {};

  const title = ${getField('nestedTitle')};
  const comments = ${getField('comments')};
  const replyLabel = ${getField('replyLabel')};
  const likeLabel = ${getField('likeLabel')};
  const editLabel = ${getField('editLabel')};
  const deleteLabel = ${getField('deleteLabel')};
  const reportLabel = ${getField('reportLabel')};
  const cancelLabel = ${getField('cancelLabel')};
  const saveLabel = ${getField('saveLabel')};
  const showRepliesLabel = ${getField('showRepliesLabel')};
  const hideRepliesLabel = ${getField('hideRepliesLabel')};
  const replyPlaceholder = ${getField('replyPlaceholder')};
  const totalComments = ${getField('totalComments')};

  const handleLike = (commentId: number) => {
    const isCurrentlyLiked = likedComments.includes(commentId);
    setLikedComments(prev =>
      isCurrentlyLiked ? prev.filter(id => id !== commentId) : [...prev, commentId]
    );
    if (onLike) {
      onLike(commentId, !isCurrentlyLiked);
    } else {
      console.log('Like toggled:', commentId, !isCurrentlyLiked);
    }
  };

  const handleReply = (commentId: number) => {
    if (replyText.trim()) {
      if (onReply) {
        onReply(commentId, replyText);
      } else {
        console.log('Reply to comment:', commentId, replyText);
      }
      setReplyText('');
      setReplyingTo(null);
    }
  };

  const handleEdit = (commentId: number) => {
    if (editText.trim()) {
      if (onEdit) {
        onEdit(commentId, editText);
      } else {
        console.log('Edit comment:', commentId, editText);
      }
      setEditText('');
      setEditingComment(null);
    }
  };

  const handleDelete = (commentId: number) => {
    if (confirm('Are you sure you want to delete this comment?')) {
      if (onDelete) {
        onDelete(commentId);
      } else {
        console.log('Delete comment:', commentId);
      }
    }
    setShowMenu(null);
  };

  const handleReport = (commentId: number) => {
    const reason = prompt('Please provide a reason for reporting this comment:');
    if (reason) {
      if (onReport) {
        onReport(commentId, reason);
      } else {
        console.log('Report comment:', commentId, reason);
      }
    }
    setShowMenu(null);
  };

  const handleAuthorClick = (authorName: string) => {
    if (onAuthorClick) {
      onAuthorClick(authorName);
    } else {
      console.log('Author clicked:', authorName);
    }
  };

  const toggleReplies = (commentId: number) => {
    setShowReplies(prev =>
      prev.includes(commentId) ? prev.filter(id => id !== commentId) : [...prev, commentId]
    );
  };

  const renderComment = (comment: Comment, depth: number = 0) => {
    const isLiked = likedComments.includes(comment.id);
    const isReplying = replyingTo === comment.id;
    const isEditing = editingComment === comment.id;
    const hasReplies = comment.replies && comment.replies.length > 0;
    const repliesVisible = showReplies.includes(comment.id);

    return (
      <div key={comment.id} className={\`\${depth > 0 ? 'ml-12 mt-4 border-l-4 border-gradient-to-b from-blue-400 to-purple-400 pl-4' : 'mt-6'}\`}>
        <div className="flex gap-3">
          <img
            src={comment.author.avatar}
            alt={comment.author.name}
            onClick={() => handleAuthorClick(comment.author.name)}
            className="w-10 h-10 rounded-full object-cover cursor-pointer ring-2 ring-blue-200 dark:ring-blue-800 hover:ring-4 hover:ring-blue-400 transition-all duration-300 transform hover:scale-110"
          />

          <div className="flex-1">
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-800/50 rounded-2xl px-5 py-4 shadow-lg border border-gray-200/50 dark:border-gray-700/50 hover:shadow-xl transition-all duration-300">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <button
                    onClick={() => handleAuthorClick(comment.author.name)}
                    className="font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    {comment.author.name}
                  </button>
                  {comment.author.role && (
                    <span className="text-xs px-2 py-1 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium shadow-sm">
                      {comment.author.role}
                    </span>
                  )}
                </div>
                <div className="relative">
                  <button
                    onClick={() => setShowMenu(showMenu === comment.id ? null : comment.id)}
                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                  >
                    <MoreVertical className="h-4 w-4 text-gray-500" />
                  </button>
                  {showMenu === comment.id && (
                    <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-900 rounded-lg shadow-lg border dark:border-gray-700 py-1 z-10">
                      {comment.canEdit && (
                        <button
                          onClick={() => {
                            setEditingComment(comment.id);
                            setEditText(comment.text);
                            setShowMenu(null);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm"
                        >
                          <Edit className="h-3 w-3" />
                          {editLabel}
                        </button>
                      )}
                      {comment.canDelete && (
                        <button
                          onClick={() => handleDelete(comment.id)}
                          className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm text-red-600"
                        >
                          <Trash2 className="h-3 w-3" />
                          {deleteLabel}
                        </button>
                      )}
                      <button
                        onClick={() => handleReport(comment.id)}
                        className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm"
                      >
                        <Flag className="h-3 w-3" />
                        {reportLabel}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {isEditing ? (
                <div className="space-y-2">
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-white resize-none"
                    rows={3}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(comment.id)}
                      className="px-4 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      {saveLabel}
                    </button>
                    <button
                      onClick={() => {
                        setEditingComment(null);
                        setEditText('');
                      }}
                      className="px-4 py-1.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm"
                    >
                      {cancelLabel}
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-gray-700 dark:text-gray-300">
                  {comment.text}
                  {comment.isEdited && (
                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">(edited)</span>
                  )}
                </p>
              )}
            </div>

            <div className="flex items-center gap-3 mt-3 text-sm flex-wrap">
              <span className="text-gray-500 dark:text-gray-400 text-xs">{comment.timestamp}</span>
              <button
                onClick={() => handleLike(comment.id)}
                className={\`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium transition-all duration-300 \${
                  isLiked
                    ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-md scale-105'
                    : 'text-gray-500 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500'
                }\`}
              >
                <Heart className={\`h-4 w-4 \${isLiked ? 'fill-white animate-pulse' : ''}\`} />
                <span>{comment.likes + (isLiked ? 1 : 0)}</span>
              </button>
              <button
                onClick={() => setReplyingTo(isReplying ? null : comment.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium text-gray-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300"
              >
                <MessageCircle className="h-4 w-4" />
                {replyLabel}
              </button>
              {hasReplies && (
                <button
                  onClick={() => toggleReplies(comment.id)}
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {repliesVisible ? hideRepliesLabel : \`\${showRepliesLabel} (\${comment.replies.length})\`}
                </button>
              )}
            </div>

            {isReplying && (
              <div className="mt-3 space-y-2">
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder={replyPlaceholder}
                  className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-white resize-none"
                  rows={2}
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => handleReply(comment.id)}
                    className="px-4 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    {replyLabel}
                  </button>
                  <button
                    onClick={() => {
                      setReplyingTo(null);
                      setReplyText('');
                    }}
                    className="px-4 py-1.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm"
                  >
                    {cancelLabel}
                  </button>
                </div>
              </div>
            )}

            {hasReplies && repliesVisible && (
              <div className="mt-2">
                {comment.replies.map(reply => renderComment(reply, depth + 1))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={cn("max-w-4xl", className)}>
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
          {title} ({totalComments})
        </h3>
      </div>

      <div className="divide-y dark:divide-gray-700">
        {comments.map((comment: Comment) => renderComment(comment))}
      </div>
    </div>
  );
};

export default NestedCommentThread;
    `,

    flat: `
${commonImports}
import { Heart, MessageCircle, MoreVertical, Flag, Edit, Trash2, ChevronDown } from 'lucide-react';

interface Comment {
  id: number;
  author: {
    name: string;
    avatar: string;
    role: string;
  };
  text: string;
  timestamp: string;
  likes: number;
  isLiked: boolean;
  isEdited: boolean;
  canEdit: boolean;
  canDelete: boolean;
  replies: Comment[];
}

interface FlatThreadProps {
  ${dataName}?: any;
  className?: string;
  onLike?: (commentId: number, isLiked: boolean) => void;
  onReply?: (commentId: number, replyText: string) => void;
  onEdit?: (commentId: number, newText: string) => void;
  onDelete?: (commentId: number) => void;
  onReport?: (commentId: number, reason: string) => void;
  onSort?: (sortBy: string) => void;
}

const FlatCommentThread: React.FC<FlatThreadProps> = ({
  ${dataName}: propData,
  className,
  onLike,
  onReply,
  onEdit,
  onDelete,
  onReport,
  onSort
}) => {
  const [likedComments, setLikedComments] = useState<number[]>([]);
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [editingComment, setEditingComment] = useState<number | null>(null);
  const [editText, setEditText] = useState('');
  const [replyText, setReplyText] = useState('');
  const [showMenu, setShowMenu] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState('Newest');
  const [showSortMenu, setShowSortMenu] = useState(false);

  // Dynamic data fetching
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || []);
    },
    enabled: !propData,
    retry: 1,
  });

  const ${dataName} = propData || fetchedData || {};

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const threadData = ${dataName} || {};

  const title = ${getField('flatTitle')};
  const comments = ${getField('comments')};
  const replyLabel = ${getField('replyLabel')};
  const likeLabel = ${getField('likeLabel')};
  const editLabel = ${getField('editLabel')};
  const deleteLabel = ${getField('deleteLabel')};
  const reportLabel = ${getField('reportLabel')};
  const cancelLabel = ${getField('cancelLabel')};
  const saveLabel = ${getField('saveLabel')};
  const replyPlaceholder = ${getField('replyPlaceholder')};
  const sortByLabel = ${getField('sortByLabel')};
  const sortOptions = ${getField('sortOptions')};
  const totalComments = ${getField('totalComments')};

  // Flatten all comments and replies
  const flattenComments = (comments: Comment[]): Comment[] => {
    const flattened: Comment[] = [];
    comments.forEach(comment => {
      flattened.push(comment);
      if (comment.replies && comment.replies.length > 0) {
        flattened.push(...flattenComments(comment.replies));
      }
    });
    return flattened;
  };

  const allComments = flattenComments(comments);

  const handleLike = (commentId: number) => {
    const isCurrentlyLiked = likedComments.includes(commentId);
    setLikedComments(prev =>
      isCurrentlyLiked ? prev.filter(id => id !== commentId) : [...prev, commentId]
    );
    if (onLike) {
      onLike(commentId, !isCurrentlyLiked);
    } else {
      console.log('Like toggled:', commentId, !isCurrentlyLiked);
    }
  };

  const handleSort = (option: string) => {
    setSortBy(option);
    setShowSortMenu(false);
    if (onSort) {
      onSort(option);
    } else {
      console.log('Sort by:', option);
    }
  };

  const renderComment = (comment: Comment) => {
    const isLiked = likedComments.includes(comment.id);
    const isReplying = replyingTo === comment.id;
    const isEditing = editingComment === comment.id;

    return (
      <div key={comment.id} className="py-6 border-b dark:border-gray-700 last:border-0">
        <div className="flex gap-4">
          <img
            src={comment.author.avatar}
            alt={comment.author.name}
            className="w-12 h-12 rounded-full object-cover"
          />

          <div className="flex-1">
            <div className="flex items-start justify-between mb-2">
              <div>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {comment.author.name}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                  {comment.author.role}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">•</span>
                <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                  {comment.timestamp}
                </span>
              </div>
              <div className="relative">
                <button
                  onClick={() => setShowMenu(showMenu === comment.id ? null : comment.id)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                >
                  <MoreVertical className="h-4 w-4 text-gray-500" />
                </button>
                {showMenu === comment.id && (
                  <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-900 rounded-lg shadow-lg border dark:border-gray-700 py-1 z-10">
                    {comment.canEdit && (
                      <button
                        onClick={() => {
                          setEditingComment(comment.id);
                          setEditText(comment.text);
                          setShowMenu(null);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm"
                      >
                        <Edit className="h-3 w-3" />
                        {editLabel}
                      </button>
                    )}
                    {comment.canDelete && (
                      <button
                        onClick={() => {
                          if (confirm('Are you sure?')) {
                            onDelete?.(comment.id);
                          }
                          setShowMenu(null);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm text-red-600"
                      >
                        <Trash2 className="h-3 w-3" />
                        {deleteLabel}
                      </button>
                    )}
                    <button
                      onClick={() => {
                        const reason = prompt('Reason:');
                        if (reason) onReport?.(comment.id, reason);
                        setShowMenu(null);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm"
                    >
                      <Flag className="h-3 w-3" />
                      {reportLabel}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {isEditing ? (
              <div className="space-y-2">
                <textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-white resize-none"
                  rows={3}
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      onEdit?.(comment.id, editText);
                      setEditingComment(null);
                      setEditText('');
                    }}
                    className="px-4 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    {saveLabel}
                  </button>
                  <button
                    onClick={() => {
                      setEditingComment(null);
                      setEditText('');
                    }}
                    className="px-4 py-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm"
                  >
                    {cancelLabel}
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-gray-700 dark:text-gray-300 mb-3">
                {comment.text}
                {comment.isEdited && (
                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">(edited)</span>
                )}
              </p>
            )}

            <div className="flex items-center gap-4 text-sm">
              <button
                onClick={() => handleLike(comment.id)}
                className={\`flex items-center gap-1 transition-colors \${
                  isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
                }\`}
              >
                <Heart className={\`h-4 w-4 \${isLiked ? 'fill-red-500' : ''}\`} />
                <span>{comment.likes + (isLiked ? 1 : 0)}</span>
              </button>
              <button
                onClick={() => setReplyingTo(isReplying ? null : comment.id)}
                className="text-gray-500 hover:text-blue-600 transition-colors flex items-center gap-1"
              >
                <MessageCircle className="h-4 w-4" />
                {replyLabel}
              </button>
            </div>

            {isReplying && (
              <div className="mt-3 space-y-2">
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder={replyPlaceholder}
                  className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-white resize-none"
                  rows={2}
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      onReply?.(comment.id, replyText);
                      setReplyText('');
                      setReplyingTo(null);
                    }}
                    className="px-4 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    {replyLabel}
                  </button>
                  <button
                    onClick={() => {
                      setReplyingTo(null);
                      setReplyText('');
                    }}
                    className="px-4 py-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm"
                  >
                    {cancelLabel}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={cn("max-w-4xl", className)}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
          {title} ({totalComments})
        </h3>
        <div className="relative">
          <button
            onClick={() => setShowSortMenu(!showSortMenu)}
            className="flex items-center gap-2 px-4 py-2 border dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <span className="text-sm text-gray-700 dark:text-gray-300">{sortByLabel}: {sortBy}</span>
            <ChevronDown className="h-4 w-4" />
          </button>
          {showSortMenu && (
            <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-900 rounded-lg shadow-lg border dark:border-gray-700 py-1 z-10">
              {sortOptions.map((option: string) => (
                <button
                  key={option}
                  onClick={() => handleSort(option)}
                  className={\`w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm \${
                    sortBy === option ? 'text-blue-600 dark:text-blue-400 font-medium' : ''
                  }\`}
                >
                  {option}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div>
        {allComments.map(comment => renderComment(comment))}
      </div>
    </div>
  );
};

export default FlatCommentThread;
    `,

    compact: `
${commonImports}
import { Heart, MessageCircle } from 'lucide-react';

interface Comment {
  id: number;
  author: {
    name: string;
    avatar: string;
    role: string;
  };
  text: string;
  timestamp: string;
  likes: number;
  isLiked: boolean;
  isEdited: boolean;
  canEdit: boolean;
  canDelete: boolean;
  replies: Comment[];
}

interface CompactThreadProps {
  ${dataName}?: any;
  className?: string;
  onLike?: (commentId: number, isLiked: boolean) => void;
  onReply?: (commentId: number) => void;
  onCommentClick?: (commentId: number) => void;
}

const CompactCommentThread: React.FC<CompactThreadProps> = ({
  ${dataName}: propData,
  className,
  onLike,
  onReply,
  onCommentClick
}) => {
  const [likedComments, setLikedComments] = useState<number[]>([]);

  // Dynamic data fetching
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || []);
    },
    enabled: !propData,
    retry: 1,
  });

  const ${dataName} = propData || fetchedData || {};

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const threadData = ${dataName} || {};

  const title = ${getField('compactTitle')};
  const comments = ${getField('comments')};
  const loadMoreLabel = ${getField('loadMoreLabel')};
  const totalComments = ${getField('totalComments')};
  const showingComments = ${getField('showingComments')};

  const handleLike = (commentId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const isCurrentlyLiked = likedComments.includes(commentId);
    setLikedComments(prev =>
      isCurrentlyLiked ? prev.filter(id => id !== commentId) : [...prev, commentId]
    );
    if (onLike) {
      onLike(commentId, !isCurrentlyLiked);
    } else {
      console.log('Like toggled:', commentId, !isCurrentlyLiked);
    }
  };

  const handleReply = (commentId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onReply) {
      onReply(commentId);
    } else {
      console.log('Reply to:', commentId);
    }
  };

  const handleCommentClick = (commentId: number) => {
    if (onCommentClick) {
      onCommentClick(commentId);
    } else {
      console.log('Comment clicked:', commentId);
    }
  };

  return (
    <div className={cn("max-w-4xl", className)}>
      <div className="mb-4">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
          {title} ({totalComments})
        </h3>
      </div>

      <div className="space-y-3">
        {comments.map((comment: Comment) => {
          const isLiked = likedComments.includes(comment.id);
          return (
            <div
              key={comment.id}
              onClick={() => handleCommentClick(comment.id)}
              className="flex gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors cursor-pointer"
            >
              <img
                src={comment.author.avatar}
                alt={comment.author.name}
                className="w-8 h-8 rounded-full object-cover flex-shrink-0"
              />

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm text-gray-900 dark:text-white">
                    {comment.author.name}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {comment.timestamp}
                  </span>
                </div>

                <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2 mb-2">
                  {comment.text}
                </p>

                <div className="flex items-center gap-4 text-xs">
                  <button
                    onClick={(e) => handleLike(comment.id, e)}
                    className={\`flex items-center gap-1 transition-colors \${
                      isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
                    }\`}
                  >
                    <Heart className={\`h-3 w-3 \${isLiked ? 'fill-red-500' : ''}\`} />
                    <span>{comment.likes + (isLiked ? 1 : 0)}</span>
                  </button>
                  <button
                    onClick={(e) => handleReply(comment.id, e)}
                    className="flex items-center gap-1 text-gray-500 hover:text-blue-600 transition-colors"
                  >
                    <MessageCircle className="h-3 w-3" />
                    <span>{comment.replies.length}</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {showingComments < totalComments && (
        <button className="w-full mt-4 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
          {loadMoreLabel}
        </button>
      )}
    </div>
  );
};

export default CompactCommentThread;
    `
  };

  return variants[variant] || variants.nested;
};
