
import React, { useState, useEffect } from 'react';
import { TripPreferences } from '../types';
import { resolveDestination } from '../services/geminiService';
import { Plane, Calendar, Wallet, Users, Heart, Globe, Loader2, Sparkles, MapPin, Search, ExternalLink, Plus, X } from 'lucide-react';

interface PlannerFormProps {
  onSubmit: (prefs: TripPreferences) => void;
  isLoading: boolean;
}

const INTERESTS_LIST = [
  "History", "Food", "Nature", "Art", "Nightlife", 
  "Adventure", "Relaxation", "Shopping", "Photography", "Architecture", "Music",
  "Hiking", "Wellness", "Luxury", "Budget Hacks", "Hidden Gems", "Spirituality", "Anime/Pop Culture", "Sports"
];

const GLOBAL_CITIES = [
  "Accra, Ghana", "Addis Ababa, Ethiopia", "Algiers, Algeria", "Cairo, Egypt", 
  "Cape Town, South Africa", "Casablanca, Morocco", "Dakar, Senegal", "Dar es Salaam, Tanzania",
  "Johannesburg, South Africa", "Kigali, Rwanda", "Lagos, Nigeria", "Luanda, Angola",
  "Marrakech, Morocco", "Nairobi, Kenya", "Tunis, Tunisia", "Zanzibar City, Tanzania",
  "Beijing, China", "Chengdu, China", "Guangzhou, China", "Hangzhou, China", 
  "Hong Kong, China", "Kyoto, Japan", "Lhasa, Tibet", "Macau, China", "Osaka, Japan", 
  "Pyongyang, North Korea", "Sapporo, Japan", "Seoul, South Korea", "Shanghai, China", 
  "Shenzhen, China", "Taipei, Taiwan", "Tokyo, Japan", "Ulaanbaatar, Mongolia", 
  "Xi'an, China",
  "Bali (Denpasar), Indonesia", "Bangkok, Thailand", "Bengaluru, India", "Cebu City, Philippines",
  "Chiang Mai, Thailand", "Colombo, Sri Lanka", "Dhaka, Bangladesh", "Hanoi, Vietnam", 
  "Ho Chi Minh City, Vietnam", "Hyderabad, India", "Islamabad, Pakistan", "Jakarta, Indonesia", 
  "Jaipur, India", "Kathmandu, Nepal", "Kuala Lumpur, Malaysia", "Lahore, Pakistan", 
  "Male, Maldives", "Manila, Philippines", "Mumbai, India", "New Delhi, India", 
  "Phnom Penh, Cambodia", "Phuket, Thailand", "Siem Reap, Cambodia", "Singapore", 
  "Yangon, Myanmar",
  "Abu Dhabi, UAE", "Amman, Jordan", "Ankara, Turkey", "Baghdad, Iraq", "Beirut, Lebanon", 
  "Doha, Qatar", "Dubai, UAE", "Isfahan, Iran", "Istanbul, Turkey", "Jerusalem, Israel", 
  "Jeddah, Saudi Arabia", "Kuwait City, Kuwait", "Manama, Bahrain", "Muscat, Oman", 
  "Riyadh, Saudi Arabia", "Shiraz, Iran", "Tehran, Iran", "Tel Aviv, Israel",
  "Belgrade, Serbia", "Bratislava, Slovakia", "Bucharest, Romania", "Budapest, Hungary", 
  "Krakow, Poland", "Kyiv, Ukraine", "Ljubljana, Slovenia", "Minsk, Belarus", 
  "Moscow, Russia", "Prague, Czech Republic", "Riga, Latvia", "Saint Petersburg, Russia", 
  "Sofia, Bulgaria", "Tallinn, Estonia", "Vilnius, Lithuania", "Warsaw, Poland", 
  "Zagreb, Croatia",
  "Copenhagen, Denmark", "Gothenburg, Sweden", "Helsinki, Finland", "Oslo, Norway", 
  "Reykjavik, Iceland", "Stockholm, Sweden",
  "Athens, Greece", "Barcelona, Spain", "Bologna, Italy", "Florence, Italy", 
  "Granada, Spain", "Lisbon, Portugal", "Madrid, Spain", "Milan, Italy", 
  "Naples, Italy", "Porto, Portugal", "Rome, Italy", "Santorini, Greece", 
  "Seville, Spain", "Valletta, Malta", "Venice, Italy",
  "Amsterdam, Netherlands", "Antwerp, Belgium", "Berlin, Germany", "Bern, Switzerland", 
  "Bordeaux, France", "Brussels, Belgium", "Cologne, Germany", "Dublin, Ireland", 
  "Edinburgh, UK", "Frankfurt, Germany", "Geneva, Switzerland", "Glasgow, UK", 
  "Hamburg, Germany", "London, UK", "Luxembourg City, Luxembourg", "Lyon, France", 
  "Manchester, UK", "Marseille, France", "Munich, Germany", "Nice, France", 
  "Paris, France", "Rotterdam, Netherlands", "Vienna, Austria", "Zurich, Switzerland",
  "Banff, Canada", "Calgary, Canada", "Montreal, Canada", "Ottawa, Canada", 
  "Quebec City, Canada", "Toronto, Canada", "Vancouver, Canada", "Whistler, Canada", 
  "Winnipeg, Canada",
  "Atlanta, USA", "Austin, USA", "Boston, USA", "Chicago, USA", "Dallas, USA", 
  "Denver, USA", "Honolulu, USA", "Houston, USA", "Las Vegas, USA", "Los Angeles, USA", 
  "Miami, USA", "Nashville, USA", "New Orleans, USA", "New York City, USA", 
  "Orlando, USA", "Philadelphia, USA", "Phoenix, USA", "Portland, USA", "San Diego, USA", 
  "San Francisco, USA", "Seattle, USA", "Washington D.C., USA",
  "Cancun, Mexico", "Guadalajara, Mexico", "Guatemala City, Guatemala", "Havana, Cuba", 
  "Kingston, Jamaica", "Mexico City, Mexico", "Monterrey, Mexico", "Nassau, Bahamas", 
  "Panama City, Panama", "Punta Cana, Dominican Republic", "San Jose, Costa Rica", 
  "San Juan, Puerto Rico", "Tulum, Mexico",
  "Adelaide, Australia", "Auckland, New Zealand", "Brisbane, Australia", "Christchurch, New Zealand", 
  "Gold Coast, Australia", "Hobart, Australia", "Melbourne, Australia", "Perth, Australia", 
  "Queenstown, New Zealand", "Suva, Fiji", "Sydney, Australia", "Wellington, New Zealand",
  "Asuncion, Paraguay", "Bogota, Colombia", "Brasilia, Brazil", "Buenos Aires, Argentina", 
  "Caracas, Venezuela", "Cartagena, Colombia", "Cusco, Peru", "La Paz, Bolivia", 
  "Lima, Peru", "Medellin, Colombia", "Montevideo, Uruguay", "Quito, Ecuador", 
  "Rio de Janeiro, Brazil", "Salvador, Brazil", "Santiago, Chile", "Sao Paulo, Brazil"
].sort();

