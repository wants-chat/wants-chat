import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Send, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { toast } from '../ui/sonner';

interface CommentFormProps {
  onSubmit: (content: string) => Promise<void>;
  onCancel?: () => void;
  placeholder?: string;
  submitText?: string;
  isReply?: boolean;
  loading?: boolean;
}

const CommentForm: React.FC<CommentFormProps> = ({
  onSubmit,
  onCancel,
  placeholder = "Add a comment...",
  submitText = "Comment",
  isReply = false,
  loading = false
}) => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      return;
    }

    if (!user) {
      toast.error('Please login to post comments.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(content.trim());
      setContent('');
    } catch (error) {
      console.error('Failed to submit comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getAvatarColor = () => {
    if (!user) return 'bg-gray-500';
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-purple-500', 
      'bg-pink-500', 'bg-indigo-500', 'bg-red-500',
      'bg-yellow-500', 'bg-cyan-500'
    ];
    const index = user.id?.charCodeAt(0) % colors.length || 0;
    return colors[index];
  };

  if (!user) {
    return (
      <div className="border border-white/20 rounded-lg p-6 text-center bg-white/10 backdrop-blur-xl">
        <p className="text-white/60 mb-4">
          Sign in to join the discussion
        </p>
        <Link to="/login">
          <Button size="sm" className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white hover:from-teal-600 hover:to-cyan-600">
            Sign In
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex gap-3">
        {/* User Avatar */}
        <div className="flex-shrink-0">
          <div className={`w-10 h-10 ${getAvatarColor()} rounded-full flex items-center justify-center text-white font-medium text-sm`}>
            {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
          </div>
        </div>

        {/* Form Content */}
        <div className="flex-1 space-y-3">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={placeholder}
            className="min-h-[80px] resize-none text-sm bg-white/10 border-white/20 text-white placeholder:text-white/40"
            disabled={isSubmitting || loading}
          />

          <div className="flex items-center justify-between">
            <div className="text-xs text-white/60">
              {content.length}/1000
            </div>

            <div className="flex items-center gap-2">
              {isReply && onCancel && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={onCancel}
                  disabled={isSubmitting || loading}
                  className="text-white/60 hover:text-white hover:bg-white/10"
                >
                  Cancel
                </Button>
              )}

              <Button
                type="submit"
                size="sm"
                disabled={isSubmitting || loading || !content.trim() || content.length > 1000}
                className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white hover:from-teal-600 hover:to-cyan-600"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2"></div>
                    Posting...
                  </>
                ) : (
                  submitText
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};

export default CommentForm;