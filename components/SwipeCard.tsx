import React, { useState, useEffect, useRef } from 'react';
import { UserProfile } from '../types';
import { MapPin, Info, Heart, ShieldCheck, X, Ruler } from 'lucide-react';

interface SwipeCardProps {
  profile: UserProfile;
  onSwipe: (direction: 'left' | 'right') => void;
  onReport: (id: string) => void;
  onSettingsClick?: () => void;
}

export const SwipeCard: React.FC<SwipeCardProps> = ({ profile, onSwipe, onReport, onSettingsClick }) => {
  const [showInfo, setShowInfo] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isSwiping, setIsSwiping] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const startPos = useRef({ x: 0, y: 0 });

  const allImages = [profile.imageUrl, ...(profile.additionalImages || [])].filter(Boolean);

  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    setIsSwiping(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    startPos.current = { x: clientX, y: clientY };
  };

  const handleTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isSwiping) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setOffset({
      x: clientX - startPos.current.x,
      y: (clientY - startPos.current.y) * 0.05
    });
  };

  const handleTouchEnd = () => {
    if (!isSwiping) return;
    setIsSwiping(false);
    if (Math.abs(offset.x) > 100) {
      onSwipe(offset.x > 0 ? 'right' : 'left');
    }
    setOffset({ x: 0, y: 0 });
  };

  const handleImageTap = (e: React.MouseEvent) => {
    const { clientX, currentTarget } = e;
    const { left, width } = currentTarget.getBoundingClientRect();
    if (clientX - left < width / 2) {
      setActiveImageIndex(prev => Math.max(0, prev - 1));
    } else {
      setActiveImageIndex(prev => Math.min(allImages.length - 1, prev + 1));
    }
  };

  const rotation = offset.x / 20;
  const opacity = Math.max(0, 1 - Math.abs(offset.x) / 600);

  return (
    <div className="absolute inset-0 px-4 pt-2 pb-24 flex flex-col">
      <div 
        className="relative flex-1 rounded-[1.5rem] overflow-hidden transition-transform duration-100 ease-out cursor-grab active:cursor-grabbing select-none bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
        style={{ 
          transform: `translate(${offset.x}px, ${offset.y}px) rotate(${rotation}deg)`,
          opacity: opacity
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleTouchStart}
        onMouseMove={handleTouchMove}
        onMouseUp={handleTouchEnd}
        onMouseLeave={handleTouchEnd}
        onClick={handleImageTap}
      >
        <img 
          src={allImages[activeImageIndex]} 
          className="w-full h-full object-cover pointer-events-none transition-all duration-300"
        />
        
        {/* Rating Badge - Smaller and with new label */}
        <div className="absolute top-6 left-6 bg-[#ff4d00] text-black font-brand text-sm px-3 py-1.5 border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] rotate-[-3deg] z-20">
          RATE #{profile.selfRating}
        </div>

        {/* Progress Bar */}
        <div className="absolute top-3 left-6 right-6 flex gap-1.5 pointer-events-none z-10">
          {allImages.map((_, i) => (
            <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 border border-black ${i === activeImageIndex ? 'bg-white' : 'bg-white/20'}`} />
          ))}
        </div>

        {/* Bottom Shade */}
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

        {/* Profile Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-8 pb-14 space-y-8 pointer-events-none">
          <div className="flex items-end justify-between pointer-events-auto">
            <div className="space-y-1">
              <h3 className="text-4xl font-brand text-white flex items-center gap-3 tracking-tighter italic drop-shadow-[2px_2px_2px_rgba(0,0,0,1)] leading-none">
                {profile.name}, {profile.age}
                <ShieldCheck size={24} className="text-white" />
              </h3>
              <div className="flex items-center text-white font-brand uppercase gap-4 mt-2 tracking-widest text-[10px] drop-shadow-md">
                <span className="flex items-center gap-1.5"><MapPin size={12}/> {profile.location}</span>
                <span className="flex items-center gap-1.5"><Ruler size={12}/> {profile.height}</span>
              </div>
            </div>
            <button onClick={(e) => { e.stopPropagation(); setShowInfo(true); }} className="p-4 bg-white text-black rounded-xl border-4 border-black active:scale-90 transition shadow-xl">
              <Info size={28} />
            </button>
          </div>
          
          {/* Action Buttons */}
          <div className="flex justify-center items-center gap-12 pt-4 pointer-events-auto">
             <button onClick={(e) => { e.stopPropagation(); onSwipe('left'); }} className="w-18 h-18 rounded-2xl bg-white border-4 border-black flex items-center justify-center text-black active:scale-95 transition shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:bg-slate-50"><X size={40} strokeWidth={4} /></button>
             <button onClick={(e) => { e.stopPropagation(); onSwipe('right'); }} className="w-20 h-20 rounded-2xl bg-black border-4 border-white flex items-center justify-center text-white active:scale-95 transition shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"><Heart size={44} strokeWidth={4} fill="#ff4d00" className="drop-shadow-sm" /></button>
          </div>
        </div>

        {/* Detail Modal */}
        {showInfo && (
          <div className="absolute inset-0 z-50 bg-white p-8 overflow-y-auto no-scrollbar animate-in slide-in-from-bottom duration-400 border-t-8 border-black" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-10 border-b-4 border-black pb-4">
              <h4 className="text-4xl font-brand text-black uppercase italic tracking-tighter leading-none">THE REAL SCOOP</h4>
              <button onClick={() => setShowInfo(false)} className="bg-black text-white p-3 rounded-xl border-2 border-white shadow-lg"><X size={28} /></button>
            </div>
            <div className="space-y-10 pb-10">
              <div className="bg-white p-8 rounded-xl border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                <p className="text-black text-lg leading-relaxed italic font-bold">"{profile.bio}"</p>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-black text-white p-8 rounded-2xl border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,0.5)] flex flex-col items-center">
                  <h5 className="text-[10px] font-brand text-slate-400 uppercase mb-3">RATE #</h5>
                  <p className="text-5xl font-brand text-[#ff4d00]">{profile.selfRating}/10</p>
                </div>
                <div className="bg-white text-black p-8 rounded-2xl border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center">
                  <h5 className="text-[10px] font-brand text-slate-400 uppercase mb-3 text-center">LOOKING FOR</h5>
                  <p className="text-[10px] font-brand uppercase tracking-widest leading-tight text-center">{profile.lookingFor?.replace('-', ' ')}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3 pt-4 justify-center">
                {profile.interests.map(i => <span key={i} className="px-5 py-3 bg-white text-[11px] font-brand text-black uppercase rounded-xl border-4 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">{i}</span>)}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};