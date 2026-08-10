import React, { useState, useEffect } from 'react';
import { UserProfile, Itinerary } from '../types';
import { User, Mail, MapPin, Save, Settings, Heart, History, LogOut, Star } from 'lucide-react';

const DEFAULT_PROFILE: UserProfile = {
  name: "Guest Traveler",
  email: "guest@example.com",
  bio: "Exploring the world one city at a time.",
  homeAirport: "JFK",
  savedTrips: [],
  preferences: {
    destination: "",
    startDate: "",
    duration: 5,
    budget: "Medium",
    travelers: "Solo",
    interests: ["Food", "Nature"],
    language: "English"
  }
};

const INTERESTS_LIST = [
  "History", "Food", "Nature", "Art", "Nightlife", 
  "Adventure", "Relaxation", "Shopping", "Photography", "Architecture", "Music"
];

export const UserProfileView: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('musafirx_profile');
    return saved ? JSON.parse(saved) : DEFAULT_PROFILE;
  });

  const [isEditing, setIsEditing] = useState(false);
  const [tempProfile, setTempProfile] = useState<UserProfile>(profile);
  
  // Check for current itinerary to potentially save
  const [currentItinerary, setCurrentItinerary] = useState<Itinerary | null>(() => {
    const saved = localStorage.getItem('musafirx_itinerary');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    localStorage.setItem('musafirx_profile', JSON.stringify(profile));
  }, [profile]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setProfile(tempProfile);
    setIsEditing(false);
  };

  const saveCurrentTrip = () => {
    if (!currentItinerary) return;
    const exists = profile.savedTrips.some(t => t.title === currentItinerary.title);
    if (exists) {
        alert("Trip already saved to history!");
        return;
    }
    setProfile(prev => ({
        ...prev,
        savedTrips: [currentItinerary, ...prev.savedTrips]
    }));
    alert("Trip saved successfully!");
  };

  const handleRateTrip = (tripIndex: number, rating: number) => {
    const newSavedTrips = [...profile.savedTrips];
    newSavedTrips[tripIndex] = { ...newSavedTrips[tripIndex], rating };
    setProfile(prev => ({ ...prev, savedTrips: newSavedTrips }));
  };

  const toggleEditInterest = (interest: string) => {
    setTempProfile(prev => {
      const interests = prev.preferences.interests.includes(interest)
        ? prev.preferences.interests.filter(i => i !== interest)
        : [...prev.preferences.interests, interest];
      return {
        ...prev,
        preferences: { ...prev.preferences, interests }
      };
    });
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in space-y-8">
      {/* Header / Banner */}
      <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-teal-500 to-cyan-600"></div>
        <div className="px-8 pb-8">
            <div className="relative -mt-12 mb-6 flex justify-between items-end">
                <div className="flex items-end gap-6">
                    <div className="w-24 h-24 bg-white dark:bg-slate-800 rounded-2xl p-1 shadow-lg">
                        <div className="w-full h-full bg-slate-100 dark:bg-slate-700 rounded-xl flex items-center justify-center text-slate-400 dark:text-slate-500">
                             <User className="w-10 h-10" />
                        </div>
                    </div>
                    <div className="mb-2">
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{profile.name}</h1>
                        <p className="text-slate-500 dark:text-slate-400 flex items-center gap-2 text-sm">
                            <MapPin className="w-3.5 h-3.5" /> Based in {profile.homeAirport}
                        </p>
                    </div>
                </div>
                <button 
                    onClick={() => {
                        setTempProfile(profile);
                        setIsEditing(!isEditing);
                    }}
                    className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-lg font-medium text-sm hover:bg-slate-50 dark:hover:bg-slate-600 transition shadow-sm"
                >
                    {isEditing ? 'Cancel Editing' : 'Edit Profile'}
                </button>
            </div>

            {isEditing ? (
                <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                    <div className="col-span-full border-b border-slate-100 dark:border-slate-700 pb-2 mb-2">
                       <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">Personal Info</h3>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">Display Name</label>
                        <input 
                            className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 dark:text-white outline-none focus:border-teal-500"
                            value={tempProfile.name}
                            onChange={e => setTempProfile({...tempProfile, name: e.target.value})}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">Email Address</label>
                        <input 
                            className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 dark:text-white outline-none focus:border-teal-500"
                            value={tempProfile.email}
                            onChange={e => setTempProfile({...tempProfile, email: e.target.value})}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">Home Airport Code</label>
                        <input 
                            className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 dark:text-white outline-none focus:border-teal-500"
                            value={tempProfile.homeAirport}
                            onChange={e => setTempProfile({...tempProfile, homeAirport: e.target.value})}
                        />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">Bio</label>
                        <textarea 
                            className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 dark:text-white outline-none focus:border-teal-500"
                            rows={3}
                            value={tempProfile.bio}
                            onChange={e => setTempProfile({...tempProfile, bio: e.target.value})}
                        />
                    </div>

                    <div className="col-span-full border-b border-slate-100 dark:border-slate-700 pb-2 mt-4 mb-2">
                       <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">Default Travel Preferences</h3>
                    </div>
                    
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">Default Budget</label>
                        <select 
                            className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 dark:text-white outline-none focus:border-teal-500"
                            value={tempProfile.preferences.budget}
                            onChange={e => setTempProfile({...tempProfile, preferences: {...tempProfile.preferences, budget: e.target.value}})}
                        >
                             <option value="Low">Economy / Backpacker</option>
                             <option value="Medium">Standard / Comfort</option>
                             <option value="High">Luxury / First Class</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">Default Travelers</label>
                        <select 
                            className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 dark:text-white outline-none focus:border-teal-500"
                            value={tempProfile.preferences.travelers}
                            onChange={e => setTempProfile({...tempProfile, preferences: {...tempProfile.preferences, travelers: e.target.value}})}
                        >
                             <option value="Solo">Solo Explorer</option>
                             <option value="Couple">Couple</option>
                             <option value="Family">Family with Kids</option>
                             <option value="Friends">Group of Friends</option>
                             <option value="Seniors">Senior Travelers</option>
                        </select>
                    </div>

                     <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">Language</label>
                        <select 
                            className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 dark:text-white outline-none focus:border-teal-500"
                            value={tempProfile.preferences.language}
                            onChange={e => setTempProfile({...tempProfile, preferences: {...tempProfile.preferences, language: e.target.value}})}
                        >
                           <option value="English">English</option>
                           <option value="Spanish">Spanish</option>
                           <option value="French">French</option>
                           <option value="German">German</option>
                        </select>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                         <label className="text-xs font-bold text-slate-500 uppercase">Interests</label>
                         <div className="flex flex-wrap gap-2">
                            {INTERESTS_LIST.map(interest => (
                                <button
                                type="button"
                                key={interest}
                                onClick={() => toggleEditInterest(interest)}
                                className={`px-3 py-1 text-xs rounded-full border transition-all ${
                                    tempProfile.preferences.interests.includes(interest) 
                                    ? 'bg-teal-600 text-white border-teal-600' 
                                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-600'
                                }`}
                                >
                                {interest}
                                </button>
                            ))}
                         </div>
                    </div>

                    <div className="md:col-span-2 flex justify-end pt-2">
                        <button type="submit" className="bg-teal-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-teal-700 transition flex items-center gap-2">
                            <Save className="w-4 h-4" /> Save Changes
                        </button>
                    </div>
                </form>
            ) : (
                <p className="text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
                    {profile.bio}
                </p>
            )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Col: Preferences & Stats */}
        <div className="space-y-6">
             <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <Settings className="w-5 h-5 text-teal-600" /> Default Preferences
                </h3>
                <div className="space-y-4">
                     <div className="flex justify-between items-center text-sm border-b border-slate-50 dark:border-slate-700 pb-2">
                        <span className="text-slate-500">Travel Style</span>
                        <span className="font-medium text-slate-800 dark:text-slate-200">{profile.preferences.budget} Budget</span>
                     </div>
                     <div className="flex justify-between items-center text-sm border-b border-slate-50 dark:border-slate-700 pb-2">
                        <span className="text-slate-500">Party Size</span>
                        <span className="font-medium text-slate-800 dark:text-slate-200">{profile.preferences.travelers}</span>
                     </div>
                     <div className="flex justify-between items-center text-sm pb-2">
                        <span className="text-slate-500">Language</span>
                        <span className="font-medium text-slate-800 dark:text-slate-200">{profile.preferences.language}</span>
                     </div>
                     <div className="pt-2">
                        <p className="text-xs font-bold text-slate-400 uppercase mb-2">Interests</p>
                        <div className="flex flex-wrap gap-2">
                            {profile.preferences.interests.map(i => (
                                <span key={i} className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs rounded-md">{i}</span>
                            ))}
                        </div>
                     </div>
                </div>
             </div>

             <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-6 rounded-2xl shadow-lg text-white">
                 <div className="flex justify-between items-start mb-6">
                    <div>
                        <p className="text-indigo-200 text-sm font-medium">Community Status</p>
                        <h3 className="text-2xl font-bold">Explorer Lvl 3</h3>
                    </div>
                    <Heart className="w-8 h-8 text-indigo-300 opacity-50" />
                 </div>
                 <div className="w-full bg-indigo-900/40 rounded-full h-2 mb-2">
                     <div className="bg-indigo-300 h-2 rounded-full w-2/3"></div>
                 </div>
                 <p className="text-xs text-indigo-200">2,400 / 3,000 XP to next level</p>
             </div>
        </div>

        {/* Right Col: Trip History */}
        <div className="lg:col-span-2 space-y-6">
            {currentItinerary && (
                <div className="bg-teal-50 dark:bg-teal-900/20 border border-teal-100 dark:border-teal-800 p-6 rounded-2xl flex justify-between items-center">
                    <div>
                        <h4 className="font-bold text-teal-900 dark:text-teal-100 mb-1">Current Active Trip</h4>
                        <p className="text-sm text-teal-700 dark:text-teal-300">{currentItinerary.title} ({currentItinerary.days.length} Days)</p>
                    </div>
                    <button 
                        onClick={saveCurrentTrip}
                        className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition shadow-sm"
                    >
                        Save to History
                    </button>
                </div>
            )}

            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                <h3 className="font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                    <History className="w-5 h-5 text-teal-600" /> Trip History
                </h3>

                {profile.savedTrips.length === 0 ? (
                    <div className="text-center py-12 text-slate-400 dark:text-slate-500">
                        <History className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p>No past trips saved yet.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {profile.savedTrips.map((trip, idx) => (
                            <div key={idx} className="flex flex-col sm:flex-row justify-between sm:items-center p-4 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 border border-slate-100 dark:border-slate-700/50 transition cursor-pointer group">
                                <div className="mb-3 sm:mb-0 flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                       <h4 className="font-bold text-slate-800 dark:text-slate-200 group-hover:text-teal-600 transition-colors">{trip.title}</h4>
                                       <div className="flex">
                                          {[1, 2, 3, 4, 5].map((star) => (
                                              <button 
                                                key={star}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleRateTrip(idx, star);
                                                }}
                                                className={`focus:outline-none transition-colors ${
                                                    (trip.rating || 0) >= star ? 'text-amber-400' : 'text-slate-300 dark:text-slate-600 hover:text-amber-200'
                                                }`}
                                              >
                                                  <Star className="w-4 h-4 fill-current" />
                                              </button>
                                          ))}
                                       </div>
                                    </div>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">{trip.days.length} Days • Estimated {trip.totalEstimatedCost} {trip.currency}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-xs font-semibold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-3 py-1 rounded-full">
                                        Completed
                                    </span>
                                    <button 
                                        onClick={() => {
                                            const newHistory = profile.savedTrips.filter((_, i) => i !== idx);
                                            setProfile(prev => ({...prev, savedTrips: newHistory}));
                                        }}
                                        className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-full transition"
                                    >
                                        <LogOut className="w-4 h-4 rotate-180" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};