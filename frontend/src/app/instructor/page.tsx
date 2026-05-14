'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/useAuthStore';
import type { InstructorCourse, CreateCourseRequest, Section } from '@/types';
import { getMyCourses, createCourse, deleteCourse, addSection, addLecture, uploadThumbnail } from '@/lib/api/instructor';
import { getCourseDetail } from '@/lib/api/courses';
import LoadingSpinner from '@/components/common/LoadingSpinner';

const CATEGORIES = ['BACKEND', 'FRONTEND', 'MOBILE', 'AI_ML', 'DATA_SCIENCE', 'DEVOPS', 'CS'];
const LEVELS = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'];
const LEVEL_LABEL: Record<string, string> = { BEGINNER: '입문', INTERMEDIATE: '중급', ADVANCED: '고급' };
const CAT_LABEL: Record<string, string> = {
  BACKEND: '백엔드', FRONTEND: '프론트엔드', MOBILE: '모바일',
  AI_ML: 'AI/ML', DATA_SCIENCE: '데이터 사이언스', DEVOPS: 'DevOps', CS: 'CS/기타',
};

const empty: CreateCourseRequest = {
  title: '', description: '', thumbnailUrl: '', category: 'BACKEND', level: 'BEGINNER', price: 0, isPublished: false,
};

