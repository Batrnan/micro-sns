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
