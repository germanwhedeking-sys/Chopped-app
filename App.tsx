import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, AppView, Match, Message } from './types';
import { MOCK_PROFILES } from './constants';
import { Onboarding } from './components/Onboarding';
import { SwipeCard } from './components/SwipeCard';
import { Logo } from './components/Logo';
import { 
  Heart, 
  Search, 
  User as UserIcon, 
  Flame,
  Settings as SettingsIcon,
  ChevronRight,
  X,
  MessageCircle,
  Edit2,
  Sparkles,
  Loader2,
  Send,
  MoreVertical,
  ArrowLeft,
  Bell,
  Lock,
  FileText,
  Plus,
  Smile,
  Flag,
  UserX,
  Ban,
  Ruler,
  ShieldCheck,
  Image as ImageIcon,
  ExternalLink,
  LogOut,
  ChevronDown
} from 'lucide-react';

const Toggle: React.FC<{ enabled: boolean; onToggle: () => void }> = ({ enabled, onToggle }) => (
  <button 
    onClick={onToggle}
    className={`w-10 h-5 rounded-full transition-colors duration-300 relative border-2 border-black ${enabled ? 'bg-black' : 'bg-white'}`}
  >
    <div className={`absolute top-0.5 w-3 h-3 rounded-full transition-all duration-300 ${enabled ? 'left-5.5 bg-white' : 'left-0.5 bg-black'}`} />
  </button>
);

const SplashScreen: React.FC = () => (
  <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-white">
    <div className="mesh-bg"></div>
    <div className="flex flex-col items-center gap-6">
      <Logo size={42} />
      <div className="flex items-center gap-2 text-black font-brand text-[10px] uppercase tracking-[0.3em]">
        <Loader2 className="animate-spin" size={12} /> AUTHENTICATING...
      </div>
    </div>
  </div>
);

