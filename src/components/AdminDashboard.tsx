import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { ConversationList } from './ConversationList';
import { ChatPanel } from './ChatPanel';
import { QuickRepliesPanel } from './QuickRepliesPanel';

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('conversations');
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [quickReplyMessage, setQuickReplyMessage] = useState<string>('');

  const handleSendQuickReply = (content: string) => {
    setQuickReplyMessage(content);
  };

  const handleMessageSent = () => {
    setQuickReplyMessage('');
  };

  return (
    <div className="h-screen flex bg-[hsl(var(--background))]">
      {/* Sidebar */}
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <Header />

        <div className="flex-1 flex overflow-hidden">
          {/* Conversation List */}
          <ConversationList
            selectedId={selectedConversation}
            onSelect={setSelectedConversation}
          />

          {/* Chat Panel */}
          <ChatPanel 
            conversationId={selectedConversation}
            externalMessage={quickReplyMessage}
            onMessageSent={handleMessageSent}
          />

          {/* Quick Replies Panel */}
          <QuickRepliesPanel onSendMessage={handleSendQuickReply} />
        </div>
      </div>
    </div>
  );
}

