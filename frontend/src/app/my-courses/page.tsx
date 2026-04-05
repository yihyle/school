'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { Enrollment } from '@/types';
import { getMyCourses, cancelEnrollment } from '@/lib/api/enrollments';
import { getCourseProgress } from '@/lib/api/courses';
import ProgressBar from '@/components/common/ProgressBar';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { getCategoryLabel, stringToColor } from '@/lib/utils';
import { useAuthStore } from '@/stores/useAuthStore';

interface EnrollmentWithProgress extends Enrollment {
  progressPercent: number;
}

export default function MyCoursesPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [enrollments, setEnrollments] = useState<EnrollmentWithProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) { router.replace('/login'); return; }
    const fetchData = async () => {
      try {
        const myCoursesData = await getMyCourses(user.id);
        const withProgress = await Promise.all(
          myCoursesData.map(async (enrollment) => {
            try {
              const progress = await getCourseProgress(enrollment.courseId, user.id);
              return { ...enrollment, progressPercent: progress.progressRate ?? 0 };
            } catch {
              return { ...enrollment, progressPercent: enrollment.progressRate ?? 0 };
            }
          })
        );
        setEnrollments(withProgress);
      } catch {
        setError('수강 중인 강의를 불러오는 데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user, router]);

  const handleCancel = async (enrollmentId: number) => {
    if (!confirm('수강을 취소하시겠습니까?')) return;
    try {
      await cancelEnrollment(enrollmentId);
      setEnrollments((prev) => prev.filter((e) => e.id !== enrollmentId));
    } catch {
      alert('수강 취소에 실패했습니다.');
    }
  };

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#222222] mb-1">내 강의실</h1>
        <p className="text-[#717171] text-sm">수강 중인 강의를 관리하고 학습을 이어가세요</p>
      </div>

      {error ? (
        <div className="text-center py-20">
          <p className="text-[#222222] text-lg">{error}</p>
        </div>
      ) : enrollments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-[#717171]">
          <p className="text-xl font-medium mb-2">수강 중인 강의가 없습니다</p>
          <p className="text-sm mb-6">관심 있는 강의를 찾아 수강 신청해 보세요</p>
          <Link href="/courses" className="px-6 py-3 bg-[#222222] text-white font-semibold rounded-xl hover:bg-[#3B82F6] transition-colors">
            강의 탐색하기
          </Link>
        </div>
      ) : (
        <>
          <p className="text-sm text-[#717171] mb-6">
            총 <span className="font-semibold text-[#222222]">{enrollments.length}</span>개의 강의 수강 중
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {enrollments.map((enrollment) => {
              const course = enrollment.course;
              if (!course) return null;
              const gradient = stringToColor(course.title);

              return (
                <div key={enrollment.id} className="bg-white rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-200 group">
                  <div className={`relative aspect-video bg-gradient-to-br ${gradient} rounded-2xl overflow-hidden`}>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-3xl font-bold text-white/60">{course.title.charAt(0)}</span>
                    </div>
                    {enrollment.progressPercent === 100 && (
                      <div className="absolute top-3 right-3 bg-[#222222] text-white text-xs font-semibold px-2.5 py-0.5 rounded-full">완료</div>
                    )}
                  </div>
                  <div className="pt-3 pb-1 px-1">
                    <p className="text-xs font-medium text-[#717171] mb-1">{getCategoryLabel(course.category)}</p>
                    <h3 className="font-semibold text-[#222222] text-sm leading-snug mb-1 line-clamp-2">{course.title}</h3>
                    <p className="text-xs text-[#717171] mb-3">{course.instructorNickname}</p>
                    <ProgressBar percent={enrollment.progressPercent} showLabel height="sm" />
                    <div className="flex gap-2 mt-3">
                      <Link
                        href={`/courses/${course.id}`}
                        className="flex-1 py-2 bg-[#222222] text-white text-sm font-medium rounded-xl text-center hover:bg-[#3B82F6] transition-colors"
                      >
                        이어서 학습
                      </Link>
                      <button
                        onClick={() => handleCancel(enrollment.id)}
                        className="px-3 py-2 text-[#717171] text-sm rounded-xl hover:bg-[#F7F7F7] transition-colors"
                        title="수강 취소"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
