import { useEffect } from 'react'; // useEffect 추가
import { followUser, unfollowUser } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { useFollowStatus } from '@/hooks';
import { showError } from '@/lib/utils';

// 이벤트를 식별하기 위한 상수 이름
const FOLLOW_EVENT = 'FOLLOW_STATUS_UPDATE';

interface FollowButtonProps {
  currentUserId: number;
  targetUserId: number;
  onFollowChange?: {
    fetchPosts?: () => void;
    loadStats?: () => void;
  };
  size?: 'sm' | 'md';
}

export function FollowButton({
  currentUserId,
  targetUserId,
  onFollowChange,
  size = 'sm',
}: FollowButtonProps) {
  const {
    following,
    setFollowing,
    loading: statusLoading,
  } = useFollowStatus(currentUserId, targetUserId);

  // 1. 이벤트 리스너: 다른 버튼에서 발생한 상태 변화 감지
  useEffect(() => {
    const handleStatusChange = (e: CustomEvent) => {
      const { targetId, isFollowing } = e.detail;

      // 이벤트 대상이 이 버튼의 타겟 유저와 같다면 상태 동기화
      if (targetId === targetUserId) {
        setFollowing(isFollowing);
      }
    };

    // 이벤트 등록
    window.addEventListener(FOLLOW_EVENT as any, handleStatusChange);

    // 컴포넌트 언마운트 시 이벤트 제거 (메모리 누수 방지)
    return () => {
      window.removeEventListener(FOLLOW_EVENT as any, handleStatusChange);
    };
  }, [targetUserId, setFollowing]);

  const handleFollow = async () => {
    const previousState = following;
    const newState = !following;

    // 2. Optimistic Update (나 자신을 즉시 업데이트)
    setFollowing(newState);

    // 3. 이벤트 방송: "이 유저(targetUserId)의 상태가 newState로 변했다"고 알림
    // 다른 위치에 있는 동일 인물 버튼들이 이 이벤트를 듣고 같이 바뀝니다.
    window.dispatchEvent(
      new CustomEvent(FOLLOW_EVENT, {
        detail: { targetId: targetUserId, isFollowing: newState },
      })
    );

    try {
      if (following) {
        await unfollowUser(currentUserId, targetUserId);
      } else {
        await followUser(currentUserId, targetUserId);
      }

      // 부모 컴포넌트의 콜백 실행
      if (onFollowChange) {
        onFollowChange.fetchPosts?.();
        onFollowChange.loadStats?.();
      }
    } catch (error) {
      // 4. 에러 발생 시 롤백 (이벤트도 다시 롤백 방송)
      setFollowing(previousState);
      window.dispatchEvent(
        new CustomEvent(FOLLOW_EVENT, {
          detail: { targetId: targetUserId, isFollowing: previousState },
        })
      );
      showError(error, '팔로우 처리 중 오류가 발생했습니다.');
    }
  };

  if (currentUserId === targetUserId) {
    return null;
  }

  const sizeClass = size === 'sm' ? 'text-xs' : 'text-sm px-6 py-2';

  return (
    <Button
      onClick={handleFollow}
      disabled={statusLoading}
      className={`
        rounded-full font-bold transition-colors ${sizeClass}
        ${
          following
            ? 'bg-transparent border-2 border-gray-600 text-gray-300 hover:border-red-600 hover:text-red-500 hover:bg-red-500/10'
            : 'bg-white text-black hover:bg-gray-200'
        }
      `}
    >
      {statusLoading ? '...' : following ? '팔로잉' : '팔로우'}
    </Button>
  );
}
