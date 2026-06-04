'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Comment,
  CommentType,
  listComments,
  createComment,
  updateComment,
  deleteComment,
  likeComment,
  unlikeComment,
  toggleResolveComment,
} from '@/lib/api/comments';
import { useAuthStore } from '@/stores/useAuthStore';

interface Props {
  lectureId: number;
}

type Tab = 'ALL' | 'QUESTION';

function formatDate(iso: string) {
  const d = new Date(iso);
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return '방금 전';
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)}일 전`;
  return d.toLocaleDateString('ko-KR');
}

export default function CommentSection({ lectureId }: Props) {
  const { user } = useAuthStore();
  const [tab, setTab] = useState<Tab>('ALL');
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState('');
  const [asQuestion, setAsQuestion] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    const type: CommentType | undefined = tab === 'QUESTION' ? 'QUESTION' : undefined;
    listComments(lectureId, user?.id, type)
      .then(setComments)
      .finally(() => setLoading(false));
  }, [lectureId, user?.id, tab]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSubmit = async () => {
    if (!user) {
      alert('로그인이 필요합니다.');
      return;
    }
    if (!input.trim()) return;
    setSubmitting(true);
    try {
      const type: CommentType = asQuestion || tab === 'QUESTION' ? 'QUESTION' : 'GENERAL';
      await createComment(lectureId, user.id, input.trim(), undefined, type);
      setInput('');
      setAsQuestion(false);
      load();
    } finally {
      setSubmitting(false);
    }
  };

  const total = comments.reduce((sum, c) => sum + 1 + c.replies.length, 0);
  const writingAsQuestion = tab === 'QUESTION' || asQuestion;

  return (
    <section className="mt-8 border-t border-gray-200 pt-6">
      <div className="flex items-center gap-1 mb-4">
        <button
          onClick={() => setTab('ALL')}
          className={`px-3 py-1.5 text-sm font-semibold rounded-lg ${
            tab === 'ALL' ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          전체 댓글
        </button>
        <button
          onClick={() => setTab('QUESTION')}
          className={`px-3 py-1.5 text-sm font-semibold rounded-lg flex items-center gap-1 ${
            tab === 'QUESTION' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <span>Q&amp;A</span>
        </button>
        <span className="ml-2 text-sm text-gray-500">{total}</span>
      </div>

      <div className="mb-6">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            user
              ? writingAsQuestion
                ? '강사에게 질문할 내용을 입력하세요'
                : '강의에 대한 의견을 남겨주세요'
              : '로그인 후 작성할 수 있습니다'
          }
          disabled={!user || submitting}
          rows={3}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400 resize-none disabled:bg-gray-50"
        />
        <div className="flex items-center justify-between mt-2">
          {tab === 'ALL' ? (
            <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={asQuestion}
                onChange={(e) => setAsQuestion(e.target.checked)}
                className="rounded"
              />
              질문으로 작성 (Q&amp;A 탭에 표시)
            </label>
          ) : (
            <span className="text-xs text-blue-600 font-medium">Q&amp;A 탭에서 질문 작성 중</span>
          )}
          <button
            onClick={handleSubmit}
            disabled={!user || submitting || !input.trim()}
            className={`px-4 py-2 text-white text-sm rounded-lg disabled:opacity-40 disabled:cursor-not-allowed ${
              writingAsQuestion ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'
            }`}
          >
            {submitting ? '작성 중...' : writingAsQuestion ? '질문 등록' : '댓글 작성'}
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-gray-400 text-center py-6">불러오는 중...</p>
      ) : comments.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-6">
          {tab === 'QUESTION' ? '아직 질문이 없어요. 첫 질문을 남겨보세요!' : '첫 댓글을 남겨보세요'}
        </p>
      ) : (
        <ul className="space-y-5">
          {comments.map((c) => (
            <CommentItem key={c.id} comment={c} lectureId={lectureId} onChanged={load} />
          ))}
        </ul>
      )}
    </section>
  );
}

interface ItemProps {
  comment: Comment;
  lectureId: number;
  onChanged: () => void;
  isReply?: boolean;
}

function CommentItem({ comment, lectureId, onChanged, isReply = false }: ItemProps) {
  const { user } = useAuthStore();
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(comment.content);
  const [replying, setReplying] = useState(false);
  const [replyValue, setReplyValue] = useState('');
  const [likeCount, setLikeCount] = useState(comment.likeCount);
  const [liked, setLiked] = useState(comment.likedByMe);

  const isQuestion = comment.type === 'QUESTION' && !isReply;
  const writerIsInstructor = comment.userRole === 'INSTRUCTOR' || comment.userRole === 'ADMIN';

  const handleLike = async () => {
    if (!user) { alert('로그인이 필요합니다.'); return; }
    try {
      const count = liked
        ? await unlikeComment(comment.id, user.id)
        : await likeComment(comment.id, user.id);
      setLikeCount(count);
      setLiked(!liked);
    } catch {/* ignore */}
  };

  const handleSaveEdit = async () => {
    if (!user || !editValue.trim()) return;
    await updateComment(comment.id, user.id, editValue.trim());
    setEditing(false);
    onChanged();
  };

  const handleDelete = async () => {
    if (!user) return;
    if (!confirm('정말 삭제하시겠습니까?')) return;
    await deleteComment(comment.id, user.id);
    onChanged();
  };

  const handleReply = async () => {
    if (!user || !replyValue.trim()) return;
    await createComment(lectureId, user.id, replyValue.trim(), comment.id, comment.type);
    setReplyValue('');
    setReplying(false);
    onChanged();
  };

  const handleToggleResolved = async () => {
    if (!user) { alert('로그인이 필요합니다.'); return; }
    try {
      await toggleResolveComment(comment.id, user.id);
      onChanged();
    } catch {
      alert('해결 상태 변경에 실패했습니다. (질문 작성자/강사/관리자만 가능)');
    }
  };

  return (
    <li className={isReply ? 'pl-10' : ''}>
      <div className={`flex gap-3 ${isQuestion ? 'p-4 rounded-xl bg-blue-50/40 border border-blue-100' : ''}`}>
        <div className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-semibold ${
          writerIsInstructor
            ? 'bg-gradient-to-br from-amber-400 to-orange-500'
            : 'bg-gradient-to-br from-blue-400 to-purple-500'
        }`}>
          {comment.userNickname?.[0] ?? '?'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-gray-900">{comment.userNickname}</span>
            {writerIsInstructor && (
              <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-amber-100 text-amber-800">
                {comment.userRole === 'ADMIN' ? '관리자' : '강사'}
              </span>
            )}
            {isQuestion && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                comment.resolved
                  ? 'bg-green-100 text-green-700'
                  : 'bg-blue-100 text-blue-700'
              }`}>
                {comment.resolved ? '✓ 해결됨' : 'Q&A'}
              </span>
            )}
            <span className="text-xs text-gray-400">{formatDate(comment.createdAt)}</span>
            {comment.updatedAt && <span className="text-xs text-gray-400">(수정됨)</span>}
          </div>

          {editing ? (
            <div className="mt-2">
              <textarea
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400 resize-none"
              />
              <div className="flex gap-2 mt-1">
                <button onClick={handleSaveEdit} className="text-xs px-3 py-1 bg-blue-500 text-white rounded">저장</button>
                <button onClick={() => setEditing(false)} className="text-xs px-3 py-1 border border-gray-200 rounded">취소</button>
              </div>
            </div>
          ) : (
            <p className="mt-1 text-sm text-gray-700 whitespace-pre-wrap">{comment.content}</p>
          )}

          <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
            <button onClick={handleLike} className={`flex items-center gap-1 hover:text-red-500 ${liked ? 'text-red-500' : ''}`}>
              <svg className="w-4 h-4" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {likeCount}
            </button>
            {!isReply && (
              <button onClick={() => setReplying(!replying)} className="hover:text-blue-500">
                {isQuestion ? '답변' : '답글'}
              </button>
            )}
            {isQuestion && user && (
              <button onClick={handleToggleResolved} className="hover:text-green-600">
                {comment.resolved ? '해결 취소' : '해결됨으로 표시'}
              </button>
            )}
            {comment.editable && !editing && (
              <>
                <button onClick={() => setEditing(true)} className="hover:text-blue-500">수정</button>
                <button onClick={handleDelete} className="hover:text-red-500">삭제</button>
              </>
            )}
          </div>

          {replying && (
            <div className="mt-3">
              <textarea
                value={replyValue}
                onChange={(e) => setReplyValue(e.target.value)}
                rows={2}
                placeholder={isQuestion ? '답변 작성...' : '답글 입력...'}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400 resize-none"
              />
              <div className="flex justify-end gap-2 mt-1">
                <button onClick={() => setReplying(false)} className="text-xs px-3 py-1 border border-gray-200 rounded">취소</button>
                <button onClick={handleReply} className="text-xs px-3 py-1 bg-blue-500 text-white rounded">등록</button>
              </div>
            </div>
          )}

          {comment.replies && comment.replies.length > 0 && (
            <ul className="mt-4 space-y-4">
              {comment.replies.map((r) => (
                <CommentItem key={r.id} comment={r} lectureId={lectureId} onChanged={onChanged} isReply />
              ))}
            </ul>
          )}
        </div>
      </div>
    </li>
  );
}
