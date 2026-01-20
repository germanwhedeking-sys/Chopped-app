
export interface UserProfile {
  id: string;
  name: string;
  lastName: string;
  birthDate: string;
  age: number;
  gender: 'man' | 'woman' | 'non-binary';
  interestedIn: 'men' | 'women' | 'everyone';
  lookingFor: 'long-term' | 'life-partner' | 'casual' | 'not-sure';
  height: string; // e.g. "5'10\""
  bio: string;
  selfRating: number;
  idealMatchRating: number;
  interests: string[];
  imageUrl: string;
  additionalImages: string[];
  location: string;
  job: string;
  redFlags: string[];
  vibeSummary?: string;
  settings: {
    notificationsEnabled: boolean;
    locationSharing: boolean;
    privacyLevel: 'public' | 'private';
  };
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: number;
}

export interface Match {
  id: string;
  userId: string;
  profile: UserProfile;
  lastMessage?: string;
}

export type AppView = 'onboarding' | 'discovery' | 'matches' | 'profile' | 'chat' | 'likes-you' | 'settings';
