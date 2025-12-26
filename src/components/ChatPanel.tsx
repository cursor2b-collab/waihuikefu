import { Send, Paperclip, Smile, MoreVertical, Phone, Video } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { supabase, type Message as SupabaseMessage } from '../lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';

interface Message {
  id: string;
  content: string;
  sender: 'customer' | 'agent';
  time: string;
}

interface ChatPanelProps {
  conversationId: string | null;
  externalMessage?: string;
  onMessageSent?: () => void;
}

export function ChatPanel({ conversationId, externalMessage, onMessageSent }: ChatPanelProps) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);

  // 加载消息
  const loadMessages = async (convId: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', convId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const formattedMessages: Message[] = (data || []).map((msg: SupabaseMessage) => ({
        id: msg.id,
        content: msg.content,
        sender: msg.sender_type === 'customer' ? 'customer' : 'agent',
        time: new Date(msg.created_at).toLocaleTimeString('zh-CN', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
      }));

      setMessages(formattedMessages);
    } catch (error) {
      console.error('加载消息失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 订阅实时消息更新
  useEffect(() => {
    if (!conversationId) {
      setMessages([]);
      return;
    }

    // 加载历史消息
    loadMessages(conversationId);

    // 清理旧的订阅
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    // 订阅新消息
    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const newMessage = payload.new as SupabaseMessage;
          setMessages((prev) => {
            if (prev.some((msg) => msg.id === newMessage.id)) {
              return prev;
            }
            return [
              ...prev,
              {
                id: newMessage.id,
                content: newMessage.content,
                sender: newMessage.sender_type === 'customer' ? 'customer' : 'agent',
                time: new Date(newMessage.created_at).toLocaleTimeString('zh-CN', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                }),
              },
            ];
          });
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [conversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (externalMessage) {
      handleSend(externalMessage);
      if (onMessageSent) {
        onMessageSent();
      }
    }
  }, [externalMessage]);

  const handleSend = async (messageToSend?: string) => {
    if (!conversationId) return;

    const content = messageToSend || message;
    if (!content.trim()) return;

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_type: 'agent',
          content: content.trim(),
        });

      if (error) throw error;

      // 更新会话的更新时间
      await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversationId);

      setMessage('');
    } catch (error) {
      console.error('发送消息失败:', error);
    }
  };

  if (!conversationId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[hsl(var(--background))]">
        <div className="text-center text-[hsl(var(--muted-foreground))]">
          <p>请从左侧选择一个会话</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-[hsl(var(--background))]">
      {/* Chat Header */}
      <div className="h-16 bg-[hsl(var(--card))] border-b border-[hsl(var(--border))] px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src="https://cy-747263170.imgix.net/15201ab3-e961-4298-8525-ebd51fcbefc5.png" />
            <AvatarFallback className="bg-[hsl(var(--primary))] text-white">
              {conversationId.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="text-[hsl(var(--foreground))]">会话 {conversationId.substring(0, 8)}</div>
            <div className="text-xs text-[hsl(var(--muted-foreground))]">在线</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="w-9 h-9 rounded-lg hover:bg-[hsl(var(--accent))] flex items-center justify-center transition-colors">
            <Phone size={18} className="text-[hsl(var(--muted-foreground))]" />
          </button>
          <button className="w-9 h-9 rounded-lg hover:bg-[hsl(var(--accent))] flex items-center justify-center transition-colors">
            <Video size={18} className="text-[hsl(var(--muted-foreground))]" />
          </button>
          <button className="w-9 h-9 rounded-lg hover:bg-[hsl(var(--accent))] flex items-center justify-center transition-colors">
            <MoreVertical size={18} className="text-[hsl(var(--muted-foreground))]" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-[hsl(var(--muted-foreground))]">加载中...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-[hsl(var(--muted-foreground))]">暂无消息</p>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-end gap-3 ${msg.sender === 'agent' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'customer' && (
                  <Avatar className="w-8 h-8">
                    <AvatarImage src="https://cy-747263170.imgix.net/15201ab3-e961-4298-8525-ebd51fcbefc5.png" />
                    <AvatarFallback className="text-xs">客</AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`max-w-md ${
                    msg.sender === 'agent'
                      ? 'bg-[hsl(var(--primary))] text-white'
                      : 'bg-[hsl(var(--card))] text-[hsl(var(--foreground))]'
                  } rounded-lg px-4 py-2`}
                >
                  <p className="text-sm">{msg.content}</p>
                  <span className={`text-xs mt-1 block ${
                    msg.sender === 'agent' ? 'text-white/70' : 'text-[hsl(var(--muted-foreground))]'
                  }`}>
                    {msg.time}
                  </span>
                </div>
                {msg.sender === 'agent' && (
                  <Avatar className="w-8 h-8">
                    <AvatarImage src="https://cy-747263170.imgix.net/EOkvsbDty0.jpg" />
                    <AvatarFallback className="text-xs">服</AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-[hsl(var(--card))] border-t border-[hsl(var(--border))]">
        <div className="flex items-end gap-3">
          <div className="flex-1 bg-[hsl(var(--background))] border border-[hsl(var(--border))] rounded-lg">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="输入消息..."
              className="w-full px-4 py-3 bg-transparent text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none resize-none"
              rows={2}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
            <div className="flex items-center justify-between px-4 pb-3">
              <div className="flex gap-2">
                <button className="w-8 h-8 rounded-lg hover:bg-[hsl(var(--accent))] flex items-center justify-center transition-colors">
                  <Paperclip size={18} className="text-[hsl(var(--muted-foreground))]" />
                </button>
                <button className="w-8 h-8 rounded-lg hover:bg-[hsl(var(--accent))] flex items-center justify-center transition-colors">
                  <Smile size={18} className="text-[hsl(var(--muted-foreground))]" />
                </button>
              </div>
            </div>
          </div>
          <button
            onClick={() => handleSend()}
            disabled={!message.trim()}
            className="h-10 px-6 rounded-lg bg-[hsl(var(--primary))] text-white hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={18} />
            发送
          </button>
        </div>
      </div>
    </div>
  );
}

