import { Plus, Edit2, Trash2, Send, X, Check } from 'lucide-react';
import { useState } from 'react';

interface QuickReply {
  id: string;
  title: string;
  content: string;
  category: string;
}

interface QuickRepliesPanelProps {
  onSendMessage: (content: string) => void;
}

export function QuickRepliesPanel({ onSendMessage }: QuickRepliesPanelProps) {
  const [quickReplies, setQuickReplies] = useState<QuickReply[]>([
    {
      id: '1',
      title: '欢迎语',
      content: '您好！很高兴为您服务，请问有什么可以帮助您的？',
      category: '常用',
    },
    {
      id: '2',
      title: '查询订单',
      content: '好的，我马上为您查询订单信息，请稍等片刻。',
      category: '常用',
    },
    {
      id: '3',
      title: '物流信息',
      content: '您的订单已发货，预计2-3个工作日送达，请注意查收。',
      category: '产品',
    },
    {
      id: '4',
      title: '退款说明',
      content: '我们支持7天无理由退货，退款会在3-5个工作日内原路退回。',
      category: '产品',
    },
    {
      id: '5',
      title: '感谢语',
      content: '感谢您的理解与支持，祝您生活愉快！',
      category: '常用',
    },
  ]);

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ title: '', content: '', category: '常用' });

  const categories = ['常用', '产品', '其他'];

  const handleAdd = () => {
    if (formData.title.trim() && formData.content.trim()) {
      const newReply: QuickReply = {
        id: Date.now().toString(),
        title: formData.title,
        content: formData.content,
        category: formData.category,
      };
      setQuickReplies([...quickReplies, newReply]);
      setFormData({ title: '', content: '', category: '常用' });
      setIsAdding(false);
    }
  };

  const handleEdit = (id: string) => {
    const reply = quickReplies.find((r) => r.id === id);
    if (reply) {
      setFormData({ title: reply.title, content: reply.content, category: reply.category });
      setEditingId(id);
    }
  };

  const handleUpdate = () => {
    if (formData.title.trim() && formData.content.trim() && editingId) {
      setQuickReplies(
        quickReplies.map((reply) =>
          reply.id === editingId
            ? { ...reply, title: formData.title, content: formData.content, category: formData.category }
            : reply
        )
      );
      setFormData({ title: '', content: '', category: '常用' });
      setEditingId(null);
    }
  };

  const handleDelete = (id: string) => {
    setQuickReplies(quickReplies.filter((reply) => reply.id !== id));
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({ title: '', content: '', category: '常用' });
  };

  const handleSend = (content: string) => {
    onSendMessage(content);
  };

  return (
    <div className="w-80 bg-[hsl(var(--card))] border-l border-[hsl(var(--border))] overflow-y-auto flex flex-col">
      <div className="p-4 border-b border-[hsl(var(--border))]">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[hsl(var(--foreground))]">快捷回复</h3>
          <button
            onClick={() => setIsAdding(true)}
            className="w-8 h-8 rounded-lg bg-[hsl(var(--primary))] text-white flex items-center justify-center hover:opacity-90 transition-opacity"
            title="添加关键词"
          >
            <Plus size={18} />
          </button>
        </div>
        <p className="text-xs text-[hsl(var(--muted-foreground))]">点击快捷回复直接发送</p>
      </div>

      <div className="flex-1 p-4 space-y-3">
        {/* Add/Edit Form */}
        {(isAdding || editingId) && (
          <div className="p-3 rounded-lg bg-[hsl(var(--secondary))] border border-[hsl(var(--border))]">
            <div className="space-y-2 mb-3">
              <input
                type="text"
                placeholder="标题"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 bg-[hsl(var(--background))] border border-[hsl(var(--border))] rounded-lg text-[hsl(var(--foreground))] text-sm placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
              />
              <textarea
                placeholder="回复内容"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 bg-[hsl(var(--background))] border border-[hsl(var(--border))] rounded-lg text-[hsl(var(--foreground))] text-sm placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] resize-none"
              />
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 bg-[hsl(var(--background))] border border-[hsl(var(--border))] rounded-lg text-[hsl(var(--foreground))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              <button
                onClick={editingId ? handleUpdate : handleAdd}
                className="flex-1 px-3 py-2 rounded-lg bg-[hsl(var(--primary))] text-white hover:opacity-90 transition-opacity flex items-center justify-center gap-2 text-sm"
              >
                <Check size={16} />
                {editingId ? '更新' : '添加'}
              </button>
              <button
                onClick={handleCancel}
                className="px-3 py-2 rounded-lg bg-[hsl(var(--accent))] text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] transition-colors flex items-center justify-center"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Quick Reply List */}
        {categories.map((category) => {
          const categoryReplies = quickReplies.filter((r) => r.category === category);
          if (categoryReplies.length === 0) return null;

          return (
            <div key={category} className="space-y-2">
              {categoryReplies.map((reply) => (
                <div
                  key={reply.id}
                  className="group relative p-3 rounded-lg bg-[hsl(var(--secondary))] hover:bg-[hsl(var(--accent))] transition-colors"
                >
                  <div className="pr-16">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm text-[hsl(var(--foreground))]">{reply.title}</span>
                    </div>
                    <p className="text-xs text-[hsl(var(--muted-foreground))] line-clamp-2">
                      {reply.content}
                    </p>
                  </div>
                  <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleSend(reply.content)}
                      className="w-7 h-7 rounded-md bg-[hsl(var(--primary))] text-white flex items-center justify-center hover:opacity-90 transition-opacity"
                      title="发送"
                    >
                      <Send size={14} />
                    </button>
                    <button
                      onClick={() => handleEdit(reply.id)}
                      className="w-7 h-7 rounded-md bg-[hsl(var(--background))] text-[hsl(var(--foreground))] flex items-center justify-center hover:bg-[hsl(var(--muted))] transition-colors"
                      title="编辑"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(reply.id)}
                      className="w-7 h-7 rounded-md bg-red-500 text-white flex items-center justify-center hover:opacity-90 transition-opacity"
                      title="删除"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

