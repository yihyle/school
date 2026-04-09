'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '@/stores/useAuthStore';
import Logo from '@/components/common/Logo';

const CATEGORIES = [
  { value: 'all', label: '전체' },
  { value: 'BACKEND', label: '백엔드' },
  { value: 'FRONTEND', label: '프론트엔드' },
  { value: 'MOBILE', label: '모바일' },
  { value: 'AI_ML', label: 'AI/ML' },
  { value: 'DATA_SCIENCE', label: '데이터 사이언스' },
  { value: 'DEVOPS', label: 'DevOps' },
  { value: 'CS', label: 'CS/기타' },
];

export default function Header() {
  const router = useRouter();
  const { isLoggedIn, user, logout } = useAuthStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    router.push('/');
  };

  const handleSearchClick = () => {
    router.push('/courses');
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-[#EBEBEB]">
      {/* Top bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Logo size={30} />

          {/* Search pill — center */}
          <button
            onClick={handleSearchClick}
            className="hidden md:flex flex-1 max-w-md items-center gap-3 px-4 py-2.5 rounded-full border border-gray-300 shadow-sm bg-white hover:shadow-md transition-shadow duration-200 text-left"
            aria-label="강의 검색"
          >
            <svg className="w-4 h-4 text-[#717171] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span className="text-sm text-[#717171] flex-1">배우고 싶은 기술을 검색하세요</span>
          </button>

          {/* Right: auth */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Mobile search icon */}
            <button
              className="md:hidden p-2 rounded-full hover:bg-gray-100 transition-colors"
              onClick={handleSearchClick}
              aria-label="검색"
            >
              <svg className="w-5 h-5 text-[#222222]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            {isLoggedIn && user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-300 hover:shadow-md transition-shadow duration-200"
                  aria-label="사용자 메뉴"
                >
                  <svg className="w-4 h-4 text-[#717171]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                  <div className="w-7 h-7 rounded-full bg-[#222222] flex items-center justify-center">
                    <span className="text-white text-xs font-semibold">
                      {user.nickname.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 overflow-hidden">
                    <div className="px-4 py-2.5 border-b border-gray-100">
                      <p className="text-sm font-semibold text-[#222222]">{user.nickname}</p>
                      <p className="text-xs text-[#717171] mt-0.5">학습자</p>
                    </div>
                    <Link
                      href="/my-courses"
                      onClick={() => setDropdownOpen(false)}
                      className="block px-4 py-2.5 text-sm text-[#222222] hover:bg-gray-50 transition-colors"
                    >
                      내 강의실
                    </Link>
                    <Link
                      href="/dashboard"
                      onClick={() => setDropdownOpen(false)}
                      className="block px-4 py-2.5 text-sm text-[#222222] hover:bg-gray-50 transition-colors"
                    >
                      대시보드
                    </Link>
                    <div className="border-t border-gray-100 mt-1 pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2.5 text-sm text-[#717171] hover:bg-gray-50 transition-colors"
                      >
                        로그아웃
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="hidden sm:block text-sm font-medium text-[#222222] hover:text-[#3B82F6] transition-colors px-3 py-1.5"
                >
                  로그인
                </Link>
                <Link
                  href="/signup"
                  className="text-sm font-semibold text-white bg-[#222222] rounded-full px-4 py-2 hover:bg-[#3B82F6] transition-colors duration-200"
                >
                  회원가입
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-full hover:bg-gray-100 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="메뉴"
            >
              <svg className="w-5 h-5 text-[#222222]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Category strip */}
      <div className="border-t border-[#EBEBEB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-0 overflow-x-auto scrollbar-hide">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.value}
                href={cat.value === 'all' ? '/courses' : `/courses?category=${cat.value}`}
                className="flex-shrink-0 px-4 py-3 text-sm font-medium text-[#717171] hover:text-[#222222] transition-colors duration-150 whitespace-nowrap border-b-2 border-transparent hover:border-[#222222]"
              >
                {cat.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-[#EBEBEB] py-3">
          <div className="max-w-7xl mx-auto px-4 space-y-1">
            <Link href="/" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2.5 text-sm font-medium text-[#222222] hover:bg-gray-50 rounded-xl">홈</Link>
            <Link href="/courses" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2.5 text-sm font-medium text-[#222222] hover:bg-gray-50 rounded-xl">강의</Link>
            <Link href="/my-courses" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2.5 text-sm font-medium text-[#222222] hover:bg-gray-50 rounded-xl">내 강의실</Link>
            <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2.5 text-sm font-medium text-[#222222] hover:bg-gray-50 rounded-xl">대시보드</Link>
            {!isLoggedIn && (
              <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2.5 text-sm font-medium text-[#3B82F6] hover:bg-blue-50 rounded-xl">로그인</Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
