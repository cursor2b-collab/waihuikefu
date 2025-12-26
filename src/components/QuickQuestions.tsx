import { motion } from 'motion/react';
import { Button } from './ui/button';
import { MessageCircle } from 'lucide-react';

interface QuickQuestionsProps {
  onQuestionClick: (question: string) => void;
}

export function QuickQuestions({ onQuestionClick }: QuickQuestionsProps) {
  const questions = [
    '如何查询订单状态？',
    '退款需要多久？',
    '如何联系人工客服？',
    '账户安全问题',
  ];

  return (
    <div className="border-t border-blue-100 bg-gradient-to-r from-blue-50/50 to-white px-3 py-3 md:px-4 md:py-3">
      <div className="flex items-center space-x-2 mb-2">
        <MessageCircle size={14} className="text-[#1677FF]" />
        <span className="text-xs text-gray-500">快捷问题</span>
      </div>
      <div className="flex gap-2 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent pb-1">
        {questions.map((question, index) => (
          <motion.div
            key={question}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.08, duration: 0.3 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex-shrink-0"
          >
            <Button
              variant="outline"
              size="sm"
              onClick={() => onQuestionClick(question)}
              className="bg-white border-[#1677FF]/30 text-[#1677FF] hover:bg-blue-50 hover:border-[#1677FF] text-xs transition-all duration-200 h-auto py-2 px-4 rounded-full shadow-sm whitespace-nowrap"
            >
              {question}
            </Button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}