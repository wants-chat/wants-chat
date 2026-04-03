/**
 * Thread Panel - Slack-style thread view for branched conversations
 * Opens on the right side when user clicks "Thread" button on a message
 */

import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { cn } from '../../lib/utils';
import { MessageContent } from './MessageContent';
import { X, Send, Sparkles, GitBranch, Copy, Check, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export interface ThreadMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: Date;
}

interface ThreadPanelProps {
  branchId: string;
  parentMessage: ThreadMessage;
  messages: ThreadMessage[];
  onClose: () => void;
  onSendMessage: (content: string) => void;
  onRegenerate?: (userMessageContent: string) => void;
  isLoading?: boolean;
  streamingMessageId?: string | null;
}

export const ThreadPanel: React.FC<ThreadPanelProps> = ({
  branchId,
  parentMessage,
  messages,
  onClose,
  onSendMessage,
  onRegenerate,
  isLoading = false,
  streamingMessageId = null,
}) => {
  const { theme } = useTheme();
  const [inputValue, setInputValue] = useState('');
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Handle copy message
  const handleCopy = async (messageId: string, content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedMessageId(messageId);
      toast.success('Copied to clipboard');
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (error) {
      toast.error('Failed to copy');
    }
  };

  // Handle regenerate - find the previous user message and regenerate
  const handleRegenerate = (messageIndex: number) => {
    if (!onRegenerate) return;

    // Find the user message before this assistant message
    for (let i = messageIndex - 1; i >= 0; i--) {
      if (messages[i].role === 'user') {
        onRegenerate(messages[i].content);
        return;
      }
    }
  };

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 150) + 'px';
    }
  }, [inputValue]);

  const handleSend = () => {
    if (!inputValue.trim() || isLoading) return;
    onSendMessage(inputValue.trim());
    setInputValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={cn(
      "flex flex-col h-full border-l",
      theme === 'dark' ? 'bg-[#1a1a1a] border-[#2a2a2a]' : 'bg-white border-slate-200'
    )}>
      {/* Header */}
      <div className={cn(
        "flex items-center justify-between px-4 py-3 border-b",
        theme === 'dark' ? 'border-[#2a2a2a]' : 'border-slate-200'
      )}>
        <div className="flex items-center gap-2">
          <GitBranch className="w-5 h-5 text-[#0D9488]" />
          <span className={cn(
            "font-semibold",
            theme === 'dark' ? 'text-white' : 'text-slate-900'
          )}>
            Thread
          </span>
        </div>
        <button
          onClick={onClose}
          className={cn(
            "p-1.5 rounded-lg transition-colors",
            theme === 'dark'
              ? 'hover:bg-[#2a2a2a] text-slate-400 hover:text-white'
              : 'hover:bg-slate-100 text-slate-500 hover:text-slate-700'
          )}
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Parent Message (the message being branched from) */}
      <div className={cn(
        "px-4 py-3 border-b",
        theme === 'dark' ? 'bg-[#232323] border-[#2a2a2a]' : 'bg-slate-50 border-slate-200'
      )}>
        <div className="flex items-start gap-3">
          {parentMessage.role === 'user' ? (
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0",
              theme === 'dark' ? 'bg-[#0D9488] text-white' : 'bg-[#0D9488] text-white'
            )}>
              U
            </div>
          ) : (
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-slate-100 to-slate-200">
              <Sparkles className="w-4 h-4 text-[#0D9488]" />
            </div>
          )}
          <div className={cn(
            "flex-1 text-sm",
            theme === 'dark' ? 'text-slate-300' : 'text-slate-600'
          )}>
            <p className="line-clamp-3">{parentMessage.content}</p>
          </div>
        </div>
      </div>

      {/* Thread Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {messages.length === 0 ? (
          <div className={cn(
            "text-center py-8",
            theme === 'dark' ? 'text-slate-500' : 'text-slate-400'
          )}>
            <GitBranch className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Start a thread from this message</p>
            <p className="text-xs mt-1">Continue the conversation in a focused side discussion</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div key={message.id} className="flex items-start gap-3">
                {message.role === 'user' ? (
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0",
                    theme === 'dark' ? 'bg-[#0D9488] text-white' : 'bg-[#0D9488] text-white'
                  )}>
                    U
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-slate-100 to-slate-200">
                    <Sparkles className={cn(
                      "w-4 h-4 text-[#0D9488]",
                      message.id === streamingMessageId && "animate-pulse"
                    )} />
                  </div>
                )}
                <div className={cn(
                  "flex-1 min-w-0",
                  theme === 'dark' ? 'text-slate-200' : 'text-slate-700'
                )}>
                  <MessageContent content={message.content} />
                  {/* Streaming cursor */}
                  {message.id === streamingMessageId && (
                    <span className="inline-block w-2 h-4 ml-0.5 bg-[#0D9488] animate-pulse rounded-sm" />
                  )}
                  {/* Action buttons for assistant messages - only show after streaming completes */}
                  {message.role === 'assistant' && message.id !== streamingMessageId && message.content && (
                    <div className="mt-2 flex items-center gap-1.5">
                      {/* Copy Button */}
                      <button
                        onClick={() => handleCopy(message.id, message.content)}
                        className={cn(
                          "flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-all",
                          copiedMessageId === message.id
                            ? 'bg-green-500/20 text-green-600'
                            : theme === 'dark'
                              ? 'bg-[#2a2a2a] text-slate-400 hover:text-white hover:bg-[#3a3a3a]'
                              : 'bg-slate-100 text-slate-500 hover:text-slate-700 hover:bg-slate-200'
                        )}
                      >
                        {copiedMessageId === message.id ? (
                          <>
                            <Check className="w-3 h-3" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            Copy
                          </>
                        )}
                      </button>
                      {/* Regenerate Button - only on last assistant message */}
                      {index === messages.length - 1 && onRegenerate && (
                        <button
                          onClick={() => handleRegenerate(index)}
                          disabled={isLoading}
                          className={cn(
                            "flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-all disabled:opacity-50",
                            theme === 'dark'
                              ? 'bg-[#2a2a2a] text-slate-400 hover:text-white hover:bg-[#3a3a3a]'
                              : 'bg-slate-100 text-slate-500 hover:text-slate-700 hover:bg-slate-200'
                          )}
                        >
                          <RefreshCw className="w-3 h-3" />
                          Regenerate
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {/* Show bouncing dots only when loading but NOT streaming */}
            {isLoading && !streamingMessageId && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-slate-100 to-slate-200">
                  <Sparkles className="w-4 h-4 text-[#0D9488] animate-pulse" />
                </div>
                <div className="flex gap-1.5 pt-3">
                  <span className="w-2 h-2 rounded-full animate-bounce bg-[#0D9488]" />
                  <span className="w-2 h-2 rounded-full animate-bounce [animation-delay:0.2s] bg-[#0D9488]/70" />
                  <span className="w-2 h-2 rounded-full animate-bounce [animation-delay:0.4s] bg-[#0D9488]/40" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className={cn(
        "px-4 py-3 border-t",
        theme === 'dark' ? 'border-[#2a2a2a]' : 'border-slate-200'
      )}>
        <div className={cn(
          "flex items-end gap-2 rounded-xl p-2",
          theme === 'dark'
            ? 'bg-[#232323]'
            : 'bg-slate-50'
        )}>
          <textarea
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Reply in thread..."
            rows={1}
            className={cn(
              "flex-1 resize-none px-2 py-1.5 bg-transparent outline-none text-sm max-h-[150px] border-0 ring-0 focus:border-0 focus:ring-0 focus:outline-none",
              theme === 'dark'
                ? 'text-white placeholder:text-slate-500'
                : 'text-slate-800 placeholder:text-slate-400'
            )}
          />
          <button
            onClick={handleSend}
            disabled={!inputValue.trim() || isLoading}
            className={cn(
              "p-2 rounded-lg transition-all disabled:opacity-40",
              inputValue.trim()
                ? 'bg-[#0D9488] text-white hover:bg-[#0B8278]'
                : theme === 'dark' ? 'bg-[#2a2a2a] text-slate-500' : 'bg-slate-100 text-slate-400'
            )}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className={cn(
          "text-xs mt-2 text-center",
          theme === 'dark' ? 'text-slate-500' : 'text-slate-400'
        )}>
          Replies stay in this thread
        </p>
      </div>
    </div>
  );
};

export default ThreadPanel;
