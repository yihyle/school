'use client';

interface ProgressBarProps {
  percent: number;
  showLabel?: boolean;
  height?: 'sm' | 'md' | 'lg';
  color?: 'blue' | 'green' | 'yellow';
}

const heightMap = {
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-4',
};

const colorMap = {
  blue: 'bg-blue-500',
  green: 'bg-green-500',
  yellow: 'bg-yellow-500',
};

export default function ProgressBar({
  percent,
  showLabel = false,
  height = 'md',
  color = 'blue',
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, percent));

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between mb-1 text-sm text-gray-600">
          <span>진행률</span>
          <span className="font-medium text-blue-600">{Math.round(clamped)}%</span>
        </div>
      )}
      <div className={`w-full bg-gray-200 rounded-full ${heightMap[height]}`}>
        <div
          className={`${colorMap[color]} ${heightMap[height]} rounded-full transition-all duration-300`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
