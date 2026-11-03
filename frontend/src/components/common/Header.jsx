import React from 'react';
import { Link } from 'react-router-dom';
import headerImage from '../../assets/images/header.png';

/**
 * IIIT Bhagalpur Circular Crest / Seal (Vector SVG)
 */
const IIITBhagalpurSeal = ({ className = 'w-20 h-20 sm:w-24 sm:h-24' }) => (
  <svg
    viewBox="0 0 200 200"
    className={`flex-shrink-0 ${className}`}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-label="IIIT Bhagalpur Seal"
    role="img"
  >
    {/* Outer Gold Border */}
    <circle cx="100" cy="100" r="96" fill="#081D35" stroke="#F59E0B" strokeWidth="4" />
    <circle cx="100" cy="100" r="90" fill="none" stroke="#D97706" strokeWidth="1" strokeDasharray="3 3" />

    {/* Inner Navy Background */}
    <circle cx="100" cy="100" r="74" fill="#0B2545" stroke="#F59E0B" strokeWidth="2" />

    {/* Circular Text Arcs */}
    {/* Top Arc: IIIT BHAGALPUR */}
    <path id="topSealArc" d="M 28 100 A 72 72 0 0 1 172 100" fill="none" />
    <text fill="#FFFFFF" fontSize="13.5" fontWeight="bold" letterSpacing="2.5">
      <textPath href="#topSealArc" startOffset="50%" textAnchor="middle">
        IIIT BHAGALPUR
      </textPath>
    </text>

    {/* Bottom Arc: विद्या ददाति विनयं */}
    <path id="bottomSealArc" d="M 172 100 A 72 72 0 0 1 28 100" fill="none" />
    <text fill="#F59E0B" fontSize="12" fontWeight="600" letterSpacing="1.2">
      <textPath href="#bottomSealArc" startOffset="50%" textAnchor="middle">
        विद्या ददाति विनयं
      </textPath>
    </text>

    {/* Central Crest Core: Flame / Book / Circuit / River Silk */}
    {/* Base Pedestal / Book */}
    <path
      d="M72 136 L100 128 L128 136 L128 131 L100 123 L72 131 Z"
      fill="#F59E0B"
    />
    <path
      d="M74 130 C86 122 96 124 100 127 C104 124 114 122 126 130 C120 121 110 120 100 122 C90 120 80 121 74 130 Z"
      fill="#FFFFFF"
    />

    {/* Circuit Network & Technology Nodes */}
    <path
      d="M78 112 L92 112 L100 100 L108 112 L122 112"
      stroke="#F59E0B"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <circle cx="78" cy="112" r="3" fill="#F59E0B" />
    <circle cx="122" cy="112" r="3" fill="#F59E0B" />
    <circle cx="100" cy="100" r="3" fill="#F59E0B" />

    {/* Upward Rising Flame / Torch of Wisdom */}
    <path
      d="M100 68 C105 78 112 86 112 96 C112 103 107 108 100 108 C93 108 88 103 88 96 C88 86 95 78 100 68 Z"
      fill="url(#sealFlameGradient)"
    />
    <path
      d="M100 78 C102 84 107 89 107 95 C107 99 104 102 100 102 C96 102 93 99 93 95 C93 89 98 84 100 78 Z"
      fill="#F59E0B"
    />

    {/* Tiny Star Accents */}
    <polygon points="100,56 102,61 107,61 103,64 105,69 100,66 95,69 97,64 93,61 98,61" fill="#F59E0B" />

    <defs>
      <linearGradient id="sealFlameGradient" x1="100" y1="68" x2="100" y2="108" gradientUnits="userSpaceOnUse">
        <stop stopColor="#F59E0B" />
        <stop offset="1" stopColor="#DC2626" />
      </linearGradient>
    </defs>
  </svg>
);

/**
 * Azadi Ka Amrit Mahotsav Official Emblem (Vector SVG)
 */
const AzadiMahotsavLogo = ({ className = 'w-24 h-16 sm:w-32 sm:h-20' }) => (
  <svg
    viewBox="0 0 160 100"
    className={`flex-shrink-0 ${className}`}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-label="Azadi Ka Amrit Mahotsav Logo"
    role="img"
  >
    {/* Tri-color Swooshes */}
    {/* Saffron Ribbon */}
    <path
      d="M20 72 C35 30 75 22 135 24 C100 32 60 38 42 74 Z"
      fill="#FF9933"
    />
    {/* White / Light Gray Separation Ribbon */}
    <path
      d="M22 75 C38 40 78 32 135 33 C102 40 64 45 44 77 Z"
      fill="#E2E8F0"
    />
    {/* Green Ribbon */}
    <path
      d="M24 78 C42 48 80 41 138 42 C105 48 68 53 46 80 Z"
      fill="#138808"
    />

    {/* Bold Number "75" */}
    <text
      x="80"
      y="74"
      fill="#0B2545"
      fontSize="42"
      fontWeight="900"
      fontFamily="system-ui, sans-serif"
      letterSpacing="-2"
    >
      75
    </text>

    {/* Ashoka Chakra Mini Emblem */}
    <circle cx="124" cy="56" r="10" stroke="#000080" strokeWidth="1.5" fill="#FFFFFF" />
    <circle cx="124" cy="56" r="2" fill="#000080" />
    {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
      <line
        key={deg}
        x1="124"
        y1="56"
        x2={124 + 9 * Math.cos((deg * Math.PI) / 180)}
        y2={56 + 9 * Math.sin((deg * Math.PI) / 180)}
        stroke="#000080"
        strokeWidth="0.75"
      />
    ))}

    {/* Bilingual Typography */}
    <text
      x="80"
      y="84"
      fill="#B45309"
      fontSize="8.5"
      fontWeight="bold"
      letterSpacing="0.2"
    >
      आज़ादी का अमृत महोत्सव
    </text>
    <text
      x="80"
      y="94"
      fill="#475569"
      fontSize="7"
      fontWeight="600"
      letterSpacing="0.4"
    >
      Azadi Ka Amrit Mahotsav
    </text>
  </svg>
);

/**
 * Header Component
 * Official institutional header displaying the provided header banner image
 * containing the IIIT Bhagalpur seal, bilingual identity, and Azadi Ka Amrit Mahotsav logo.
 */
const Header = () => {
  return (
    <header className="w-full bg-white shadow-sm select-none border-b border-slate-200">
      <div className="w-full max-w-[1920px] mx-auto">
        <Link to="/" className="block w-full focus:outline-none" title="IIIT Bhagalpur Curriculum Portal">
          <img
            src={headerImage}
            alt="Indian Institute of Information Technology Bhagalpur - Academic Curriculum Portal"
            className="w-full h-auto block"
          />
        </Link>
      </div>
    </header>
  );
};

export default Header;
export { IIITBhagalpurSeal, AzadiMahotsavLogo };
