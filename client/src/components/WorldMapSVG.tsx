/**
 * 밝고 선명한 SVG 세계지도 컴포넌트
 */
export default function WorldMapSVG({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 1000 500"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ width: "100%", height: "100%" }}
    >
      <defs>
        <filter id="glow-strong" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur1" />
          <feGaussianBlur stdDeviation="6" result="blur2" />
          <feMerge><feMergeNode in="blur2" /><feMergeNode in="blur1" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="glow-soft" x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <radialGradient id="bg-grad" cx="50%" cy="50%" r="70%">
          <stop offset="0%" stopColor="#1a3a6e" />
          <stop offset="100%" stopColor="#0d1f3c" />
        </radialGradient>
      </defs>

      {/* 배경 */}
      <rect width="1000" height="500" fill="url(#bg-grad)" />

      {/* 격자선 */}
      {[100,200,300,400,500,600,700,800,900].map(x => (
        <line key={`v${x}`} x1={x} y1="0" x2={x} y2="500" stroke="#4a7ab5" strokeWidth="0.3" strokeOpacity="0.3" />
      ))}
      {[100,200,300,400].map(y => (
        <line key={`h${y}`} x1="0" y1={y} x2="1000" y2={y} stroke="#4a7ab5" strokeWidth="0.3" strokeOpacity="0.3" />
      ))}
      <line x1="0" y1="250" x2="1000" y2="250" stroke="#4a7ab5" strokeWidth="0.6" strokeOpacity="0.5" />

      {/* 북아메리카 */}
      <g filter="url(#glow-soft)">
        <path d="M 95 80 L 120 70 L 155 65 L 175 75 L 185 90 L 195 100 L 200 120 L 195 140 L 205 155 L 215 170 L 220 190 L 215 210 L 205 225 L 195 240 L 185 255 L 175 265 L 165 260 L 155 250 L 145 240 L 135 230 L 125 220 L 115 210 L 105 200 L 95 185 L 85 170 L 80 155 L 78 140 L 80 120 L 85 100 Z" fill="rgba(126,184,247,0.08)" stroke="#7eb8f7" strokeWidth="1.5" strokeOpacity="0.9" />
        <path d="M 95 80 L 110 60 L 130 50 L 155 45 L 175 55 L 185 70 L 175 75 L 155 65 L 120 70 Z" fill="none" stroke="#7eb8f7" strokeWidth="1" strokeOpacity="0.6" />
        <path d="M 185 255 L 190 270 L 185 280 L 178 270 L 180 255 Z" fill="none" stroke="#7eb8f7" strokeWidth="1" strokeOpacity="0.7" />
        <path d="M 115 265 L 130 275 L 145 285 L 140 300 L 125 295 L 110 280 Z" fill="none" stroke="#7eb8f7" strokeWidth="1" strokeOpacity="0.6" />
      </g>

      {/* 남아메리카 */}
      <g filter="url(#glow-soft)">
        <path d="M 185 295 L 200 285 L 220 285 L 235 295 L 245 315 L 250 335 L 248 360 L 240 385 L 228 405 L 215 415 L 205 410 L 195 395 L 188 375 L 182 355 L 180 330 L 182 310 Z" fill="rgba(126,184,247,0.08)" stroke="#7eb8f7" strokeWidth="1.5" strokeOpacity="0.9" />
      </g>

      {/* 유럽 */}
      <g filter="url(#glow-soft)">
        <path d="M 440 80 L 455 75 L 470 78 L 480 90 L 475 100 L 485 108 L 490 120 L 480 130 L 470 125 L 460 130 L 450 125 L 440 130 L 435 120 L 440 110 L 435 100 Z" fill="rgba(168,212,255,0.1)" stroke="#a8d4ff" strokeWidth="1.5" strokeOpacity="0.95" />
        <path d="M 430 130 L 445 135 L 450 150 L 440 158 L 428 150 L 425 138 Z" fill="none" stroke="#a8d4ff" strokeWidth="1.2" strokeOpacity="0.8" />
        <path d="M 468 130 L 472 145 L 475 160 L 470 170 L 465 160 L 463 145 Z" fill="none" stroke="#a8d4ff" strokeWidth="1" strokeOpacity="0.7" />
        <path d="M 455 75 L 462 60 L 472 55 L 478 65 L 470 78 Z" fill="none" stroke="#a8d4ff" strokeWidth="1" strokeOpacity="0.7" />
      </g>

      {/* 아프리카 */}
      <g filter="url(#glow-soft)">
        <path d="M 450 165 L 470 160 L 490 165 L 505 180 L 510 200 L 512 225 L 510 250 L 505 275 L 495 300 L 480 320 L 465 330 L 450 325 L 438 310 L 430 290 L 428 265 L 430 240 L 435 215 L 440 190 L 445 175 Z" fill="rgba(168,212,255,0.08)" stroke="#a8d4ff" strokeWidth="1.5" strokeOpacity="0.9" />
        <path d="M 518 270 L 522 285 L 520 300 L 515 295 L 514 278 Z" fill="none" stroke="#a8d4ff" strokeWidth="0.8" strokeOpacity="0.6" />
      </g>

      {/* 러시아 */}
      <g filter="url(#glow-soft)">
        <path d="M 490 60 L 530 50 L 580 45 L 630 48 L 670 55 L 700 65 L 720 75 L 710 90 L 690 95 L 660 90 L 630 88 L 600 85 L 570 82 L 540 80 L 510 78 L 490 75 Z" fill="rgba(168,212,255,0.08)" stroke="#a8d4ff" strokeWidth="1.2" strokeOpacity="0.8" />
      </g>

      {/* 중동/아라비아 */}
      <g filter="url(#glow-soft)">
        <path d="M 510 160 L 535 155 L 555 160 L 565 175 L 560 195 L 548 205 L 535 200 L 520 195 L 510 180 Z" fill="rgba(168,212,255,0.08)" stroke="#a8d4ff" strokeWidth="1.2" strokeOpacity="0.85" />
      </g>

      {/* 인도 */}
      <g filter="url(#glow-soft)">
        <path d="M 590 170 L 615 165 L 625 180 L 628 200 L 622 220 L 610 235 L 600 230 L 592 215 L 588 195 Z" fill="rgba(168,212,255,0.08)" stroke="#a8d4ff" strokeWidth="1.3" strokeOpacity="0.9" />
      </g>

      {/* 중국/동아시아 */}
      <g filter="url(#glow-soft)">
        <path d="M 650 95 L 690 90 L 720 95 L 740 110 L 745 130 L 738 148 L 720 155 L 700 150 L 680 145 L 660 140 L 645 125 L 642 108 Z" fill="rgba(168,212,255,0.1)" stroke="#a8d4ff" strokeWidth="1.5" strokeOpacity="0.95" />
        <path d="M 700 155 L 720 160 L 735 175 L 730 190 L 715 195 L 700 185 L 695 170 Z" fill="none" stroke="#a8d4ff" strokeWidth="1" strokeOpacity="0.75" />
      </g>

      {/* 한반도 (강조) */}
      <g filter="url(#glow-strong)">
        <path d="M 738 118 L 745 115 L 750 120 L 748 130 L 742 135 L 737 130 Z" fill="rgba(201,169,97,0.25)" stroke="#C9A961" strokeWidth="2" strokeOpacity="1" />
      </g>

      {/* 일본 (강조) */}
      <g filter="url(#glow-strong)">
        <path d="M 758 108 L 763 105 L 767 110 L 765 118 L 760 120 L 756 115 Z" fill="rgba(201,169,97,0.2)" stroke="#C9A961" strokeWidth="1.8" strokeOpacity="0.9" />
        <ellipse cx="762" cy="125" rx="3" ry="5" fill="none" stroke="#C9A961" strokeWidth="1.2" strokeOpacity="0.7" />
      </g>

      {/* 호주 */}
      <g filter="url(#glow-soft)">
        <path d="M 740 310 L 775 300 L 810 305 L 830 320 L 835 345 L 825 365 L 805 375 L 780 375 L 758 365 L 742 348 L 738 328 Z" fill="rgba(126,184,247,0.08)" stroke="#7eb8f7" strokeWidth="1.5" strokeOpacity="0.9" />
        <path d="M 850 360 L 855 375 L 852 388 L 847 382 L 846 368 Z" fill="none" stroke="#7eb8f7" strokeWidth="1" strokeOpacity="0.7" />
        <path d="M 853 345 L 858 355 L 855 362 L 850 357 L 851 347 Z" fill="none" stroke="#7eb8f7" strokeWidth="0.8" strokeOpacity="0.6" />
      </g>

      {/* 연결선 */}
      <g opacity="0.35">
        <path d="M 742 122 Q 752 110 762 112" fill="none" stroke="#C9A961" strokeWidth="0.8" strokeDasharray="3,2" />
        <path d="M 742 122 Q 720 115 700 122" fill="none" stroke="#C9A961" strokeWidth="0.8" strokeDasharray="3,2" />
        <path d="M 742 122 Q 600 60 175 200" fill="none" stroke="#C9A961" strokeWidth="0.6" strokeDasharray="4,3" />
        <path d="M 742 122 Q 600 80 465 95" fill="none" stroke="#7eb8f7" strokeWidth="0.6" strokeDasharray="4,3" />
        <path d="M 742 122 Q 650 150 540 178" fill="none" stroke="#7eb8f7" strokeWidth="0.6" strokeDasharray="4,3" />
        <path d="M 175 200 Q 320 120 465 95" fill="none" stroke="#7eb8f7" strokeWidth="0.6" strokeDasharray="4,3" />
        <path d="M 465 95 Q 500 140 540 178" fill="none" stroke="#7eb8f7" strokeWidth="0.5" strokeDasharray="4,3" />
        <path d="M 540 178 Q 570 185 605 200" fill="none" stroke="#7eb8f7" strokeWidth="0.5" strokeDasharray="3,2" />
        <path d="M 742 122 Q 780 230 785 340" fill="none" stroke="#7eb8f7" strokeWidth="0.5" strokeDasharray="4,3" />
        <path d="M 175 200 Q 200 280 215 350" fill="none" stroke="#7eb8f7" strokeWidth="0.5" strokeDasharray="4,3" />
      </g>

      {/* 도시 광점 */}
      <g filter="url(#glow-strong)">
        <circle cx="742" cy="122" r="4" fill="#C9A961" opacity="0.9" />
        <circle cx="742" cy="122" r="8" fill="none" stroke="#C9A961" strokeWidth="1" opacity="0.5" />
        <circle cx="762" cy="112" r="3.5" fill="#C9A961" opacity="0.85" />
        <circle cx="762" cy="112" r="7" fill="none" stroke="#C9A961" strokeWidth="0.8" opacity="0.4" />
        <circle cx="175" cy="200" r="3.5" fill="#7eb8f7" opacity="0.85" />
        <circle cx="175" cy="200" r="7" fill="none" stroke="#7eb8f7" strokeWidth="0.8" opacity="0.4" />
        <circle cx="465" cy="95" r="3" fill="#7eb8f7" opacity="0.8" />
        <circle cx="465" cy="95" r="6" fill="none" stroke="#7eb8f7" strokeWidth="0.7" opacity="0.35" />
        <circle cx="540" cy="178" r="3" fill="#7eb8f7" opacity="0.8" />
        <circle cx="605" cy="200" r="3" fill="#7eb8f7" opacity="0.75" />
        <circle cx="215" cy="350" r="3" fill="#7eb8f7" opacity="0.75" />
        <circle cx="785" cy="340" r="3" fill="#7eb8f7" opacity="0.75" />
        <circle cx="700" cy="122" r="3" fill="#7eb8f7" opacity="0.75" />
        <circle cx="530" cy="78" r="2.5" fill="#7eb8f7" opacity="0.7" />
      </g>

      {/* 도시 레이블 */}
      <g fontSize="9" fontFamily="Inter, sans-serif" fill="#a8d4ff" opacity="0.75">
        <text x="748" y="135">SEOUL</text>
        <text x="766" y="108">TOKYO</text>
        <text x="150" y="215">NEW YORK</text>
        <text x="468" y="90">LONDON</text>
        <text x="543" y="192">DUBAI</text>
        <text x="607" y="214">MUMBAI</text>
        <text x="790" y="355">SYDNEY</text>
        <text x="700" y="138">BEIJING</text>
      </g>
    </svg>
  );
}
