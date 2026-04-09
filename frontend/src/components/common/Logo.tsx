import Link from 'next/link';

interface LogoProps {
  size?: number;
  textClassName?: string;
  href?: string | null;
  className?: string;
}

export default function Logo({
  size = 28,
  textClassName = 'text-lg font-bold tracking-tight text-[#191F28]',
  href = '/',
  className = '',
}: LogoProps) {
  const inner = (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M16 4L30 10.5L16 17L2 10.5L16 4Z"
          fill="#3B82F6"
        />
        <path
          d="M7 13.5V20.2C7 20.78 7.27 21.32 7.74 21.66C9.42 22.86 12.43 24 16 24C19.57 24 22.58 22.86 24.26 21.66C24.73 21.32 25 20.78 25 20.2V13.5"
          stroke="#191F28"
          strokeWidth="2.2"
          strokeLinecap="round"
          fill="none"
        />
        <line x1="29" y1="11" x2="29" y2="18" stroke="#191F28" strokeWidth="2.2" strokeLinecap="round" />
        <circle cx="29" cy="20" r="1.6" fill="#3B82F6" />
      </svg>
      <span className={textClassName}>learnhub</span>
    </span>
  );

  if (href === null) return inner;
  return (
    <Link href={href} className="flex-shrink-0">
      {inner}
    </Link>
  );
}
