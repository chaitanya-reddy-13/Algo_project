import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  MessageSquare,
  Send,
  Bot,
  User,
  Loader2,
  X,
  Lightbulb,
  AlertCircle
} from 'lucide-react';
import { aiAssistantAPI } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AIAssistantProps {
  problemId: number;
  problemTitle: string;
  problemDescription: string;
  problemConstraints: string;
  currentCode: string;
  isOpen: boolean;
  onClose: () => void;
}

const QUICK_TIPS = [
  "What's the time complexity of this approach?",
  "Can you explain this algorithm?",
  "What's wrong with my code?",
  "Give me a hint for the next step",
];

export function AIAssistant({
  problemId,
  problemTitle,
  problemDescription,
  problemConstraints,
  currentCode,
  isOpen,
  onClose
}: AIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          type: 'assistant',
          content: `Hi! I'm your AI coding assistant for "${problemTitle}". I can help you with:\n\n• Understanding the problem requirements\n• Explaining algorithms and concepts\n• Debugging your code\n• Providing hints and guidance\n\nI won't give you complete solutions, but I'll guide you in the right direction. What would you like help with?`,
          timestamp: new Date()
        }
      ]);
    }
  }, [isOpen, problemTitle, messages.length]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await aiAssistantAPI.sendMessage(
        inputValue.trim(),
        problemId,
        currentCode
      );

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: response.data.response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Failed to get AI response:', error);
      toast({
        title: "Error",
        description: "Failed to get AI response. Please try again.",
        variant: "destructive",
      });
       // Add the error message back to the chat for visibility
      setMessages(prev => [...prev, {
        id: 'error-' + Date.now(),
        type: 'assistant',
        content: "Sorry, I couldn't process that. Please try rephrasing your question.",
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleQuickTipClick = (tip: string) => {
    if (isLoading) return;
    setInputValue(tip);
    inputRef.current?.focus();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl h-[90vh] max-h-[700px] bg-background/80 border-border shadow-lg flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b">
          <div className="flex items-center gap-3">
            <Bot className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">AI Assistant: {problemTitle}</CardTitle>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="flex flex-col flex-1 p-4 space-y-4 min-h-0">
          {/* Messages Area */}
          <ScrollArea className="flex-1 pr-4 -mr-4">
            <div className="space-y-6">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 text-sm ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.type === 'assistant' && (
                    <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center border">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                  )}
                  <div
                    className={`max-w-[85%] rounded-lg p-3 ${
                      message.type === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted/50'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{message.content}</div>
                    <div className="text-xs opacity-60 mt-2 text-right">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  {message.type === 'user' && (
                     <div className="flex-shrink-0 w-8 h-8 bg-muted rounded-full flex items-center justify-center border">
                      <User className="h-4 w-4 text-muted-foreground" />
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3 justify-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center border">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3 flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Thinking...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Bottom Section */}
          <div className="flex-shrink-0 pt-4 border-t space-y-3">
            {/* Quick Tips - FIXED */}
            <div className="px-1">
              <div className="flex items-center gap-2 mb-2">
                 <Lightbulb className="h-4 w-4 text-yellow-400" />
                 <span className="text-xs font-medium text-muted-foreground">Quick tips</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {QUICK_TIPS.map((tip) => (
                  <Badge
                    key={tip}
                    variant="outline"
                    className="cursor-pointer hover:bg-muted"
                    onClick={() => handleQuickTipClick(tip)}
                  >
                    {tip}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Input Area */}
            <div className="flex gap-3">
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask a question or request a hint..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
                size="icon"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}