const MatchOverlay: React.FC<{ match: Match; user: UserProfile; onClose: (startChat: boolean) => void }> = ({ match, user, onClose }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-500">
      <div className="absolute inset-0 bg-black/95 backdrop-blur-md" />
      <div className="relative w-full max-sm bg-white border-4 border-black p-10 rounded-3xl shadow-[12px_12px_0px_0px_rgba(255,77,0,1)] flex flex-col items-center animate-match-shake">
        <div className="absolute -top-12 animate-heart-burst">
          <Heart className="text-[#ff4d00]" size={120} fill="#ff4d00" />
        </div>
        <h2 className="text-4xl font-brand text-black text-center tracking-tighter uppercase italic mb-10 leading-none mt-4">IT'S TRU!</h2>
        <div className="flex items-center gap-6 mb-12">
          <div className="relative group">
            <img src={user.imageUrl} className="w-24 h-24 rounded-xl border-4 border-black object-cover shadow-lg" />
            <div className="absolute -bottom-2 -left-2 bg-black text-white font-brand text-[9px] px-2 py-1 border-2 border-white">RATE #{user.selfRating}</div>
          </div>
          <Flame className="text-[#ff4d00] animate-pulse" size={32} />
          <div className="relative group">
            <img src={match.profile.imageUrl} className="w-24 h-24 rounded-xl border-4 border-black object-cover shadow-lg" />
            <div className="absolute -bottom-2 -right-2 bg-white text-black font-brand text-[9px] px-2 py-1 border-2 border-black">RATE #{match.profile.selfRating}</div>
          </div>
        </div>
        <p className="text-[10px] font-brand text-slate-400 uppercase tracking-widest text-center mb-8 px-4">Matched based on Location & Reality Scores.</p>
        <div className="w-full space-y-3">
          <button onClick={() => onClose(true)} className="w-full bg-black text-white font-brand py-5 rounded-xl active:scale-95 transition text-[11px] tracking-widest uppercase border-4 border-black shadow-xl">Start Mingling</button>
          <button onClick={() => onClose(false)} className="w-full bg-white text-black font-brand py-4 rounded-xl active:scale-95 transition border-4 border-black text-[9px] tracking-widest uppercase shadow-md">Keep Looking</button>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('trumingle_v7_profile');
    return saved ? JSON.parse(saved) : null;
  });
  const [view, setView] = useState<AppView>(userProfile ? 'discovery' : 'onboarding');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [matches, setMatches] = useState<Match[]>(() => {
    const saved = localStorage.getItem('trumingle_v7_matches');
    return saved ? JSON.parse(saved) : [];
  });
  const [chatMessages, setChatMessages] = useState<Record<string, Message[]>>(() => {
    const saved = localStorage.getItem('trumingle_v7_messages');
    return saved ? JSON.parse(saved) : {};
  });
  const [likesYou, setLikesYou] = useState<UserProfile[]>(MOCK_PROFILES.slice(1, 3));
  const [activeMatch, setActiveMatch] = useState<Match | null>(null);
  const [reportedIds, setReportedIds] = useState<string[]>([]);
  const [latestMatch, setLatestMatch] = useState<Match | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [showMatchProfile, setShowMatchProfile] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  
  // Chat feature states
  const [activePicker, setActivePicker] = useState<'emoji' | 'gif' | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Scroll behavior for nav
  const [isNavVisible, setIsNavVisible] = useState(true);
  const lastScrollY = useRef(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const [settings, setSettings] = useState({ notifications: true, discovery: true });
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (userProfile) localStorage.setItem('trumingle_v7_profile', JSON.stringify(userProfile));
  }, [userProfile]);

  useEffect(() => {
    localStorage.setItem('trumingle_v7_matches', JSON.stringify(matches));
    localStorage.setItem('trumingle_v7_messages', JSON.stringify(chatMessages));
  }, [matches, chatMessages]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, activeMatch]);

  // Hide nav on scroll behavior (especially for profile tab)
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const currentScrollY = e.currentTarget.scrollTop;
    if (currentScrollY > lastScrollY.current && currentScrollY > 50) {
      setIsNavVisible(false);
    } else {
      setIsNavVisible(true);
    }
    lastScrollY.current = currentScrollY;
  };

  const handleOnboardingComplete = (profile: UserProfile) => {
    setShowSplash(true);
    setTimeout(() => {
      setUserProfile(profile);
      setView('discovery');
      setShowSplash(false);
    }, 1500);
  };

  const handleSwipe = (direction: 'left' | 'right') => {
    if (direction === 'right') {
      const matchChance = 0.5;
      if (Math.random() < matchChance) {
        const newMatch: Match = { id: Date.now().toString(), userId: currentProfile.id, profile: currentProfile };
        setMatches(prev => [...prev, newMatch]);
        setTimeout(() => setLatestMatch(newMatch), 100);
      }
    }
    setCurrentIndex(prev => prev + 1);
  };

  const handleSafetyAction = (action: string) => {
    if (!activeMatch) return;
    if (action === 'unmatch' || action === 'block') {
      setMatches(prev => prev.filter(m => m.id !== activeMatch.id));
      setView('matches');
      setActiveMatch(null);
    }
    setShowMenu(false);
  };

  const filteredProfiles = MOCK_PROFILES.filter(p => {
    if (reportedIds.includes(p.id)) return false;
    if (userProfile) {
      const diff = Math.abs(p.selfRating - userProfile.selfRating);
      if (userProfile.selfRating >= 9 && p.selfRating > 7) return false;
      return diff <= 3;
    }
    return true;
  });

  const currentProfile = filteredProfiles.length > 0 
    ? filteredProfiles[currentIndex % filteredProfiles.length]
    : MOCK_PROFILES[currentIndex % MOCK_PROFILES.length];

  const handleSendMessage = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newMessage.trim() || !activeMatch) return;
    const msg: Message = { id: Date.now().toString(), senderId: userProfile!.id, text: newMessage, timestamp: Date.now() };
    setChatMessages(prev => ({ ...prev, [activeMatch.id]: [...(prev[activeMatch.id] || []), msg] }));
    setNewMessage('');
    setActivePicker(null);
    
    setTimeout(() => {
      const reply: Message = { id: Date.now().toString(), senderId: activeMatch.userId, text: "Truly love your energy. Let's keep it real.", timestamp: Date.now() };
      setChatMessages(prev => ({ ...prev, [activeMatch.id]: [...(prev[activeMatch.id] || []), reply] }));
    }, 1500);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setNewMessage(prev => prev + " [Image Uploaded] ");
      handleSendMessage();
    }
  };

  if (showSplash) return <SplashScreen />;
  if (!userProfile) return <Onboarding onComplete={handleOnboardingComplete} />;

  return (
    <div className="flex flex-col h-screen bg-white max-w-md mx-auto relative overflow-hidden font-sans border-x-4 border-black">
      {latestMatch && <MatchOverlay match={latestMatch} user={userProfile} onClose={(chat) => { const m = latestMatch; setLatestMatch(null); if (chat) { setActiveMatch(m); setView('chat'); } else setView('discovery'); }} />}

      <header className={`px-6 py-4 flex justify-between items-center z-30 bg-white border-b-4 border-black ${view === 'chat' || view === 'onboarding' ? 'hidden' : ''}`}>
        <Logo size={28} />
        <button onClick={() => setView('settings')} className="w-10 h-10 flex items-center justify-center bg-black rounded-lg text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,0.5)] active:scale-95 transition border border-white">
          <SettingsIcon size={20} />
        </button>
      </header>

      <main className={`flex-1 relative z-10 overflow-hidden ${view === 'chat' ? 'pb-0' : 'pb-14'}`}>
        {view === 'discovery' && currentProfile && (
          <SwipeCard profile={currentProfile} onSwipe={handleSwipe} onReport={(id) => setReportedIds(prev => [...prev, id])} />
        )}

        {view === 'likes-you' && (
          <div className="p-6 space-y-8 animate-in fade-in duration-500 overflow-y-auto no-scrollbar h-full bg-white">
            <h2 className="text-3xl font-brand text-black uppercase italic tracking-tighter">THE REAL LIST</h2>
            <div className="grid grid-cols-2 gap-5">
              {likesYou.map(p => (
                <div key={p.id} className="relative aspect-[3/4] rounded-2xl overflow-hidden border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-slate-50">
                  <img src={p.imageUrl} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-black/40 backdrop-blur-[1px]">
                    <p className="text-[12px] font-brand text-white bg-[#ff4d00] border-2 border-black px-3 py-2 rotate-[-4deg] shadow-lg">RATE #{p.selfRating}</p>
                    <p className="text-[10px] font-brand text-black bg-white px-2 mt-2 uppercase border-2 border-black">Request</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {view === 'matches' && (
          <div className="flex flex-col h-full bg-white">
            <div className="p-6 space-y-6 flex-1 overflow-y-auto no-scrollbar">
              <h2 className="text-3xl font-brand text-black uppercase italic tracking-tighter">TRU CHOPS</h2>
              <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4">
                {matches.filter(m => !(chatMessages[m.id]?.length > 0)).map(m => (
                  <button key={m.id} onClick={() => { setActiveMatch(m); setView('chat'); }} className="flex-shrink-0 w-24 space-y-2 text-center group">
                    <div className="w-24 h-24 rounded-full border-4 border-black p-0.5 relative transition-transform group-active:scale-95 overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                      <img src={m.profile.imageUrl} className="w-full h-full rounded-full object-cover" />
                      <div className="absolute bottom-0 right-0 bg-black text-white font-brand text-[8px] border-2 border-white px-1.5 py-0.5 rounded-tl-xl">#{m.profile.selfRating}</div>
                    </div>
                    <p className="text-[10px] font-brand text-black uppercase italic truncate pt-1">{m.profile.name}</p>
                  </button>
                ))}
              </div>

              <h2 className="text-3xl font-brand text-black uppercase italic tracking-tighter mt-4">MESSAGES</h2>
              <div className="space-y-4 pb-8">
                {matches.filter(m => chatMessages[m.id]?.length > 0).map(m => {
                  const lastMsg = chatMessages[m.id][chatMessages[m.id].length - 1];
                  return (
                    <button 
                      key={m.id} 
                      onClick={() => { setActiveMatch(m); setView('chat'); }} 
                      className="w-full flex items-center gap-4 p-4 bg-white rounded-xl border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:scale-[0.98] transition text-left relative overflow-hidden"
                    >
                      <img src={m.profile.imageUrl} className="w-16 h-16 rounded-lg object-cover border-2 border-black" />
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <h4 className="font-brand text-[13px] text-black uppercase italic">{m.profile.name}</h4>
                          <span className="font-brand text-[8px] text-white bg-black px-2 py-0.5 rounded-full border border-white">RATE #{m.profile.selfRating}</span>
                        </div>
                        <p className="text-[11px] text-slate-600 line-clamp-1 italic">{lastMsg.senderId === userProfile.id ? 'You: ' : ''}{lastMsg.text}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {view === 'profile' && (
          <div 
            ref={scrollRef}
            onScroll={handleScroll}
            className="p-8 space-y-12 text-center overflow-y-auto no-scrollbar h-full bg-white pb-24"
          >
             <div className="relative inline-block mt-4">
                <img src={userProfile.imageUrl} className="w-56 h-56 rounded-3xl border-4 border-black object-cover shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]" />
                <button className="absolute -bottom-4 -right-4 bg-black text-white p-4 rounded-xl border-2 border-white shadow-xl active:scale-90 transition"><Edit2 size={24}/></button>
                <div className="absolute -top-4 -left-4 bg-[#ff4d00] text-black font-brand text-2xl px-5 py-2 border-4 border-black shadow-xl">RATE #{userProfile.selfRating}</div>
              </div>
              <div className="space-y-2">
                <h2 className="text-4xl font-brand text-black uppercase tracking-tighter italic">{userProfile.name}, {userProfile.age}</h2>
                <p className="text-[10px] font-brand text-slate-400 uppercase tracking-widest">{userProfile.location}</p>
              </div>
              <div className="flex justify-center gap-4">
                <span className="px-6 py-3 bg-white border-4 border-black rounded-xl text-xs font-brand text-black uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">{userProfile.height}</span>
                <span className="px-6 py-3 bg-black border-4 border-black rounded-xl text-xs font-brand text-white uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">{userProfile.lookingFor?.replace('-', ' ')}</span>
              </div>
              <div className="bg-white p-8 rounded-2xl border-4 border-black text-left shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <p className="text-black text-base leading-relaxed italic font-bold">"{userProfile.bio}"</p>
              </div>
              {/* Extra content to ensure scrollability */}
              <div className="space-y-4 pt-4">
                <h4 className="font-brand text-black text-left uppercase text-sm border-b-2 border-black pb-1">Interests</h4>
                <div className="flex flex-wrap gap-2">
                  {userProfile.interests.map(i => <span key={i} className="px-3 py-1.5 border-2 border-black font-brand text-[9px] uppercase">{i}</span>)}
                  {userProfile.interests.length === 0 && <span className="text-slate-400 text-[10px] italic">No interests listed.</span>}
                </div>
              </div>
              <div className="h-12" />
          </div>
        )}

        {view === 'chat' && activeMatch && (
          <div className="h-full flex flex-col bg-white">
            <div className="px-6 py-5 border-b-4 border-black flex items-center gap-5 bg-white">
              <button onClick={() => setView('matches')} className="text-black p-2 -ml-2 hover:bg-slate-100 transition rounded-lg"><ArrowLeft size={28} /></button>
              <div className="flex items-center gap-4 flex-1 cursor-pointer" onClick={() => setShowMatchProfile(true)}>
                <div className="relative">
                  <img src={activeMatch.profile.imageUrl} className="w-12 h-12 rounded-lg object-cover border-2 border-black" />
                  <div className="absolute -top-2 -right-2 bg-[#ff4d00] text-black font-brand text-[7px] px-1 border border-black rounded shadow-sm">#{activeMatch.profile.selfRating}</div>
                </div>
                <div className="flex-1">
                  <h3 className="font-brand text-[15px] text-black uppercase italic truncate">{activeMatch.profile.name}</h3>
                  <p className="text-[9px] font-brand text-slate-400 uppercase tracking-widest">Dossier Details <ChevronDown size={10}/></p>
                </div>
              </div>
              <div className="relative">
                <button onClick={() => setShowMenu(!showMenu)} className="text-black hover:bg-slate-50 transition rounded-lg p-1 border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"><MoreVertical size={24}/></button>
                {showMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border-4 border-black rounded-xl shadow-2xl py-2 z-[70] animate-in fade-in zoom-in duration-200">
                    <button onClick={() => handleSafetyAction('report')} className="w-full px-4 py-3 text-left flex items-center gap-3 text-black hover:bg-slate-100 transition font-bold uppercase text-xs">Report</button>
                    <button onClick={() => handleSafetyAction('unmatch')} className="w-full px-4 py-3 text-left flex items-center gap-3 text-black hover:bg-slate-100 transition font-bold uppercase text-xs border-y-2 border-black">Unmatch</button>
                    <button onClick={() => handleSafetyAction('block')} className="w-full px-4 py-3 text-left flex items-center gap-3 text-white bg-black hover:opacity-80 transition font-bold uppercase text-xs">Block</button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1 p-6 space-y-6 overflow-y-auto no-scrollbar scroll-smooth">
              {(chatMessages[activeMatch.id] || []).map(msg => (
                <div key={msg.id} className={`flex ${msg.senderId === userProfile.id ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-4 rounded-xl text-[14px] font-bold border-4 border-black ${msg.senderId === userProfile.id ? 'bg-black text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]' : 'bg-white text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'}`}>{msg.text}</div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="p-4 border-t-4 border-black bg-white space-y-4 relative">
              {activePicker === 'emoji' && (
                <div className="absolute bottom-full left-0 right-0 p-4 bg-white border-t-4 border-black grid grid-cols-6 gap-2 shadow-xl animate-in slide-in-from-bottom">
                  {['🔥', '❤️', '👋', '😅', '🤔', '👀', '💯', '✨', '🙌', '🍔', '🍺', '🛹'].map(e => (
                    <button key={e} type="button" onClick={() => setNewMessage(p => p + e)} className="text-2xl hover:scale-125 transition active:scale-95">{e}</button>
                  ))}
                  <button onClick={() => setActivePicker(null)} className="absolute top-2 right-2 p-1"><X size={14}/></button>
                </div>
              )}
              {activePicker === 'gif' && (
                <div className="absolute bottom-full left-0 right-0 p-4 bg-white border-t-4 border-black grid grid-cols-2 gap-2 shadow-xl animate-in slide-in-from-bottom">
                  <div className="aspect-video bg-slate-100 border-2 border-black flex items-center justify-center font-brand text-[8px] cursor-pointer hover:bg-slate-200" onClick={() => { setNewMessage(p => p + " [GIF] "); handleSendMessage(); }}>Meme 1</div>
                  <div className="aspect-video bg-slate-100 border-2 border-black flex items-center justify-center font-brand text-[8px] cursor-pointer hover:bg-slate-200" onClick={() => { setNewMessage(p => p + " [GIF] "); handleSendMessage(); }}>Meme 2</div>
                  <button onClick={() => setActivePicker(null)} className="absolute top-2 right-2 p-1"><X size={14}/></button>
                </div>
              )}
              
              <div className="flex items-center gap-6 px-2">
                <button type="button" onClick={() => fileInputRef.current?.click()} className="text-black hover:scale-125 transition active:scale-90"><Plus size={24} strokeWidth={3} /></button>
                <input type="file" ref={fileInputRef} className="hidden" onChange={handleImageUpload} accept="image/*" />
                <button type="button" onClick={() => setActivePicker(prev => prev === 'emoji' ? null : 'emoji')} className="text-black hover:scale-125 transition active:scale-90"><Smile size={24} strokeWidth={3} /></button>
                <button type="button" onClick={() => setActivePicker(prev => prev === 'gif' ? null : 'gif')} className="text-[12px] font-brand text-black hover:scale-110 transition tracking-widest border-2 border-black px-2 py-1 rounded bg-slate-50 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">GIF</button>
              </div>
              <div className="flex gap-2 pb-2">
                <input type="text" placeholder="Be yourself..." className="flex-1 bg-white border-4 border-black rounded-xl px-5 py-4 text-black text-[14px] outline-none font-bold placeholder-slate-300 shadow-inner" value={newMessage} onChange={e => setNewMessage(e.target.value)} />
                <button type="submit" disabled={!newMessage.trim()} className="w-14 h-14 bg-black rounded-xl flex items-center justify-center text-white active:scale-95 transition disabled:opacity-30 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"><Send size={24} /></button>
              </div>
            </form>

            {showMatchProfile && (
              <div className="fixed inset-0 z-[100] bg-white animate-in slide-in-from-bottom duration-500 overflow-y-auto no-scrollbar border-t-8 border-black">
                <div className="sticky top-0 p-6 flex justify-between items-center z-10 bg-white border-b-4 border-black">
                   <h2 className="text-3xl font-brand text-black uppercase italic tracking-tighter">DOSSIER FILE</h2>
                   <button onClick={() => setShowMatchProfile(false)} className="bg-black text-white p-3 rounded-lg border-2 border-white shadow-xl active:scale-90 transition"><X size={28} /></button>
                </div>
                <div className="px-6 pb-12 space-y-10 mt-8">
                  <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] bg-slate-100 border-4 border-black" onClick={() => {
                    const imgs = [activeMatch.profile.imageUrl, ...(activeMatch.profile.additionalImages || [])];
                    setActiveImageIndex((activeImageIndex + 1) % imgs.length);
                  }}>
                    <img src={[activeMatch.profile.imageUrl, ...(activeMatch.profile.additionalImages || [])][activeImageIndex]} className="w-full h-full object-cover" />
                    <div className="absolute top-6 left-6 bg-[#ff4d00] text-black font-brand text-3xl px-8 py-4 border-4 border-black shadow-2xl">RATE #{activeMatch.profile.selfRating}</div>
                    <div className="absolute bottom-6 left-6 right-6 flex gap-2">
                      {[activeMatch.profile.imageUrl, ...(activeMatch.profile.additionalImages || [])].map((_, i) => (
                        <div key={i} className={`h-1.5 flex-1 rounded-full border border-black ${i === activeImageIndex ? 'bg-white' : 'bg-white/30'}`} />
                      ))}
                    </div>
                  </div>
                  <div className="space-y-8">
                    <div className="flex items-center justify-between border-b-4 border-black pb-4">
                      <h3 className="text-4xl font-brand text-black uppercase italic tracking-tighter leading-none">
                        {activeMatch.profile.name}, {activeMatch.profile.age}
                      </h3>
                      <ShieldCheck className="text-[#ff4d00]" size={32} />
                    </div>
                    <div className="bg-white p-8 rounded-2xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                       <p className="text-black text-lg leading-relaxed italic font-bold">"{activeMatch.profile.bio}"</p>
                    </div>
                  </div>
                  <button onClick={() => setShowMatchProfile(false)} className="w-full py-8 bg-black text-white font-brand text-[14px] uppercase tracking-widest rounded-2xl border-4 border-white shadow-2xl active:scale-95 transition">Return</button>
                </div>
              </div>
            )}
          </div>
        )}

        {view === 'settings' && (
          <div className="bg-white h-full flex flex-col">
            <div className="p-6 border-b-4 border-black flex items-center gap-4">
              <button onClick={() => setView('discovery')} className="text-black p-2 hover:bg-slate-100 rounded-lg transition border-4 border-black active:bg-black active:text-white"><ArrowLeft size={24}/></button>
              <h2 className="text-3xl font-brand text-black uppercase italic tracking-tighter">Settings</h2>
            </div>
            <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-10 pb-20">
              <div className="bg-white rounded-xl border-4 border-black divide-y-4 divide-black overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <div className="p-6 flex items-center justify-between">
                  <div className="flex items-center gap-4 font-bold text-black uppercase text-sm tracking-tighter"><Bell size={20} /> Notifications</div>
                  <Toggle enabled={settings.notifications} onToggle={() => setSettings(s => ({...s, notifications: !s.notifications}))} />
                </div>
                <div className="p-6 flex items-center justify-between">
                  <div className="flex items-center gap-4 font-bold text-black uppercase text-sm tracking-tighter"><Search size={20} /> Discovery</div>
                  <Toggle enabled={settings.discovery} onToggle={() => setSettings(s => ({...s, discovery: !s.discovery}))} />
                </div>
              </div>
              <div className="space-y-4 pt-4">
                <button onClick={() => { localStorage.clear(); window.location.reload(); }} className="w-full p-6 bg-black text-white rounded-xl font-brand text-[12px] uppercase tracking-widest border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)]"><LogOut size={20} className="inline mr-2"/> Log Out</button>
                <button onClick={() => { if (confirm("Wipe data forever?")) { localStorage.clear(); window.location.reload(); } }} className="w-full p-6 text-black bg-white font-brand text-[10px] uppercase tracking-widest border-4 border-black hover:bg-red-50 transition">Delete Account</button>
              </div>
            </div>
          </div>
        )}
      </main>

      <nav className={`absolute bottom-0 left-0 right-0 px-8 py-2 bg-white border-t-4 border-black flex justify-between items-center z-40 nav-transition ${view === 'chat' || view === 'onboarding' || !isNavVisible ? 'translate-y-full' : ''}`}>
        <button onClick={() => setView('discovery')} className={`p-2 relative transition-all ${view === 'discovery' ? 'scale-110 opacity-100' : 'opacity-30 hover:opacity-100'}`}>
          <Search size={24} strokeWidth={4} className="text-black" />
          {view === 'discovery' && <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#ff4d00] border-2 border-black rounded-full" />}
        </button>
        <button onClick={() => setView('likes-you')} className={`p-2 relative transition-all ${view === 'likes-you' ? 'scale-110 opacity-100' : 'opacity-30 hover:opacity-100'}`}>
          <Heart size={24} strokeWidth={4} className="text-black" />
          {view === 'likes-you' && <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#ff4d00] border-2 border-black rounded-full" />}
        </button>
        <button onClick={() => setView('matches')} className={`p-2 relative transition-all ${view === 'matches' ? 'scale-110 opacity-100' : 'opacity-30 hover:opacity-100'}`}>
          <MessageCircle size={24} strokeWidth={4} className="text-black" />
          {view === 'matches' && <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#ff4d00] border-2 border-black rounded-full" />}
        </button>
        <button onClick={() => setView('profile')} className={`p-2 relative transition-all ${view === 'profile' ? 'scale-110 opacity-100' : 'opacity-30 hover:opacity-100'}`}>
          <UserIcon size={24} strokeWidth={4} className="text-black" />
          {view === 'profile' && <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#ff4d00] border-2 border-black rounded-full" />}
        </button>
      </nav>
    </div>
  );
};

export default App;
