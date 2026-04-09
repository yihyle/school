'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Comment,
  listComments,
  createComment,
  updateComment,
  deleteComment,
  likeComment,
  unlikeComment,
} from '@/lib/api/comments';
import { useAuthStore } from '@/stores/useAuthStore';

interface Props {
  lectureId: number;
}

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
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    listComments(lectureId, user?.id)
      .then(setComments)
      .finally(() => setLoading(false));
  }, [lectureId, user?.id]);

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
      await createComment(lectureId, user.id, input.trim());
      setInput('');
      load();
    } finally {
      setSubmitting(false);
    }
  };

  const total = comments.reduce((sum, c) => sum + 1 + c.replies.length, 0);

  return (
    <section className="mt-8 border-t border-gray-200 pt-6">
      <h2 className="text-lg font-bold text-gray-900 mb-4">
        댓글 <span className="text-blue-500">{total}</span>
      </h2>

      <div className="mb-6">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={user ? '강의에 대한 의견을 남겨주세요' : '로그인 후 작성할 수 있습니다'}
          disabled={!user || submitting}
          rows={3}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400 resize-none disabled:bg-gray-50"
        />
        <div className="flex justify-end mt-2">
          <button
            onClick={handleSubmit}
            disabled={!user || submitting || !input.trim()}
            className="px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {submitting ? '작성 중...' : '댓글 작성'}
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-gray-400 text-center py-6">불러오는 중...</p>
      ) : comments.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-6">첫 댓글을 남겨보세요</p>
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

  const handleLike = async () => {
    if (!user) {
      alert('로그인이 필요합니다.');
      return;
    }
    try {
      const count = liked
        ? await unlikeComment(comment.id, user.id)
        : await likeComment(comment.id, user.id);
      setLikeCount(count);
      setLiked(!liked);
    } catch {
      // ignore
    }
  };

  const handleSaveEdit = async () => {
    if (!user || !editValue.trim()) return;
    await updateComment(comment.id, user.id, editValue.trim());
    setEditing(false);
    onChanged();
  };

  const handleDelete = async () => {
    if (!user) return;
    if (!confirm('댓글을 삭제하시겠습니까?')) return;
    await deleteComment(comment.id, user.id);
    onChanged();
  };

  const handleReply = async () => {
    if (!user || !replyValue.trim()) return;
    await createComment(lectureId, user.id, replyValue.trim(), comment.id);
    setReplyValue('');
    setReplying(false);
    onChanged();
  };

  return (
    <li className={isReply ? 'pl-10' : ''}>
      <div className="flex gap-3">
        <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm font-semibold">
          {comment.userNickname?.[0] ?? '?'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-semibold text-gray-900">{comment.userNickname}</span>
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
                <button onClick={handleSaveEdit} className="text-xs px-3 py-1 bg-blue-500 text-white rounded">
                  저장
                </button>
                <button onClick={() => setEditing(false)} className="text-xs px-3 py-1 border border-gray-200 rounded">
                  취소
                </button>
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
                답글
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
                placeholder="답글 입력..."
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400 resize-none"
              />
              <div className="flex justify-end gap-2 mt-1">
                <button onClick={() => setReplying(false)} className="text-xs px-3 py-1 border border-gray-200 rounded">
                  취소
                </button>
                <button onClick={handleReply} className="text-xs px-3 py-1 bg-blue-500 text-white rounded">
                  등록
                </button>
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
