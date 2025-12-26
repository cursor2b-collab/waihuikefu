import { Clock, Star } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase, type Conversation as SupabaseConversation } from '../lib/supabase';

interface Conversation {
  id: string;
  customerName: string;
  lastMessage: string;
  time: string;
  unread: number;
  status: 'active' | 'waiting' | 'resolved';
  priority: boolean;
}

interface ConversationListProps {
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function ConversationList({ selectedId, onSelect }: ConversationListProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 加载会话列表
  const loadConversations = async () => {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      // 获取每个会话的最后一条消息
      const conversationsWithMessages = await Promise.all(
        (data || []).map(async (conv: SupabaseConversation) => {
          const { data: lastMessage } = await supabase
            .from('messages')
            .select('content, created_at')
            .eq('conversation_id', conv.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          const formatTime = (dateString: string) => {
            const date = new Date(dateString);
            const now = new Date();
            const diff = now.getTime() - date.getTime();
            const minutes = Math.floor(diff / 60000);
            const hours = Math.floor(minutes / 60);
            const days = Math.floor(hours / 24);

            if (minutes < 1) return '刚刚';
            if (minutes < 60) return `${minutes}分钟前`;
            if (hours < 24) return `${hours}小时前`;
            if (days < 7) return `${days}天前`;
            return date.toLocaleDateString('zh-CN');
          };

          return {
            id: conv.id,
            customerName: `用户 ${conv.id.substring(0, 8)}`,
            lastMessage: lastMessage?.content || '暂无消息',
            time: formatTime(conv.updated_at),
            unread: 0, // 可以后续实现未读消息计数
            status: conv.status === 'active' ? 'active' : 'resolved' as 'active' | 'resolved',
            priority: false,
          };
        })
      );

      setConversations(conversationsWithMessages);
    } catch (error) {
      console.error('加载会话列表失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 订阅会话列表更新
  useEffect(() => {
    const channel = supabase
      .channel('conversations-list')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
        },
        () => {
          loadConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    loadConversations();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'waiting':
        return 'bg-yellow-500';
      case 'resolved':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="w-80 bg-[hsl(var(--card))] border-r border-[hsl(var(--border))] flex flex-col">
      <div className="p-4 border-b border-[hsl(var(--border))]">
        <h2 className="text-[hsl(var(--foreground))]">对话列表</h2>
        <div className="flex gap-2 mt-3">
          <button className="px-3 py-1 rounded-md bg-[hsl(var(--primary))] text-white text-xs">
            全部 ({conversations.length})
          </button>
          <button className="px-3 py-1 rounded-md bg-[hsl(var(--secondary))] text-[hsl(var(--muted-foreground))] text-xs hover:bg-[hsl(var(--accent))]">
            进行中 ({conversations.filter(c => c.status === 'active').length})
          </button>
          <button className="px-3 py-1 rounded-md bg-[hsl(var(--secondary))] text-[hsl(var(--muted-foreground))] text-xs hover:bg-[hsl(var(--accent))]">
            已关闭 ({conversations.filter(c => c.status === 'resolved').length})
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 text-center text-[hsl(var(--muted-foreground))]">加载中...</div>
        ) : conversations.length === 0 ? (
          <div className="p-4 text-center text-[hsl(var(--muted-foreground))]">暂无会话</div>
        ) : (
          conversations.map((conversation) => (
            <button
              key={conversation.id}
              onClick={() => onSelect(conversation.id)}
              className={`w-full p-4 border-b border-[hsl(var(--border))] text-left transition-colors ${
                selectedId === conversation.id
                  ? 'bg-[hsl(var(--accent))]'
                  : 'hover:bg-[hsl(var(--secondary))]'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-[hsl(var(--foreground))]">{conversation.customerName}</span>
                  {conversation.priority && (
                    <Star size={14} className="text-yellow-500" fill="yellow" />
                  )}
                </div>
                <span className="text-xs text-[hsl(var(--muted-foreground))] flex items-center gap-1">
                  <Clock size={12} />
                  {conversation.time}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-[hsl(var(--muted-foreground))] text-xs truncate flex-1">
                  {conversation.lastMessage}
                </p>
                {conversation.unread > 0 && (
                  <span className="ml-2 px-2 py-0.5 rounded-full bg-[hsl(var(--primary))] text-white text-xs">
                    {conversation.unread}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <span className={`w-2 h-2 rounded-full ${getStatusColor(conversation.status)}`}></span>
                <span className="text-xs text-[hsl(var(--muted-foreground))]">
                  {conversation.status === 'active' && '进行中'}
                  {conversation.status === 'waiting' && '等待中'}
                  {conversation.status === 'resolved' && '已关闭'}
                </span>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}

