'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { CourseDetail, Enrollment } from '@/types';
import { getCourseDetail } from '@/lib/api/courses';
import { enrollCourse, getMyCourses } from '@/lib/api/enrollments';
import SectionAccordion from '@/components/curriculum/SectionAccordion';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { formatPrice, getLevelColor, getLevelLabel, getCategoryLabel, formatTotalDuration, stringToColor } from '@/lib/utils';
import { useAuthStore } from '@/stores/useAuthStore';

export default function CourseDetailPage(props: PageProps<'/courses/[courseId]'>) {
  const router = useRouter();
  const { user } = useAuthStore();
  const [courseId, setCourseId] = useState<number | null>(null);
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    props.params.then(({ courseId: id }) => {
      setCourseId(Number(id));
    });
  }, [props.params]);

  useEffect(() => {
    if (courseId === null) return;
    const fetchData = async () => {
      try {
        const [courseData, myCoursesData] = await Promise.all([
          getCourseDetail(courseId),
          getMyCourses(user?.id ?? 1),
        ]);
        setCourse(courseData);
        const found = myCoursesData.find((e) => e.courseId === courseId);
        setEnrollment(found ?? null);
      } catch {
        setError('강의 정보를 불러오는 데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [courseId, user?.id]);

  const handleEnroll = async () => {
    if (!courseId) return;
    if (!user) { router.push('/login'); return; }
    setEnrolling(true);
    try {
      const newEnrollment = await enrollCourse(user.id, courseId);
      setEnrollment(newEnrollment);
    } catch {
      alert('수강 신청에 실패했습니다. 다시 시도해 주세요.');
    } finally {
      setEnrolling(false);
    }
  };

  const handleContinue = () => {
    if (!courseId || !course) return;
    const firstLecture = course.sections[0]?.lectures[0];
    if (firstLecture) router.push(`/learn/${courseId}/${firstLecture.id}`);
  };

  if (loading) return <LoadingSpinner fullScreen />;

  if (error || !course) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <p className="text-[#717171] text-lg">{error ?? '강의를 찾을 수 없습니다.'}</p>
      </div>
    );
  }

  const totalLectures = course.sections.reduce((sum, s) => sum + s.lectures.length, 0);
  const totalSeconds = course.sections.reduce(
    (sum, s) => sum + s.lectures.reduce((ls, l) => ls + l.duration, 0), 0
  );
  const gradient = stringToColor(course.title);

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left: course info */}
          <div className="lg:col-span-2">
            {/* Thumbnail */}
            <div className={`relative aspect-video bg-gradient-to-br ${gradient} rounded-2xl overflow-hidden mb-6`}>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-5xl font-bold text-white/60">{course.title.charAt(0)}</span>
              </div>
              <div className="absolute top-4 left-4">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getLevelColor(course.level)}`}>
                  {getLevelLabel(course.level)}
                </span>
              </div>
            </div>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-3 text-sm text-[#717171] mb-4">
              <span className="px-3 py-1 bg-[#F7F7F7] rounded-full">{getCategoryLabel(course.category)}</span>
              <span>{totalLectures}강</span>
              <span>·</span>
              <span>{formatTotalDuration(totalSeconds)}</span>
              {course.enrollmentCount !== undefined && (
                <>
                  <span>·</span>
                  <span>수강생 {course.enrollmentCount.toLocaleString()}명</span>
                </>
              )}
            </div>

            <h1 className="text-2xl md:text-3xl font-bold text-[#222222] mb-3">{course.title}</h1>
            <p className="text-[#717171] leading-relaxed mb-8">{course.description}</p>

            {/* Instructor */}
            <div className="flex items-center gap-3 mb-10 p-4 bg-[#F7F7F7] rounded-2xl">
              <div className="w-11 h-11 rounded-full bg-[#222222] flex items-center justify-center flex-shrink-0">
                <span className="text-white font-semibold text-sm">
                  {course.instructorNickname?.charAt(0) ?? '?'}
                </span>
              </div>
              <div>
                <p className="font-semibold text-[#222222] text-sm">{course.instructorNickname}</p>
                <p className="text-xs text-[#717171]">전문 강사</p>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-[#EBEBEB] mb-8" />

            {/* Curriculum */}
            <h2 className="text-xl font-bold text-[#222222] mb-2">커리큘럼</h2>
            <p className="text-sm text-[#717171] mb-5">
              총 {course.sections.length}섹션 · {totalLectures}강 · {formatTotalDuration(totalSeconds)}
            </p>
            <div className="space-y-3">
              {course.sections.map((section, idx) => (
                <SectionAccordion
                  key={section.id}
                  section={section}
                  courseId={course.id}
                  isClickable={!!enrollment}
                  defaultOpen={idx === 0}
                />
              ))}
            </div>
          </div>

          {/* Right: sticky enrollment card */}
          <div className="lg:col-span-1">
            <div className="sticky top-28">
              <div className="rounded-2xl border border-[#EBEBEB] overflow-hidden shadow-sm">
                <div className={`aspect-video bg-gradient-to-br ${gradient} relative`}>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-3xl font-bold text-white/60">{course.title.charAt(0)}</span>
                  </div>
                </div>
                <div className="p-5">
                  <p className="text-2xl font-bold text-[#222222] mb-5">{formatPrice(course.price)}</p>
                  {enrollment ? (
                    <button
                      onClick={handleContinue}
                      className="w-full py-3.5 bg-[#222222] text-white font-semibold rounded-xl hover:bg-[#3B82F6] transition-colors duration-200"
                    >
                      학습 계속하기
                    </button>
                  ) : (
                    <button
                      onClick={handleEnroll}
                      disabled={enrolling}
                      className="w-full py-3.5 bg-[#3B82F6] text-white font-semibold rounded-xl hover:bg-blue-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {enrolling ? '처리 중...' : '수강 신청하기'}
                    </button>
                  )}
                  <ul className="mt-5 space-y-2.5 text-sm text-[#717171]">
                    <li className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-[#3B82F6]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      평생 수강 가능
                    </li>
                    <li className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-[#3B82F6]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      {totalLectures}개 강의 · {formatTotalDuration(totalSeconds)}
                    </li>
                    <li className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-[#3B82F6]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      모바일 · 데스크탑 수강
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
