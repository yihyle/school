'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { Course } from '@/types';
import { getTrendingCourses } from '@/lib/api/courses';
import CourseCard from '@/components/course/CourseCard';
import LoadingSpinner from '@/components/common/LoadingSpinner';

const FEATURES = [
  {
    tag: '학습',
    title: '내 속도에 맞춘\n진도 추적',
    desc: '강의를 어디까지 들었는지, 어디서 멈췄는지 자동으로 기억합니다. 다음에 이어 보기만 누르면 됩니다.',
    accent: 'from-blue-500 to-blue-600',
  },
  {
    tag: '구조',
    title: '섹션과 강의로\n체계적 커리큘럼',
    desc: '강의는 섹션 단위로 묶여 있어 한눈에 흐름을 파악할 수 있습니다. 필요한 부분만 골라 보세요.',
    accent: 'from-violet-500 to-purple-600',
  },
  {
    tag: '소통',
    title: '강의마다\n실시간 댓글',
    desc: '같은 강의를 듣는 사람들과 질문하고 답하세요. 답글, 좋아요, 작성자 식별까지 지원합니다.',
    accent: 'from-pink-500 to-rose-500',
  },
];

const STATS = [
  { value: '7+', label: '카테고리' },
  { value: '100%', label: '무료 강의' },
  { value: '∞', label: '재수강 가능' },
];

export default function HomePage() {
  const [trending, setTrending] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTrendingCourses()
      .then(setTrending)
      .catch(() => setTrending([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-white text-[#191F28]">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50/60 to-transparent pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-32">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 text-blue-600 text-xs font-semibold mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              누구나, 무료로 시작하는 학습
            </span>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-6">
              배우는 즐거움,
              <br />
              <span className="text-blue-600">가장 단순하게.</span>
            </h1>
            <p className="text-lg sm:text-xl text-[#4E5968] leading-relaxed mb-10 max-w-2xl">
              복잡한 절차도, 비싼 결제도 없습니다.
              <br />
              지금 바로 강의를 골라 학습을 시작하세요.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/courses"
                className="inline-flex items-center gap-2 px-6 py-4 bg-[#191F28] text-white text-base font-semibold rounded-2xl hover:bg-blue-600 transition-colors"
              >
                강의 둘러보기
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              <Link
                href="/signup"
                className="inline-flex items-center px-6 py-4 bg-[#F2F4F6] text-[#191F28] text-base font-semibold rounded-2xl hover:bg-[#E5E8EB] transition-colors"
              >
                무료로 가입하기
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-3 gap-6 max-w-2xl">
            {STATS.map((s) => (
              <div key={s.label}>
                <div className="text-3xl sm:text-4xl font-bold text-[#191F28]">{s.value}</div>
                <div className="text-sm text-[#8B95A1] mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
        <div className="mb-20">
          <p className="text-sm font-semibold text-blue-600 mb-3">왜 LearnHub인가요</p>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight">
            학습에 필요한 것만
            <br />
            <span className="text-[#8B95A1]">담았습니다.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="group relative p-8 rounded-3xl bg-[#F9FAFB] hover:bg-white hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] transition-all duration-300 border border-transparent hover:border-[#F2F4F6]"
            >
              <div className={`inline-block w-12 h-12 rounded-2xl bg-gradient-to-br ${f.accent} mb-6`} />
              <p className="text-xs font-semibold text-[#8B95A1] mb-2 tracking-wide">{f.tag.toUpperCase()}</p>
              <h3 className="text-2xl font-bold mb-4 whitespace-pre-line leading-tight">{f.title}</h3>
              <p className="text-[#4E5968] leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-[#F9FAFB] py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold text-blue-600 mb-3">시작하는 방법</p>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight mb-20">
            3단계면 충분합니다.
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { n: '01', t: '회원가입', d: '이메일만 있으면 30초 안에 시작할 수 있어요.' },
              { n: '02', t: '강의 선택', d: '백엔드부터 AI까지, 관심 분야에서 골라보세요.' },
              { n: '03', t: '학습 시작', d: '내 속도에 맞춰 들으면 진도가 자동으로 저장됩니다.' },
            ].map((step) => (
              <div key={step.n}>
                <div className="text-6xl font-bold text-blue-600 mb-4">{step.n}</div>
                <h3 className="text-2xl font-bold mb-3">{step.t}</h3>
                <p className="text-[#4E5968] leading-relaxed">{step.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trending courses */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="text-sm font-semibold text-blue-600 mb-3">지금 인기 있는</p>
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight">
              많이 듣는 강의
            </h2>
          </div>
          <Link
            href="/courses"
            className="hidden sm:inline-flex items-center gap-1 text-base font-semibold text-[#4E5968] hover:text-blue-600 transition-colors"
          >
            전체 보기
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : trending.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {trending.slice(0, 8).map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-[#8B95A1]">
            <p>강의를 불러올 수 없습니다.</p>
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="bg-[#191F28] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 text-center">
          <h2 className="text-4xl sm:text-6xl font-bold tracking-tight leading-tight mb-6">
            오늘부터,
            <br />
            <span className="text-blue-400">새로운 나를 만나보세요.</span>
          </h2>
          <p className="text-lg text-[#B0B8C1] mb-12 max-w-xl mx-auto">
            지금 가입하면 모든 강의를 무료로 수강할 수 있습니다.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-8 py-5 bg-white text-[#191F28] text-base font-semibold rounded-2xl hover:bg-blue-50 transition-colors"
          >
            무료로 시작하기
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </section>
    </div>
  );
}
