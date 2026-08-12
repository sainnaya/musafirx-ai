import React, { useState } from 'react';
import { Itinerary, DayPlan, Activity } from '../types';
import { MapPin, Clock, DollarSign, ChevronRight, MessageSquare, ExternalLink, Calendar as CalendarIcon, Send, Lightbulb } from 'lucide-react';
import { askTravelAssistant } from '../services/geminiService';

interface ItineraryViewProps {
  itinerary: Itinerary;
}

export const ItineraryView: React.FC<ItineraryViewProps> = ({ itinerary }) => {
  const [activeDay, setActiveDay] = useState<number>(1);
  const [chatQuery, setChatQuery] = useState("");
  const [chatResponse, setChatResponse] = useState("");
  const [isChatting, setIsChatting] = useState(false);

  const handleChat = async (e: React.FormEvent) => {
    e.preventDefault(); 
    if (!chatQuery.trim()) return;
    setIsChatting(true);
    const context = `Trip to ${itinerary.title}. Day ${activeDay} plan: ${JSON.stringify(itinerary.days.find(d => d.day === activeDay))}`;
    const response = await askTravelAssistant(chatQuery, context);
    setChatResponse(response.text);
    setIsChatting(false);
  };

  return (
    <div className="w-full min-w-0 grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-8 animate-fade-in">
      {/* Sidebar Navigation */}
      <div className="min-w-0 lg:col-span-4 xl:col-span-3 space-y-6">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700 sticky top-24">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white leading-tight mb-2">{itinerary.title}</h2>
            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-4">
              <span className="px-2.5 py-1 bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 rounded-md font-medium text-xs uppercase tracking-wide">
                {(itinerary.days ?? []).length} Days
              </span>
              <span className="w-1 h-1 bg-slate-300 dark:bg-slate-600 rounded-full"></span>
              <span className="flex items-center text-slate-600 dark:text-slate-300 font-medium">
                <DollarSign className="w-3.5 h-3.5 mr-0.5" />{itinerary.totalEstimatedCost} {itinerary.currency}
              </span>
            </div>
            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">{itinerary.description}</p>
          </div>

          <div className="space-y-2 mb-8">
            <h3 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3 pl-1">Daily Schedule</h3>
            <div className="space-y-1">
              {(itinerary.days ?? []).map((day) => (
                <button
                  key={day.day}
                  onClick={() => setActiveDay(day.day)}
                  className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 flex justify-between items-center group ${activeDay === day.day
                      ? 'bg-teal-600 text-white shadow-md shadow-teal-200 dark:shadow-teal-900/50'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                    }`}
                >
                  <div className="flex flex-col">
                    <span className={`text-xs font-medium uppercase tracking-wide ${activeDay === day.day ? 'text-teal-200' : 'text-slate-400 dark:text-slate-500'}`}>
                      {day.date || `Day ${day.day}`}
                    </span>
                    <span className="font-semibold text-sm truncate max-w-[160px]">{day.theme}</span>
                  </div>
                  {activeDay === day.day && <ChevronRight className="w-4 h-4 text-teal-200" />}
                </button>
              ))}
            </div>
          </div>

          {/* AI Assistant Mini Chat */}
          <div className="pt-6 border-t border-slate-100 dark:border-slate-700">
            <h3 className="font-semibold text-slate-800 dark:text-white text-sm mb-3 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-teal-500" />
              <span>AI Assistant</span>
            </h3>

            <div className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 p-3 rounded-xl text-xs text-slate-600 dark:text-slate-300 mb-3 min-h-[60px] max-h-[150px] overflow-y-auto leading-relaxed">
              {chatResponse || "Need to adjust today's plan? Ask me anything!"}
            </div>

            <form onSubmit={handleChat} className="flex gap-2">
              <input
                type="text"
                value={chatQuery}
                onChange={e => setChatQuery(e.target.value)}
                placeholder="Suggest a dinner spot..."
                className="flex-1 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
              />
              <button
                type="submit"
                disabled={isChatting}
                className="bg-teal-600 text-white p-2 rounded-lg hover:bg-teal-700 disabled:opacity-50 transition-colors"
              >
                {isChatting ? (
                  <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <Send className="w-3 h-3" />
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Content / Timeline */}
      <div className="min-w-0 lg:col-span-8 xl:col-span-9">
        {(itinerary.days ?? [])
          .filter(d => d.day === activeDay)
          .map(day => (
            <div key={day.day} className="space-y-8">
              {/* Day Header */}
              <div className="relative rounded-3xl overflow-hidden shadow-xl shadow-slate-200/50 dark:shadow-none group min-h-56 sm:min-h-64">
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                  style={{ backgroundImage: `url(https://picsum.photos/1200/600?random=${day.day + 10})` }}
                ></div>
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-4 sm:p-6 md:p-8">
                  <div className="flex items-center gap-2 text-teal-300 font-bold uppercase tracking-wider text-sm mb-2">
                    <CalendarIcon className="w-4 h-4" />
                    {day.date || `Day ${day.day}`}
                  </div>
                  <h3 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white leading-tight break-words"></h3>
                </div>
              </div>

              {/* Timeline */}
              <div className="bg-white dark:bg-slate-800 rounded-3xl p-4 sm:p-6 md:p-8 shadow-sm border border-slate-100 dark:border-slate-700">
                <div className="space-y-10">
                  {day.activities.map((activity, idx) => (
                    <div key={idx} className="relative pl-10 sm:pl-12 group">
                      {/* Timeline Line */}
                      {idx !== day.activities.length - 1 && (
                        <div className="absolute left-[19px] sm:left-[23px] top-8 bottom-[-40px] w-[2px] bg-slate-100 dark:bg-slate-700 group-hover:bg-teal-50 dark:group-hover:bg-teal-900/30 transition-colors"></div>
                      )}

                      {/* Timeline Dot */}
                      <div className="absolute left-0 top-1.5 w-10 h-10 sm:w-12 sm:h-12 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-600 rounded-full flex items-center justify-center shadow-sm z-10 group-hover:border-teal-100 dark:group-hover:border-teal-700 group-hover:shadow-md transition-all">
                        <div className="w-3 h-3 bg-teal-500 rounded-full ring-4 ring-teal-50 dark:ring-teal-900/50 group-hover:ring-teal-100 dark:group-hover:ring-teal-900 transition-all"></div>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-3">
                        <div>
                          <h4 className="text-xl font-bold text-slate-800 dark:text-white group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors">{activity.activity}</h4>
                          <div className="flex items-center gap-3 mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">
                            <span className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-700 px-2 py-0.5 rounded text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-600">
                              <Clock className="w-3.5 h-3.5" /> {activity.time}
                            </span>
                            <span className="px-2 py-0.5 rounded text-teal-600 dark:text-teal-300 bg-teal-50 dark:bg-teal-900/30 border border-teal-100 dark:border-teal-900/50 capitalize text-xs">
                              {activity.type}
                            </span>
                          </div>
                        </div>
                        <div className="sm:text-right">
                          <div className="inline-flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded text-sm text-green-700 dark:text-green-400 border border-green-100 dark:border-green-900/30">
                            <DollarSign className="w-3.5 h-3.5" />{activity.estimatedCost}
                          </div>
                        </div>
                      </div>

                      <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4 text-sm sm:text-base bg-slate-50/50 dark:bg-slate-700/30 p-3 rounded-lg border border-slate-100/50 dark:border-slate-700/50">{activity.description}</p>

                      <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400 pt-1">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-4 h-4 text-rose-500" />
                          <span className="truncate max-w-[180px] sm:max-w-xs font-medium text-slate-600 dark:text-slate-300"></span>
                        </div>

                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activity.activity + " " + activity.location)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="ml-auto text-teal-600 dark:text-teal-400 hover:text-teal-800 dark:hover:text-teal-300 font-medium flex items-center gap-1.5 hover:underline decoration-2 underline-offset-2 transition-all"
                        >
                          View on Map <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}

        {/* Travel Tips Card */}
        <div className="mt-8 bg-amber-50/60 dark:bg-amber-900/20 rounded-2xl p-6 border border-amber-100/80 dark:border-amber-900/30">
          <h4 className="font-bold text-amber-900 dark:text-amber-400 mb-4 flex items-center gap-2 text-lg">
            <Lightbulb className="w-5 h-5 text-amber-500" /> Local Insights & Tips
          </h4>
          <div className="grid gap-3 sm:grid-cols-2">
            {itinerary.travelTips.map((tip, i) => (
              <div key={i} className="flex gap-3 text-amber-900/80 dark:text-amber-200 text-sm bg-white/60 dark:bg-slate-800/60 p-3 rounded-xl border border-amber-100/50 dark:border-amber-900/20">
                <span className="font-bold text-amber-500 text-lg leading-none">•</span>
                {tip}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};