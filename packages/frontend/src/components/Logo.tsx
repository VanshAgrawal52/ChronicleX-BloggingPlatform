export function Logo({ size = 32, className = '' }: { size?: number; className?: string }) {
  const bookWidth = size;
  const bookHeight = size * 0.78;
  return (
    <div className={`flex items-center gap-2 font-semibold tracking-wide ${className}`} style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      <svg width={bookWidth} height={bookHeight} viewBox="0 0 64 50" role="img" aria-label="ChronicleX Logo" className="drop-shadow-sm">
        <defs>
          <linearGradient id="lg1" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#4F46E5" />
            <stop offset="100%" stopColor="#7C3AED" />
          </linearGradient>
          <linearGradient id="pg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#EEF2FF" />
          </linearGradient>
        </defs>
        <rect x="2" y="2" width="60" height="46" rx="10" fill="url(#lg1)" />
        <path d="M10 10h20c2.4 0 4.2.9 5.3 2.4 1.1-1.5 2.9-2.4 5.3-2.4h20v26c0 2.4-2 4.4-4.4 4.4H40c-2.4 0-4.2-.9-5.3-2.4-1.1 1.5-2.9 2.4-5.3 2.4H14.4C12 40.4 10 38.4 10 36V10Z" fill="url(#pg)" stroke="#E2E8F0" strokeWidth="1.2" />
        <rect x="31" y="11" width="2" height="24" rx="1" fill="#E0E7FF" />
        <path d="M24 17l4.9 6.3L24 30h4l3.1-4.4L34.2 30H38l-4.8-6.8L38 17h-3.8l-2.9 4.3L28.3 17H24Z" fill="#4F46E5" />
      </svg>
      <span className="text-lg leading-none"><span className="text-indigo-600">Chronicle</span>X</span>
    </div>
  );
}
