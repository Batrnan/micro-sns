import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { toast } from 'sonner';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 현재 시간과 주어진 날짜의 차이를 한국어로 포맷팅
 */
export function formatTimeAgo(date: string | Date): string {
  const now = new Date();
  const postDate = new Date(date);
  const diffMs = now.getTime() - postDate.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return '방금';
  if (diffMins < 60) return `${diffMins}분`;
  if (diffHours < 24) return `${diffHours}시간`;
  return `${diffDays}일`;
}

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
