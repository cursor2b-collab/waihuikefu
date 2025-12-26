import { motion } from 'motion/react';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface Message {
  id: string;
  content: string;
  type: 'text' | 'emoji' | 'image';
  sender: 'user' | 'agent';
  timestamp: Date;
  imageUrl?: string;
}

interface MessageItemProps {
  message: Message;
}

export function MessageItem({ message }: MessageItemProps) {
  const isUser = message.sender === 'user';
  const isAgent = message.sender === 'agent';
  
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('zh-CN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className={`flex items-end space-x-2 md:space-x-3 ${isUser ? 'justify-end mt-2' : 'justify-start'}`}>
      {isAgent && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Avatar className="w-8 h-8 md:w-12 md:h-12">
            <AvatarImage src="https://cy-747263170.imgix.net/EOkvsbDty0.jpg" />
            <AvatarFallback className="w-full h-full bg-gradient-to-br from-[#1677FF] to-[#0958D9] rounded-full flex items-center justify-center shadow-md">
              <span className="text-white text-sm md:text-base font-medium">客</span>
            </AvatarFallback>
          </Avatar>
        </motion.div>
      )}
      
      <div className={`flex flex-col max-w-[85%] md:max-w-[80%] ${isUser ? 'items-end mt-4' : 'items-start'}`}>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.2 }}
          className={`relative px-3 py-2 md:px-4 md:py-3 rounded-2xl shadow-lg ${
            isUser 
              ? 'bg-gradient-to-r from-[#1677FF] to-[#0958D9] text-white rounded-br-md' 
              : 'bg-blue-50 text-gray-800 rounded-bl-md border border-blue-100'
          }`}
        >
          {message.type === 'text' && (
            <p className="text-xs md:text-sm leading-relaxed break-words">{message.content}</p>
          )}
          
          {message.type === 'emoji' && (
            <span className="text-2xl">{message.content}</span>
          )}
          
          {message.type === 'image' && message.imageUrl && (
            <div className="rounded-lg overflow-hidden max-w-[150px] md:max-w-[200px]">
              <ImageWithFallback
                src={message.imageUrl}
                alt="用户上传的图片"
                className="w-full h-auto object-cover"
              />
            </div>
          )}
          
          {/* Message tail */}
          <div
            className={`absolute top-3 w-3 h-3 ${
              isUser
                ? 'right-[-6px] bg-[#0958D9] transform rotate-45'
                : 'left-[-6px] bg-blue-50 border-l border-b border-blue-100 transform rotate-45'
            }`}
          />
        </motion.div>
        
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-xs text-gray-400 mt-1 px-2"
        >
          {formatTime(message.timestamp)}
        </motion.span>
      </div>
      
      {isUser && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Avatar className="w-8 h-8 md:w-12 md:h-12">
            <AvatarImage src="https://cy-747263170.imgix.net/15201ab3-e961-4298-8525-ebd51fcbefc5.png" />
            <AvatarFallback className="w-full h-full bg-gradient-to-br from-[#1677FF] to-[#4096FF] rounded-full flex items-center justify-center shadow-md">
              <span className="text-white text-sm md:text-base font-medium">我</span>
            </AvatarFallback>
          </Avatar>
        </motion.div>
      )}
    </div>
  );
}