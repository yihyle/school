'use client';

import type { Section } from '@/types';
import SectionAccordion from '@/components/curriculum/SectionAccordion';
import ProgressBar from '@/components/common/ProgressBar';

interface CourseSidebarProps {
  courseTitle: string;
  sections: Section[];
  courseId: number;
  activeLectureId: number;
  completedLectureIds: Set<number>;
  progressPercent: number;
}

export default function CourseSidebar({
  courseTitle,
  sections,
  courseId,
  activeLectureId,
  completedLectureIds,
  progressPercent,
}: CourseSidebarProps) {
  const totalLectures = sections.reduce((sum, s) => sum + s.lectures.length, 0);
  const activeSection = sections.find((s) =>
    s.lectures.some((l) => l.id === activeLectureId)
  );

  return (
    <aside className="flex flex-col h-full bg-white border-l border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="font-bold text-gray-900 text-sm leading-snug mb-3 line-clamp-2">
          {courseTitle}
        </h2>
        <ProgressBar percent={progressPercent} showLabel height="sm" />
        <p className="text-xs text-gray-500 mt-1.5">
          {completedLectureIds.size} / {totalLectures}강 완료
        </p>
      </div>

      {/* Sections */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {sections.map((section) => (
          <SectionAccordion
            key={section.id}
            section={section}
            courseId={courseId}
            activeLectureId={activeLectureId}
            completedLectureIds={completedLectureIds}
            isClickable
            defaultOpen={section.id === activeSection?.id}
          />
        ))}
      </div>
    </aside>
  );
}
