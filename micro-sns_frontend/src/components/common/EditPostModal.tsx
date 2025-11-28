import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { CloseIcon } from '@/components/icons';

interface EditPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (content: string) => Promise<void>;
  initialContent: string;
  loading?: boolean;
}

export function EditPostModal({
  isOpen,
  onClose,
  onConfirm,
  initialContent,
  loading = false,
}: EditPostModalProps) {
  const [content, setContent] = useState(initialContent);

  useEffect(() => {
    setContent(initialContent);
  }, [initialContent, isOpen]);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    if (!content.trim()) return;
    await onConfirm(content);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg max-w-lg w-full mx-4 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">게시글 수정</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
            disabled={loading}
          >
            <CloseIcon />
          </button>
        </div>

        <textarea
          className="w-full bg-gray-700 text-white rounded-lg p-3 mb-4 min-h-[150px] resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="내용을 입력하세요..."
          disabled={loading}
        />

        <div className="flex gap-2 justify-end">
          <Button
            onClick={onClose}
            disabled={loading}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-full"
          >
            취소
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={loading || !content.trim()}
            className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-full"
          >
            {loading ? '수정 중...' : '수정'}
          </Button>
        </div>
      </div>
    </div>
  );
}
