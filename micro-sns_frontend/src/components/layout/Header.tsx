import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { type FollowStats } from '@/lib/api';
import LOGO from '/logo.png';

interface User {
  user_id: number;
  name: string;
  email: string;
  bio?: string;
}

interface HeaderProps {
  user: User | null;
  stats?: FollowStats;
  onStatsClick?: (type: 'followers' | 'following') => void;
}

export function Header({ user, stats, onStatsClick }: HeaderProps) {
  const navigate = useNavigate();

  return (
    <div className="px-4 sticky top-0 z-10 bg-gray-900/80 backdrop-blur-md border-b border-gray-800">
      <div className="max-w-2xl mx-auto py-4 flex items-center justify-between">
        <img src={LOGO} alt="@LOGO" className="w-10 cursor-pointer" onClick={() => navigate('/')} />
        {user ? (
          <div className="flex items-center gap-4">
            {stats && onStatsClick && (
              <div className="flex items-center gap-4 text-xs border-r border-gray-400 px-4">
                <button
                  onClick={() => onStatsClick('following')}
                  className="hover:underline transition-colors"
                >
                  <span className="font-bold text-white">
                    {stats.following_count}
                  </span>
                  <span className="text-gray-400 ml-1">팔로잉</span>
                </button>
                <button
                  onClick={() => onStatsClick('followers')}
                  className="hover:underline transition-colors"
                >
                  <span className="font-bold text-white">
                    {stats.follower_count}
                  </span>
                  <span className="text-gray-400 ml-1">팔로워</span>
                </button>
              </div>
            )}

            <button
              className="text-white text-sm cursor-pointer hover:underline"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/profile/${user.user_id}`);
              }}
            >
              @ {user.name}
            </button>
          </div>
        ) : (
          <Button
            onClick={() => navigate('/login')}
            className="bg-blue-500 hover:bg-blue-600 text-sm px-4 py-1.5"
          >
            로그인
          </Button>
        )}
      </div>
    </div>
  );
}
