
import { UserProfile } from './types';

const defaultSettings = {
  notificationsEnabled: true,
  locationSharing: true,
  privacyLevel: 'public' as const,
};

export const MOCK_PROFILES: UserProfile[] = [
  {
    id: '1',
    name: 'Sarah',
    lastName: 'Jenkins',
    birthDate: '1996-05-12',
    age: 28,
    gender: 'woman',
    interestedIn: 'men',
    lookingFor: 'long-term',
    height: "5'6\"",
    bio: 'Honestly just looking for someone who doesn\'t take 45 minutes to order a coffee. I like bad puns and medium-rare steaks.',
    selfRating: 6,
    idealMatchRating: 7,
    interests: ['Bowling', 'Dive Bars', 'Netflix', 'Cooking'],
    imageUrl: 'https://picsum.photos/seed/sarah/800/1200',
    additionalImages: ['https://picsum.photos/seed/sarah2/800/1200'],
    location: 'Brooklyn, NY',
    job: 'Library Assistant',
    redFlags: ['Owns more than 2 cats', 'Always late'],
    settings: defaultSettings
  },
  {
    id: '2',
    name: 'Elena',
    lastName: 'Rodriguez',
    birthDate: '1993-02-14',
    age: 31,
    gender: 'woman',
    interestedIn: 'men',
    lookingFor: 'life-partner',
    height: "5'4\"",
    bio: 'Looking for a 6 who thinks they are a 6. I am a solid 7 on a good hair day.',
    selfRating: 7,
    idealMatchRating: 6,
    interests: ['Birds', 'Hiking', 'Board Games'],
    imageUrl: 'https://picsum.photos/seed/elena/800/1200',
    additionalImages: ['https://picsum.photos/seed/elena2/800/1200'],
    location: 'Chicago, IL',
    job: 'Graphic Designer',
    redFlags: ['Doesn\'t like pizza', 'Talks during movies'],
    settings: defaultSettings
  },
  {
    id: '3',
    name: 'Maya',
    lastName: 'Chen',
    birthDate: '1998-11-20',
    age: 26,
    gender: 'woman',
    interestedIn: 'everyone',
    lookingFor: 'casual',
    height: "5'2\"",
    bio: 'I promise my personality is an 8 even if my profile is a 5.',
    selfRating: 5,
    idealMatchRating: 6,
    interests: ['Music', 'Vinyl', 'Bars'],
    imageUrl: 'https://picsum.photos/seed/maya/800/1200',
    additionalImages: ['https://picsum.photos/seed/maya2/800/1200'],
    location: 'Austin, TX',
    job: 'Barista',
    redFlags: ['Claps when the plane lands'],
    settings: defaultSettings
  }
];

export const INTEREST_OPTIONS = [
  'Dive Bars', 'Bowling', 'Netflix', 'Cooking', 'Hiking', 'Tacos', 'Darts', 'Reality TV', '80s Rock', 'Video Games', 'Bad Movies'
];
