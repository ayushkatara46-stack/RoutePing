'use client';

// =============================================
// Animated School Bus Component
// Custom SVG Vector School Bus driving Left to Right
// with spinning wheels, headlights glow, road markings, and suspension bounce
// =============================================

import { useState } from 'react';

export default function AnimatedSchoolBus() {
  const [honked, setHonked] = useState(false);

  const handleHonk = () => {
    setHonked(true);
    setTimeout(() => setHonked(false), 1500);
  };

  return (
    <div className="bus-animation-track" onClick={handleHonk} title="Click to honk! 🚌">
      {/* Moving Bus Container */}
      <div className={`driving-bus-container ${honked ? 'bus-turbo' : ''}`}>
        {/* Honk Speech Bubble */}
        {honked && <div className="bus-honk-bubble">📢 BEEP BEEP! 🚌</div>}

        {/* Headlight Beam shining forward */}
        <div className="bus-headlight-beam" />

        {/* Detailed SVG School Bus matching user reference */}
        <svg
          viewBox="0 0 320 160"
          className="school-bus-svg"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Body Yellow Gradient */}
            <linearGradient id="busBodyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FBBF24" />
              <stop offset="35%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#D97706" />
            </linearGradient>

            {/* Roof Highlight */}
            <linearGradient id="roofGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FDE68A" />
              <stop offset="100%" stopColor="#F59E0B" />
            </linearGradient>

            {/* Window Glass Gradient */}
            <linearGradient id="windowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#374151" />
              <stop offset="50%" stopColor="#1F2937" />
              <stop offset="100%" stopColor="#111827" />
            </linearGradient>

            {/* Window Glare Reflection */}
            <linearGradient id="glareGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.4)" />
              <stop offset="40%" stopColor="rgba(255,255,255,0.1)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0)" />
            </linearGradient>

            {/* Wheel Rim Gradient */}
            <radialGradient id="rimGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#9CA3AF" />
              <stop offset="50%" stopColor="#4B5563" />
              <stop offset="100%" stopColor="#1F2937" />
            </radialGradient>
          </defs>

          {/* Exhaust Smoke Clouds */}
          <g className="exhaust-puff">
            <circle cx="10" cy="125" r="4" fill="rgba(255,255,255,0.3)" />
            <circle cx="2" cy="122" r="6" fill="rgba(255,255,255,0.2)" />
            <circle cx="-8" cy="120" r="8" fill="rgba(255,255,255,0.1)" />
          </g>

          {/* Lower Chassis / Bumper Base */}
          <rect x="20" y="102" width="280" height="20" rx="4" fill="#374151" />
          <rect x="15" y="112" width="292" height="12" rx="3" fill="#1F2937" />

          {/* Main Bus Body */}
          <path
            d="M 25 105 
               L 25 32 
               C 25 20, 40 16, 60 16 
               L 235 16 
               C 255 16, 268 24, 275 38 
               L 282 62 
               C 285 64, 298 64, 305 75 
               C 310 82, 310 95, 306 105 
               Z"
            fill="url(#busBodyGrad)"
            stroke="#B45309"
            strokeWidth="1.5"
          />

          {/* Roof Cap */}
          <path
            d="M 28 22 C 35 16, 50 14, 70 14 L 235 14 C 255 14, 268 18, 274 24 Z"
            fill="url(#roofGrad)"
          />

          {/* Side Black Rub Rails (Iconic School Bus Lines) */}
          <rect x="25" y="65" width="238" height="4" rx="2" fill="#1F2937" />
          <rect x="25" y="100" width="270" height="5" rx="2.5" fill="#1F2937" />

          {/* Side Windows (4 Passenger Windows) */}
          <g>
            {/* Window 1 */}
            <rect x="36" y="28" width="34" height="32" rx="5" fill="url(#windowGrad)" stroke="#78350F" strokeWidth="2" />
            <path d="M 38 30 L 68 60 L 58 60 L 38 40 Z" fill="url(#glareGrad)" />

            {/* Window 2 */}
            <rect x="78" y="28" width="34" height="32" rx="5" fill="url(#windowGrad)" stroke="#78350F" strokeWidth="2" />
            <path d="M 80 30 L 110 60 L 100 60 L 80 40 Z" fill="url(#glareGrad)" />

            {/* Window 3 */}
            <rect x="120" y="28" width="34" height="32" rx="5" fill="url(#windowGrad)" stroke="#78350F" strokeWidth="2" />
            <path d="M 122 30 L 152 60 L 142 60 L 122 40 Z" fill="url(#glareGrad)" />

            {/* Window 4 */}
            <rect x="162" y="28" width="34" height="32" rx="5" fill="url(#windowGrad)" stroke="#78350F" strokeWidth="2" />
            <path d="M 164 30 L 194 60 L 184 60 L 164 40 Z" fill="url(#glareGrad)" />
          </g>

          {/* Front Windshield Window */}
          <path
            d="M 242 26 L 270 38 L 265 64 L 242 64 Z"
            fill="url(#windowGrad)"
            stroke="#78350F"
            strokeWidth="2"
          />
          <path d="M 244 28 L 268 40 L 260 62 Z" fill="url(#glareGrad)" />

          {/* Driver / Passenger Double Door */}
          <g>
            <rect x="204" y="26" width="32" height="85" rx="3" fill="#D97706" stroke="#78350F" strokeWidth="1.5" />
            {/* Door Glass Top */}
            <rect x="208" y="32" width="10" height="32" rx="2" fill="url(#windowGrad)" />
            <rect x="222" y="32" width="10" height="32" rx="2" fill="url(#windowGrad)" />
            {/* Door Glass Bottom */}
            <rect x="208" y="68" width="10" height="24" rx="2" fill="url(#windowGrad)" />
            <rect x="222" y="68" width="10" height="24" rx="2" fill="url(#windowGrad)" />
          </g>

          {/* Front Grille & Hood */}
          <path d="M 285 75 L 305 75 C 308 80, 308 88, 305 92 L 285 92 Z" fill="#374151" />
          <rect x="290" y="78" width="14" height="2" fill="#9CA3AF" />
          <rect x="290" y="82" width="14" height="2" fill="#9CA3AF" />
          <rect x="290" y="86" width="14" height="2" fill="#9CA3AF" />

          {/* Headlight (Glowing Orange / Gold) */}
          <rect x="298" y="93" width="10" height="8" rx="3" fill="#FDE047" stroke="#EA580C" strokeWidth="1" />
          <circle cx="303" cy="97" r="3" fill="#FEF08A" />

          {/* Tail Light (Red) */}
          <rect x="20" y="95" width="5" height="10" rx="2" fill="#EF4444" stroke="#991B1B" strokeWidth="1" />

          {/* RoutePing Name on Bus Side */}
          <text
            x="115"
            y="85"
            fill="#1F2937"
            fontSize="11"
            fontWeight="900"
            fontFamily="sans-serif"
            letterSpacing="2"
          >
            ROUTEPING
          </text>

          {/* Wheel Wells (Cutouts) */}
          <circle cx="75" cy="120" r="26" fill="#120F0B" />
          <circle cx="260" cy="120" r="26" fill="#120F0B" />

          {/* Back Wheel (Spinning) */}
          <g className="bus-wheel" style={{ transformOrigin: '75px 120px' }}>
            <circle cx="75" cy="120" r="23" fill="#1F2937" stroke="#374151" strokeWidth="4" />
            <circle cx="75" cy="120" r="14" fill="url(#rimGrad)" />
            <circle cx="75" cy="120" r="6" fill="#111827" />
            <circle cx="75" cy="120" r="2" fill="#9CA3AF" />
            {/* Wheel Spokes */}
            <line x1="75" y1="106" x2="75" y2="134" stroke="#D1D5DB" strokeWidth="1.5" />
            <line x1="61" y1="120" x2="89" y2="120" stroke="#D1D5DB" strokeWidth="1.5" />
          </g>

          {/* Front Wheel (Spinning) */}
          <g className="bus-wheel" style={{ transformOrigin: '260px 120px' }}>
            <circle cx="260" cy="120" r="23" fill="#1F2937" stroke="#374151" strokeWidth="4" />
            <circle cx="260" cy="120" r="14" fill="url(#rimGrad)" />
            <circle cx="260" cy="120" r="6" fill="#111827" />
            <circle cx="260" cy="120" r="2" fill="#9CA3AF" />
            {/* Wheel Spokes */}
            <line x1="260" y1="106" x2="260" y2="134" stroke="#D1D5DB" strokeWidth="1.5" />
            <line x1="246" y1="120" x2="274" y2="120" stroke="#D1D5DB" strokeWidth="1.5" />
          </g>
        </svg>
      </div>

      {/* Road / Asphalt Highway Line with animated dashed markings */}
      <div className="bus-road-surface">
        <div className="bus-road-line" />
      </div>
    </div>
  );
}
