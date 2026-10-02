import React, { useState, useEffect } from 'react';

interface RoyalLogoProps {
  className?: string;
  src?: string;
  forceDefault?: boolean;
}

export default function RoyalLogo({ className = "w-10 h-10", src, forceDefault = false }: RoyalLogoProps) {
  const [customLogo, setCustomLogo] = useState<string | null>(() => {
    if (forceDefault) return null;
    if (src) return src;
    try {
      return localStorage.getItem('royal_custom_logo');
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (forceDefault) {
      setCustomLogo(null);
      return;
    }
    if (src) {
      setCustomLogo(src);
      return;
    }

    const handleLogoUpdate = () => {
      try {
        const stored = localStorage.getItem('royal_custom_logo');
        setCustomLogo(stored);
      } catch {
        setCustomLogo(null);
      }
    };

    window.addEventListener('royal_logo_updated', handleLogoUpdate);
    window.addEventListener('storage', handleLogoUpdate);

    return () => {
      window.removeEventListener('royal_logo_updated', handleLogoUpdate);
      window.removeEventListener('storage', handleLogoUpdate);
    };
  }, [src, forceDefault]);

  if (customLogo) {
    return (
      <img
        src={customLogo}
        alt="Royal School Logo"
        className={`${className} object-contain`}
      />
    );
  }

  // Olive leaves positions along the left curve
  const leftLeaves = [
    { x: 172, y: 356, rot: -55, scale: 0.95 },
    { x: 150, y: 332, rot: -40, scale: 1.0 },
    { x: 134, y: 302, rot: -22, scale: 1.05 },
    { x: 125, y: 268, rot: -5, scale: 1.1 },
    { x: 124, y: 232, rot: 12, scale: 1.1 },
    { x: 132, y: 198, rot: 30, scale: 1.05 },
    { x: 147, y: 168, rot: 48, scale: 1.0 },
    { x: 170, y: 145, rot: 65, scale: 0.9 },
    { x: 182, y: 338, rot: -25, scale: 0.8 },
    { x: 162, y: 298, rot: -10, scale: 0.85 },
    { x: 154, y: 256, rot: 8, scale: 0.9 },
    { x: 156, y: 218, rot: 28, scale: 0.85 },
    { x: 172, y: 185, rot: 45, scale: 0.8 },
  ];

  const rightLeaves = leftLeaves.map(leaf => ({
    x: 500 - leaf.x,
    y: leaf.y,
    rot: -leaf.rot,
    scale: leaf.scale
  }));

  return (
    <svg 
      viewBox="0 0 500 520" 
      className={className} 
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Royal International School Crest Logo"
    >
      <defs>
        <path 
          id="shield-outer-path" 
          d="M 68,68 Q 250,38 432,68 C 438,105 442,165 438,285 C 430,378 250,490 250,490 C 250,490 70,378 62,285 C 58,165 62,105 68,68 Z" 
        />

        <clipPath id="shield-inner-clip">
          <path d="M 72,72 Q 250,42 428,72 C 434,108 438,165 434,282 C 426,372 250,482 250,482 C 250,482 74,372 66,282 C 62,165 66,108 72,72 Z" />
        </clipPath>

        <path 
          id="ribbon-text-path" 
          d="M 88,432 Q 250,352 412,432" 
        />
      </defs>

      {/* 1. Shield Outermost Red Line & Thin White Gap */}
      <use href="#shield-outer-path" fill="#FFFFFF" stroke="#CE1B28" strokeWidth="8" strokeLinejoin="round" />
      <path 
        d="M 64,64 Q 250,34 436,64 C 442,102 446,165 442,288 C 434,382 250,496 250,496 C 250,496 66,382 58,288 C 54,165 58,102 64,64 Z" 
        fill="none" 
        stroke="#CE1B28" 
        strokeWidth="3.5" 
        strokeLinejoin="round" 
      />

      {/* 2. Shield Body Content (Clipped) */}
      <g clipPath="url(#shield-inner-clip)">
        <rect x="0" y="0" width="250" height="520" fill="#1C75BC" />
        <rect x="250" y="0" width="250" height="520" fill="#FBB017" />
        <rect x="245.5" y="0" width="9" height="520" fill="#FFFFFF" />

        <path d="M 50,30 L 450,30 L 450,140 Q 250,122 50,140 Z" fill="#CE1B28" />
        <path d="M 50,140 Q 250,122 450,140" stroke="#FFFFFF" strokeWidth="5.5" fill="none" />

        <g transform="translate(126, 92) scale(1.15)">
          <path d="M 0,-10 L 2,-3 L 9,-9 L 3,-2 L 10,0 L 3,2 L 9,9 L 2,3 L 0,10 L -2,3 L -9,9 L -3,2 L -10,0 L -3,-2 L -9,-9 L -2,-3 Z" fill="#FFFFFF" />
        </g>

        <text 
          x="250" 
          y="105" 
          fill="#FFFFFF" 
          fontFamily="'Times New Roman', 'Georgia', serif" 
          fontWeight="bold" 
          fontSize="48" 
          textAnchor="middle" 
          letterSpacing="5"
        >
          ROYAL
        </text>

        <g transform="translate(374, 92) scale(1.15)">
          <path d="M 0,-10 L 2,-3 L 9,-9 L 3,-2 L 10,0 L 3,2 L 9,9 L 2,3 L 0,10 L -2,3 L -9,9 L -3,2 L -10,0 L -3,-2 L -9,-9 L -2,-3 Z" fill="#FFFFFF" />
        </g>
      </g>

      {/* 3. Laurel Wreath */}
      <path 
        d="M 235,368 C 160,358 116,280 126,200 C 130,170 148,145 174,136" 
        fill="none" 
        stroke="#FFFFFF" 
        strokeWidth="3.5" 
        strokeLinecap="round" 
      />

      <path 
        d="M 265,368 C 340,358 384,280 374,200 C 370,170 352,145 326,136" 
        fill="none" 
        stroke="#FFFFFF" 
        strokeWidth="3.5" 
        strokeLinecap="round" 
      />

      {leftLeaves.map((leaf, index) => (
        <path
          key={`l-leaf-${index}`}
          d="M 0,0 C -9,-11 -5,-23 0,-28 C 5,-23 9,-11 0,0 Z"
          fill="#FFFFFF"
          transform={`translate(${leaf.x}, ${leaf.y}) rotate(${leaf.rot}) scale(${leaf.scale})`}
        />
      ))}

      {rightLeaves.map((leaf, index) => (
        <path
          key={`r-leaf-${index}`}
          d="M 0,0 C -9,-11 -5,-23 0,-28 C 5,-23 9,-11 0,0 Z"
          fill="#FFFFFF"
          transform={`translate(${leaf.x}, ${leaf.y}) rotate(${leaf.rot}) scale(${leaf.scale})`}
        />
      ))}

      <g transform="translate(250, 370)">
        <circle cx="0" cy="0" r="3.5" fill="#CE1B28" />
        <circle cx="0" cy="-6" r="3" fill="#FFFFFF" />
        <circle cx="5.5" cy="-2" r="3" fill="#FFFFFF" />
        <circle cx="3.5" cy="5" r="3" fill="#FFFFFF" />
        <circle cx="-3.5" cy="5" r="3" fill="#FFFFFF" />
        <circle cx="-5.5" cy="-2" r="3" fill="#FFFFFF" />
      </g>

      {/* 4. Center Stylized Open Book */}
      <path 
        d="M 250,320 C 220,314 186,298 186,188 C 208,180 236,192 250,202 C 264,192 292,180 314,188 C 314,298 280,314 250,320 Z" 
        fill="none" 
        stroke="#FFFFFF" 
        strokeWidth="6" 
        strokeLinejoin="round" 
        strokeLinecap="round" 
      />

      <path 
        d="M 250,308 C 226,303 194,288 194,198 C 212,192 236,201 250,210" 
        fill="none" 
        stroke="#FFFFFF" 
        strokeWidth="3.5" 
        strokeLinejoin="round" 
      />
      <path 
        d="M 250,308 C 274,303 306,288 306,198 C 288,192 264,201 250,210" 
        fill="none" 
        stroke="#FFFFFF" 
        strokeWidth="3.5" 
        strokeLinejoin="round" 
      />

      <path 
        d="M 183,198 L 183,300 C 183,312 215,324 250,334 C 285,324 317,312 317,300 L 317,198" 
        fill="none" 
        stroke="#FFFFFF" 
        strokeWidth="4" 
        strokeLinejoin="round" 
      />

      {/* 5. Center Red Crown */}
      <g>
        <path 
          d="M 212,274 
             C 225,278 275,278 288,274 
             L 294,232 
             C 290,240 282,246 276,242 
             L 278,226 
             C 272,236 262,242 258,242 
             L 250,222 
             L 242,242 
             C 238,242 228,236 222,226 
             L 224,242 
             C 218,246 210,240 206,232 
             Z" 
          fill="#CE1B28" 
          stroke="#CE1B28" 
          strokeWidth="1.5" 
          strokeLinejoin="round" 
        />
        <path d="M 250,222 C 248,228 245,238 250,245 C 255,238 252,228 250,222 Z" fill="#CE1B28" />
        <path d="M 235,228 C 233,234 231,241 236,246 C 240,241 238,234 235,228 Z" fill="#CE1B28" />
        <path d="M 265,228 C 267,234 269,241 264,246 C 260,241 262,234 265,228 Z" fill="#CE1B28" />
        <path d="M 218,234 C 215,240 214,246 220,250 C 223,245 222,239 218,234 Z" fill="#CE1B28" />
        <path d="M 282,234 C 285,240 286,246 280,250 C 277,245 278,239 282,234 Z" fill="#CE1B28" />
      </g>

      {/* 6. Arched Golden Yellow Ribbon Banner */}
      <g>
        <path d="M 94,408 L 74,432 L 108,432 Z" fill="#B77800" />
        <path 
          d="M 76,430 L 18,446 L 50,470 L 15,488 L 84,458 Z" 
          fill="#FBB017" 
          stroke="#FFFFFF" 
          strokeWidth="2.5" 
          strokeLinejoin="round" 
        />

        <path d="M 406,408 L 426,432 L 392,432 Z" fill="#B77800" />
        <path 
          d="M 424,430 L 482,446 L 450,470 L 485,488 L 416,458 Z" 
          fill="#FBB017" 
          stroke="#FFFFFF" 
          strokeWidth="2.5" 
          strokeLinejoin="round" 
        />

        <path 
          d="M 76,430 Q 250,348 424,430 L 406,478 Q 250,400 94,478 Z" 
          fill="#FBB017" 
          stroke="#FFFFFF" 
          strokeWidth="3.5" 
          strokeLinejoin="round" 
        />

        <path 
          d="M 85,436 Q 250,358 415,436" 
          fill="none" 
          stroke="#DE9404" 
          strokeWidth="1.5" 
        />
        <path 
          d="M 101,470 Q 250,394 399,470" 
          fill="none" 
          stroke="#DE9404" 
          strokeWidth="1.5" 
        />

        <text 
          fill="#111827" 
          fontFamily="'Arial Black', 'Impact', sans-serif" 
          fontWeight="900" 
          fontSize="20.5" 
          letterSpacing="1.2"
        >
          <textPath href="#ribbon-text-path" startOffset="50%" textAnchor="middle">
            INTERNATIONAL SCHOOL
          </textPath>
        </text>
      </g>
    </svg>
  );
}
