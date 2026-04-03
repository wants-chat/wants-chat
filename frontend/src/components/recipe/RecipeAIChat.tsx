import React from 'react';
import { Send, Bot } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { ChatMessage } from '../../types/recipe';

interface RecipeAIChatProps {
  messages: ChatMessage[];
  inputMessage: string;
  onInputChange: (message: string) => void;
  onSendMessage: (message: string) => void;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
}

export const RecipeAIChat: React.FC<RecipeAIChatProps> = ({
  messages,
  inputMessage,
  onInputChange,
  onSendMessage,
  messagesEndRef
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSendMessage(inputMessage);
  };

  const formatTime = (timestamp: Date) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const quickQuestions = [
    "What can I cook with chicken and rice?",
    "Suggest a vegetarian dinner recipe",
    "How do I make pasta sauce from scratch?",
    "What's a good recipe for beginners?",
    "Help me plan meals for the week"
  ];

  return (
    <div className="h-[calc(100vh-200px)] flex flex-col">
      {/* Chat Header */}
      <Card className="rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 border-l-4 border-l-teal-500 mb-4">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-2xl font-bold text-white">
            <Bot className="h-8 w-8 text-teal-400" />
            AI Cooking Assistant
          </CardTitle>
          <CardDescription className="text-lg text-white/60">
            Ask me anything about cooking, recipes, ingredients, or meal planning!
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Messages Container */}
      <Card className="flex-1 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 flex flex-col min-h-0">
        <CardContent className="flex-1 p-6 overflow-hidden flex flex-col">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto space-y-4 mb-4 min-h-0">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[80%] p-4 rounded-2xl ${
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white'
                      : 'bg-white/10 backdrop-blur-xl border border-white/20 text-white'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {message.role === 'assistant' && (
                      <Bot className="h-5 w-5 mt-0.5 text-teal-400" />
                    )}
                    <div className="flex-1">
                      <p className="leading-relaxed">{message.content}</p>
                      <p
                        className={`text-xs mt-2 ${
                          message.role === 'user'
                            ? 'text-white/70'
                            : 'text-white/50'
                        }`}
                      >
                        {formatTime(message.timestamp)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions */}
          {messages.length <= 1 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-white/60 mb-3">
                Quick Questions:
              </h4>
              <div className="flex flex-wrap gap-2">
                {quickQuestions.map((question, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    size="sm"
                    onClick={() => onSendMessage(question)}
                    className="text-xs rounded-xl h-8 px-3 border border-white/20 text-white/80 hover:bg-white/10 hover:text-white"
                  >
                    {question}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Input Form */}
          <form onSubmit={handleSubmit} className="flex gap-3">
            <div className="flex-1">
              <Input
                value={inputMessage}
                onChange={(e) => onInputChange(e.target.value)}
                placeholder="Ask me about recipes, cooking tips, or meal planning..."
                className="h-12 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-white/40"
                disabled={false}
              />
            </div>
            <Button
              type="submit"
              disabled={!inputMessage.trim()}
              className="h-12 px-6 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white rounded-xl disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};