/**
 * Format seconds to MM:SS
 */
export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

/**
 * Format price with Korean won symbol and comma separators
 */
export function formatPrice(price: number): string {
  if (price === 0) return '무료';
  return `₩${price.toLocaleString('ko-KR')}`;
}

/**
 * Format total seconds to human-readable Korean string
 */
export function formatTotalDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}시간 ${m}분`;
  return `${m}분`;
}

/**
 * Map backend level enum to Korean display label
 */
export function getLevelLabel(level: string): string {
  const map: Record<string, string> = {
    BEGINNER: '입문',
    ELEMENTARY: '초급',
    INTERMEDIATE: '중급',
    ADVANCED: '고급',
  };
  return map[level] ?? level;
}

/**
 * Return level badge color classes
 */
export function getLevelColor(level: string): string {
  switch (level) {
    case 'BEGINNER':
      return 'bg-green-100 text-green-700';
    case 'ELEMENTARY':
      return 'bg-blue-100 text-blue-700';
    case 'INTERMEDIATE':
      return 'bg-yellow-100 text-yellow-700';
    case 'ADVANCED':
      return 'bg-red-100 text-red-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
}

/**
 * Map backend category enum to Korean display label
 */
export function getCategoryLabel(category: string): string {
  const map: Record<string, string> = {
    BACKEND: '웹 개발',
    FRONTEND: '웹 개발',
    MOBILE: '모바일',
    AI_ML: 'AI/ML',
    DATA_SCIENCE: '데이터 사이언스',
    DEVOPS: 'DevOps',
    CS: '기타',
  };
  return map[category] ?? category;
}

/**
 * Clamp a number between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Generate a color based on a string (for placeholder thumbnails)
 */
export function stringToColor(str: string): string {
  const colors = [
    'from-blue-400 to-blue-600',
    'from-green-400 to-green-600',
    'from-purple-400 to-purple-600',
    'from-red-400 to-red-600',
    'from-yellow-400 to-yellow-600',
    'from-indigo-400 to-indigo-600',
    'from-pink-400 to-pink-600',
    'from-teal-400 to-teal-600',
  ];
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}
