import { SVGProps } from 'react';

export function WhistleIcon({ className = "w-3.5 h-3.5 text-yellow-400 shrink-0", ...props }: { className?: string } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M9 5a6 6 0 1 0 0 12h5l6-6V5H9z" />
      <path d="M14 5v6" />
      <circle cx="9" cy="11" r="2" />
      <path d="M3 11h2" />
    </svg>
  );
}
