import React, { useState } from 'react';
import { BlogComment, CreateCommentRequest } from '../../types/blog';
import { useBlogComments, useCreateComment } from '../../hooks/useComments';
import { useAuth } from '../../contexts/AuthContext';
import Comment from './Comment';
import CommentForm from './CommentForm';
import { Button } from '../ui/button';
import { ChevronDown, ChevronUp, MessageCircle } from 'lucide-react';
import { toast } from '../ui/sonner';

interface CommentSectionProps {
  postId: string;
}

const CommentSection: React.FC<CommentSectionProps> = ({ postId }) => {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [expandedSection, setExpandedSection] = useState(true);
  
  const { comments, loading, error, pagination, refetch } = useBlogComments(postId, currentPage, 10);
  const { createComment, loading: creating } = useCreateComment(postId);

  const handleCreateComment = async (content: string, parentId?: string) => {
    const commentData: CreateCommentRequest = {
      content,
      parent_comment_id: parentId,
      metadata: {}
    };

    const newComment = await createComment(commentData);
    if (newComment) {
      await refetch();
      setReplyingTo(null);
      if (parentId) {
        toast.success('Reply posted successfully!');
      } else {
        toast.success('Comment posted successfully!');
      }
    }
  };

  const handleReply = (parentId: string) => {
    if (!user) {
      toast.error('Please login to reply to comments.');
      return;
    }
    setReplyingTo(replyingTo === parentId ? null : parentId);
  };

  const loadMoreComments = () => {
    setCurrentPage(prev => prev + 1);
  };

  if (error) {
    return (
      <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-6">
        <div className="text-center text-red-400">
          <MessageCircle size={24} className="mx-auto mb-2" />
          <p>Failed to load comments: {error}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={refetch}
            className="mt-2 border-white/20 bg-white/10 text-white hover:bg-white/20"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-6">
      {/* Simple Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <MessageCircle size={20} className="text-white/60" />
          <div>
            <h3 className="text-lg font-semibold text-white">
              Comments
            </h3>
            <p className="text-sm text-white/60">
              {pagination.total === 0 ? 'No comments yet' :
               pagination.total === 1 ? '1 comment' :
               `${pagination.total} comments`}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setExpandedSection(!expandedSection)}
          className="flex items-center gap-2 text-white hover:bg-white/20"
        >
          {expandedSection ? (
            <>
              <ChevronUp size={16} />
              Collapse
            </>
          ) : (
            <>
              <ChevronDown size={16} />
              Expand
            </>
          )}
        </Button>
      </div>

      {expandedSection && (
        <>
          {/* Comment Form */}
          <div className="mb-6">
            <CommentForm
              onSubmit={(content) => handleCreateComment(content)}
              placeholder="Add a comment..."
              loading={creating}
            />
          </div>

          {/* Comments List */}
          {loading && comments.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-white/60">Loading comments...</p>
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-12">
              <MessageCircle size={48} className="text-white/40 mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-white mb-2">No comments yet</h4>
              <p className="text-white/60">Be the first to share your thoughts!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id}>
                  <Comment
                    comment={comment}
                    onReply={handleReply}
                  />
                  
                  {/* Reply Form */}
                  {replyingTo === comment.id && (
                    <div className="mt-4 ml-12">
                      <CommentForm
                        onSubmit={(content) => handleCreateComment(content, comment.id)}
                        onCancel={() => setReplyingTo(null)}
                        placeholder={`Reply to ${comment.user_id === user?.id ? 'your comment' : 'this comment'}...`}
                        submitText="Reply"
                        isReply={true}
                        loading={creating}
                      />
                    </div>
                  )}
                </div>
              ))}

              {/* Load More Button */}
              {pagination.total_pages > currentPage && (
                <div className="text-center pt-6">
                  <Button
                    variant="outline"
                    onClick={loadMoreComments}
                    disabled={loading}
                    className="px-6 py-2 border-white/20 bg-white/10 text-white hover:bg-white/20"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2"></div>
                        Loading...
                      </>
                    ) : (
                      <>
                        <ChevronDown size={16} className="mr-2" />
                        Show more comments ({pagination.total - comments.length})
                      </>
                    )}
                  </Button>
                </div>
              )}

              {comments.length > 0 && (
                <div className="text-center pt-4 border-t border-white/20">
                  <p className="text-xs text-white/60">
                    Showing {comments.length} of {pagination.total} comments
                  </p>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CommentSection;