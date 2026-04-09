import Link from 'next/link';
import Logo from '@/components/common/Logo';

export default function Footer() {
  return (
    <footer className="bg-[#F7F7F7] border-t border-[#EBEBEB] mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-sm font-semibold text-[#222222] mb-3">LearnHub 소개</h3>
            <ul className="space-y-2 text-sm text-[#717171]">
              <li><Link href="/" className="hover:text-[#222222] transition-colors">서비스 소개</Link></li>
              <li><Link href="/courses" className="hover:text-[#222222] transition-colors">강의 둘러보기</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[#222222] mb-3">카테고리</h3>
            <ul className="space-y-2 text-sm text-[#717171]">
              <li><Link href="/courses?category=BACKEND" className="hover:text-[#222222] transition-colors">백엔드</Link></li>
              <li><Link href="/courses?category=FRONTEND" className="hover:text-[#222222] transition-colors">프론트엔드</Link></li>
              <li><Link href="/courses?category=MOBILE" className="hover:text-[#222222] transition-colors">모바일</Link></li>
              <li><Link href="/courses?category=AI_ML" className="hover:text-[#222222] transition-colors">AI/ML</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[#222222] mb-3">학습</h3>
            <ul className="space-y-2 text-sm text-[#717171]">
              <li><Link href="/my-courses" className="hover:text-[#222222] transition-colors">내 강의실</Link></li>
              <li><Link href="/dashboard" className="hover:text-[#222222] transition-colors">대시보드</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[#222222] mb-3">지원</h3>
            <ul className="space-y-2 text-sm text-[#717171]">
              <li><span className="cursor-default">이용약관</span></li>
              <li><span className="cursor-default">개인정보처리방침</span></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-[#EBEBEB] pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <Logo size={22} textClassName="text-sm font-bold tracking-tight text-[#191F28]" />
          <p className="text-xs text-[#717171]">© 2026 LearnHub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
