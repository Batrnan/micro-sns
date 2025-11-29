import { useState } from "react";
import { changePassword } from "@/lib/api";
import { showError, showSuccess } from "@/lib/utils";

export default function ChangePasswordPage() {
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [loading, setLoading] = useState(false);

  // 로그인 시 저장된 사용자 정보 가져오기
  const user = JSON.parse(localStorage.getItem("user") || "null");

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white text-lg">
        로그인 정보가 없습니다. 다시 로그인해주세요.
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPw !== confirmPw) {
      showError("새 비밀번호가 일치하지 않습니다.");
      return;
    }

    setLoading(true);
    try {
      // ✔ user.user_id 필수!
      await changePassword(user.user_id, currentPw, newPw);

      showSuccess("비밀번호가 성공적으로 변경되었습니다!");

      setCurrentPw("");
      setNewPw("");
      setConfirmPw("");
    } catch (err) {
      showError(err, "비밀번호 변경 실패");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
      <div className="w-full max-w-md bg-gray-800 p-8 rounded-2xl shadow-lg">

        <h2 className="text-2xl font-bold text-white text-center mb-6">
          비밀번호 변경
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* 기존 비밀번호 */}
          <div>
            <label className="text-sm text-gray-300 mb-1 block">현재 비밀번호</label>
            <input
              type="password"
              value={currentPw}
              onChange={(e) => setCurrentPw(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg 
                         focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="현재 비밀번호"
              required
            />
          </div>

          {/* 새 비밀번호 */}
          <div>
            <label className="text-sm text-gray-300 mb-1 block">새 비밀번호</label>
            <input
              type="password"
              value={newPw}
              onChange={(e) => setNewPw(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg
                         focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="새 비밀번호"
              required
            />
          </div>

          {/* 새 비밀번호 확인 */}
          <div>
            <label className="text-sm text-gray-300 mb-1 block">새 비밀번호 확인</label>
            <input
              type="password"
              value={confirmPw}
              onChange={(e) => setConfirmPw(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg
                         focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="새 비밀번호 확인"
              required
            />
          </div>

          {/* 버튼 */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg font-semibold text-white 
                       bg-blue-600 hover:bg-blue-700 
                       disabled:opacity-50 disabled:cursor-not-allowed 
                       transition-all mt-4"
          >
            {loading ? "변경 중..." : "비밀번호 변경하기"}
          </button>
        </form>
      </div>
    </div>
  );
}
