import { Button } from '../ui/button';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
}

export function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  loading = false,
}: DeleteConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-gray-800 rounded-2xl w-full max-w-sm mx-4 border border-gray-700 shadow-2xl">
        <div className="p-6">
          <h2 className="text-xl font-bold text-white mb-2">
            게시물을 삭제하시겠습니까?
          </h2>
          <p className="text-gray-400 text-sm mb-6">
            이 작업은 취소할 수 없습니다.
          </p>

          <div className="flex flex-col gap-3">
            <Button
              onClick={onConfirm}
              disabled={loading}
              className="w-full bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white font-bold py-3 rounded-full"
            >
              {loading ? '삭제 중...' : '삭제'}
            </Button>
            <Button
              onClick={onClose}
              disabled={loading}
              className="w-full bg-transparent border border-gray-600 hover:bg-gray-700 text-white font-bold py-3 rounded-full"
            >
              취소
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
