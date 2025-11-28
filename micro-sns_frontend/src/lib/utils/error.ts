import { toast } from 'sonner';

/**
 * API 에러를 사용자 친화적인 메시지로 변환
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return '알 수 없는 오류가 발생했습니다.';
}

/**
 * 에러를 토스트로 표시
 */
export function showError(error: unknown, fallbackMessage?: string): void {
  const message = fallbackMessage || getErrorMessage(error);
  toast.error(message);
}

/**
 * 성공 메시지를 토스트로 표시
 */
export function showSuccess(message: string): void {
  toast.success(message);
}
