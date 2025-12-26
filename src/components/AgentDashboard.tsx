import { SidebarProvider } from '@/components/blocks/sidebar';
import { ChatTemplate } from '@/components/blocks/chat-template';

export function AgentDashboard() {
  return (
    <SidebarProvider>
      <ChatTemplate />
    </SidebarProvider>
  );
}
