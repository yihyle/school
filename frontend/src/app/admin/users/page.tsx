'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/useAuthStore';
import { listAdminUsers, updateUserRole, setUserActive, deleteUser } from '@/lib/api/admin';
import type { AdminUser } from '@/types';

const ROLES = ['STUDENT', 'INSTRUCTOR', 'ADMIN'];
const ROLE_LABEL: Record<string, string> = {
  STUDENT: '학생',
  INSTRUCTOR: '강사',
  ADMIN: '관리자',
};

const ROLE_BADGE: Record<string, string> = {
  STUDENT: 'bg-gray-100 text-gray-700',
  INSTRUCTOR: 'bg-blue-50 text-blue-700',
  ADMIN: 'bg-red-50 text-red-700',
};

export default function AdminUsersPage() {
  const { user: me } = useAuthStore();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (kw?: string) => {
    setLoading(true);
    try {
      const data = await listAdminUsers(kw);
      setUsers(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onChangeRole = async (u: AdminUser, role: string) => {
    if (u.role === role) return;
    if (!confirm(`${u.nickname} 의 권한을 ${ROLE_LABEL[role]} 로 변경할까요?`)) return;
    try {
      const updated = await updateUserRole(u.id, role);
      setUsers((prev) => prev.map((x) => (x.id === u.id ? updated : x)));
    } catch {
      alert('권한 변경에 실패했습니다.');
    }
  };

  const onToggleActive = async (u: AdminUser) => {
    if (me?.id === u.id) {
      alert('자기 자신은 비활성화할 수 없습니다.');
      return;
    }
    try {
      const updated = await setUserActive(u.id, !u.isActive);
      setUsers((prev) => prev.map((x) => (x.id === u.id ? updated : x)));
    } catch {
      alert('상태 변경에 실패했습니다.');
    }
  };

  const onDelete = async (u: AdminUser) => {
    if (me?.id === u.id) {
      alert('자기 자신은 삭제할 수 없습니다.');
      return;
    }
    if (!confirm(`${u.nickname} 계정을 정말 삭제할까요? 되돌릴 수 없습니다.`)) return;
    try {
      await deleteUser(u.id);
      setUsers((prev) => prev.filter((x) => x.id !== u.id));
    } catch {
      alert('삭제에 실패했습니다. 연결된 데이터가 있는지 확인하세요.');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6 gap-4">
        <h2 className="text-xl font-bold text-gray-900">사용자 관리 <span className="text-sm font-medium text-gray-400 ml-2">{users.length}명</span></h2>
        <div className="flex gap-2">
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') load(keyword); }}
            placeholder="이메일/닉네임 검색"
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 w-64"
          />
          <button
            onClick={() => load(keyword)}
            className="px-3 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            검색
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-4 py-3 text-left">사용자</th>
              <th className="px-4 py-3 text-left">권한</th>
              <th className="px-4 py-3 text-left">상태</th>
              <th className="px-4 py-3 text-left">가입일</th>
              <th className="px-4 py-3 text-right">작업</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">불러오는 중...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">검색 결과 없음</td></tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-gray-900">
                      {u.nickname}
                      {me?.id === u.id && <span className="ml-2 text-xs text-blue-600">(나)</span>}
                    </p>
                    <p className="text-xs text-gray-500">{u.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={u.role}
                      onChange={(e) => onChangeRole(u, e.target.value)}
                      className={`px-2 py-1 rounded-full text-xs font-medium border border-transparent cursor-pointer ${ROLE_BADGE[u.role] ?? 'bg-gray-100 text-gray-700'}`}
                    >
                      {ROLES.map((r) => (
                        <option key={r} value={r}>{ROLE_LABEL[r]}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => onToggleActive(u)}
                      disabled={me?.id === u.id}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        u.isActive
                          ? 'bg-green-50 text-green-700 hover:bg-green-100'
                          : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                      } disabled:opacity-40 disabled:cursor-not-allowed`}
                    >
                      {u.isActive ? '활성' : '비활성'}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-xs">
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString('ko-KR') : '-'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => onDelete(u)}
                      disabled={me?.id === u.id}
                      className="text-xs px-2 py-1 text-red-600 hover:bg-red-50 rounded disabled:opacity-40 disabled:cursor-not-allowed"
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
