import { MessageSquare, BarChart3, Users, Settings, HelpCircle, LogOut } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const menuItems = [
    { id: 'conversations', icon: MessageSquare, label: '对话' },
    { id: 'analytics', icon: BarChart3, label: '数据分析' },
    { id: 'customers', icon: Users, label: '客户' },
    { id: 'settings', icon: Settings, label: '设置' },
  ];

  return (
    <div className="w-16 bg-[hsl(var(--card))] border-r border-[hsl(var(--border))] flex flex-col items-center py-4">
      <div className="mb-8 w-10 h-10 rounded-lg bg-[hsl(var(--primary))] flex items-center justify-center">
        <MessageSquare size={24} className="text-white" />
      </div>

      <nav className="flex-1 flex flex-col gap-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-12 h-12 rounded-lg flex items-center justify-center transition-colors ${
                isActive
                  ? 'bg-[hsl(var(--primary))] text-white'
                  : 'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--foreground))]'
              }`}
              title={item.label}
            >
              <Icon size={20} />
            </button>
          );
        })}
      </nav>

      <div className="flex flex-col gap-2">
        <button
          className="w-12 h-12 rounded-lg flex items-center justify-center text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--foreground))] transition-colors"
          title="帮助"
        >
          <HelpCircle size={20} />
        </button>
        <button
          className="w-12 h-12 rounded-lg flex items-center justify-center text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--foreground))] transition-colors"
          title="登出"
        >
          <LogOut size={20} />
        </button>
      </div>
    </div>
  );
}

