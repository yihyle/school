'use client';

import { useState } from 'react';
import type { Section } from '@/types';
import { formatDuration } from '@/lib/utils';
import LectureItem from './LectureItem';

interface SectionAccordionProps {
  section: Section;
  courseId: number;
  activeLectureId?: number;
  completedLectureIds?: Set<number>;
  isClickable?: boolean;
  defaultOpen?: boolean;
}

export default function SectionAccordion({
  section,
  courseId,
  activeLectureId,
  completedLectureIds = new Set(),
  isClickable = false,
  defaultOpen = false,
}: SectionAccordionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const totalSeconds = section.lectures.reduce((sum, l) => sum + l.duration, 0);
  const completedCount = section.lectures.filter((l) => completedLectureIds.has(l.id)).length;

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      {/* Section header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3.5 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
      >
        <div className="flex-1 min-w-0 pr-4">
          <h3 className="font-semibold text-gray-900 text-sm truncate">{section.title}</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            {section.lectures.length}강 · {formatDuration(totalSeconds)}
            {completedCount > 0 && (
              <span className="ml-2 text-green-600 font-medium">
                ({completedCount}/{section.lectures.length} 완료)
              </span>
            )}
          </p>
        </div>
        <svg
          className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Lectures list */}
      {isOpen && (
        <div className="divide-y divide-gray-100 p-2 bg-white space-y-0.5">
          {section.lectures.map((lecture) => (
            <LectureItem
              key={lecture.id}
              lecture={lecture}
              courseId={courseId}
              isActive={lecture.id === activeLectureId}
              isCompleted={completedLectureIds.has(lecture.id)}
              isClickable={isClickable}
            />
          ))}
        </div>
      )}
    </div>
  );
}
