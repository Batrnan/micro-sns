import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { type FollowStats } from '@/lib/api';
import LOGO from '/logo.png';

import { useState } from 'react';
import { searchUsers } from '@/lib/api';

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

  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState([]);

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setKeyword(value);

    if (value.trim() === '') {
      setResults([]);
      return;
    }

    try {
    console.log("🔍 검색 요청:", value); // 추가
    const users = await searchUsers(value);
    console.log("🔍 검색 결과:", users); // 추가
      setResults(users);
    } catch (err) {
      console.error('검색 실패:', err);
    }
  };

  return (
    <div className="px-4 sticky top-0 z-10 bg-gray-900/80 backdrop-blur-md border-b border-gray-800">
      <div className="max-w-2xl mx-auto py-4 flex items-center justify-between gap-4">
        {/* 로고 */}
        <img src={LOGO} alt="@LOGO" className="w-10 cursor-pointer" onClick={() => navigate('/')} />

        {/* 검색창 - 로그인 상태에서만 표시 */}
        {user && (
          <div className="relative w-56">
            <input
              type="text"
              value={keyword}
              onChange={handleSearch}
              placeholder="사용자 검색..."
              className="w-full px-3 py-1.5 bg-gray-800 text-white rounded-lg text-sm focus:outline-none"
            />

            {/* 검색 결과 */}
            {results.length > 0 && (
              <div className="absolute left-0 right-0 bg-gray-800 border border-gray-700 rounded-lg mt-1 shadow-lg max-h-60 overflow-y-auto z-50">
                {results.map((u: any) => (
                  <div
                    key={u.user_id}
                    className="p-3 hover:bg-gray-700 cursor-pointer text-white text-sm"
                    onClick={() => {
                      navigate(`/profile/${u.user_id}`);
                      setKeyword('');
                      setResults([]);
                    }}
                  >
                    {u.name}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 사용자 정보 / 로그인 버튼 */}
        {user ? (
          <div className="flex items-center gap-4">
            {/* 팔로잉/팔로워 */}
            {stats && onStatsClick && (
              <div className="flex items-center gap-4 text-xs border-r border-gray-400 px-4">
                <button
                  onClick={() => onStatsClick('following')}
                  className="hover:underline transition-colors"
                >
                  <span className="font-bold text-white">{stats.following_count}</span>
                  <span className="text-gray-400 ml-1">팔로잉</span>
                </button>
                <button
                  onClick={() => onStatsClick('followers')}
                  className="hover:underline transition-colors"
                >
                  <span className="font-bold text-white">{stats.follower_count}</span>
                  <span className="text-gray-400 ml-1">팔로워</span>
                </button>
              </div>
            )}

            {/* 프로필 이동 */}
            <button
              className="text-white text-sm cursor-pointer hover:underline"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/profile/${user.user_id}`);
              }}
            >
              @ {user.name}
            </button>
              <div className="absolute right-0 mt-2 bg-gray-800 text-white rounded shadow-lg">
    <button
      className="block px-4 py-2 hover:bg-gray-700 w-full text-left"
      onClick={() => navigate('/change-password')}
    >
      비밀번호 변경
    </button>
  </div>
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
