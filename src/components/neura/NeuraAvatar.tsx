import React from 'react';

interface NeuraAvatarProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isThinking?: boolean;
}

export const NeuraAvatar: React.FC<NeuraAvatarProps> = ({ size = 'md', isThinking = false }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-11 h-11',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  }[size];

  const iconSizes = {
    sm: 'w-5 h-5',
    md: 'w-7 h-7',
    lg: 'w-10 h-10',
    xl: 'w-14 h-14'
  }[size];

  return (
    <div
      className={`relative ${sizeClasses} rounded-2xl bg-gradient-to-br from-[#7955D9] to-[#51358F] border-2 border-[#BCA6F4] flex items-center justify-center shadow-sm select-none ${
        isThinking ? 'animate-pulse' : ''
      }`}
    >
      {/* Neural Synapse Mascot SVG */}
      <svg
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`${iconSizes} text-white drop-shadow-sm`}
      >
        {/* Brain hemisphere left */}
        <path
          d="M24 16C17.3726 16 12 21.3726 12 28C12 31.42 13.43 34.5 15.74 36.68C14.67 38.38 14 40.38 14 42.5C14 47.7467 18.2533 52 23.5 52C24.4 52 25.26 51.87 26.08 51.64C27.5 52.5 29.17 53 31 53V16H24Z"
          fill="#BCA6F4"
          fillOpacity="0.85"
        />
        {/* Brain hemisphere right */}
        <path
          d="M40 16C46.6274 16 52 21.3726 52 28C52 31.42 50.57 34.5 48.26 36.68C49.33 38.38 50 40.38 50 42.5C50 47.7467 45.7467 52 40.5 52C39.6 52 38.74 51.87 37.92 51.64C36.5 52.5 34.83 53 33 53V16H40Z"
          fill="#35D4E5"
          fillOpacity="0.85"
        />
        {/* Friendly cute eyes */}
        <circle cx="25" cy="32" r="3" fill="#29243B" />
        <circle cx="26" cy="31" r="1" fill="#FFFFFF" />
        <circle cx="39" cy="32" r="3" fill="#29243B" />
        <circle cx="40" cy="31" r="1" fill="#FFFFFF" />
        {/* Cheerful mouth */}
        <path
          d="M28 39C29.5 41.5 34.5 41.5 36 39"
          stroke="#29243B"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        {/* Synapse spark nodes */}
        <circle cx="10" cy="20" r="2" fill="#35D4E5" />
        <path d="M12 21L18 24" stroke="#35D4E5" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="54" cy="20" r="2" fill="#A5F0D0" />
        <path d="M52 21L46 24" stroke="#A5F0D0" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="32" cy="11" r="2.5" fill="#FAF9FE" />
        <path d="M32 13V16" stroke="#FAF9FE" strokeWidth="1.5" strokeLinecap="round" />
      </svg>

      {/* Floating active synapse sparkle badge */}
      <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#35D4E5] border-2 border-white shadow-xs" />
    </div>
  );
};
