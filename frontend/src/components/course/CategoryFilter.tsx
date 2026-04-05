'use client';

const CATEGORIES = [
  { value: 'all', label: '전체' },
  { value: 'BACKEND', label: '백엔드' },
  { value: 'FRONTEND', label: '프론트엔드' },
  { value: 'MOBILE', label: '모바일' },
  { value: 'AI_ML', label: 'AI/ML' },
  { value: 'DATA_SCIENCE', label: '데이터 사이언스' },
  { value: 'DEVOPS', label: 'DevOps' },
  { value: 'CS', label: 'CS/기타' },
];

interface CategoryFilterProps {
  selected: string;
  onChange: (category: string) => void;
}

export default function CategoryFilter({ selected, onChange }: CategoryFilterProps) {
  return (
    <div className="flex gap-0 overflow-x-auto scrollbar-hide border-b border-[#EBEBEB]">
      {CATEGORIES.map((cat) => (
        <button
          key={cat.value}
          onClick={() => onChange(cat.value)}
          className={`flex-shrink-0 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-all duration-150 ${
            selected === cat.value
              ? 'text-[#222222] border-[#222222]'
              : 'text-[#717171] border-transparent hover:text-[#222222] hover:border-gray-300'
          }`}
        >
          {cat.label}
        </button>
      ))}
    </div>
  );
}
