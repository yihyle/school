'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { listAdminCourses, toggleCoursePublish, deleteCourseAdmin } from '@/lib/api/admin';
import type { AdminCourse } from '@/types';

const CAT_LABEL: Record<string, string> = {
  BACKEND: '백엔드', FRONTEND: '프론트엔드', MOBILE: '모바일',
  AI_ML: 'AI/ML', DATA_SCIENCE: '데이터 사이언스', DEVOPS: 'DevOps', CS: 'CS/기타',
};
const LEVEL_LABEL: Record<string, string> = { BEGINNER: '입문', INTERMEDIATE: '중급', ADVANCED: '고급' };

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<AdminCourse[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setCourses(await listAdminCourses());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onTogglePublish = async (c: AdminCourse) => {
    try {
      const updated = await toggleCoursePublish(c.id);
      setCourses((prev) => prev.map((x) => (x.id === c.id ? updated : x)));
    } catch {
      alert('상태 변경에 실패했습니다.');
    }
  };

  const onDelete = async (c: AdminCourse) => {
    if (!confirm(`"${c.title}" 강의를 정말 삭제할까요? 수강생/댓글 등 연결 데이터가 있으면 실패할 수 있어요.`)) return;
    try {
      await deleteCourseAdmin(c.id);
      setCourses((prev) => prev.filter((x) => x.id !== c.id));
    } catch {
      alert('삭제에 실패했습니다. 연결된 데이터(수강/댓글)를 먼저 정리하세요.');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">
          강의 관리 <span className="text-sm font-medium text-gray-400 ml-2">{courses.length}개</span>
        </h2>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-4 py-3 text-left">강의</th>
              <th className="px-4 py-3 text-left">강사</th>
              <th className="px-4 py-3 text-left">분류</th>
              <th className="px-4 py-3 text-left">수강</th>
              <th className="px-4 py-3 text-left">상태</th>
              <th className="px-4 py-3 text-right">작업</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">불러오는 중...</td></tr>
            ) : courses.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">등록된 강의 없음</td></tr>
            ) : (
              courses.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link href={`/courses/${c.id}`} className="font-semibold text-gray-900 hover:text-blue-600">
                      {c.title}
                    </Link>
                    <p className="text-xs text-gray-500">#{c.id}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{c.instructorNickname ?? '-'}</td>
                  <td className="px-4 py-3 text-xs text-gray-600">
                    {CAT_LABEL[c.category] ?? c.category} · {LEVEL_LABEL[c.level] ?? c.level}
                  </td>
                  <td className="px-4 py-3 text-gray-700 tabular-nums">{c.enrollmentCount ?? 0}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => onTogglePublish(c)}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        c.isPublished
                          ? 'bg-green-50 text-green-700 hover:bg-green-100'
                          : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                      }`}
                    >
                      {c.isPublished ? '공개' : '비공개'}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => onDelete(c)}
                      className="text-xs px-2 py-1 text-red-600 hover:bg-red-50 rounded"
                    >
                      삭제
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
