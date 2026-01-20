import React from 'react';

export const Logo: React.FC<{ size?: number; className?: string }> = ({ size = 24, className = "" }) => {
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <div 
        className="font-brand leading-none flex items-center" 
        style={{ fontSize: `${size}px` }}
      >
        <span 
          className="text-white bg-black px-2 py-1 rounded-l-md border-y-2 border-l-2 border-black"
          style={{ 
            textShadow: '2px 2px 0px rgba(0,0,0,0.5)',
          }}
        >
          TRU
        </span>
        <span 
          className="text-[#ff4d00] bg-white px-2 py-1 rounded-r-md border-2 border-black -ml-1"
          style={{ 
            WebkitTextStroke: '1.5px black',
          }}
        >
          MINGLE
        </span>
      </div>
    </div>
  );
};