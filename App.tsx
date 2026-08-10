
import React, { useState, useEffect } from 'react';
import { PlannerForm } from './components/PlannerForm';
import { ItineraryView } from './components/ItineraryView';
import { ExpenseDashboard } from './components/ExpenseDashboard';
import { CommunityHub } from './components/CommunityHub';
import { GuideFinder } from './components/GuideFinder';
import { UserProfileView } from './components/UserProfileView';
import { SocialMediaGenerator } from './components/SocialMediaGenerator';
import { ChatBot } from './components/ChatBot';
import { LandingPage } from './components/LandingPage';
import { generateItinerary } from './services/geminiService';
import { AppState, Itinerary, TripPreferences } from './types';
import { Globe, Layout, Users, CreditCard, Compass, Menu, X, ArrowLeft, ChevronRight, Moon, Sun, User, Camera, Home, Sparkles } from 'lucide-react';

export default function App() {
  const [appState, setAppState] = useState<AppState>(() => {
    return (localStorage.getItem('musafirx_state') as AppState) || AppState.HOME;
  });
  
  const [currentItinerary, setCurrentItinerary] = useState<Itinerary | null>(() => {
    const saved = localStorage.getItem('musafirx_itinerary');
    return saved ? JSON.parse(saved) : null;
  });

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('musafirx_theme') === 'dark';
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('musafirx_state', appState);
  }, [appState]);

  useEffect(() => {
    if (currentItinerary) {
      localStorage.setItem('musafirx_itinerary', JSON.stringify(currentItinerary));
    }
  }, [currentItinerary]);

  useEffect(() => {
    localStorage.setItem('musafirx_theme', darkMode ? 'dark' : 'light');
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleItinerarySubmit = async (prefs: TripPreferences) => {
    setIsLoading(true);
    try {
      const itinerary = await generateItinerary(prefs);
      setCurrentItinerary(itinerary);
      setAppState(AppState.ITINERARY);
    } catch (error) {
      alert("Failed to generate itinerary. Please try again. Ensure API Key is set.");
    } finally {
      setIsLoading(false);
    }
  };

  const NavItem = ({ state, icon: Icon, label }: { state: AppState; icon: any; label: string }) => (
    <button
      onClick={() => {
        setAppState(state);
        setMobileMenuOpen(false);
      }}
      className={`group flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
        appState === state
          ? 'bg-teal-600 text-white shadow-md shadow-teal-200 dark:shadow-none'
          : 'text-slate-600 dark:text-slate-300 hover:bg-teal-50 dark:hover:bg-slate-800 hover:text-teal-600 dark:hover:text-teal-400'
      }`}
    >
      <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${appState === state ? 'text-white' : 'text-slate-400 dark:text-slate-500 group-hover:text-teal-600 dark:group-hover:text-teal-400'}`} />
      {label}
    </button>
  );

  return (
    <div className={`min-h-screen font-sans flex flex-col transition-colors duration-300 ${darkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'} selection:bg-teal-100 selection:text-teal-900 dark:selection:bg-teal-900 dark:selection:text-teal-100`}>
      {/* Navigation - Glassmorphism */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-800/60 shadow-sm transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center cursor-pointer group" onClick={() => setAppState(AppState.HOME)}>
              <div className="bg-gradient-to-br from-teal-500 to-cyan-600 p-2 rounded-xl shadow-lg shadow-teal-500/20 group-hover:shadow-teal-500/30 transition-all duration-300">
                <Globe className="h-5 w-5 text-white" />
              </div>
              <span className="ml-3 text-xl font-bold tracking-tight text-slate-800 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                MusafirX
              </span>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center space-x-1">
              <NavItem state={AppState.HOME} icon={Home} label="Home" />
              <NavItem state={AppState.PLANNING} icon={Layout} label="Plan Trip" />
              
              {currentItinerary && <NavItem state={AppState.ITINERARY} icon={Compass} label="My Trip" />}
              <NavItem state={AppState.EXPENSES} icon={CreditCard} label="Expenses" />
              <NavItem state={AppState.SOCIAL_STUDIO} icon={Camera} label="Social Studio" />
              <NavItem state={AppState.COMMUNITY} icon={Users} label="Community" />
              <NavItem state={AppState.GUIDES} icon={Globe} label="Guides" />
            </div>

            <div className="hidden md:flex items-center gap-3">
               <button 
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-400 transition-colors"
                title="Toggle Dark Mode"
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
               <button 
                 onClick={() => setAppState(AppState.PROFILE)}
                 className={`p-2 rounded-full transition-colors ${appState === AppState.PROFILE ? 'bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-400'}`}
               >
                 <User className="w-5 h-5" />
               </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="flex items-center gap-3 md:hidden">
               <button 
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-400 transition-colors"
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
                className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-4 space-y-2 shadow-xl absolute w-full z-40">
             <NavItem state={AppState.HOME} icon={Home} label="Home" />
             <NavItem state={AppState.PLANNING} icon={Layout} label="Plan Trip" />
              {currentItinerary && <NavItem state={AppState.ITINERARY} icon={Compass} label="My Trip" />}
              <NavItem state={AppState.EXPENSES} icon={CreditCard} label="Expenses" />
              <NavItem state={AppState.SOCIAL_STUDIO} icon={Camera} label="Social Studio" />
              <NavItem state={AppState.COMMUNITY} icon={Users} label="Community" />
              <NavItem state={AppState.GUIDES} icon={Globe} label="Guides" />
              <NavItem state={AppState.PROFILE} icon={User} label="My Profile" />
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {appState === AppState.HOME && (
          <div className="space-y-12">
            {!currentItinerary ? (
               <LandingPage onStart={() => setAppState(AppState.PLANNING)} />
            ) : (
              <div className="text-center py-20 animate-fade-in">
                 <div className="inline-flex items-center justify-center p-4 bg-teal-50 dark:bg-teal-900/30 rounded-full mb-6">
                    <Compass className="w-12 h-12 text-teal-600 dark:text-teal-400" />
                 </div>
                 <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight">Welcome Back!</h2>
                 <p className="text-lg text-slate-600 dark:text-slate-300 mb-10 max-w-lg mx-auto leading-relaxed">
                   Your personalized itinerary for <span className="text-teal-600 dark:text-teal-400 font-bold">{currentItinerary.title}</span> is ready.
                 </p>
                 <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <button 
                      onClick={() => setAppState(AppState.ITINERARY)}
                      className="inline-flex items-center justify-center px-8 py-4 bg-teal-600 text-white rounded-xl font-semibold shadow-lg shadow-teal-500/30 dark:shadow-teal-900/30 hover:bg-teal-700 hover:shadow-teal-500/40 hover:-translate-y-0.5 transition-all duration-300"
                    >
                      View Itinerary <ChevronRight className="w-4 h-4 ml-2" />
                    </button>
                    <button 
                      onClick={() => {
                        if(confirm("Are you sure? This will delete your current itinerary.")) {
                           setCurrentItinerary(null);
                           localStorage.removeItem('musafirx_itinerary');
                           setAppState(AppState.PLANNING); // Go to planning after reset
                        }
                      }}
                      className="inline-flex items-center justify-center px-8 py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-300 transition-all duration-300"
                    >
                      Create New Plan
                    </button>
                 </div>
              </div>
            )}
          </div>
        )}

        {appState === AppState.PLANNING && (
             <PlannerForm onSubmit={handleItinerarySubmit} isLoading={isLoading} />
        )}

        {appState === AppState.ITINERARY && currentItinerary && (
          <ItineraryView itinerary={currentItinerary} />
        )}

        {appState === AppState.EXPENSES && (
           <ExpenseDashboard />
        )}

        {appState === AppState.SOCIAL_STUDIO && (
           <SocialMediaGenerator itinerary={currentItinerary} />
        )}

        {appState === AppState.COMMUNITY && (
           <CommunityHub destination={currentItinerary?.destination} />
        )}

         {appState === AppState.GUIDES && (
           <GuideFinder destination={currentItinerary?.destination} />
        )}

        {appState === AppState.PROFILE && (
           <UserProfileView />
        )}
        
        {/* Fallback for Itinerary state if empty */}
        {appState === AppState.ITINERARY && !currentItinerary && (
            <div className="flex flex-col items-center justify-center py-32 text-center animate-fade-in">
                <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
                    <Compass className="w-10 h-10 text-slate-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No Plan Yet</h3>
                <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-sm">You haven't generated a travel plan yet. Head over to the planner to get started.</p>
                <button 
                    onClick={() => setAppState(AppState.PLANNING)}
                    className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-teal-600 dark:text-teal-400 font-semibold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-teal-200 transition-all"
                >
                    <ArrowLeft className="w-4 h-4"/> Go to Planner
                </button>
            </div>
        )}
      </main>

      {/* Persistent ChatBot - Pass current itinerary for context */}
      <ChatBot currentItinerary={currentItinerary} />

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
               <Globe className="w-5 h-5 text-teal-600 dark:text-teal-400" />
               <p className="text-sm font-medium text-slate-900 dark:text-white">MusafirX AI</p>
            </div>
            
            {/* Powered by AI Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <Sparkles className="w-3.5 h-3.5 text-teal-500" />
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Powered by Gemini 3.1 Flash Lite AI</span>
            </div>

            <div className="flex flex-wrap justify-center gap-6 text-sm text-slate-500 dark:text-slate-400">
              <span className="hover:text-teal-600 dark:hover:text-teal-400 cursor-pointer transition-colors">© 2025 All rights reserved</span>
              <a href="#" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">Privacy</a>
              <a href="#" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">Terms</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
