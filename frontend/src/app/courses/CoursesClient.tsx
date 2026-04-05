'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import type { Course } from '@/types';
import { getCourses } from '@/lib/api/courses';
import CourseCard from '@/components/course/CourseCard';
import CategoryFilter from '@/components/course/CategoryFilter';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function CoursesClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const category = searchParams.get('category') || 'all';
  const keyword = searchParams.get('keyword') || '';
  const [searchInput, setSearchInput] = useState(keyword);

  const updateParams = useCallback(
    (newCategory: string, newKeyword: string) => {
      const params = new URLSearchParams();
      if (newCategory && newCategory !== 'all') params.set('category', newCategory);
      if (newKeyword) params.set('keyword', newKeyword);
      router.push(`/courses?${params.toString()}`);
    },
    [router]
  );

  useEffect(() => {
    setLoading(true);
    setError(null);
    const params: { category?: string; keyword?: string } = {};
    if (category !== 'all') params.category = category;
    if (keyword) params.keyword = keyword;

    getCourses(params)
      .then(setCourses)
      .catch(() => setError('강의를 불러오는 데 실패했습니다.'))
      .finally(() => setLoading(false));
  }, [category, keyword]);

  const handleCategoryChange = (cat: string) => {
    updateParams(cat, keyword);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateParams(category, searchInput);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#222222] mb-1">강의 목록</h1>
        <p className="text-[#717171] text-sm">원하는 기술을 배울 수 있는 다양한 강의를 찾아보세요</p>
      </div>

      {/* Search bar */}
      <form onSubmit={handleSearchSubmit} className="mb-6">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#717171]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="강의명 또는 강사 이름 검색..."
              className="w-full pl-10 pr-4 py-3 rounded-full border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#222222] focus:border-transparent transition shadow-sm"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 bg-[#222222] text-white font-medium rounded-full hover:bg-[#3B82F6] transition-colors text-sm"
          >
            검색
          </button>
        </div>
      </form>

      {/* Category filter */}
      <div className="mb-8">
        <CategoryFilter selected={category} onChange={handleCategoryChange} />
      </div>

      {/* Results count */}
      {!loading && !error && (
        <p className="text-sm text-[#717171] mb-5">
          총 <span className="font-semibold text-[#222222]">{courses.length}</span>개의 강의
          {keyword && (
            <span>
              {' '}&mdash; &quot;<span className="font-semibold text-[#3B82F6]">{keyword}</span>&quot; 검색 결과
            </span>
          )}
        </p>
      )}

      {/* Content */}
      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <div className="text-center py-20">
          <p className="text-[#222222] text-lg font-medium">{error}</p>
          <p className="text-[#717171] text-sm mt-2">백엔드 서버가 실행 중인지 확인하세요.</p>
        </div>
      ) : courses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-[#717171]">
          <p className="text-lg font-medium mb-2">검색 결과가 없습니다.</p>
          <button
            onClick={() => { setSearchInput(''); updateParams('all', ''); }}
            className="text-sm text-[#3B82F6] hover:underline"
          >
            필터 초기화
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </div>
  );
}
