import { Search, Bell, User } from 'lucide-react';

export function Header() {
  return (
    <header className="h-16 bg-[hsl(var(--card))] border-b border-[hsl(var(--border))] px-6 flex items-center justify-between">
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" size={18} />
          <input
            type="text"
            placeholder="搜索对话、客户或工单..."
            className="w-full h-10 pl-10 pr-4 bg-[hsl(var(--background))] border border-[hsl(var(--border))] rounded-lg text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative w-10 h-10 rounded-lg hover:bg-[hsl(var(--accent))] flex items-center justify-center transition-colors">
          <Bell size={20} className="text-[hsl(var(--muted-foreground))]" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        <div className="flex items-center gap-3 pl-4 border-l border-[hsl(var(--border))]">
          <div className="text-right">
            <div className="text-sm text-[hsl(var(--foreground))]">客服管理员</div>
            <div className="text-xs text-[hsl(var(--muted-foreground))]">在线</div>
          </div>
          <div className="w-10 h-10 rounded-full bg-[hsl(var(--primary))] flex items-center justify-center">
            <User size={20} className="text-white" />
          </div>
        </div>
      </div>
    </header>
  );
}

