'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { UserDashboard, Enrollment } from '@/types';
import { getUserDashboard } from '@/lib/api/users';
import { getMyCourses } from '@/lib/api/enrollments';
import { getCourseProgress } from '@/lib/api/courses';
import ProgressBar from '@/components/common/ProgressBar';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { useAuthStore } from '@/stores/useAuthStore';

interface EnrollmentWithProgress extends Enrollment {
  progressPercent: number;
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [dashboard, setDashboard] = useState<UserDashboard | null>(null);
  const [enrollments, setEnrollments] = useState<EnrollmentWithProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashboardData, myCoursesData] = await Promise.all([
          getUserDashboard(user?.id ?? 1),
          getMyCourses(user?.id ?? 1),
        ]);
        setDashboard(dashboardData);
        const withProgress = await Promise.all(
          myCoursesData.slice(0, 6).map(async (enrollment) => {
            try {
              const progress = await getCourseProgress(enrollment.courseId, user?.id ?? 1);
              return { ...enrollment, progressPercent: progress.progressRate ?? 0 };
            } catch {
              return { ...enrollment, progressPercent: enrollment.progressRate ?? 0 };
            }
          })
        );
        setEnrollments(withProgress);
      } catch {
        setError('대시보드 데이터를 불러오는 데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user?.id]);

  if (loading) return <LoadingSpinner fullScreen />;

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <p className="text-[#222222] text-lg mb-2">{error}</p>
          <p className="text-[#717171] text-sm">백엔드 서버가 실행 중인지 확인하세요.</p>
        </div>
      </div>
    );
  }

  const stats = [
    { label: '전체 강의', value: dashboard?.totalEnrolledCourses ?? 0 },
    { label: '완료한 강의', value: dashboard?.completedCourses ?? 0 },
    { label: '학습 중', value: dashboard?.inProgressCourses ?? 0 },
    { label: '평균 진도율', value: `${Math.round(dashboard?.overallProgressRate ?? 0)}%` },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#222222] mb-1">대시보드</h1>
        <p className="text-[#717171] text-sm">학습 현황을 한눈에 확인하세요</p>
      </div>

      {/* Profile */}
      <div className="flex items-center gap-4 mb-8 p-5 bg-[#F7F7F7] rounded-2xl">
        <div className="w-14 h-14 rounded-full bg-[#222222] flex items-center justify-center flex-shrink-0">
          <span className="text-xl font-bold text-white">
            {(dashboard?.nickname ?? user?.nickname ?? '?').charAt(0)}
          </span>
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-bold text-[#222222]">{dashboard?.nickname ?? user?.nickname ?? '사용자'}</h2>
          <p className="text-sm text-[#717171]">학습자</p>
        </div>
        <Link href="/my-courses" className="px-4 py-2 bg-[#222222] text-white text-sm font-medium rounded-xl hover:bg-[#3B82F6] transition-colors">
          내 강의실
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {stats.map((stat) => (
          <div key={stat.label} className="p-5 bg-[#F7F7F7] rounded-2xl">
            <p className="text-2xl font-bold text-[#222222]">{stat.value}</p>
            <p className="text-sm text-[#717171] mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div className="border-t border-[#EBEBEB] mb-8" />

      {/* Progress overview */}
      {enrollments.length > 0 ? (
        <div>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-[#222222]">진행 중인 강의</h2>
            <Link href="/my-courses" className="text-sm font-medium text-[#717171] hover:text-[#222222] transition-colors">
              전체 보기 →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {enrollments.map((enrollment) => {
              const course = enrollment.course;
              if (!course) return null;
              return (
                <Link
                  key={enrollment.id}
                  href={`/courses/${course.id}`}
                  className="p-5 bg-[#F7F7F7] rounded-2xl hover:bg-[#EBEBEB] transition-colors group"
                >
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-[#222222] flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-sm">{course.title.charAt(0)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-[#222222] text-sm line-clamp-2 group-hover:text-[#3B82F6] transition-colors">{course.title}</h3>
                      <p className="text-xs text-[#717171] mt-0.5">{course.instructorNickname}</p>
                    </div>
                  </div>
                  <ProgressBar percent={enrollment.progressPercent} showLabel height="sm" />
                </Link>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-[#717171] mb-4">아직 수강 중인 강의가 없습니다.</p>
          <Link href="/courses" className="inline-block px-6 py-2.5 bg-[#222222] text-white font-medium rounded-xl hover:bg-[#3B82F6] transition-colors text-sm">
            강의 탐색하기
          </Link>
        </div>
      )}
    </div>
  );
}
