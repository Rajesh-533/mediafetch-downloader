import React from 'react';

interface LogoProps {
  className?: string;
  iconSize?: number;
  showText?: boolean;
  textSize?: string;
}

export default function Logo({
  className = '',
  iconSize = 32,
  showText = true,
  textSize = 'text-lg',
}: LogoProps) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Precision Vector Emblem matching the brand mark */}
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
      >
        {/* Main "M" Structure (Adapts cleanly to dark/light mode) */}
        <path
          d="M 16 22 L 34 22 L 50 48 L 66 22 L 84 22 L 84 38 L 74 38 L 74 29 L 50 66 L 26 29 L 26 84 L 40 84 L 40 92 L 16 92 Z"
          className="fill-neutral-900 dark:fill-white transition-colors"
        />
        {/* Bottom portion of right leg */}
        <path
          d="M 68 70 L 84 70 L 84 92 L 68 92 Z"
          className="fill-neutral-900 dark:fill-white transition-colors"
        />
        {/* Signature Vibrant Electric Blue Play Triangle */}
        <path
          d="M 68 36 L 94 54 L 68 72 Z"
          fill="#2563eb"
          className="transition-transform duration-200 group-hover:scale-105"
        />
      </svg>

      {showText && (
        <span className={`font-bold tracking-tight ${textSize} leading-none flex items-center`}>
          <span className="text-neutral-900 dark:text-white">Media</span>
          <span className="text-[#2563eb]">Fetch</span>
        </span>
      )}
    </div>
  );
}
