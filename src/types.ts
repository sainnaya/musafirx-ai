
export enum AppState {
  HOME = 'HOME',
  PLANNING = 'PLANNING',
  ITINERARY = 'ITINERARY',
  COMMUNITY = 'COMMUNITY',
  EXPENSES = 'EXPENSES',
  GUIDES = 'GUIDES',
  PROFILE = 'PROFILE',
  SOCIAL_STUDIO = 'SOCIAL_STUDIO'
}

export interface TripPreferences {
  destination: string;
  startDate: string;
  duration: number;
  budget: string;
  travelers: string; // Solo, Couple, Family, Friends
  interests: string[];
  language: string;
}

export interface Activity {
  time: string;
  activity: string;
  description: string;
  location: string;
  estimatedCost: number;
  type: 'food' | 'sightseeing' | 'adventure' | 'relax' | 'culture';
}

export interface DayPlan {
  day: number;
  date?: string; // Added date string
  theme: string;
  activities: Activity[];
}

export interface Itinerary {
  title: string;
  destination: string; // Added field for precise location targeting
  description: string;
  totalEstimatedCost: number;
  currency: string;
  days: DayPlan[];
  travelTips: string[];
  rating?: number; // Added rating field (1-5)
}

export interface Expense {
  id: string;
  category: string;
  subcategory?: string;
  amount: number;
  date: string;
  description: string;
}

export interface TourGuide {
  id: string;
  name: string;
  languages: string[];
  specialty: string;
  rating: number;
  ratePerHour: number;
  imageUrl: string;
}

export interface CommunityPost {
  id: string;
  user: string;
  location: string;
  content: string;
  likes: number;
  tags: string[];
  imageUrl?: string;
  timestamp: number;
}

export interface UserProfile {
  name: string;
  email: string;
  bio: string;
  homeAirport: string;
  savedTrips: Itinerary[];
  preferences: TripPreferences;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  sources?: { title: string; uri: string }[];
}

// Social Studio Types

export interface Photo {
  id: string;
  url: string;
  description: string;
  location: string;
  timestamp: string;
  aiTags: string[];
  aestheticScore: number;
}

export interface UserVoiceProfile {
  tone: 'casual' | 'professional' | 'poetic' | 'humorous' | 'energetic';
  audience: 'friends' | 'travelers' | 'professionals' | 'family';
  emojiStyle: 'none' | 'minimal' | 'heavy';
  hashtagCount: number;
}

export interface SocialMediaContent {
  instagram: {
    posts: {
      photoReference: number;
      caption: string;
      hashtags: string[];
      locationTag: string;
      firstComment: string;
      viralPotentialScore: number;
    }[];
    stories: {
      photoReference: number;
      stickerIdeas: string[];
      text: string;
      cta: string;
    }[];
    reel: {
      concept: string;
      hook: string;
      photoSequence: number[];
      music: string;
      captions: string[];
      trendAlignment: string;
    };
  };
  twitter: {
    thread: string[];
    standalonetweet: string;
    hashtags: string[];
  };
  facebook: {
    post: string;
    photoAlbum: {
      title: string;
      description: string;
      photoOrder: number[];
    };
  };
  linkedIn: {
    post: string;
    tone: string;
  };
  tiktok: {
    concepts: {
      hook: string;
      narrative: string;
      photoSequence: number[];
      sound: string;
      hashtags: string[];
      duration: string;
    }[];
  };
  blogPost: {
    seoTitle: string;
    metaDescription: string;
    url: string;
    fullPost: string;
    sections: string[];
    internalLinks: string[];
    ctaPlacement: string[];
  };
}
