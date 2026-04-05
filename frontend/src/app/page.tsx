'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { Course } from '@/types';
import { getTrendingCourses } from '@/lib/api/courses';
import CourseCard from '@/components/course/CourseCard';
import LoadingSpinner from '@/components/common/LoadingSpinner';

const CATEGORIES = [
  { value: 'BACKEND', label: '백엔드', desc: 'Spring, Node.js 등' },
  { value: 'FRONTEND', label: '프론트엔드', desc: 'React, Vue 등' },
  { value: 'MOBILE', label: '모바일', desc: 'Flutter, Swift 등' },
  { value: 'AI_ML', label: 'AI/ML', desc: 'PyTorch, TensorFlow 등' },
  { value: 'DATA_SCIENCE', label: '데이터 사이언스', desc: 'Pandas, SQL 등' },
  { value: 'DEVOPS', label: 'DevOps', desc: 'Docker, K8s 등' },
  { value: 'CS', label: 'CS/기타', desc: '알고리즘, 자료구조 등' },
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
    <div className="bg-white">
      {/* Title section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-[#222222] mb-2">
          어떤 기술을 배워볼까요?
        </h1>
        <p className="text-[#717171] text-lg">
          실무 중심 강의로 빠르게 성장하세요
        </p>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.value}
              href={`/courses?category=${cat.value}`}
              className="group p-4 rounded-2xl bg-[#F7F7F7] hover:bg-[#EBEBEB] transition-colors duration-200"
            >
              <h3 className="font-semibold text-[#222222] text-sm mb-0.5 group-hover:text-[#3B82F6] transition-colors">
                {cat.label}
              </h3>
              <p className="text-xs text-[#717171]">{cat.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-[#EBEBEB]" />

      {/* Trending courses */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-[#222222]">인기 강의</h2>
          <Link href="/courses" className="text-sm font-medium text-[#717171] hover:text-[#222222] transition-colors">
            전체 보기 →
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
          <div className="text-center py-16 text-[#717171]">
            <p className="text-lg">강의를 불러오는 중 문제가 발생했습니다.</p>
            <p className="text-sm mt-1">백엔드 서버가 실행 중인지 확인하세요.</p>
          </div>
        )}
      </section>

      {/* Divider */}
      <div className="border-t border-[#EBEBEB]" />

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h2 className="text-2xl font-bold text-[#222222] mb-3">지금 바로 시작하세요</h2>
        <p className="text-[#717171] mb-8">
          나에게 맞는 강의를 찾고, 커리어를 발전시키세요.
        </p>
        <Link
          href="/courses"
          className="inline-block px-8 py-3 bg-[#222222] text-white font-semibold rounded-xl hover:bg-[#3B82F6] transition-colors duration-200"
        >
          강의 탐색하기
        </Link>
      </section>
    </div>
  );
}