export const PlannerForm: React.FC<PlannerFormProps> = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState<TripPreferences>({
    destination: '',
    startDate: new Date().toISOString().split('T')[0],
    duration: 3,
    budget: 'Medium',
    travelers: 'Couple',
    interests: [],
    language: 'English'
  });

  const [isSearching, setIsSearching] = useState(false);
  const [mapLink, setMapLink] = useState<string | undefined>(undefined);
  const [customInterest, setCustomInterest] = useState("");

  // Load defaults from profile on mount
  useEffect(() => {
    const savedProfile = localStorage.getItem('musafirx_profile');
    if (savedProfile) {
      try {
        const profile = JSON.parse(savedProfile);
        if (profile.preferences) {
          setFormData(prev => ({
            ...prev,
            ...profile.preferences,
            destination: prev.destination || profile.preferences.destination || '', // Keep existing destination if user typed
            startDate: prev.startDate // Keep today's date logic
          }));
        }
      } catch (e) {
        console.error("Failed to load profile preferences", e);
      }
    }
  }, []);

  const toggleInterest = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleAddCustomInterest = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!customInterest.trim()) return;
    
    const newInterest = customInterest.trim();
    if (!formData.interests.includes(newInterest)) {
         setFormData(prev => ({
            ...prev,
            interests: [...prev.interests, newInterest]
        }));
    }
    setCustomInterest("");
  };

  const handleDestinationSearch = async () => {
    if (!formData.destination) return;
    setIsSearching(true);
    setMapLink(undefined);
    try {
        const result = await resolveDestination(formData.destination);
        setFormData(prev => ({ ...prev, destination: result.name }));
        setMapLink(result.url);
    } catch (error) {
        console.error("Search failed", error);
    } finally {
        setIsSearching(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      {/* Header Section */}
      <div className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
          Design Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-cyan-600 dark:from-teal-400 dark:to-cyan-400">Perfect Journey</span>
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Tell us where you want to go and what you love. Our AI will curate a personalized itinerary just for you.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700 overflow-hidden">
        <div className="bg-teal-600 h-2 w-full"></div>
        <form onSubmit={handleSubmit} className="p-8 md:p-10 space-y-8">
          
          {/* Destination & Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Destination</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <MapPin className="h-5 w-5 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
                </div>
                <input
                  required
                  list="cities-list"
                  type="text"
                  placeholder="e.g. Paris, or 'Beach in Italy'"
                  className="w-full pl-12 pr-12 py-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:bg-white dark:focus:bg-slate-900 transition-all duration-200 ease-in-out"
                  value={formData.destination}
                  onChange={e => setFormData({ ...formData, destination: e.target.value })}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        handleDestinationSearch();
                    }
                  }}
                />
                <button
                    type="button"
                    onClick={handleDestinationSearch}
                    disabled={isSearching || !formData.destination}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                    title="Search Destination with Google Maps"
                >
                    {isSearching ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                </button>
                <datalist id="cities-list">
                  {GLOBAL_CITIES.map(city => (
                    <option key={city} value={city} />
                  ))}
                </datalist>
              </div>
              {mapLink && (
                  <div className="text-xs flex items-center gap-1 mt-1 text-teal-600 dark:text-teal-400 animate-fade-in">
                      <ExternalLink className="w-3 h-3" />
                      <a href={mapLink} target="_blank" rel="noopener noreferrer" className="hover:underline">
                          View on Google Maps
                      </a>
                  </div>
              )}
            </div>
            
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Start Date</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Calendar className="h-5 w-5 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
                </div>
                <input
                  required
                  type="date"
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:bg-white dark:focus:bg-slate-900 transition-all duration-200 ease-in-out"
                  value={formData.startDate}
                  onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Duration & Budget */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Duration (Days)</label>
              <div className="relative group">
                 <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Plane className="h-5 w-5 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
                </div>
                <input
                  required
                  type="number"
                  min="1"
                  max="30"
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:bg-white dark:focus:bg-slate-900 transition-all duration-200 ease-in-out"
                  value={formData.duration}
                  onChange={e => setFormData({ ...formData, duration: parseInt(e.target.value) || 1 })}
                />
              </div>
            </div>
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Budget Level</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Wallet className="h-5 w-5 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
                </div>
                <select
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:bg-white dark:focus:bg-slate-900 transition-all duration-200 ease-in-out appearance-none"
                  value={formData.budget}
                  onChange={e => setFormData({ ...formData, budget: e.target.value })}
                >
                  <option value="Low">Economy / Backpacker</option>
                  <option value="Medium">Standard / Comfort</option>
                  <option value="High">Luxury / First Class</option>
                </select>
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                  <svg className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Travelers & Language */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="space-y-3">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Travel Party</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Users className="h-5 w-5 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
                  </div>
                  <select
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:bg-white dark:focus:bg-slate-900 transition-all duration-200 ease-in-out appearance-none"
                    value={formData.travelers}
                    onChange={e => setFormData({ ...formData, travelers: e.target.value })}
                  >
                    <option value="Solo">Solo Explorer</option>
                    <option value="Couple">Couple</option>
                    <option value="Family">Family with Kids</option>
                    <option value="Friends">Group of Friends</option>
                    <option value="Seniors">Senior Travelers</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                    <svg className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
            </div>
             <div className="space-y-3">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Itinerary Language</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Globe className="h-5 w-5 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
                  </div>
                  <select
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:bg-white dark:focus:bg-slate-900 transition-all duration-200 ease-in-out appearance-none"
                    value={formData.language}
                    onChange={e => setFormData({ ...formData, language: e.target.value })}
                  >
                    <option value="English">English</option>
                    <option value="Spanish">Spanish</option>
                    <option value="French">French</option>
                    <option value="German">German</option>
                    <option value="Hindi">Hindi</option>
                    <option value="Chinese">Mandarin Chinese</option>
                    <option value="Japanese">Japanese</option>
                    <option value="Korean">Korean</option>
                    <option value="Arabic">Arabic</option>
                    <option value="Portuguese">Portuguese</option>
                    <option value="Russian">Russian</option>
                    <option value="Italian">Italian</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                    <svg className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
            </div>
          </div>

          {/* Interests */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Interests</label>
                <span className="text-xs text-slate-500 dark:text-slate-400">{formData.interests.length} selected</span>
            </div>
            
            <div className="flex flex-wrap gap-3">
              {INTERESTS_LIST.map(interest => (
                <button
                  key={interest}
                  type="button"
                  onClick={() => toggleInterest(interest)}
                  className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 border ${
                    formData.interests.includes(interest)
                      ? 'bg-teal-600 text-white border-teal-600 shadow-md shadow-teal-200 dark:shadow-teal-900/50 scale-105'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300'
                  }`}
                >
                  {interest}
                </button>
              ))}
               {/* Render Custom Added Interests */}
               {formData.interests
                    .filter(i => !INTERESTS_LIST.includes(i))
                    .map(interest => (
                         <button
                          key={interest}
                          type="button"
                          onClick={() => toggleInterest(interest)}
                          className="px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 border bg-teal-600 text-white border-teal-600 shadow-md shadow-teal-200 dark:shadow-teal-900/50 scale-105 flex items-center gap-2"
                        >
                          {interest}
                          <X className="w-3 h-3 ml-1" />
                        </button>
                    ))
                }
            </div>

            {/* Custom Interest Input */}
            <div className="relative flex items-center mt-3">
                 <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Heart className="h-4 w-4 text-slate-400" />
                 </div>
                 <input
                    type="text"
                    value={customInterest}
                    onChange={(e) => setCustomInterest(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddCustomInterest();
                        }
                    }}
                    placeholder="Add a custom interest (e.g. Pottery, Jazz, K-Pop)..."
                    className="w-full pl-10 pr-12 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all dark:text-white"
                 />
                 <button
                    type="button"
                    onClick={handleAddCustomInterest}
                    disabled={!customInterest.trim()}
                    className="absolute right-2 p-1.5 bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 rounded-lg hover:bg-teal-200 dark:hover:bg-teal-900/50 disabled:opacity-50 transition-colors"
                 >
                    <Plus className="w-4 h-4" />
                 </button>
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-bold text-lg rounded-xl shadow-xl shadow-teal-500/30 dark:shadow-teal-900/40 transform transition-all duration-300 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-3"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" /> Crafting Your MusafirX...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" /> Generate Itinerary
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
