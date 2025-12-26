import { useState, useRef, useEffect } from 'react';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';
import { Button } from './ui/button';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { X, Minimize2, Maximize2 } from 'lucide-react';
import { supabase, type Message as SupabaseMessage } from '../lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

interface Message {
  id: string;
  content: string;
  type: 'text' | 'emoji' | 'image';
  sender: 'user' | 'agent';
  timestamp: Date;
  imageUrl?: string;
}

export function ChatWindow() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isMinimized, setIsMinimized] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);

  // 将 Supabase 消息格式转换为组件使用的格式
  const convertMessage = (msg: SupabaseMessage): Message => {
    // 检查是否是图片消息（格式：[IMAGE:base64...]）
    const imageMatch = msg.content.match(/^\[IMAGE:(.*)\]$/s);
    if (imageMatch) {
      return {
        id: msg.id,
        content: '图片',
        type: 'image',
        sender: msg.sender_type === 'customer' ? 'user' : 'agent',
        timestamp: new Date(msg.created_at),
        imageUrl: imageMatch[1],
      };
    }
    
    return {
      id: msg.id,
      content: msg.content,
      type: 'text',
      sender: msg.sender_type === 'customer' ? 'user' : 'agent',
      timestamp: new Date(msg.created_at),
    };
  };

  // 初始化会话和加载历史消息
  useEffect(() => {
    const initializeConversation = async () => {
      try {
        // 创建或获取会话
        // 使用 localStorage 存储会话 ID，以便刷新后保持会话
        let convId = localStorage.getItem('chat_conversation_id');
        
        // 如果存在会话 ID，验证会话是否仍然存在
        if (convId) {
          const { data: existingConv, error: checkError } = await supabase
            .from('conversations')
            .select('id')
            .eq('id', convId)
            .single();

          // 如果会话不存在或查询失败，清除 localStorage 并创建新会话
          if (checkError || !existingConv) {
            console.warn('会话不存在，创建新会话:', checkError);
            localStorage.removeItem('chat_conversation_id');
            convId = null;
          }
        }
        
        if (!convId) {
          // 创建新会话
          const { data: conversation, error: convError } = await supabase
            .from('conversations')
            .insert({ status: 'active' })
            .select()
            .single();

          if (convError) {
            console.error('创建会话失败:', convError);
            throw convError;
          }
          convId = conversation.id;
          localStorage.setItem('chat_conversation_id', convId);
        }

        setConversationId(convId);

        // 加载历史消息
        const { data: historyMessages, error: messagesError } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', convId)
          .order('created_at', { ascending: true });

        if (messagesError) throw messagesError;

        if (historyMessages && historyMessages.length > 0) {
          setMessages(historyMessages.map(convertMessage));
        } else {
          // 如果没有历史消息，添加欢迎消息
          const welcomeMessage: Message = {
            id: 'welcome-1',
            content: '您好！欢迎使用在线客服，我是您的专属客服小助手，有什么可以帮助您的吗？',
            type: 'text',
            sender: 'agent',
            timestamp: new Date(),
          };
          setMessages([welcomeMessage]);
        }

        setIsLoading(false);
      } catch (error) {
        console.error('初始化会话失败:', error);
        setIsLoading(false);
      }
    };

    initializeConversation();
  }, []);

  // 订阅实时消息更新
  useEffect(() => {
    if (!conversationId) return;

    // 清理旧的订阅
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    // 订阅消息变化
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
          console.log('收到新消息:', payload);
          const newMessage = payload.new as SupabaseMessage;
          setMessages((prev) => {
            // 避免重复添加（包括临时消息）
            const existing = prev.find((msg) => msg.id === newMessage.id);
            if (existing) {
              return prev;
            }
            // 移除可能的临时消息
            const filtered = prev.filter((msg) => !msg.id.startsWith('temp-'));
            return [...filtered, convertMessage(newMessage)];
          });
        }
      )
      .subscribe((status) => {
        console.log('Realtime 订阅状态:', status);
      });

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [conversationId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (content: string, type: 'text' | 'emoji' | 'image', imageUrl?: string) => {
    // 确保有有效的会话 ID
    let currentConvId = conversationId;
    
    if (!currentConvId) {
      console.error('会话未初始化，尝试创建新会话');
      // 尝试创建新会话
      try {
        const { data: conversation, error: convError } = await supabase
          .from('conversations')
          .insert({ status: 'active' })
          .select()
          .single();

        if (convError) {
          console.error('创建会话失败:', convError);
          alert('无法创建会话，请刷新页面重试');
          return;
        }

        currentConvId = conversation.id;
        localStorage.setItem('chat_conversation_id', currentConvId);
        setConversationId(currentConvId);
      } catch (error) {
        console.error('创建会话异常:', error);
        alert('无法创建会话，请刷新页面重试');
        return;
      }
    } else {
      // 验证会话是否存在
      const { data: convCheck, error: checkError } = await supabase
        .from('conversations')
        .select('id')
        .eq('id', currentConvId)
        .single();

      if (checkError || !convCheck) {
        console.error('会话不存在，重新创建:', checkError);
        // 清除无效的会话 ID
        localStorage.removeItem('chat_conversation_id');
        
        // 创建新会话
        try {
          const { data: conversation, error: convError } = await supabase
            .from('conversations')
            .insert({ status: 'active' })
            .select()
            .single();

          if (convError) {
            console.error('重新创建会话失败:', convError);
            alert('无法创建会话，请刷新页面重试');
            return;
          }

          currentConvId = conversation.id;
          localStorage.setItem('chat_conversation_id', currentConvId);
          setConversationId(currentConvId);
        } catch (error) {
          console.error('重新创建会话异常:', error);
          alert('无法创建会话，请刷新页面重试');
          return;
        }
      }
    }

    // 根据类型构建消息内容
    // 图片消息格式：[IMAGE:base64...]
    let messageContent: string;
    if (type === 'image' && imageUrl) {
      messageContent = `[IMAGE:${imageUrl}]`;
    } else {
      messageContent = content;
    }
    
    // 乐观更新：立即显示消息（临时ID）
    const tempId = `temp-${Date.now()}`;
    const optimisticMessage: Message = {
      id: tempId,
      content: type === 'image' ? '图片' : content,
      type: type,
      sender: 'user',
      timestamp: new Date(),
      imageUrl: imageUrl,
    };

    // 立即添加到消息列表
    setMessages((prev) => [...prev, optimisticMessage]);

    try {
      // 发送消息到 Supabase（使用验证后的会话 ID）
      const { data: newMessage, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: currentConvId,
          sender_type: 'customer',
          content: messageContent,
        })
        .select()
        .single();

      if (error) {
        console.error('发送消息失败:', error);
        // 如果发送失败，移除乐观更新的消息
        setMessages((prev) => prev.filter((msg) => msg.id !== tempId));
        throw error;
      }

      // 更新会话的更新时间
      await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', currentConvId);

      // 用真实消息替换临时消息
      setMessages((prev) => {
        const filtered = prev.filter((msg) => msg.id !== tempId);
        // 检查是否已通过 Realtime 添加
        if (filtered.some((msg) => msg.id === newMessage.id)) {
          return filtered;
        }
        // 对于图片消息，保留 imageUrl
        const convertedMsg = convertMessage(newMessage);
        if (type === 'image' && imageUrl) {
          convertedMsg.imageUrl = imageUrl;
        }
        return [...filtered, convertedMsg];
      });
    } catch (error) {
      console.error('发送消息失败:', error);
      // 错误已经在上面处理了，这里可以添加用户提示
      alert('发送消息失败，请重试');
    }
  };

  return (
    <div 
      className="bg-white"
      style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%'
      }}
    >
      {/* Header - 顶部 */}
      <div 
        className="bg-gradient-to-r from-[#1677FF] to-[#0958D9] px-4 md:px-6 py-3 md:py-4 flex items-center justify-between border-b border-blue-600"
        style={{ flexShrink: 0 }}
      >
        <div className="flex items-center space-x-2 md:space-x-3">
          <Avatar className="w-8 h-8 md:w-10 md:h-10">
            <AvatarImage src="https://cy-747263170.imgix.net/EOkvsbDty0.jpg" />
            <AvatarFallback className="bg-white rounded-full flex items-center justify-center shadow-md">
              <span className="text-[#1677FF] text-sm md:text-base font-medium">客</span>
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-white font-medium text-sm md:text-base">在线客服</h3>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></div>
              <span className="text-blue-100 text-xs md:text-sm">在线</span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMinimized(!isMinimized)}
            className="text-blue-100 hover:text-white hover:bg-blue-600/50 p-2"
          >
            {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-blue-100 hover:text-white hover:bg-blue-600/50 p-2"
          >
            <X size={16} />
          </Button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages - 中间区域可滚动 */}
          <div 
            className="bg-gradient-to-b from-blue-50/30 to-white"
            style={{ 
              flex: 1,
              overflowY: 'auto',
              overflowX: 'hidden',
              minHeight: 0
            }}
          >
            <MessageList messages={messages} />
            <div ref={messagesEndRef} />
          </div>

          {/* Input - 底部 */}
          <div style={{ flexShrink: 0 }}>
            <ChatInput onSendMessage={handleSendMessage} />
          </div>
        </>
      )}
    </div>
  );
}