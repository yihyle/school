'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { CourseDetail, Lecture } from '@/types';
import { getCourseDetail, getCourseProgress } from '@/lib/api/courses';
import { getLecture } from '@/lib/api/lectures';
import VideoPlayer from '@/components/learning/VideoPlayer';
import CourseSidebar from '@/components/learning/CourseSidebar';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { usePlayerStore } from '@/stores/usePlayerStore';
import { useAuthStore } from '@/stores/useAuthStore';

export default function LearnPage(props: PageProps<'/learn/[courseId]/[lectureId]'>) {
  const router = useRouter();
  const { user } = useAuthStore();

  const [courseId, setCourseId] = useState<number | null>(null);
  const [lectureId, setLectureId] = useState<number | null>(null);

  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [lecture, setLecture] = useState<Lecture | null>(null);
  const [progressPercent, setProgressPercent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { completedLectureIds, markLectureCompleted, setSections, setCurrentLecture } =
    usePlayerStore();

  // Resolve params
  useEffect(() => {
    props.params.then(({ courseId: cid, lectureId: lid }) => {
      setCourseId(Number(cid));
      setLectureId(Number(lid));
    });
  }, [props.params]);

  // Load course + lecture data
  useEffect(() => {
    if (courseId === null || lectureId === null) return;
    setLoading(true);
    setError(null);

    Promise.all([
      getCourseDetail(courseId),
      getLecture(lectureId),
      getCourseProgress(courseId, user?.id ?? 1).catch(() => null),
    ])
      .then(([courseData, lectureData, progressData]) => {
        setCourse(courseData);
        setLecture(lectureData);
        setSections(courseData.sections);
        setCurrentLecture(lectureData);
        if (progressData) setProgressPercent(progressData.progressRate ?? 0);
      })
      .catch(() => setError('강의를 불러오는 데 실패했습니다.'))
      .finally(() => setLoading(false));
  }, [courseId, lectureId, setSections, setCurrentLecture, markLectureCompleted]);

  const handleLectureComplete = useCallback(
    (completedId: number) => {
      markLectureCompleted(completedId);
      setProgressPercent((prev) => {
        if (!course) return prev;
        const total = course.sections.reduce((sum, s) => sum + s.lectures.length, 0);
        return total > 0 ? Math.round(((completedLectureIds.size + 1) / total) * 100) : prev;
      });
    },
    [course, completedLectureIds, markLectureCompleted]
  );

  const navigateToLecture = useCallback(
    (targetId: number) => {
      if (courseId !== null) router.push(`/learn/${courseId}/${targetId}`);
    },
    [courseId, router]
  );

  const getAdjacentLecture = useCallback(
    (direction: 'prev' | 'next'): number | null => {
      if (!course || lectureId === null) return null;
      const allLectures = course.sections.flatMap((s) => s.lectures);
      const idx = allLectures.findIndex((l) => l.id === lectureId);
      if (idx === -1) return null;
      if (direction === 'prev') return idx > 0 ? allLectures[idx - 1].id : null;
      return idx < allLectures.length - 1 ? allLectures[idx + 1].id : null;
    },
    [course, lectureId]
  );

  if (loading) return <LoadingSpinner fullScreen />;

  if (error || !course || !lecture) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-500 text-lg mb-3">{error ?? '강의를 찾을 수 없습니다.'}</p>
          <button
            onClick={() => router.back()}
            className="text-blue-500 hover:underline text-sm"
          >
            뒤로 가기
          </button>
        </div>
      </div>
    );
  }

  const prevId = getAdjacentLecture('prev');
  const nextId = getAdjacentLecture('next');

  return (
    <div className="flex h-[calc(100vh-64px)] bg-gray-900 overflow-hidden">
      {/* Main content */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Video */}
        <div className="flex-shrink-0">
          <VideoPlayer
            lecture={lecture}
            onLectureComplete={handleLectureComplete}
            onEnded={() => { if (nextId) navigateToLecture(nextId); }}
          />
        </div>

        {/* Lecture info + navigation */}
        <div className="flex-1 overflow-y-auto bg-white">
          <div className="max-w-4xl mx-auto px-4 py-5">
            {/* Nav buttons */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => prevId && navigateToLecture(prevId)}
                disabled={!prevId}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                이전 강의
              </button>

              <button
                className="lg:hidden px-3 py-2 text-sm text-blue-500 border border-blue-200 rounded-lg"
                onClick={() => setSidebarOpen(true)}
              >
                목차 보기
              </button>

              <button
                onClick={() => nextId && navigateToLecture(nextId)}
                disabled={!nextId}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                다음 강의
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            <h1 className="text-xl font-bold text-gray-900 mb-2">{lecture.title}</h1>
            <p className="text-sm text-gray-500">{course.title}</p>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex w-80 flex-shrink-0 flex-col">
        <CourseSidebar
          courseTitle={course.title}
          sections={course.sections}
          courseId={course.id}
          activeLectureId={lecture.id}
          completedLectureIds={completedLectureIds}
          progressPercent={progressPercent}
        />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative ml-auto w-80 h-full flex flex-col">
            <CourseSidebar
              courseTitle={course.title}
              sections={course.sections}
              courseId={course.id}
              activeLectureId={lecture.id}
              completedLectureIds={completedLectureIds}
              progressPercent={progressPercent}
            />
          </div>
        </div>
      )}
    </div>
  );
}
