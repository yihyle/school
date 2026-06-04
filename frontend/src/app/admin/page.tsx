'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getAdminStats } from '@/lib/api/admin';
import type { AdminStats } from '@/types';

const CAT_LABEL: Record<string, string> = {
  BACKEND: '백엔드', FRONTEND: '프론트엔드', MOBILE: '모바일',
  AI_ML: 'AI/ML', DATA_SCIENCE: '데이터 사이언스', DEVOPS: 'DevOps', CS: 'CS/기타',
};

const ROLE_LABEL: Record<string, string> = {
  STUDENT: '학생',
  INSTRUCTOR: '강사',
  ADMIN: '관리자',
};

function StatCard({ label, value, accent }: { label: string; value: number | string; accent?: string }) {
  return (
    <div className="rounded-2xl bg-white border border-gray-100 p-5 shadow-sm">
      <p className="text-xs font-medium text-gray-500">{label}</p>
      <p className={`mt-2 text-2xl font-bold ${accent ?? 'text-gray-900'}`}>{value}</p>
    </div>
  );
}

function BarRow({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = max > 0 ? Math.max(2, Math.round((value / max) * 100)) : 0;
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="w-24 shrink-0 text-gray-700">{label}</span>
      <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
        <div className="h-full bg-blue-500" style={{ width: `${pct}%` }} />
      </div>
      <span className="w-10 text-right text-gray-700 tabular-nums">{value}</span>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getAdminStats()
      .then(setStats)
      .catch(() => setError('통계를 불러오지 못했습니다.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-sm text-gray-500">불러오는 중...</p>;
  if (error || !stats) return <p className="text-sm text-red-500">{error}</p>;

  const roleMax = Math.max(...Object.values(stats.usersByRole), 1);
  const catMax = Math.max(...Object.values(stats.coursesByCategory), 1);

  return (
    <div className="space-y-8">
      {/* 주요 지표 */}
      <section>
        <h2 className="text-lg font-bold text-gray-900 mb-4">전체 지표</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="전체 사용자" value={stats.totalUsers} />
          <StatCard label="강사" value={stats.totalInstructors} accent="text-blue-600" />
          <StatCard label="학생" value={stats.totalStudents} />
          <StatCard label="전체 강의" value={stats.totalCourses} />
          <StatCard label="공개 강의" value={stats.publishedCourses} accent="text-green-600" />
          <StatCard label="누적 수강" value={stats.totalEnrollments} />
          <StatCard label="전체 댓글" value={stats.totalComments} />
          <StatCard
            label="미해결 질문"
            value={`${stats.unresolvedQuestions} / ${stats.totalQuestions}`}
            accent={stats.unresolvedQuestions > 0 ? 'text-orange-600' : 'text-gray-900'}
          />
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 역할 분포 */}
        <section className="rounded-2xl bg-white border border-gray-100 p-6">
          <h2 className="text-base font-bold text-gray-900 mb-4">역할 분포</h2>
          <div className="space-y-3">
            {Object.entries(stats.usersByRole).map(([role, n]) => (
              <BarRow key={role} label={ROLE_LABEL[role] ?? role} value={n} max={roleMax} />
            ))}
          </div>
        </section>

        {/* 카테고리 분포 */}
        <section className="rounded-2xl bg-white border border-gray-100 p-6">
          <h2 className="text-base font-bold text-gray-900 mb-4">강의 카테고리 분포</h2>
          <div className="space-y-3">
            {Object.entries(stats.coursesByCategory).map(([cat, n]) => (
              <BarRow key={cat} label={CAT_LABEL[cat] ?? cat} value={n} max={catMax} />
            ))}
            {Object.keys(stats.coursesByCategory).length === 0 && (
              <p className="text-sm text-gray-400">등록된 강의가 없습니다.</p>
            )}
          </div>
        </section>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 최근 가입자 */}
        <section className="rounded-2xl bg-white border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-gray-900">최근 가입자</h2>
            <Link href="/admin/users" className="text-xs font-medium text-blue-600 hover:underline">
              전체 보기 →
            </Link>
          </div>
          <ul className="divide-y divide-gray-100">
            {stats.recentUsers.map((u) => (
              <li key={u.id} className="py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{u.nickname}</p>
                  <p className="text-xs text-gray-500">{u.email}</p>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                  {ROLE_LABEL[u.role] ?? u.role}
                </span>
              </li>
            ))}
            {stats.recentUsers.length === 0 && (
              <p className="text-sm text-gray-400 py-4">데이터 없음</p>
            )}
          </ul>
        </section>

        {/* 인기 강의 */}
        <section className="rounded-2xl bg-white border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-gray-900">인기 강의 TOP 5</h2>
            <Link href="/admin/courses" className="text-xs font-medium text-blue-600 hover:underline">
              전체 보기 →
            </Link>
          </div>
          <ul className="divide-y divide-gray-100">
            {stats.topCourses.map((c, i) => (
              <li key={c.id} className="py-3 flex items-center gap-3">
                <span className="w-6 text-sm font-bold text-blue-600">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{c.title}</p>
                  <p className="text-xs text-gray-500 truncate">{c.instructorNickname}</p>
                </div>
                <span className="text-xs text-gray-600 tabular-nums">{c.enrollmentCount ?? 0}명</span>
              </li>
            ))}
            {stats.topCourses.length === 0 && (
              <p className="text-sm text-gray-400 py-4">데이터 없음</p>
            )}
          </ul>
        </section>
      </div>
    </div>
  );
}
