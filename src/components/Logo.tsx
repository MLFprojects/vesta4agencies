import React from 'react';

interface LogoProps {
  type?: 'full' | 'icon';
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function Logo({ type = 'full', className = '', size = 'md' }: LogoProps) {
  // Define scale heights for the logo
  const heights = {
    sm: 'h-6',
    md: 'h-9',
    lg: 'h-14'
  };

  const chosenHeight = heights[size] || heights['md'];

  const srcs = [
    '/assets/vesta logo no back.png',
    '/assets/vesta_logo_no_back.png',
    '/assets/vesta logo no back.svg',
    '/assets/vesta_logo_no_back.svg',
    '/assets/vesta logo no back.jpg',
    '/assets/vesta_logo_no_back.jpg'
  ];

  const [srcIndex, setSrcIndex] = React.useState(0);
  const [useFallback, setUseFallback] = React.useState(false);

  const handleImageError = () => {
    if (srcIndex < srcs.length - 1) {
      setSrcIndex(srcIndex + 1);
    } else {
      setUseFallback(true);
    }
  };

  if (type === 'icon') {
    return (
      <svg
        id="logo-icon-svg"
        className={`${chosenHeight} ${className}`}
        viewBox="0 0 100 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M 50 10 L 10 45 L 10 100 L 90 100 L 90 45 Z" fill="#1B3B2B" />
        <rect x="35" y="65" width="30" height="35" fill="white" />
        <rect x="36" y="32" width="11" height="11" fill="white" />
        <rect x="53" y="32" width="11" height="11" fill="white" />
        <rect x="36" y="47" width="11" height="11" fill="white" />
        <rect x="53" y="47" width="11" height="11" fill="white" />
      </svg>
    );
  }

  if (!useFallback) {
    return (
      <img
        id="logo-full-img"
        src={srcs[srcIndex]}
        alt="Vesta Logo"
        className={`${chosenHeight} ${className} object-contain`}
        onError={handleImageError}
        referrerPolicy="no-referrer"
        style={{ display: 'inline-block', verticalAlign: 'middle' }}
      />
    );
  }

  // Native fallback
  return (
    <svg
      id="logo-full-svg"
      className={`${chosenHeight} ${className}`}
      viewBox="0 0 310 115"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'inline-block', verticalAlign: 'middle' }}
    >
      {/* Black spot above the V */}
      <circle cx="34" cy="18" r="11" fill="black" />
      
      {/* Letter 'V' */}
      <path d="M 12 35 L 34 105 L 56 35 L 43 35 L 34 85 L 25 35 Z" fill="black" />
      
      {/* Lowercase 'e' */}
      <path d="M 68 70 L 100 70 C 100 50 85 45 78 45 C 67 45 58 55 58 75 C 58 95 68 105 80 105 C 92 105 100 95 100 86 L 88 86 C 88 92 84 95 80 95 C 73 95 70 87 70 78 C 70 77 71 70 71 70 Z M 70 60 C 70 53 74 53 78 53 C 83 53 87 56 87 60 Z" fill="black" />
      
      {/* Lowercase 's' */}
      <path d="M 106 94 C 112 104 121 105 125 105 C 132 105 138 101 138 94 C 138 88 132 85 122 83 C 112 80 106 75 106 64 C 106 53 115 45 126 45 C 136 45 144 52 148 62 L 137 68 C 133 60 128 55 125 55 C 120 55 117 58 117 63 C 117 68 122 70 130 73 C 141 76 149 81 149 93 C 149 105 139 115 124 115 C 113 115 106 108 102 98 Z" fill="black" />
      
      {/* Lowercase 't' */}
      <path d="M 163 47 L 163 35 L 174 35 L 174 47 L 187 47 L 187 57 L 174 57 L 174 95 C 174 99 176 103 182 103 C 185 103 187 102 188 101 L 188 111 C 185 113 180 114 175 114 C 165 114 163 105 163 94 L 163 57 L 155 57 L 155 47 Z" fill="black" />

      {/* House as letter 'A' */}
      <g transform="translate(196, 26)">
        {/* Outlined triangle representing house + A roof */}
        <path d="M 40 0 L 0 35 L 0 86 L 80 86 L 80 35 Z" fill="#1B3B2B" />
        {/* Open bottom door to resemble letter A crossbar gap */}
        <rect x="25" y="55" width="30" height="32" fill="white" />
        {/* 4 pane window centered above the door */}
        <g fill="white">
          <rect x="26" y="27" width="11" height="11" />
          <rect x="43" y="27" width="11" height="11" />
          <rect x="26" y="42" width="11" height="11" />
          <rect x="43" y="42" width="11" height="11" />
        </g>
      </g>
    </svg>
  );
}