export default function InstructorPage() {
  const router = useRouter();
  const { user, isLoggedIn } = useAuthStore();

  const [courses, setCourses] = useState<InstructorCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<CreateCourseRequest>(empty);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [thumbnailUploading, setThumbnailUploading] = useState(false);

  // 섹션 펼치기
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [sectionsMap, setSectionsMap] = useState<Record<number, Section[]>>({});
  const [sectionsLoading, setSectionsLoading] = useState(false);

  // 모달
  const [sectionModal, setSectionModal] = useState<{ courseId: number; title: string } | null>(null);
  const [lectureModal, setLectureModal] = useState<{
    sectionId: number; courseId: number; title: string; videoUrl: string; duration: string;
  } | null>(null);

  useEffect(() => {
    if (!isLoggedIn) { router.replace('/login'); return; }
    if (user?.role !== 'INSTRUCTOR') { router.replace('/dashboard'); return; }
    fetchCourses();
  }, [isLoggedIn, user]);

  const fetchCourses = async () => {
    try {
      const data = await getMyCourses();
      setCourses(data);
    } catch {
      setError('강의 목록을 불러오는 데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const fetchSections = async (courseId: number) => {
    setSectionsLoading(true);
    try {
      const detail = await getCourseDetail(courseId);
      setSectionsMap((prev) => ({ ...prev, [courseId]: detail.sections ?? [] }));
    } catch {
      // 조회 실패 시 빈 배열 유지
    } finally {
      setSectionsLoading(false);
    }
  };

  const toggleExpand = async (courseId: number) => {
    if (expandedId === courseId) { setExpandedId(null); return; }
    setExpandedId(courseId);
    if (!sectionsMap[courseId]) await fetchSections(courseId);
  };

  const handleThumbnailFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setThumbnailPreview(URL.createObjectURL(file));
    setThumbnailUploading(true);
    try {
      const url = await uploadThumbnail(file);
      setForm((prev) => ({ ...prev, thumbnailUrl: url }));
    } catch {
      alert('썸네일 업로드에 실패했습니다.');
      setThumbnailPreview(null);
    } finally {
      setThumbnailUploading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const created = await createCourse(form);
      setCourses((prev) => [created, ...prev]);
      setForm(empty);
      setThumbnailPreview(null);
      setShowForm(false);
    } catch {
      alert('강의 등록에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (courseId: number, title: string) => {
    if (!confirm(`"${title}" 강의를 삭제하시겠습니까?`)) return;
    try {
      await deleteCourse(courseId);
      setCourses((prev) => prev.filter((c) => c.id !== courseId));
      if (expandedId === courseId) setExpandedId(null);
    } catch {
      alert('강의 삭제에 실패했습니다.');
    }
  };

  const handleAddSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sectionModal) return;
    try {
      await addSection(sectionModal.courseId, { title: sectionModal.title });
      const courseId = sectionModal.courseId;
      setSectionModal(null);
      await fetchSections(courseId);
      setExpandedId(courseId);
    } catch {
      alert('섹션 추가에 실패했습니다.');
    }
  };

  const handleAddLecture = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lectureModal) return;
    try {
      await addLecture(lectureModal.sectionId, {
        title: lectureModal.title,
        videoUrl: lectureModal.videoUrl || undefined,
        duration: lectureModal.duration ? parseInt(lectureModal.duration) : undefined,
      });
      const courseId = lectureModal.courseId;
      setLectureModal(null);
      await fetchSections(courseId);
    } catch {
      alert('영상 추가에 실패했습니다.');
    }
  };

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#222222]">강사 대시보드</h1>
          <p className="text-[#717171] text-sm mt-1">내 강의를 관리하고 새 강의를 등록하세요</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-5 py-2.5 bg-[#222222] text-white text-sm font-semibold rounded-xl hover:bg-[#3B82F6] transition-colors"
        >
          {showForm ? '취소' : '+ 강의 등록'}
        </button>
      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {/* 강의 등록 폼 */}
      {showForm && (
        <form onSubmit={handleCreate} className="bg-[#F7F7F7] rounded-2xl p-6 mb-8 space-y-4">
          <h2 className="text-lg font-bold text-[#222222]">새 강의 등록</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#222222] mb-1">제목 *</label>
              <input required value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-4 py-2.5 border border-[#EBEBEB] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6] bg-white"
                placeholder="강의 제목" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#222222] mb-1">썸네일 이미지</label>
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-[#EBEBEB] rounded-xl cursor-pointer hover:border-[#3B82F6] transition-colors bg-white overflow-hidden relative">
                {thumbnailPreview ? (
                  <img src={thumbnailPreview} alt="preview" className="absolute inset-0 w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center gap-1 text-[#717171]">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4-4a3 3 0 014 0l4 4m-4-8a1 1 0 110-2 1 1 0 010 2zm6 8l2-2a3 3 0 014 0" />
                    </svg>
                    <span className="text-xs">{thumbnailUploading ? '업로드 중...' : '이미지 선택'}</span>
                  </div>
                )}
                <input type="file" accept="image/*" className="hidden" onChange={handleThumbnailFile} disabled={thumbnailUploading} />
              </label>
              {thumbnailPreview && (
                <button type="button" onClick={() => { setThumbnailPreview(null); setForm((p) => ({ ...p, thumbnailUrl: '' })); }}
                  className="mt-1 text-xs text-red-500 hover:underline">
                  제거
                </button>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-[#222222] mb-1">카테고리 *</label>
              <select required value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-4 py-2.5 border border-[#EBEBEB] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6] bg-white">
                {CATEGORIES.map((c) => <option key={c} value={c}>{CAT_LABEL[c]}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#222222] mb-1">난이도 *</label>
              <select required value={form.level}
                onChange={(e) => setForm({ ...form, level: e.target.value })}
                className="w-full px-4 py-2.5 border border-[#EBEBEB] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6] bg-white">
                {LEVELS.map((l) => <option key={l} value={l}>{LEVEL_LABEL[l]}</option>)}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[#222222] mb-1">설명</label>
              <textarea value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-2.5 border border-[#EBEBEB] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6] bg-white resize-none"
                placeholder="강의 소개를 입력하세요" />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-[#222222]">
            <input type="checkbox" checked={form.isPublished ?? false}
              onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
              className="w-4 h-4 rounded" />
            즉시 공개
          </label>
          <div className="flex gap-3">
            <button type="submit" disabled={submitting}
              className="px-6 py-2.5 bg-[#3B82F6] text-white text-sm font-semibold rounded-xl hover:bg-[#1E40AF] transition-colors disabled:opacity-50">
              {submitting ? '등록 중...' : '강의 등록'}
            </button>
            <button type="button" onClick={() => { setShowForm(false); setForm(empty); setThumbnailPreview(null); }}
              className="px-6 py-2.5 bg-white border border-[#EBEBEB] text-sm font-medium text-[#717171] rounded-xl hover:bg-[#F7F7F7] transition-colors">
              취소
            </button>
          </div>
        </form>
      )}

      {/* 강의 목록 */}
      {courses.length === 0 ? (
        <div className="text-center py-24 text-[#717171]">
          <p className="text-xl font-medium mb-2">등록한 강의가 없습니다</p>
          <p className="text-sm">위의 버튼을 눌러 첫 강의를 등록해 보세요</p>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-[#717171] mb-2">총 <span className="font-semibold text-[#222222]">{courses.length}</span>개의 강의</p>
          {courses.map((course) => (
            <div key={course.id} className="bg-white rounded-2xl border border-[#EBEBEB] overflow-hidden">
              {/* 강의 헤더 */}
              <div className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-xs font-medium text-[#717171]">{CAT_LABEL[course.category] ?? course.category}</span>
                      <span className="text-xs text-[#EBEBEB]">·</span>
                      <span className="text-xs font-medium text-[#717171]">{LEVEL_LABEL[course.level] ?? course.level}</span>
                      {course.isPublished
                        ? <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">공개</span>
                        : <span className="text-xs font-semibold text-[#717171] bg-[#F7F7F7] px-2 py-0.5 rounded-full">비공개</span>}
                    </div>
                    <h3 className="text-base font-bold text-[#222222] mb-1">{course.title}</h3>
                    {course.description && <p className="text-sm text-[#717171] line-clamp-1">{course.description}</p>}
                    <p className="text-sm text-[#717171] mt-2">수강생 <strong className="text-[#222222]">{course.enrollmentCount}</strong>명</p>
                  </div>
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    <button
                      onClick={() => toggleExpand(course.id)}
                      className="px-4 py-2 text-xs font-medium text-[#3B82F6] border border-[#3B82F6] rounded-xl hover:bg-blue-50 transition-colors whitespace-nowrap"
                    >
                      {expandedId === course.id ? '섹션 접기 ▲' : '섹션 관리 ▼'}
                    </button>
                    <button
                      onClick={() => setSectionModal({ courseId: course.id, title: '' })}
                      className="px-4 py-2 text-xs font-medium text-[#222222] border border-[#EBEBEB] rounded-xl hover:bg-[#F7F7F7] transition-colors whitespace-nowrap"
                    >
                      + 섹션 추가
                    </button>
                    <button
                      onClick={() => handleDelete(course.id, course.title)}
                      className="px-4 py-2 text-xs font-medium text-red-500 border border-red-200 rounded-xl hover:bg-red-50 transition-colors"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              </div>

              {/* 섹션 목록 (펼침) */}
              {expandedId === course.id && (
                <div className="border-t border-[#EBEBEB] bg-[#F7F7F7] px-5 py-4">
                  {sectionsLoading && !sectionsMap[course.id] ? (
                    <p className="text-sm text-[#717171] py-2">불러오는 중...</p>
                  ) : (sectionsMap[course.id] ?? []).length === 0 ? (
                    <p className="text-sm text-[#717171] py-2">섹션이 없습니다. 위의 <strong>+ 섹션 추가</strong> 버튼을 눌러 추가하세요.</p>
                  ) : (
                    <div className="space-y-3">
                      {(sectionsMap[course.id] ?? []).map((section, idx) => (
                        <div key={section.id} className="bg-white rounded-xl border border-[#EBEBEB] p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-sm font-semibold text-[#222222]">
                              <span className="text-[#717171] mr-2">#{idx + 1}</span>{section.title}
                            </h4>
                            <button
                              onClick={() => setLectureModal({ sectionId: section.id, courseId: course.id, title: '', videoUrl: '', duration: '' })}
                              className="text-xs font-semibold text-white bg-[#3B82F6] px-3 py-1.5 rounded-lg hover:bg-[#1E40AF] transition-colors"
                            >
                              + 영상 추가
                            </button>
                          </div>
                          {section.lectures && section.lectures.length > 0 ? (
                            <ul className="space-y-1.5">
                              {section.lectures.map((lecture, li) => (
                                <li key={lecture.id} className="flex items-center gap-2 text-sm text-[#717171] py-1 border-b border-[#F7F7F7] last:border-0">
                                  <span className="text-[#EBEBEB] text-xs">{li + 1}.</span>
                                  <span className="flex-1 line-clamp-1">{lecture.title}</span>
                                  {lecture.duration != null && lecture.duration > 0 && (
                                    <span className="text-xs text-[#717171] flex-shrink-0">
                                      {Math.floor(lecture.duration / 60)}:{String(lecture.duration % 60).padStart(2, '0')}
                                    </span>
                                  )}
                                  {lecture.preview && (
                                    <span className="text-xs text-[#3B82F6] font-medium flex-shrink-0">미리보기</span>
                                  )}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-xs text-[#717171]">영상이 없습니다.</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 섹션 추가 모달 */}
      {sectionModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <form onSubmit={handleAddSection} className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-bold text-[#222222] mb-4">섹션 추가</h3>
            <input
              required autoFocus
              value={sectionModal.title}
              onChange={(e) => setSectionModal({ ...sectionModal, title: e.target.value })}
              className="w-full px-4 py-2.5 border border-[#EBEBEB] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6] mb-4"
              placeholder="섹션 제목 (예: 1장 - 환경 설정)"
            />
            <div className="flex gap-3">
              <button type="submit" className="flex-1 py-2.5 bg-[#3B82F6] text-white text-sm font-semibold rounded-xl hover:bg-[#1E40AF] transition-colors">추가</button>
              <button type="button" onClick={() => setSectionModal(null)} className="flex-1 py-2.5 bg-[#F7F7F7] text-[#717171] text-sm font-medium rounded-xl hover:bg-[#EBEBEB] transition-colors">취소</button>
            </div>
          </form>
        </div>
      )}

      {/* 영상 추가 모달 */}
      {lectureModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <form onSubmit={handleAddLecture} className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-bold text-[#222222] mb-4">강의 영상 추가</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-[#222222] mb-1">영상 제목 *</label>
                <input
                  required autoFocus
                  value={lectureModal.title}
                  onChange={(e) => setLectureModal({ ...lectureModal, title: e.target.value })}
                  className="w-full px-4 py-2.5 border border-[#EBEBEB] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                  placeholder="예: 1-1. 개발 환경 설치"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#222222] mb-1">YouTube URL</label>
                <input
                  value={lectureModal.videoUrl}
                  onChange={(e) => setLectureModal({ ...lectureModal, videoUrl: e.target.value })}
                  className="w-full px-4 py-2.5 border border-[#EBEBEB] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                  placeholder="https://www.youtube.com/watch?v=..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#222222] mb-1">영상 길이 (초)</label>
                <input
                  type="number" min="0"
                  value={lectureModal.duration}
                  onChange={(e) => setLectureModal({ ...lectureModal, duration: e.target.value })}
                  className="w-full px-4 py-2.5 border border-[#EBEBEB] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                  placeholder="예: 600 (10분)"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button type="submit" className="flex-1 py-2.5 bg-[#3B82F6] text-white text-sm font-semibold rounded-xl hover:bg-[#1E40AF] transition-colors">추가</button>
              <button type="button" onClick={() => setLectureModal(null)} className="flex-1 py-2.5 bg-[#F7F7F7] text-[#717171] text-sm font-medium rounded-xl hover:bg-[#EBEBEB] transition-colors">취소</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
