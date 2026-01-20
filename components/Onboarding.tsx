import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { Logo } from './Logo';
import { 
  ChevronLeft, 
  Facebook,
  Bell,
  Navigation,
  CheckCircle2,
  Plus,
  X,
  Sparkles,
  Phone,
  Mail,
  Loader2,
  ChevronDown,
  ArrowRight
} from 'lucide-react';

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
}

const COUNTRY_CODES = [
  { code: '+1', name: 'US', flag: '🇺🇸' },
  { code: '+44', name: 'UK', flag: '🇬🇧' },
  { code: '+52', name: 'MX', flag: '🇲🇽' },
  { code: '+1', name: 'CA', flag: '🇨🇦' },
  { code: '+61', name: 'AU', flag: '🇦🇺' },
  { code: '+49', name: 'DE', flag: '🇩🇪' },
  { code: '+33', name: 'FR', flag: '🇫🇷' },
];

const compressImage = (base64Str: string): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const MAX_WIDTH = 800;
      let width = img.width;
      let height = img.height;
      if (width > height) {
        if (width > MAX_WIDTH) {
          height *= MAX_WIDTH / width;
          width = MAX_WIDTH;
        }
      } else {
        if (height > 800) {
          width *= 800 / height;
          height = 800;
        }
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', 0.7));
    };
    img.onerror = () => resolve(base64Str);
  });
};

