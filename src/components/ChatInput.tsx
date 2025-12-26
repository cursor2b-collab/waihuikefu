import { useState, useRef } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { EmojiPicker } from './EmojiPicker';
import { Send, Smile, Image } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (content: string, type: 'text' | 'emoji' | 'image', imageUrl?: string) => void;
}

export function ChatInput({ onSendMessage }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message.trim(), 'text');
      setMessage('');
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    onSendMessage(emoji, 'emoji');
    setShowEmojiPicker(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string;
        onSendMessage('图片', 'image', imageUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
    setIsTyping(e.target.value.length > 0);
  };

  return (
    <div className="border-t border-blue-100 bg-white w-full">
      {showEmojiPicker && (
        <div className="border-b border-blue-100">
          <EmojiPicker onEmojiSelect={handleEmojiSelect} />
        </div>
      )}

      <div className="p-3 md:p-4 w-full">
        <div className="flex items-center space-x-1 md:space-x-2 w-full">
          <div className="flex-1 relative">
            <Input
              value={message}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="输入消息..."
              className="bg-blue-50 border-blue-200 text-gray-800 placeholder-gray-400 pr-12 focus:border-[#1677FF] focus:ring-[#1677FF]/20 text-sm md:text-base"
            />
            
            {isTyping && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="flex space-x-1">
                  <div className="w-1 h-1 bg-[#1677FF] rounded-full animate-bounce"></div>
                  <div className="w-1 h-1 bg-[#1677FF] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-1 h-1 bg-[#1677FF] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className={`text-gray-500 hover:text-yellow-500 hover:bg-blue-50 p-1.5 md:p-2 transition-colors ${
                showEmojiPicker ? 'text-yellow-500 bg-blue-50' : ''
              }`}
            >
              <Smile size={16} className="md:w-[18px] md:h-[18px]" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="text-gray-500 hover:text-[#1677FF] hover:bg-blue-50 p-1.5 md:p-2 transition-colors"
            >
              <Image size={16} className="md:w-[18px] md:h-[18px]" />
            </Button>
            
            <Button
              onClick={handleSend}
              disabled={!message.trim()}
              className="bg-[#1677FF] hover:bg-[#0958D9] text-white px-3 py-2 md:px-4 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:scale-105 active:scale-95"
            >
              <Send size={14} className="md:w-4 md:h-4" />
            </Button>
          </div>
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
      </div>
    </div>
  );
}