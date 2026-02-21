
import React from 'react';

interface LogoProps {
  className?: string;
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = "w-12 h-12", showText = false }) => {
  return (
    <div className={`flex flex-col items-center justify-center ${showText ? 'gap-2' : ''}`}>
      <svg 
        viewBox="0 0 200 200" 
        className={className}
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Main 'M' Body */}
        <path 
          d="M60 140V70H90L100 90L110 70H140V140H120V95L105 125H95L80 95V140H60Z" 
          fill="#1F4D54" 
        />
        
        {/* The Swoosh/Path */}
        <path 
          d="M45 120C45 120 70 145 125 100C145 83.5 152 70 152 70" 
          stroke="#3498DB" 
          strokeWidth="6" 
          strokeLinecap="round"
        />
        
        {/* Arrowhead */}
        <path 
          d="M142 75L152 65L162 75" 
          stroke="#3498DB" 
          strokeWidth="6" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
        
        {/* Pixel bits at arrow tip */}
        <rect x="155" y="55" width="6" height="6" fill="#3498DB" />
        <rect x="163" y="63" width="6" height="6" fill="#3498DB" />
        <rect x="160" y="48" width="5" height="5" fill="#3498DB" opacity="0.6" />

        {/* The Leaf */}
        <path 
          d="M65 115C65 115 25 115 35 75C45 95 65 95 65 115Z" 
          fill="#8CC63F" 
        />
        <path 
          d="M40 85C50 95 60 105 65 115" 
          stroke="white" 
          strokeWidth="2" 
          strokeLinecap="round" 
          opacity="0.4"
        />
      </svg>
      {showText && (
        <span className="font-display font-bold text-3xl tracking-tight text-[#1F4D54]">
          MaVita
        </span>
      )}
    </div>
  );
};