const HEIGHTS = Array.from({ length: 60 }, (_, i) => {
  const inches = i + 48; 
  const ft = Math.floor(inches / 12);
  const inc = inches % 12;
  return `${ft}'${inc}"`;
});

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(-4);
  const [authMethod, setAuthMethod] = useState<'none' | 'phone' | 'email' | 'social'>('none');
  const [socialProvider, setSocialProvider] = useState<'google' | 'facebook' | null>(null);
  
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState(COUNTRY_CODES[0]);
  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  
  const [showRatingAlert, setShowRatingAlert] = useState(false);
  const [isLoginMode, setIsLoginMode] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const [profile, setProfile] = useState<Partial<UserProfile>>({
    name: '',
    lastName: '',
    birthDate: '',
    gender: 'man',
    interestedIn: 'women',
    lookingFor: 'long-term',
    height: "5'8\"",
    bio: '',
    selfRating: 6,
    interests: [],
    imageUrl: '',
    additionalImages: [],
    settings: { notificationsEnabled: false, locationSharing: false, privacyLevel: 'public' }
  });

  // Handle GPS and Notification skip/auto-skip
  useEffect(() => {
    if (step === -3) {
      if (localStorage.getItem('trumingle_gps_permission') === 'true') {
        setStep(-2);
      }
    }
    if (step === -2) {
      if (localStorage.getItem('trumingle_notify_permission') === 'true') {
        setStep(-1);
      }
    }
  }, [step]);

  const handleNext = () => {
    setAuthMethod('none');
    setStep(s => s + 1);
  };

  const handleBack = () => {
    if (authMethod !== 'none') {
      setAuthMethod('none');
      return;
    }
    setStep(s => Math.max(-4, s - 1));
  };

  const handleEnableGPS = () => {
    localStorage.setItem('trumingle_gps_permission', 'true');
    handleNext();
  };

  const handleEnableNotify = () => {
    localStorage.setItem('trumingle_notify_permission', 'true');
    handleNext();
  };

  const startSocialLink = (provider: 'google' | 'facebook') => {
    setSocialProvider(provider);
    setAuthMethod('social');
    setIsVerifying(true);
    // Simulate real auth linking
    setTimeout(() => {
      setIsVerifying(false);
    }, 1800);
  };

  const handleAuthSubmit = () => {
    if (isLoginMode) {
      // Simulate successful login
      onComplete({
        ...profile,
        id: 'user-123',
        name: 'Jordan',
        age: 29,
        location: 'Chicago, IL',
        imageUrl: 'https://picsum.photos/seed/jordan/800/1200',
        interests: ['Vinyl', 'Art'],
        bio: 'Real world. Real vibes. I am back.'
      } as UserProfile);
    } else {
      // Proceed to Pact then Profile Setup
      handleNext();
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const compressed = await compressImage(event.target?.result as string);
        if (index === 0) setProfile(prev => ({ ...prev, imageUrl: compressed }));
        else {
          const newImages = [...(profile.additionalImages || [])];
          newImages[index - 1] = compressed;
          setProfile(prev => ({ ...prev, additionalImages: newImages }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRatingChange = (val: number) => {
    setProfile({...profile, selfRating: val});
    setShowRatingAlert(val >= 9);
  };

  const renderAuthMenu = () => {
    if (authMethod === 'phone') {
      return (
        <div className="space-y-6 animate-in slide-in-from-right duration-300">
          <div className="text-left">
            <h3 className="text-xl font-brand text-black uppercase tracking-tighter italic mb-1">{isLoginMode ? 'Welcome Back' : 'Mobile Verify'}</h3>
            <p className="text-[10px] font-brand text-slate-400 uppercase tracking-widest">{isLoginMode ? 'Enter your registered phone' : 'Enter your number to sign up'}</p>
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <select 
                className="appearance-none bg-white border-4 border-black rounded-xl p-4 pr-10 font-brand text-xs outline-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                onChange={(e) => setCountryCode(COUNTRY_CODES.find(c => c.code === e.target.value) || COUNTRY_CODES[0])}
                value={countryCode.code}
              >
                {COUNTRY_CODES.map(c => <option key={c.name} value={c.code}>{c.flag} {c.code}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" size={14}/>
            </div>
            <input 
              type="tel" 
              placeholder="000 000 0000" 
              className="flex-1 bg-white border-4 border-black rounded-xl p-4 font-brand outline-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:bg-slate-50 transition"
              value={phoneNumber}
              onChange={e => setPhoneNumber(e.target.value)}
            />
          </div>
          <button 
            disabled={phoneNumber.length < 7}
            onClick={handleAuthSubmit}
            className="w-full bg-black text-white font-brand py-4 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)] active:scale-95 transition disabled:opacity-30"
          >
            {isLoginMode ? 'LOG IN' : 'CONTINUE'}
          </button>
        </div>
      );
    }

    if (authMethod === 'email') {
      return (
        <div className="space-y-6 animate-in slide-in-from-right duration-300">
          <div className="text-left">
            <h3 className="text-xl font-brand text-black uppercase tracking-tighter italic mb-1">{isLoginMode ? 'Email Login' : 'Email Sign Up'}</h3>
            <p className="text-[10px] font-brand text-slate-400 uppercase tracking-widest">{isLoginMode ? 'Access your account' : 'Register with your email'}</p>
          </div>
          <div className="space-y-3">
            <input 
              type="email" 
              placeholder="YOUR@EMAIL.COM" 
              className="w-full bg-white border-4 border-black rounded-xl p-4 font-brand uppercase outline-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:bg-slate-50 transition"
              value={emailAddress}
              onChange={e => setEmailAddress(e.target.value)}
            />
            <input 
              type="password" 
              placeholder="PASSWORD" 
              className="w-full bg-white border-4 border-black rounded-xl p-4 font-brand uppercase outline-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:bg-slate-50 transition"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>
          <button 
            disabled={!emailAddress.includes('@') || password.length < 6}
            onClick={handleAuthSubmit}
            className="w-full bg-black text-white font-brand py-4 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)] active:scale-95 transition disabled:opacity-30"
          >
            {isLoginMode ? 'LOG IN' : 'CONTINUE'}
          </button>
        </div>
      );
    }

    if (authMethod === 'social') {
      return (
        <div className="space-y-8 py-10 flex flex-col items-center animate-in fade-in duration-300">
          {isVerifying ? (
            <>
              <div className="relative">
                <Loader2 className="animate-spin text-black" size={64} />
                <div className={`absolute inset-0 flex items-center justify-center`}>
                  {socialProvider === 'google' ? <GoogleLogo size={24}/> : <Facebook size={24} className="text-[#1877F2]"/>}
                </div>
              </div>
              <div className="text-center">
                <p className="font-brand text-xs uppercase tracking-widest text-black">Authenticating...</p>
                <p className="font-brand text-[8px] uppercase tracking-[0.3em] text-slate-400 mt-2">Connecting Account</p>
              </div>
            </>
          ) : (
            <>
              <div className="w-20 h-20 rounded-full border-4 border-black flex items-center justify-center bg-green-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <CheckCircle2 className="text-black" size={40} />
              </div>
              <div className="text-center">
                <h4 className="font-brand text-lg text-black uppercase">Verified</h4>
                <p className="font-brand text-[10px] text-slate-400 uppercase tracking-widest mt-1">{socialProvider} successfully linked</p>
              </div>
              <button onClick={handleAuthSubmit} className="w-full bg-black text-white font-brand py-4 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:scale-95 transition">
                {isLoginMode ? 'LOG IN' : 'CONTINUE'}
              </button>
            </>
          )}
        </div>
      );
    }

    return (
      <div className="space-y-3 animate-in fade-in duration-300">
        <button 
          onClick={() => startSocialLink('google')} 
          className="w-full bg-white border-4 border-black text-black font-brand text-[11px] py-4 rounded-xl flex items-center justify-center gap-3 active:scale-95 transition shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
        >
          <GoogleLogo size={18} /> Google Login
        </button>
        <button 
          onClick={() => startSocialLink('facebook')} 
          className="w-full bg-[#1877F2] border-4 border-black text-white font-brand text-[11px] py-4 rounded-xl flex items-center justify-center gap-3 active:scale-95 transition shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
        >
          <Facebook size={18} /> Facebook Login
        </button>
        <button 
          onClick={() => setAuthMethod('phone')} 
          className="w-full bg-black border-4 border-white text-white font-brand text-[11px] py-4 rounded-xl flex items-center justify-center gap-3 active:scale-95 transition shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)]"
        >
          <Phone size={18} /> Phone Number
        </button>
        <button 
          onClick={() => setAuthMethod('email')} 
          className="w-full bg-slate-50 border-4 border-black text-black font-brand text-[11px] py-4 rounded-xl flex items-center justify-center gap-3 active:scale-95 transition shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
        >
          <Mail size={18} /> Email Address
        </button>
        
        <div className="pt-6">
          <button 
            onClick={() => { setIsLoginMode(!isLoginMode); setAuthMethod('none'); }} 
            className="text-black font-brand text-[9px] uppercase tracking-widest border-b-2 border-black pb-0.5 hover:bg-slate-50 transition"
          >
            {isLoginMode ? 'No account? Sign up instead' : 'Already a member? Log In'}
          </button>
        </div>
      </div>
    );
  };

  const renderStep = () => {
    switch (step) {
      case -4:
        return (
          <div className="space-y-12 text-center animate-in fade-in zoom-in py-6">
            <Logo size={56} className="justify-center mb-8" />
            <div className="space-y-4">
              <button 
                onClick={() => { setIsLoginMode(false); handleNext(); }} 
                className="w-full bg-[#ff4d00] text-black font-brand py-6 rounded-xl border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:scale-95 transition"
              >
                SIGN UP
              </button>
              <button 
                onClick={() => { setIsLoginMode(true); setStep(-1); }} 
                className="w-full bg-white text-black font-brand py-5 rounded-xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:scale-95 transition text-xs"
              >
                LOG IN
              </button>
            </div>
            <p className="text-[9px] font-brand text-slate-400 uppercase tracking-widest">Reality-based dating for real humans.</p>
          </div>
        );
      case -3:
        return (
          <div className="space-y-10 text-center animate-in fade-in zoom-in py-6">
            <div className="mx-auto w-24 h-24 bg-white border-4 border-black rounded-full flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"><Navigation className="text-black" size={40} /></div>
            <div className="space-y-2">
              <h2 className="text-3xl font-brand text-black uppercase tracking-tighter italic">Locate Realness</h2>
              <p className="text-slate-500 font-brand text-[10px] uppercase tracking-widest px-4">Connect with locals in your zip code. No long-distance delusions.</p>
            </div>
            <button onClick={handleEnableGPS} className="w-full bg-black text-white font-brand py-6 rounded-xl active:scale-95 transition border-4 border-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">Enable GPS</button>
            <button onClick={handleNext} className="w-full text-slate-400 font-brand text-[9px] uppercase tracking-[0.2em] pt-4">Skip for now</button>
          </div>
        );
      case -2:
        return (
          <div className="space-y-10 text-center animate-in fade-in slide-in-from-right py-6">
            <div className="mx-auto w-24 h-24 bg-white border-4 border-black rounded-full flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"><Bell className="text-black" size={40} /></div>
            <div className="space-y-2">
              <h2 className="text-3xl font-brand text-black uppercase tracking-tighter italic">Get Alerts</h2>
              <p className="text-slate-500 font-brand text-[10px] uppercase tracking-widest px-4">Know the moment a real connection happens.</p>
            </div>
            <button onClick={handleEnableNotify} className="w-full bg-black text-white font-brand py-6 rounded-xl active:scale-95 transition border-4 border-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">Allow Alerts</button>
            <button onClick={handleNext} className="w-full text-slate-400 font-brand text-[9px] uppercase tracking-[0.2em] pt-4">Skip</button>
          </div>
        );
      case -1:
        return (
          <div className="space-y-10 text-center animate-in fade-in zoom-in">
            <Logo size={42} className="justify-center" />
            <h2 className="text-2xl font-brand text-black uppercase italic tracking-tighter">
              {isLoginMode ? 'Back in the Tru' : 'Start Your Journey'}
            </h2>
            
            {renderAuthMenu()}

          </div>
        );
      case 0:
        return (
          <div className="space-y-8 py-4 animate-in slide-in-from-right">
            <h2 className="text-2xl font-brand text-black text-center italic uppercase tracking-tighter">THE TRU PACT</h2>
            <div className="space-y-6 bg-white p-8 rounded-2xl border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex items-start gap-4">
                <CheckCircle2 className="text-black mt-0.5" size={18} />
                <p className="text-[10px] font-brand text-black uppercase leading-relaxed tracking-widest">REAL PHOTOS ONLY. No filters. No delusions.</p>
              </div>
              <div className="flex items-start gap-4">
                <CheckCircle2 className="text-black mt-0.5" size={18} />
                <p className="text-[10px] font-brand text-black uppercase leading-relaxed tracking-widest">RESPECT THE TRU. Every connection matters.</p>
              </div>
            </div>
            <button onClick={handleNext} className="w-full bg-black text-white font-brand py-6 rounded-xl border-4 border-white shadow-xl active:scale-95 transition">I COMMIT</button>
          </div>
        );
      case 1:
        return (
          <div className="space-y-8 animate-in slide-in-from-right">
            <h2 className="text-2xl font-brand text-black uppercase italic tracking-tighter">Identify</h2>
            <div className="space-y-4">
              <input type="text" placeholder="FIRST NAME" className="w-full bg-white border-4 border-black rounded-xl p-5 text-black font-brand uppercase outline-none focus:bg-slate-50 transition shadow-inner" value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} />
              <input placeholder="BIRTH DATE" type="date" className="w-full bg-white border-4 border-black rounded-xl p-5 text-black font-brand outline-none shadow-inner" value={profile.birthDate} onChange={e => setProfile({...profile, birthDate: e.target.value})} />
            </div>
            <button disabled={!profile.name} onClick={handleNext} className="w-full bg-black text-white font-brand py-6 rounded-xl border-4 border-white active:scale-95 transition disabled:opacity-30 brutalist-shadow">NEXT</button>
          </div>
        );
      case 2:
        return (
          <div className="space-y-8 animate-in slide-in-from-right text-center">
            <h2 className="text-2xl font-brand text-black uppercase italic tracking-tighter">Height</h2>
            <div className="flex justify-center h-56 overflow-y-auto no-scrollbar snap-y border-4 border-black py-4 bg-white rounded-2xl shadow-inner">
              <div className="w-full">
                {HEIGHTS.map(h => (
                  <button key={h} onClick={() => setProfile({...profile, height: h})} className={`w-full py-5 font-brand text-3xl snap-center transition-all ${profile.height === h ? 'text-black scale-125' : 'text-slate-200'}`}>{h}</button>
                ))}
              </div>
            </div>
            <button onClick={handleNext} className="w-full bg-black text-white font-brand py-6 rounded-xl active:scale-95 transition shadow-xl border-4 border-white">THAT'S MY TRU HEIGHT</button>
          </div>
        );
      case 3:
        return (
          <div className="space-y-8 animate-in slide-in-from-right">
            <h2 className="text-2xl font-brand text-black uppercase italic tracking-tighter">Photos</h2>
            <div className="grid grid-cols-3 gap-3">
              {[0, 1, 2].map(i => {
                const img = i === 0 ? profile.imageUrl : profile.additionalImages?.[i - 1];
                return (
                  <div key={i} className="relative aspect-[3/4] bg-white border-4 border-black rounded-xl overflow-hidden shadow-md">
                    {img ? (
                      <><img src={img} className="w-full h-full object-cover" /><button onClick={() => i === 0 ? setProfile({...profile, imageUrl: ''}) : null} className="absolute top-2 right-2 bg-white border-2 border-black p-1 rounded-full shadow-lg"><X size={12}/></button></>
                    ) : (
                      <label className="flex items-center justify-center w-full h-full cursor-pointer hover:bg-slate-50 transition"><Plus size={24} className="text-black" /><input type="file" className="hidden" onChange={(e) => handleImageUpload(e, i)} /></label>
                    )}
                  </div>
                );
              })}
            </div>
            <p className="text-[9px] font-brand text-slate-400 text-center uppercase tracking-widest">Natural photos preferred. No filters please.</p>
            <button disabled={!profile.imageUrl} onClick={handleNext} className="w-full bg-black text-white font-brand py-6 rounded-xl shadow-xl active:scale-95 border-4 border-white disabled:opacity-30">NEXT</button>
          </div>
        );
      case 4:
        return (
          <div className="space-y-12 py-8 transition-all">
            <h2 className="text-2xl font-brand text-black text-center uppercase italic tracking-tighter leading-none">Your Rate Score</h2>
            <p className="text-[10px] font-brand text-slate-400 text-center uppercase tracking-widest px-4">Rate yourself honestly. Delusions get chopped.</p>
            <div className="relative pt-16">
              <input type="range" min="1" max="10" step="1" className="w-full accent-black h-4 bg-slate-100 rounded-lg appearance-none cursor-pointer border-2 border-black" value={profile.selfRating} onChange={e => handleRatingChange(parseInt(e.target.value))} />
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#ff4d00] text-black font-brand text-5xl px-12 py-5 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] border-4 border-black">{profile.selfRating}</div>
            </div>
            
            {showRatingAlert && (
              <div className="bg-white border-4 border-black p-6 rounded-2xl shadow-[8px_8px_0px_0px_rgba(255,77,0,1)] animate-in slide-in-from-bottom">
                <div className="flex items-center gap-3 mb-3">
                  <Sparkles className="text-[#ff4d00]" size={20} />
                  <h3 className="font-brand text-[12px] uppercase">Whoa, a perfect score?</h3>
                </div>
                <p className="text-[10px] font-brand text-black uppercase leading-relaxed tracking-widest">
                  TruMingle is for the down-to-earth. Since you're statistically gorgeous, you are only allowed here if you commit to finding someone real (Rate #7 or below). Deal?
                </p>
              </div>
            )}

            <button onClick={() => onComplete({...profile, id: 'me-' + Math.random(), age: 25, location: 'Nearby', bio: 'Ready to be real.', interests: []} as UserProfile)} className="w-full bg-black text-white font-brand py-6 rounded-xl border-4 border-white shadow-2xl active:scale-95 transition">JOIN THE MINGLE</button>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="max-w-md mx-auto min-h-screen flex flex-col justify-center px-6 py-10 relative">
      <div className="bg-white p-8 rounded-3xl border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] overflow-hidden relative min-h-[600px] flex flex-col justify-center">
        {step > -4 && (
          <button onClick={handleBack} className="absolute top-8 left-8 text-black hover:scale-110 transition z-10 p-1 border-2 border-transparent hover:border-black rounded-lg">
            <ChevronLeft size={28}/>
          </button>
        )}
        <div className="pt-6">{renderStep()}</div>
      </div>
    </div>
  );
};

// Simplified Google Logo
const GoogleLogo: React.FC<{ size?: number }> = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);
