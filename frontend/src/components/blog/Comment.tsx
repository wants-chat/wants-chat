import React, { useState } from 'react';
import { BlogComment } from '../../types/blog';
import { useAuth } from '../../contexts/AuthContext';
import { Reply } from 'lucide-react';

interface CommentProps {
  comment: BlogComment;
  onReply?: (parentId: string) => void;
  depth?: number;
  maxDepth?: number;
}

const Comment: React.FC<CommentProps> = ({
  comment,
  onReply,
  depth = 0,
  maxDepth = 1
}) => {
  const { user } = useAuth();
  const [showReplies, setShowReplies] = useState(true);
  
  const commentUserId = comment.userId || comment.user_id;
  const isOwner = user && commentUserId === user.id;
  const canReply = depth < maxDepth;
  const marginLeft = Math.min(depth * 40, 120); // YouTube-style deeper nesting

  const getUserName = () => {
    // If current user is the comment author, show their name
    if (user && commentUserId === user.id) {
      return user.name || user.email || 'You';
    }

    // Use author name from comment if available (backend should populate this)
    const authorName = comment.authorName || comment.author_name;
    if (authorName) {
      return authorName;
    }

    // Fallback to email if available
    const authorEmail = comment.authorEmail || comment.author_email;
    if (authorEmail) {
      return authorEmail.split('@')[0]; // Show username part of email
    }

    return 'Anonymous';
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Just now';

    const date = new Date(dateString);

    // Check if date is valid
    if (isNaN(date.getTime())) return 'Just now';

    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) return 'now';
    if (diffMinutes < 60) return `${diffMinutes} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;

    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Get date with fallback for both camelCase and snake_case
  const getCommentDate = () => {
    return comment.createdAt || comment.created_at;
  };

  const getAvatarColor = () => {
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-purple-500',
      'bg-pink-500', 'bg-indigo-500', 'bg-red-500',
      'bg-yellow-500', 'bg-cyan-500'
    ];
    const userId = comment.user_id || 'anonymous';
    const index = userId.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <div className="comment-thread">
      <div 
        className="flex gap-3"
        style={{ marginLeft: `${marginLeft}px` }}
      >
        {/* Simple Avatar */}
        <div className="flex-shrink-0">
          <div className={`w-10 h-10 ${getAvatarColor()} rounded-full flex items-center justify-center text-white font-medium text-sm`}>
            {getUserName().charAt(0).toUpperCase()}
          </div>
        </div>

        {/* Comment Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-white text-sm">
              {getUserName()}
            </span>
            <span className="text-white/60 text-xs">
              {formatDate(getCommentDate())}
            </span>
          </div>

          {/* Comment Text */}
          <div className="text-white/80 text-sm leading-relaxed mb-2">
            {comment.content}
          </div>

          {/* Actions */}
          {canReply && user && (
            <div className="flex items-center">
              <button
                onClick={() => onReply?.(comment.id)}
                className="flex items-center gap-1 px-3 py-1 text-xs font-medium text-white/60 hover:text-white hover:bg-white/10 rounded transition-colors"
              >
                <Reply size={14} />
                Reply
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Nested Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-4">
          {comment.replies.length > 1 && (
            <div style={{ marginLeft: `${marginLeft + 16}px` }}>
              <button
                onClick={() => setShowReplies(!showReplies)}
                className="flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors mb-3"
              >
                <div className={`w-3 h-3 border-l-2 border-b-2 border-current transition-transform ${showReplies ? 'rotate-45' : '-rotate-45'}`}></div>
                {showReplies ? 'Hide' : 'View'} {comment.replies.length} replies
              </button>
            </div>
          )}
          
          {showReplies && (
            <div className="space-y-4">
              {comment.replies.map((reply) => (
                <Comment
                  key={reply.id}
                  comment={reply}
                  onReply={onReply}
                  depth={depth + 1}
                  maxDepth={maxDepth}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Comment;