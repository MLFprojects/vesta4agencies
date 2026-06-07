import React from 'react';

interface ClayIconProps {
  type: 'geolocation' | 'media' | 'cielo' | 'legal';
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'custom';
  className?: string;
  width?: number;
  height?: number;
}

export function ClayIcon({ type, size = 'md', className = '', width, height }: ClayIconProps) {
  // Dimensions helper mapping
  const sizeMap = {
    sm: { w: 36, h: 36 },
    md: { w: 48, h: 48 },
    lg: { w: 72, h: 72 },
    xl: { w: 100, h: 100 },
    custom: { w: width || 48, h: height || 48 }
  };

  const dims = sizeMap[size] || sizeMap['md'];
  const w = width || dims.w;
  const h = height || dims.h;

  return (
    <svg
      id={`clay-icon-${type}`}
      className={`select-none ${className}`}
      width={w}
      height={h}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ filter: 'drop-shadow(0px 6px 10px rgba(44, 62, 53, 0.15))' }}
    >
      <defs>
        {/* Soft Clay Shadows Filter */}
        <filter id="clayShadowFilter" x="-10%" y="-10%" width="125%" height="125%">
          <feDropShadow dx="0" dy="5" stdDeviation="4" floodColor="#2C3E35" floodOpacity="0.25" />
          <feDropShadow dx="0" dy="2" stdDeviation="1.5" floodColor="#1B3B2B" floodOpacity="0.15" />
        </filter>

        {/* 3D Deep Forest Green Gradient */}
        <linearGradient id="clayGreenGrad" x1="20" y1="20" x2="100" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#416E53" />
          <stop offset="50%" stopColor="#1B3B2B" />
          <stop offset="100%" stopColor="#10251B" />
        </linearGradient>

        {/* Glossy Mint highlight gradient for 3D reflections */}
        <linearGradient id="clayMintGrad" x1="40" y1="30" x2="80" y2="90" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#A2DFBD" />
          <stop offset="60%" stopColor="#316F4F" />
          <stop offset="100%" stopColor="#1B3B2B" />
        </linearGradient>

        {/* Clay Warm White Gradient */}
        <linearGradient id="clayWhiteGrad" x1="20" y1="20" x2="100" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
          <stop offset="40%" stopColor="#FDFBF7" />
          <stop offset="100%" stopColor="#D8D2C4" />
        </linearGradient>

        {/* Clay Accent Warm Gold/Orange for 3D micro highlights */}
        <linearGradient id="clayGoldGrad" x1="30" y1="30" x2="90" y2="90" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#A4C2B0" />
          <stop offset="100%" stopColor="#2C3E35" />
        </linearGradient>

        {/* Inner highlight overlay gradient */}
        <radialGradient id="clayInnerGlow" cx="35%" cy="30%" r="65%" fx="35%" fy="30%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.45" />
          <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.15" />
        </radialGradient>
      </defs>

      {/* RENDER THE CORRESPONDING CLAY ICON ICONOGRAPHY */}
      {type === 'geolocation' && (
        <g filter="url(#clayShadowFilter)">
          {/* Base rounded organic map platform pedestal */}
          <rect x="15" y="70" width="90" height="25" rx="12" fill="url(#clayWhiteGrad)" />
          <rect x="20" y="73" width="80" height="15" rx="7.5" fill="#E8F5E9" opacity="0.8" />
          {/* Schematic grid line in pedestal */}
          <line x1="45" y1="73" x2="45" y2="88" stroke="#1B3B2B" strokeWidth="2.5" strokeLinecap="round" opacity="0.3" />
          <line x1="75" y1="73" x2="75" y2="88" stroke="#1B3B2B" strokeWidth="2.5" strokeLinecap="round" opacity="0.3" />
          
          {/* Pin shadows */}
          <ellipse cx="60" cy="74" rx="15" ry="6" fill="#1B3B2B" opacity="0.18" />

          {/* Fat rounded 3D clay Pin outer */}
          <path
            d="M 60 76 C 44 58 40 46 40 36 C 40 24 49 15 60 15 C 71 15 80 24 80 36 C 80 46 76 58 60 76 Z"
            fill="url(#clayGreenGrad)"
          />
          {/* Soft inner lighting drop overlay */}
          <path
            d="M 60 76 C 44 58 40 46 40 36 C 40 24 49 15 60 15 C 71 15 80 24 80 36 C 80 46 76 58 60 76 Z"
            fill="url(#clayInnerGlow)"
          />

          {/* Pin center organic hollow sphere */}
          <circle cx="60" cy="36" r="10" fill="url(#clayWhiteGrad)" />
          <circle cx="60" cy="36" r="10" fill="url(#clayInnerGlow)" />

          {/* Glossy pill-shaped light reflection on Pin side */}
          <path
            d="M 45 32 C 45 27 50 21 56 19 C 54 21 49 26 49 32 C 49 35 47 38 45 32 Z"
            fill="#FFFFFF"
            opacity="0.35"
          />
        </g>
      )}

      {type === 'media' && (
        <g filter="url(#clayShadowFilter)">
          {/* 3D clay sheet / Blueprint background standing slightly tilted */}
          <path
            d="M 20 28 C 20 23 24 19 29 19 L 91 19 C 96 19 100 23 100 28 L 100 87 C 100 92 96 96 91 96 L 29 96 C 24 96 20 92 20 87 Z"
            fill="url(#clayWhiteGrad)"
          />
          {/* Tech schematic guidelines on blueprint */}
          <rect x="26" y="25" width="68" height="65" rx="6" fill="#E8F5E9" opacity="0.5" />
          <line x1="26" y1="46" x2="94" y2="46" stroke="#1B3B2B" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.3" />
          <line x1="26" y1="68" x2="94" y2="68" stroke="#1B3B2B" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.3" />
          <line x1="48" y1="25" x2="48" y2="90" stroke="#1B3B2B" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.3" />
          <line x1="72" y1="25" x2="72" y2="90" stroke="#1B3B2B" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.3" />

          {/* 3D Matte clay camera body overlay */}
          <rect x="35" y="42" width="50" height="34" rx="10" fill="url(#clayGreenGrad)" />
          <rect x="35" y="42" width="50" height="34" rx="10" fill="url(#clayInnerGlow)" />
          
          {/* Camera top flash notch */}
          <path d="M 47 42 C 47 38 52 36 60 36 C 68 36 73 38 73 42 Z" fill="url(#clayGreenGrad)" />

          {/* Camera lens (Double Layered Cylinder) */}
          <circle cx="60" cy="59" r="12" fill="url(#clayGoldGrad)" />
          <circle cx="60" cy="59" r="9" fill="#1B3B2B" />
          <circle cx="60" cy="59" r="9" fill="url(#clayInnerGlow)" />
          <circle cx="57" cy="56" r="3" fill="#FFFFFF" opacity="0.5" />

          {/* Specular reflection bar on camera surface */}
          <rect x="40" y="46" width="12" height="3" rx="1.5" fill="#FFFFFF" opacity="0.25" />
        </g>
      )}

      {type === 'cielo' && (
        <g filter="url(#clayShadowFilter)">
          {/* Soft Clay Cloud 1 background */}
          <path
            d="M 25 65 C 25 57 32 50 40 50 C 42 50 44 51 46 51 C 50 41 60 35 70 35 C 83 35 94 45 95 58 C 101 59 105 64 105 70 C 105 78 98 85 90 85 L 35 85 C 29 85 25 76 25 65 Z"
            fill="url(#clayWhiteGrad)"
          />
          <path
            d="M 25 65 C 25 57 32 50 40 50 C 42 50 44 51 46 51 C 50 41 60 35 70 35 C 83 35 94 45 95 58 C 101 59 105 64 105 70 C 105 78 98 85 90 85 L 35 85 C 29 85 25 76 25 65 Z"
            fill="url(#clayInnerGlow)"
          />

          {/* 3D Pencil/Pen drawing across */}
          <g transform="translate(15, -10) rotate(15 45 45)">
            {/* Pencil body */}
            <rect x="42" y="20" width="14" height="60" rx="7" fill="url(#clayGreenGrad)" />
            <rect x="42" y="20" width="14" height="60" rx="7" fill="url(#clayInnerGlow)" />
            
            {/* Pencil tip cone */}
            <path d="M 42 27 L 49 12 L 56 27 Z" fill="url(#clayWhiteGrad)" />
            {/* Pencil lead point */}
            <path d="M 46 18 L 49 12 L 52 18 Z" fill="#1B3B2B" />
            
            {/* Pencil eraser cap */}
            <rect x="42" y="73" width="14" height="7" rx="3.5" fill="url(#clayGoldGrad)" />
          </g>

          {/* Dynamic 3D speech bubble or stars popping out */}
          <circle cx="85" cy="40" r="5" fill="url(#clayGreenGrad)" />
          <circle cx="95" cy="30" r="3" fill="url(#clayGreenGrad)" />
        </g>
      )}

      {type === 'legal' && (
        <g filter="url(#clayShadowFilter)">
          {/* Main folder or sheet base block */}
          <path
            d="M 25 22 C 25 18 29 14 34 14 L 86 14 C 91 14 95 18 95 22 L 95 94 C 95 98 91 102 86 102 L 34 102 C 29 102 25 98 25 94 Z"
            fill="url(#clayWhiteGrad)"
          />
          <path
            d="M 25 22 C 25 18 29 14 34 14 L 86 14 C 91 14 95 18 95 22 L 95 94 C 95 98 91 102 86 102 L 34 102 C 29 102 25 98 25 94 Z"
            fill="url(#clayInnerGlow)"
          />

          {/* Standard thick, tactile text scribbled stripes */}
          <rect x="36" y="30" width="48" height="6" rx="3" fill="#1B3B2B" opacity="0.8" />
          <rect x="36" y="44" width="48" height="5" rx="2.5" fill="#2C3E35" opacity="0.5" />
          <rect x="36" y="56" width="36" height="5" rx="2.5" fill="#2C3E35" opacity="0.5" />
          <rect x="36" y="68" width="44" height="5" rx="2.5" fill="#2C3E35" opacity="0.5" />

          {/* 3D Stamp / Seal overlayed at bottom right corner */}
          <circle cx="78" cy="80" r="16" fill="url(#clayGreenGrad)" />
          <circle cx="78" cy="80" r="16" fill="url(#clayInnerGlow)" />
          <circle cx="78" cy="80" r="11" fill="url(#clayWhiteGrad)" opacity="0.3" />
          
          {/* Checkmark inside seal */}
          <path
            d="M 72 80 L 76 84 L 84 76"
            stroke="url(#clayWhiteGrad)"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Left margin ribbon */}
          <rect x="25" y="40" width="3" height="40" fill="url(#clayGreenGrad)" />
        </g>
      )}
    </svg>
  );
}
