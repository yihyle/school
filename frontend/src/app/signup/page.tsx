'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signup as signupApi } from '@/lib/api/auth';
import { useAuthStore } from '@/stores/useAuthStore';

export default function SignupPage() {
  const router = useRouter();
  const { isLoggedIn, login } = useAuthStore();
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isLoggedIn) router.replace('/');
  }, [isLoggedIn, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== passwordConfirm) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }
    setLoading(true);
    try {
      const user = await signupApi(email, password, nickname);
      login(user);
      router.replace('/');
    } catch {
      setError('회원가입에 실패했습니다. 이미 사용 중인 이메일일 수 있습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg border border-[#EBEBEB] overflow-hidden">
          {/* Header */}
          <div className="border-b border-[#EBEBEB] px-6 py-4 text-center">
            <h1 className="text-base font-semibold text-[#222222]">회원가입</h1>
          </div>

          <div className="p-6">
            <p className="text-xl font-semibold text-[#222222] mb-6">LearnHub 계정 만들기</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                required
                placeholder="닉네임"
                className="w-full px-4 py-3.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#222222] focus:border-transparent transition placeholder:text-[#717171]"
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="이메일"
                className="w-full px-4 py-3.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#222222] focus:border-transparent transition placeholder:text-[#717171]"
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="비밀번호"
                className="w-full px-4 py-3.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#222222] focus:border-transparent transition placeholder:text-[#717171]"
              />
              <input
                type="password"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                required
                placeholder="비밀번호 확인"
                className="w-full px-4 py-3.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#222222] focus:border-transparent transition placeholder:text-[#717171]"
              />

              {error && (
                <p className="text-sm text-red-500 text-center">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-[#222222] text-white font-semibold rounded-xl hover:bg-[#3B82F6] transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? '처리 중...' : '가입하기'}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-[#EBEBEB]" />
              <span className="text-xs text-[#717171]">또는</span>
              <div className="flex-1 h-px bg-[#EBEBEB]" />
            </div>

            <Link
              href="/login"
              className="block w-full py-3.5 text-center border border-[#222222] text-[#222222] font-semibold rounded-xl hover:bg-[#F7F7F7] transition-colors text-sm"
            >
              이미 계정이 있으신가요? 로그인
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
