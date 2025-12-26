import { motion } from 'motion/react';
import { Button } from './ui/button';

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
}

export function EmojiPicker({ onEmojiSelect }: EmojiPickerProps) {
  const emojiCategories = {
    '常用': ['😀', '😂', '🥰', '😍', '🤗', '🙄', '😅', '😊'],
    '表情': ['😭', '😱', '😡', '🤔', '😴', '🤤', '😎', '🥺'],  
    '手势': ['👍', '👎', '👌', '✌️', '🤝', '👏', '💪', '🙏'],
    '心情': ['❤️', '💕', '💖', '💔', '💯', '🔥', '⭐', '✨'],
  };

  return (
    <div className="p-3 md:p-4 bg-blue-50">
      <div className="grid grid-cols-4 gap-2 md:gap-3 max-h-40 md:max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
        {Object.entries(emojiCategories).map(([category, emojis]) => (
          <div key={category} className="col-span-4">
            <h4 className="text-xs text-gray-500 mb-1 md:mb-2 font-medium">{category}</h4>
            <div className="grid grid-cols-6 md:grid-cols-8 gap-1 mb-2 md:mb-3">
              {emojis.map((emoji, index) => (
                <motion.div
                  key={emoji}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEmojiSelect(emoji)}
                    className="h-6 w-6 md:h-8 md:w-8 p-0 hover:bg-blue-100 transition-colors duration-200"
                  >
                    <span className="text-sm md:text-lg">{emoji}</span>
                  </Button>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}