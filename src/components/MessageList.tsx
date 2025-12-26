import { motion } from 'motion/react';
import { MessageItem } from './MessageItem';

interface Message {
  id: string;
  content: string;
  type: 'text' | 'emoji' | 'image';
  sender: 'user' | 'agent';
  timestamp: Date;
  imageUrl?: string;
}

interface MessageListProps {
  messages: Message[];
}

export function MessageList({ messages }: MessageListProps) {
  if (messages.length === 0) {
    return (
      <div className="h-full flex items-center justify-center p-3 md:p-4 bg-gradient-to-b from-blue-50/30 to-white">
        <p className="text-gray-400 text-sm">暂无消息</p>
      </div>
    );
  }

  return (
    <div className="p-3 md:p-4 space-y-3 md:space-y-4 bg-gradient-to-b from-blue-50/30 to-white">
      {messages.map((message) => (
        <motion.div
          key={message.id}
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ 
            duration: 0.2,
            ease: 'easeOut'
          }}
        >
          <MessageItem message={message} />
        </motion.div>
      ))}
    </div>
  );
}