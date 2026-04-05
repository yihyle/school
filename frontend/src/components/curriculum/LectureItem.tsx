'use client';

import Link from 'next/link';
import type { Lecture } from '@/types';
import { formatDuration } from '@/lib/utils';

interface LectureItemProps {
  lecture: Lecture;
  courseId: number;
  isActive?: boolean;
  isCompleted?: boolean;
  isClickable?: boolean;
}

export default function LectureItem({
  lecture,
  courseId,
  isActive = false,
  isCompleted = false,
  isClickable = false,
}: LectureItemProps) {
  const content = (
    <div
      className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
        isActive
          ? 'bg-blue-50 border border-blue-200'
          : isClickable
          ? 'hover:bg-gray-50 cursor-pointer'
          : 'cursor-default'
      }`}
    >
      {/* Status icon */}
      <div className="flex-shrink-0">
        {isCompleted ? (
          <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        ) : isActive ? (
          <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        ) : (
          <div className="w-6 h-6 rounded-full border-2 border-gray-300 flex items-center justify-center">
            <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        )}
      </div>

      {/* Title */}
      <span className={`flex-1 text-sm leading-snug ${isActive ? 'text-blue-700 font-medium' : 'text-gray-700'}`}>
        {lecture.title}
      </span>

      {/* Duration */}
      <span className="flex-shrink-0 text-xs text-gray-400 tabular-nums">
        {formatDuration(lecture.duration)}
      </span>
    </div>
  );

  if (isClickable) {
    return (
      <Link href={`/learn/${courseId}/${lecture.id}`} className="block">
        {content}
      </Link>
    );
  }

  return content;
}
