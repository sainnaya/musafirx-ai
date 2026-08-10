
import React, { useEffect, useState, useRef } from 'react';
import { ArrowRight, Sparkles, Globe, Map, CreditCard, Users, Compass, Camera, Play, TrendingUp, Search, CheckCircle2, Plane, ChevronDown, X } from 'lucide-react';

interface LandingPageProps {
  onStart: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  const [scrollY, setScrollY] = useState(0);
  const [showDemo, setShowDemo] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
        setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Parallax calculations for the hero
  const heroOpacity = Math.max(0, 1 - scrollY * 0.0012);
  const heroScale = 1 + scrollY * 0.0002;
  const heroY = scrollY * 0.4;

  // Toggle body scroll when modal is open
  useEffect(() => {
    if (showDemo) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [showDemo]);

  return (
    <div className="relative w-full -mt-20 font-sans selection:bg-teal-500 selection:text-white">
       
       {/* 1. STICKY HERO (Background Layer) */}
       {/* This stays fixed while the content below slides over it */}
       <div className="sticky top-0 h-screen w-full flex flex-col items-center justify-center z-0 overflow-hidden bg-slate-50 dark:bg-black">
          
          {/* Animated Gradient Orbs */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
             <div className="absolute top-[10%] left-[10%] w-[60vw] h-[60vw] bg-teal-500/20 rounded-full blur-[100px] animate-blob mix-blend-multiply dark:mix-blend-screen" />
             <div className="absolute bottom-[10%] right-[10%] w-[60vw] h-[60vw] bg-purple-600/20 rounded-full blur-[100px] animate-blob animation-delay-2000 mix-blend-multiply dark:mix-blend-screen" />
             <div className="absolute top-[40%] left-[40%] w-[40vw] h-[40vw] bg-indigo-500/10 rounded-full blur-[120px] animate-pulse" />
             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] dark:opacity-[0.08]"></div>
          </div>

          {/* Hero Content */}
          <div 
            className="relative z-10 max-w-7xl mx-auto px-6 text-center transform will-change-transform"
            style={{ transform: `translateY(${heroY}px) scale(${heroScale})`, opacity: heroOpacity }}
          >
             {/* Glass Badge */}
             <div className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-white/30 dark:border-white/10 text-slate-700 dark:text-slate-200 text-xs font-bold uppercase tracking-[0.2em] mb-12 shadow-xl animate-fade-in-up ring-1 ring-white/20 hover:scale-105 transition-transform duration-300">
                <Sparkles className="w-4 h-4 text-teal-500 animate-pulse" />
                <span>Powered by Gemini 3.1 Flash Lite</span>
             </div>
             
             {/* Hybrid Typography: Cinematic & Massive */}
             <h1 className="text-6xl md:text-9xl font-black tracking-tighter text-slate-900 dark:text-white mb-8 leading-[0.9] drop-shadow-sm">
                <span className="block animate-fade-in-up" style={{animationDelay: '0.1s'}}>FUTURE OF</span>
                <span className="block animate-fade-in-up text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-cyan-400 to-indigo-500 animate-gradient-x bg-[length:200%_auto]" style={{animationDelay: '0.2s'}}>TRAVEL</span>
             </h1>

             <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto mb-14 font-medium leading-relaxed animate-fade-in-up" style={{animationDelay: '0.4s'}}>
                The first platform that thinks like a local and plans like a pro. 
                <span className="block mt-2 text-slate-900 dark:text-white font-bold"> Generative AI. Real-time Budgets. Viral Content.</span>
             </p>

             {/* Magnetic Buttons */}
             <div className="flex flex-col sm:flex-row items-center justify-center gap-6 animate-fade-in-up" style={{animationDelay: '0.6s'}}>
                <button 
                    onClick={onStart}
                    className="group relative px-12 py-6 bg-slate-900 dark:bg-white text-white dark:text-black rounded-full font-bold text-lg hover:scale-105 transition-transform duration-300 overflow-hidden shadow-2xl shadow-teal-900/20"
                >
                    <span className="relative z-10 flex items-center gap-2">Start Planning <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform"/></span>
                    <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-cyan-500 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500 ease-out" />
                </button>
                
                <button 
                  onClick={() => setShowDemo(true)}
                  className="flex items-center gap-3 px-8 py-6 rounded-full bg-white/50 dark:bg-slate-800/50 backdrop-blur-md border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 transition-all font-semibold text-slate-700 dark:text-slate-200 group"
                >
                    <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Play className="w-3 h-3 fill-current ml-0.5" />
                    </div>
                    Watch Demo
                </button>
             </div>
          </div>
          
          <div className="absolute bottom-12 animate-bounce-subtle opacity-50">
             <ChevronDown className="w-6 h-6 text-slate-400" />
          </div>
       </div>

       {/* 2. OVERLAY CONTENT (Foreground Layer) */}
       {/* High Z-Index ensures this slides OVER the sticky hero */}
       <div className="relative z-20 bg-white dark:bg-black rounded-t-[3.5rem] md:rounded-t-[5rem] shadow-[0_-20px_60px_-15px_rgba(0,0,0,0.1)] border-t border-slate-100 dark:border-white/5 overflow-hidden">
          
          {/* MARQUEE STRIP */}
          <div className="w-full bg-teal-500 text-teal-950 py-5 overflow-hidden relative z-30">
              <div className="animate-marquee whitespace-nowrap flex gap-12 font-black text-xl md:text-2xl uppercase tracking-tighter items-center">
                  {Array(10).fill("Plan • Explore • Connect • Budget • Experience • ").map((text, i) => (
                      <span key={i} className="flex items-center gap-4">{text} <Sparkles className="w-4 h-4" /></span>
                  ))}
              </div>
          </div>

          <div className="max-w-7xl mx-auto px-6 pt-32 pb-20">
              
              {/* BENTO GRID */}
              <div className="mb-40">
                   <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
                       <div>
                          <h2 className="text-teal-500 font-bold uppercase tracking-widest text-sm mb-2">Features</h2>
                          <h3 className="text-5xl md:text-6xl font-black tracking-tighter text-slate-900 dark:text-white">
                             Everything you need.<br/>Nothing you don't.
                          </h3>
                       </div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-6 md:grid-rows-2 gap-6 h-auto md:h-[700px]">
                       
                       {/* CARD 1: AI Planner */}
                       <div className="md:col-span-4 md:row-span-2 bg-slate-100 dark:bg-slate-900/50 rounded-[2.5rem] p-10 relative overflow-hidden group border border-slate-200 dark:border-slate-800 hover:border-teal-500/50 transition-colors">
                           <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-[100px] group-hover:bg-teal-500/20 transition-colors"></div>
                           
                           <div className="relative z-10 h-full flex flex-col justify-between">
                               <div>
                                   <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-8 shadow-sm">
                                       <Sparkles className="w-8 h-8 text-teal-500" />
                                   </div>
                                   <h3 className="text-4xl font-bold mb-4 text-slate-900 dark:text-white">Generative<br/>Intelligence</h3>
                                   <p className="text-slate-500 dark:text-slate-400 text-lg max-w-sm leading-relaxed">
                                       Our Gemini 2.5 Flash model processes millions of data points to build your perfect trip in seconds.
                                   </p>
                               </div>
                               
                               <div className="bg-white dark:bg-black rounded-2xl p-6 shadow-xl border border-slate-100 dark:border-slate-800 transform group-hover:-translate-y-2 transition-transform duration-500">
                                   <div className="flex items-center gap-3 mb-4">
                                       <div className="w-8 h-8 rounded-full bg-teal-100 dark:bg-teal-900 flex items-center justify-center">
                                           <Sparkles className="w-4 h-4 text-teal-600" />
                                       </div>
                                       <div className="h-2 w-24 bg-slate-100 dark:bg-slate-800 rounded"></div>
                                   </div>
                                   <div className="space-y-3">
                                       <div className="p-3 bg-teal-50 dark:bg-teal-900/20 rounded-xl rounded-tl-none text-sm text-teal-800 dark:text-teal-200">
                                           "I found a hidden jazz bar in Tokyo that matches your vibe."
                                       </div>
                                       <div className="flex gap-2">
                                           <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded"></div>
                                           <div className="h-2 w-2/3 bg-slate-100 dark:bg-slate-800 rounded"></div>
                                       </div>
                                   </div>
                               </div>
                           </div>
                       </div>

                       {/* CARD 2: Social Studio */}
                       <div className="md:col-span-2 md:row-span-1 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[2.5rem] p-8 text-white relative overflow-hidden group shadow-lg">
                           <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30"></div>
                           <div className="relative z-10">
                               <div className="flex justify-between items-start mb-12">
                                  <Camera className="w-10 h-10 text-white/90" />
                                  <div className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-bold tracking-wider">VIRAL READY</div>
                               </div>
                               <h3 className="text-2xl font-bold mb-2">Social Studio</h3>
                               <p className="text-indigo-100 text-sm opacity-90">Auto-generate Reels & TikToks from your photos.</p>
                           </div>
                           <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-white/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                       </div>

                       {/* CARD 3: Budget */}
                       <div className="md:col-span-2 md:row-span-1 bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 flex flex-col justify-center items-center text-center group border border-slate-200 dark:border-slate-800 hover:border-rose-500/50 transition-all shadow-sm">
                           <div className="w-20 h-20 bg-rose-50 dark:bg-rose-900/20 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                               <TrendingUp className="w-10 h-10 text-rose-500" />
                           </div>
                           <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">Smart Budget</h3>
                           <p className="text-slate-500 text-sm">Real-time expense tracking.</p>
                       </div>

                   </div>
              </div>

              {/* HOW IT WORKS */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center mb-40">
                  <div className="space-y-16">
                      <div className="space-y-6">
                           <h2 className="text-5xl font-black text-slate-900 dark:text-white leading-tight">
                              From dream to destination in <span className="text-teal-500">three steps.</span>
                           </h2>
                           <p className="text-lg text-slate-500 dark:text-slate-400">
                              Stop spending weeks planning. Let our advanced AI models handle the logistics while you focus on the excitement.
                           </p>
                      </div>

                      <div className="space-y-12">
                          {[
                              { num: '01', title: 'Define Your Vibe', desc: 'Tell us your budget, interests, and style.', icon: Search },
                              { num: '02', title: 'Get The Blueprint', desc: 'Receive a fully fleshed-out itinerary instantly.', icon: Map },
                              { num: '03', title: 'Roam Freely', desc: 'Adapt on the go with your AI pocket guide.', icon: Compass }
                          ].map((step, i) => (
                              <div key={i} className="flex gap-6 group">
                                  <div className="relative">
                                     <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center z-10 relative group-hover:bg-teal-500 transition-colors duration-300">
                                         <step.icon className="w-6 h-6 text-slate-400 group-hover:text-white transition-colors" />
                                     </div>
                                     {i !== 2 && <div className="absolute top-14 left-7 w-0.5 h-16 bg-slate-200 dark:bg-slate-800 -z-0"></div>}
                                  </div>
                                  <div className="pt-2">
                                      <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{step.title}</h4>
                                      <p className="text-slate-500 dark:text-slate-400 leading-relaxed">{step.desc}</p>
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>

                  {/* 3D Floating Card */}
                  <div className="relative animate-float perspective-1000">
                      <div className="absolute inset-0 bg-gradient-to-tr from-teal-500 to-purple-500 rounded-[3rem] blur-3xl opacity-20 transform rotate-6 scale-95" />
                      
                      {/* The Card */}
                      <div className="relative bg-white dark:bg-slate-900 rounded-[3rem] p-8 shadow-2xl border border-slate-100 dark:border-slate-800 transform rotate-[-2deg] hover:rotate-0 transition-all duration-500">
                          {/* Fake App Interface */}
                          <div className="flex items-center justify-between mb-8">
                              <div className="flex items-center gap-4">
                                  <div className="w-14 h-14 bg-teal-100 dark:bg-teal-900/30 rounded-2xl flex items-center justify-center">
                                      <Plane className="w-7 h-7 text-teal-600 dark:text-teal-400" />
                                  </div>
                                  <div>
                                      <div className="h-2.5 w-28 bg-slate-200 dark:bg-slate-700 rounded mb-2"></div>
                                      <div className="h-2 w-16 bg-slate-100 dark:bg-slate-800 rounded"></div>
                                  </div>
                              </div>
                              <div className="flex gap-1.5">
                                  <div className="w-2.5 h-2.5 rounded-full bg-slate-200 dark:bg-slate-700"></div>
                                  <div className="w-2.5 h-2.5 rounded-full bg-slate-200 dark:bg-slate-700"></div>
                              </div>
                          </div>
                          
                          <div className="space-y-4 mb-8">
                              {[1, 2, 3].map(i => (
                                  <div key={i} className="flex gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-transparent hover:border-teal-200 dark:hover:border-teal-800 transition-colors cursor-default group/item">
                                      <div className="text-xs font-bold text-slate-400 pt-1 w-10">09:00</div>
                                      <div className="flex-1 space-y-2">
                                          <div className="h-2.5 w-3/4 bg-slate-200 dark:bg-slate-700 rounded group-hover/item:bg-teal-200 dark:group-hover/item:bg-teal-800 transition-colors"></div>
                                          <div className="h-2 w-1/2 bg-slate-100 dark:bg-slate-800 rounded"></div>
                                      </div>
                                      <CheckCircle2 className="w-6 h-6 text-teal-500 opacity-0 group-hover/item:opacity-100 transition-opacity" />
                                  </div>
                              ))}
                          </div>

                          <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-slate-800">
                              <div className="flex -space-x-3">
                                  {[1,2,3].map(i => (
                                      <div key={i} className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-700 border-2 border-white dark:border-slate-900"></div>
                                  ))}
                              </div>
                              <button className="px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-bold rounded-xl shadow-lg">
                                  View Trip
                              </button>
                          </div>
                      </div>
                  </div>
              </div>

              {/* HUGE FOOTER CTA */}
              <div className="relative rounded-[3rem] bg-slate-900 dark:bg-white overflow-hidden py-32 px-8 text-center text-white dark:text-slate-900">
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                  <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/30 rounded-full blur-[100px] transform translate-x-1/2 -translate-y-1/2"></div>
                  <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/30 rounded-full blur-[100px] transform -translate-x-1/2 translate-y-1/2"></div>
                  
                  <div className="relative z-10 max-w-4xl mx-auto">
                      <h2 className="text-5xl md:text-7xl font-black tracking-tighter mb-8 leading-tight">Ready to jet?</h2>
                      <p className="text-xl text-slate-400 dark:text-slate-500 mb-12 max-w-2xl mx-auto">
                          Join thousands of travelers planning smarter, not harder. No credit card required.
                      </p>
                      <button 
                         onClick={onStart}
                         className="px-12 py-6 bg-teal-500 hover:bg-teal-400 text-white font-bold text-xl rounded-full transition-all shadow-xl shadow-teal-500/30 hover:shadow-teal-500/50 hover:-translate-y-1"
                        >
                         Start Your Journey
                      </button>
                  </div>
              </div>

              {/* Footer Links */}
              <div className="flex flex-col md:flex-row justify-between items-center py-12 text-sm text-slate-400 font-medium mt-12 border-t border-slate-100 dark:border-white/5">
                  <p>&copy; 2025 MusafirX AI. All rights reserved.</p>
                  <div className="flex gap-8 mt-4 md:mt-0">
                      <a href="#" className="hover:text-teal-500 transition-colors">Privacy</a>
                      <a href="#" className="hover:text-teal-500 transition-colors">Terms</a>
                      <a href="#" className="hover:text-teal-500 transition-colors">Contact</a>
                  </div>
              </div>

          </div>
       </div>

       {/* DEMO VIDEO MODAL */}
       {showDemo && (
         <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8 animate-fade-in">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-slate-900/90 backdrop-blur-md transition-opacity duration-300"
                onClick={() => setShowDemo(false)}
            />
            {/* Modal Content */}
            <div className="relative w-full max-w-5xl aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl animate-fade-in-up border border-white/10 ring-1 ring-white/10">
                <button 
                    onClick={() => setShowDemo(false)}
                    className="absolute top-6 right-6 z-20 p-2.5 bg-black/50 hover:bg-white hover:text-black text-white rounded-full transition-all backdrop-blur-md border border-white/10"
                    aria-label="Close demo"
                >
                    <X className="w-5 h-5" />
                </button>
                <div className="absolute inset-0 flex items-center justify-center bg-black">
                     <iframe 
                        width="100%" 
                        height="100%" 
                        src="https://www.youtube.com/embed/ysz5S6PUM-U?autoplay=1&rel=0&modestbranding=1&controls=1" 
                        title="MusafirX Experience" 
                        frameBorder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowFullScreen
                        className="w-full h-full object-cover"
                    ></iframe>
                </div>
            </div>
         </div>
       )}
    </div>
  );
};
