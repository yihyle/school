import Link from 'next/link';
import type { Course } from '@/types';
import { formatPrice, getLevelColor, getLevelLabel, getCategoryLabel, stringToColor } from '@/lib/utils';
import ProgressBar from '@/components/common/ProgressBar';

interface CourseCardProps {
  course: Course;
  progressPercent?: number;
  showProgress?: boolean;
}

export default function CourseCard({
  course,
  progressPercent,
  showProgress = false,
}: CourseCardProps) {
  const href = `/courses/${course.id}`;
  const gradient = stringToColor(course.title);

  return (
    <Link
      href={href}
      className="group block bg-white rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-200"
    >
      {/* Thumbnail */}
      <div className={`relative aspect-video bg-gradient-to-br ${gradient} overflow-hidden rounded-2xl`}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-2">
              <span className="text-2xl font-bold text-white">{course.title.charAt(0)}</span>
            </div>
          </div>
        </div>
        {/* Level badge */}
        <div className="absolute top-3 left-3">
          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getLevelColor(course.level)}`}>
            {getLevelLabel(course.level)}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="pt-3 pb-1 px-1">
        <p className="text-xs font-medium text-[#717171] mb-1">{getCategoryLabel(course.category)}</p>
        <h3 className="font-semibold text-[#222222] text-sm leading-snug mb-1 line-clamp-2 group-hover:text-[#3B82F6] transition-colors duration-200">
          {course.title}
        </h3>
        <p className="text-xs text-[#717171] mb-2">{course.instructorNickname}</p>

        {showProgress && progressPercent !== undefined ? (
          <div className="mt-2">
            <ProgressBar percent={progressPercent} showLabel height="sm" />
          </div>
        ) : (
          course.enrollmentCount !== undefined && (
            <p className="text-xs text-[#717171] mt-2">
              수강생 {course.enrollmentCount.toLocaleString()}명
            </p>
          )
        )}
      </div>
    </Link>
  );
}
