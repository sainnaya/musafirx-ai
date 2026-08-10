
import React, { useState, useEffect } from 'react';
import { TourGuide } from '../types';
import { Star, Languages, Clock, ShieldCheck, ArrowRight, Loader2, MapPin, Search } from 'lucide-react';
import { generateTourGuides } from '../services/geminiService';

interface GuideFinderProps {
  destination?: string;
}

const POPULAR_DESTINATIONS = ["Tokyo, Japan", "Paris, France", "New York, USA", "Rome, Italy", "Barcelona, Spain", "Sydney, Australia", "Cape Town, South Africa", "Brazil, Istanbul", "Turkey", "Bangkok, Thailand", "Dubai, UAE", "London, UK", "Marrakech, Morocco", "San Francisco, USA", "Los Angeles, USA", "Singapore", "Seoul, South Korea", "Hong Kong, China", "Amsterdam, Netherlands", "Lisbon, Portugal", "Goa, India", "Vienna, Austria", "Prague, Czech Republic", "Budapest, Hungary", "Athens, Greece", "Cairo, Egypt", "Havana, Cuba", "Buenos Aires, Argentina", "Mexico City, Mexico", "Vancouver, Canada", "Montreal, Canada", "Toronto, Canada", "Kuala Lumpur, Malaysia", "Jakarta, Indonesia", "Manila, Philippines", "Helsinki, Finland", "Oslo, Norway", "Stockholm, Sweden", "Goa , India", "Bali, Indonesia", "Phuket, Thailand", "Maldives", "Santorini, Greece", "Mykonos, Greece", "Dubrovnik, Croatia", "Venice, Italy", "Florence, Italy", "Milan, Italy", "Zurich, Switzerland", "Geneva, Switzerland", "Interlaken, Switzerland", "Lucerne, Switzerland", "Innsbruck, Austria", "Salzburg, Austria", "Bruges, Belgium", "Ghent, Belgium", "Maastricht, Netherlands"

];

export const GuideFinder: React.FC<GuideFinderProps> = ({ destination }) => {
  const [guides, setGuides] = useState<TourGuide[]>([]);
  const [loading, setLoading] = useState(false);
  const [targetLocation, setTargetLocation] = useState(destination || "");
  const [searchInput, setSearchInput] = useState("");

  useEffect(() => {
    if (destination) {
      setTargetLocation(destination);
      fetchGuides(destination);
    }
  }, [destination]);

  const fetchGuides = async (location: string) => {
    if (!location) return;
    setLoading(true);
    try {
      const data = await generateTourGuides(location);
      setGuides(data);
    } catch (e) {
      console.error("Failed to load guides", e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setTargetLocation(searchInput);
      fetchGuides(searchInput);
    }
  };

  return (
    <div className="animate-fade-in max-w-6xl mx-auto min-h-[600px]">
      <div className="mb-12 text-center max-w-2xl mx-auto">
        <span className="text-teal-600 dark:text-teal-400 font-semibold tracking-wide uppercase text-xs bg-teal-50 dark:bg-teal-900/30 px-3 py-1 rounded-full mb-4 inline-block">
          AI-Matched Locals
        </span>
        <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight">
          Find a Local Guide
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-lg mb-8">
          Enhance your trip with customized tours led by vetted locals who know the city best.
        </p>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="relative max-w-md mx-auto">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-slate-400" />
          </div>
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Enter city (e.g. Kyoto, Japan)..."
            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 dark:text-white"
          />
          <button
            type="submit"
            className="absolute right-2 top-1.5 bottom-1.5 bg-teal-600 hover:bg-teal-700 text-white px-4 rounded-lg text-sm font-medium transition-colors"
          >
            Search
          </button>
        </form>
      </div>

      {targetLocation && (
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 px-4">Guides in {targetLocation}</h3>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 text-teal-500 animate-spin mb-4" />
          <p className="text-slate-500">Finding best local experts in {targetLocation}...</p>
        </div>
      ) : guides.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {guides.map(guide => (
            <div key={guide.id} className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
              <div className="h-28 bg-gradient-to-r from-slate-800 to-slate-900 relative">
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '20px 20px' }}></div>
              </div>
              <div className="px-6 relative">
                <div className="absolute -top-12 left-6 p-1 bg-white dark:bg-slate-800 rounded-full">
                  <img src={guide.imageUrl} alt={guide.name} className="w-24 h-24 rounded-full object-cover border-2 border-white dark:border-slate-700 shadow-md" />
                </div>
                <div className="pt-16 pb-6">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        {guide.name}
                        <ShieldCheck className="w-5 h-5 text-teal-500" />
                      </h3>
                      <p className="text-teal-600 dark:text-teal-400 font-medium text-sm mt-0.5">{guide.specialty}</p>
                    </div>
                    <div className="text-right bg-slate-50 dark:bg-slate-700/50 px-3 py-1 rounded-lg">
                      <span className="block text-lg font-bold text-slate-900 dark:text-white">${guide.ratePerHour}</span>
                      <span className="block text-slate-400 dark:text-slate-500 text-xs font-medium uppercase tracking-wider">/ hr</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 mb-6 text-amber-500">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="font-bold text-slate-800 dark:text-slate-200">{guide.rating}</span>
                    <span className="text-slate-400 dark:text-slate-500 text-sm">(120+ reviews)</span>
                  </div>

                  <div className="space-y-4 border-t border-slate-100 dark:border-slate-700 pt-5">
                    <div className="flex items-start gap-3 text-sm">
                      <Languages className="w-5 h-5 text-slate-400 dark:text-slate-500 mt-0.5" />
                      <div>
                        <p className="font-semibold text-slate-700 dark:text-slate-300 mb-1">Languages</p>
                        <div className="flex flex-wrap gap-1">
                          {guide.languages.map(lang => (
                            <span key={lang} className="text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded">
                              {lang}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <button className="w-full mt-8 bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-3.5 rounded-xl font-bold text-sm hover:bg-teal-600 dark:hover:bg-teal-500 dark:hover:text-white transition-colors flex items-center justify-center gap-2 group-hover:shadow-lg group-hover:shadow-teal-500/20">
                    Book Now <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
          <MapPin className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-2">No location selected</h3>
          <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-md mx-auto">
            {destination ? "We couldn't find guides for your specific destination." : "Please enter a destination above to find local experts."}
          </p>
          {!destination && (
            <div className="flex flex-wrap justify-center gap-2">
              <span className="text-xs text-slate-400 uppercase font-bold mr-2 mt-1.5">Popular:</span>
              {POPULAR_DESTINATIONS.map(city => (
                <button
                  key={city}
                  onClick={() => { setSearchInput(city); setTargetLocation(city); fetchGuides(city); }}
                  className="px-3 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-sm hover:border-teal-500 hover:text-teal-600 transition-colors"
                >
                  {city}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
