"use client";

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../../../../../convex/_generated/api';
import { Send, Bot, User, Loader2, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { useWalletUi } from '@wallet-ui/react';

interface ChatMessage {
  _id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: number;
  userId: string;
}

const AI_PAGE = () => {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { account } = useWalletUi();

  // Get chat history
  const chatHistoryQuery = useQuery(api.aiChat.getChatHistory, 
    account?.address ? { userId: account.address } : "skip"
  );
  const chatHistory = useMemo(() => chatHistoryQuery || [], [chatHistoryQuery]);

  // Mutations
  const sendMessage = useMutation(api.aiChat.sendMessage);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const handleSendMessage = async () => {
    if (!message.trim() || !account?.address) {
      toast.error('Please enter a message and ensure you are connected');
      return;
    }

    setIsLoading(true);
    try {
      await sendMessage({
        content: message.trim(),
        userId: account.address,
      });
      setMessage('');
    } catch (error) {
      toast.error('Failed to send message');
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Card className=" py-6 border-stone-200 dark:border-stone-700 space-y-4 mb-12">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Chat with AI Assistant
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea 
          ref={scrollAreaRef}
          className="h-[600px] p-4"
        >
          {chatHistory.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center">
                <Bot className="h-8 w-8 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Welcome to AI Assistant
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Ask me anything about franchise management, operations, or get help with your tasks.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-md">
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm">
                  <strong>Franchise Analytics:</strong> &ldquo;Show me revenue trends for Q3&rdquo;
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm">
                  <strong>Operations:</strong> &ldquo;Help me optimize inventory management&rdquo;
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm">
                  <strong>Marketing:</strong> &ldquo;Create a marketing strategy for new locations&rdquo;
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm">
                  <strong>Finance:</strong> &ldquo;Analyze franchise profitability metrics&rdquo;
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {chatHistory.map((msg: ChatMessage) => (
                <div
                  key={msg._id}
                  className={`flex gap-3 ${
                    msg.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <Bot className="h-4 w-4 text-purple-600" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      msg.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                    <div
                      className={`text-xs mt-1 ${
                        msg.role === 'user'
                          ? 'text-blue-100'
                          : 'text-gray-500 dark:text-gray-400'
                      }`}
                    >
                      {formatTime(msg.timestamp)}
                    </div>
                  </div>
                  {msg.role === 'user' && (
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="h-4 w-4 text-blue-600" />
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3 justify-start">
                  <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="h-4 w-4 text-purple-600" />
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        AI is thinking...
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>
      </CardContent>
      <CardFooter className="px-6">
      <div className="flex gap-3 w-full">
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask me anything about franchise management..."
          disabled={isLoading}
          className="flex-1"
        />
        <Button
          onClick={handleSendMessage}
          disabled={!message.trim() || isLoading}
          className="px-6"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>
      </CardFooter>
    </Card>
  );
};

export default AI_PAGE;
