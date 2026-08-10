import React, { useState, useEffect, useRef } from 'react';
import { Itinerary, Photo, SocialMediaContent, UserVoiceProfile } from '../types';
import { generateSocialMediaContent, analyzeImageForSocial } from '../services/geminiService';
import { Camera, Wand2, Share2, Instagram, Facebook, Linkedin, Twitter, FileText, Video, Copy, Check, Loader2, RefreshCw, Upload, Image as ImageIcon, Sparkles, MapPin, MessageCircle, ExternalLink, Smartphone } from 'lucide-react';

interface SocialMediaGeneratorProps {
  itinerary: Itinerary | null;
}

const DEFAULT_VOICE: UserVoiceProfile = {
  tone: 'casual',
  audience: 'friends',
  emojiStyle: 'minimal',
  hashtagCount: 5
};

export const SocialMediaGenerator: React.FC<SocialMediaGeneratorProps> = ({ itinerary }) => {
  const [voice, setVoice] = useState<UserVoiceProfile>(DEFAULT_VOICE);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [generatedContent, setGeneratedContent] = useState<SocialMediaContent | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'instagram' | 'twitter' | 'tiktok' | 'linkedin' | 'blog'>('instagram');
  const [copied, setCopied] = useState(false);

  // New states for Image Analysis
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzedResult, setAnalyzedResult] = useState<{caption: string, hashtags: string[], location: string} | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Generate "Virtual" photos from itinerary activities on mount
  useEffect(() => {
    if (itinerary) {
      const virtualPhotos: Photo[] = itinerary.days.flatMap(day => 
        day.activities.slice(0, 2).map((act, idx) => ({
          id: `${day.day}-${idx}`,
          url: `https://picsum.photos/400/300?random=${day.day}${idx}`,
          description: `Photo of ${act.activity}`,
          location: act.location,
          timestamp: `Day ${day.day} - ${act.time}`,
          aiTags: [act.type, 'travel', itinerary.title],
          aestheticScore: Math.floor(Math.random() * 20) + 80
        }))
      );
      setPhotos(virtualPhotos.slice(0, 6)); // Take top 6 for demo
    }
  }, [itinerary]);

  const handleGenerate = async () => {
    if (!itinerary) return;
    setIsLoading(true);
    try {
      const content = await generateSocialMediaContent(itinerary, photos, voice);
      setGeneratedContent(content);
    } catch (e) {
      console.error(e);
      alert("Failed to generate content. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
        setAnalyzedResult(null); // Reset previous analysis
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyzeImage = async () => {
    if (!uploadedImage) return;
    setIsAnalyzing(true);
    try {
      // Remove data:image/jpeg;base64, prefix
      const base64Data = uploadedImage.split(',')[1];
      const result = await analyzeImageForSocial(base64Data, `Trip to ${itinerary?.title || 'a beautiful destination'}`);
      setAnalyzedResult(result);
    } catch (e) {
      console.error(e);
      alert("Could not analyze image. Please try another.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Share Handlers
  const shareToTwitter = (text: string) => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
  };

  const shareToWhatsApp = (text: string) => {
     window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const openInstagram = () => {
     // Instagram doesn't allow direct posting via web API for text, just open the site
     window.open('https://instagram.com', '_blank');
  };

  const openLinkedIn = () => {
      window.open('https://www.linkedin.com/feed/', '_blank');
  };

  const handleNativeShare = async (platform: string, text: string) => {
    // If we have an uploaded image and navigator.share supports files, try native share first
    if (uploadedImage) {
        try {
            const base64Response = await fetch(uploadedImage);
            const blob = await base64Response.blob();
            const file = new File([blob], 'travel-moment.jpg', { type: blob.type });

            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    files: [file],
                    title: 'My Travel Moment',
                    text: text
                });
                return; // Successfully shared via native sheet
            }
        } catch (error) {
            console.log("Native share not supported or cancelled", error);
        }
    }
    
    // Fallback to link sharing if native share fails or isn't supported
    if (platform === 'twitter') shareToTwitter(text);
    else if (platform === 'whatsapp') shareToWhatsApp(text);
    else if (platform === 'linkedin') openLinkedIn();
    else if (platform === 'instagram') openInstagram();
  };


  if (!itinerary) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
        <div className="bg-slate-100 dark:bg-slate-800 p-6 rounded-full mb-6">
          <Camera className="w-12 h-12 text-slate-400" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Social Studio Locked</h2>
        <p className="text-slate-500 dark:text-slate-400 max-w-md">
          Please generate a travel itinerary first. The AI needs your trip details to create amazing content.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto animate-fade-in grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Left Column: Image Analysis & Settings */}
      <div className="lg:col-span-5 space-y-6">
        
        {/* New Image Analysis Card */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
             <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-teal-600" /> AI Vision Analysis
             </h2>
             <p className="text-sm text-slate-500 mb-4">Upload a photo to get AI-generated captions and tags instantly.</p>
             
             <div className="space-y-4">
                 <div className="relative border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-6 text-center hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                    {!uploadedImage ? (
                        <>
                            <div className="flex flex-col items-center">
                                <Upload className="w-8 h-8 text-slate-400 mb-2" />
                                <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Drag & Drop or Click Area</span>
                            </div>
                        </>
                    ) : (
                        <div className="relative">
                            <img src={uploadedImage} alt="Uploaded" className="w-full h-48 object-cover rounded-lg" />
                            <button 
                                onClick={(e) => { e.stopPropagation(); setUploadedImage(null); setAnalyzedResult(null); }} 
                                className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white p-1.5 rounded-full backdrop-blur-sm"
                            >
                                <RefreshCw className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                    <input 
                        type="file" 
                        ref={fileInputRef}
                        accept="image/*" 
                        onChange={handleImageUpload} 
                        className="hidden" 
                    />
                 </div>

                 {/* Explicit Button for Accessibility and Clarity */}
                 {!uploadedImage && (
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full py-2.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors"
                    >
                        <Smartphone className="w-4 h-4" /> Upload from Device
                    </button>
                 )}

                 {uploadedImage && !analyzedResult && (
                     <button 
                        onClick={handleAnalyzeImage} 
                        disabled={isAnalyzing}
                        className="w-full bg-teal-600 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-teal-700 transition shadow-lg shadow-teal-500/20"
                    >
                        {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                        Analyze Photo
                     </button>
                 )}
             </div>

             {analyzedResult && (
                 <div className="mt-6 bg-slate-50 dark:bg-slate-900 p-5 rounded-xl border border-slate-100 dark:border-slate-700 space-y-4 animate-fade-in">
                      <div>
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Generated Caption</span>
                          <p className="text-sm font-medium text-slate-800 dark:text-slate-200 mt-1 leading-relaxed">{analyzedResult.caption}</p>
                      </div>
                      <div>
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Hashtags</span>
                          <p className="text-xs text-blue-500 mt-1">{analyzedResult.hashtags.join(' ')}</p>
                      </div>
                      <div>
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Detected Location</span>
                          <p className="text-sm text-slate-700 dark:text-slate-300 flex items-center gap-1 mt-1">
                              <MapPin className="w-3.5 h-3.5 text-rose-500" /> {analyzedResult.location}
                          </p>
                      </div>

                      {/* Share Buttons for Analysis */}
                      <div className="pt-4 border-t border-slate-200 dark:border-slate-700 flex flex-wrap gap-2 justify-center">
                          <button 
                            onClick={() => handleNativeShare('instagram', `${analyzedResult.caption} ${analyzedResult.hashtags.join(' ')}`)} 
                            className="p-2.5 bg-pink-100 dark:bg-pink-900/20 text-pink-600 rounded-xl hover:bg-pink-200 transition" 
                            title="Share to Instagram"
                          >
                              <Instagram className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleNativeShare('twitter', `${analyzedResult.caption} ${analyzedResult.hashtags.join(' ')}`)} 
                            className="p-2.5 bg-blue-100 dark:bg-blue-900/20 text-blue-500 rounded-xl hover:bg-blue-200 transition" 
                            title="Share to Twitter"
                          >
                              <Twitter className="w-4 h-4" />
                          </button>
                           <button 
                            onClick={() => handleNativeShare('whatsapp', `${analyzedResult.caption} ${analyzedResult.hashtags.join(' ')}`)} 
                            className="p-2.5 bg-green-100 dark:bg-green-900/20 text-green-600 rounded-xl hover:bg-green-200 transition" 
                            title="Share to WhatsApp"
                           >
                              <MessageCircle className="w-4 h-4" />
                          </button>
                           <button 
                            onClick={() => handleNativeShare('linkedin', `${analyzedResult.caption} ${analyzedResult.hashtags.join(' ')}`)} 
                            className="p-2.5 bg-indigo-100 dark:bg-indigo-900/20 text-indigo-600 rounded-xl hover:bg-indigo-200 transition" 
                            title="Share to LinkedIn"
                           >
                              <Linkedin className="w-4 h-4" />
                          </button>
                      </div>
                      <p className="text-[10px] text-center text-slate-400 mt-1">
                          Note: Sharing with image works best on mobile devices.
                      </p>
                 </div>
             )}
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <Share2 className="w-5 h-5 text-teal-600" /> Campaign Settings
          </h2>

          <div className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Tone of Voice</label>
              <div className="grid grid-cols-2 gap-2">
                {['casual', 'professional', 'poetic', 'humorous', 'energetic'].map(t => (
                  <button
                    key={t}
                    onClick={() => setVoice({...voice, tone: t as any})}
                    className={`px-3 py-2 text-xs rounded-lg border capitalize transition-all ${
                      voice.tone === t 
                      ? 'bg-teal-600 text-white border-teal-600' 
                      : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Target Audience</label>
              <select 
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-teal-500"
                value={voice.audience}
                onChange={e => setVoice({...voice, audience: e.target.value as any})}
              >
                <option value="friends">Friends & Family</option>
                <option value="travelers">Fellow Travelers</option>
                <option value="professionals">Professional Network</option>
              </select>
            </div>
          </div>

          <button 
            onClick={handleGenerate}
            disabled={isLoading}
            className="w-full mt-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-purple-500/20 transition-all flex items-center justify-center gap-2"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Wand2 className="w-5 h-5" />}
            Generate Campaign
          </button>
        </div>
      </div>

      {/* Right Column: Results */}
      <div className="lg:col-span-7">
        {!generatedContent ? (
          <div className="h-full min-h-[500px] flex flex-col items-center justify-center bg-slate-50/50 dark:bg-slate-900/50 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700">
             <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center shadow-sm mb-4">
               <Share2 className="w-8 h-8 text-slate-300" />
             </div>
             <h3 className="text-lg font-semibold text-slate-600 dark:text-slate-400">Ready to Create</h3>
             <p className="text-sm text-slate-400 dark:text-slate-500 max-w-xs text-center mt-2">
               Upload a photo for instant captions or generate a full campaign based on your itinerary.
             </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
              {[
                { id: 'instagram', icon: Instagram, label: 'Instagram' },
                { id: 'twitter', icon: Twitter, label: 'Twitter/X' },
                { id: 'linkedin', icon: Linkedin, label: 'LinkedIn' },
                { id: 'tiktok', icon: Video, label: 'TikTok' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm whitespace-nowrap transition-all ${
                    activeTab === tab.id 
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md' 
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                  }`}
                >
                  <tab.icon className="w-4 h-4" /> {tab.label}
                </button>
              ))}
            </div>

            {/* Content Display */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700 overflow-hidden min-h-[600px]">
               
               {activeTab === 'instagram' && (
                 <div className="p-8 space-y-8">
                    {/* Post */}
                    <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden">
                       <div className="bg-white dark:bg-slate-950 p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                          <span className="font-bold text-sm">Main Feed Post</span>
                          <div className="flex gap-2">
                             <button onClick={() => copyToClipboard(generatedContent.instagram.posts[0].caption)} className="text-slate-400 hover:text-teal-500">
                                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                             </button>
                             <button onClick={openInstagram} className="text-slate-400 hover:text-pink-500">
                                <ExternalLink className="w-4 h-4" />
                             </button>
                          </div>
                       </div>
                       <div className="p-6">
                           <div className="flex gap-4 mb-4">
                              <div className="w-24 h-24 bg-slate-200 dark:bg-slate-800 rounded-lg flex-shrink-0 overflow-hidden">
                                 {photos[generatedContent.instagram.posts[0].photoReference - 1] && (
                                     <img src={photos[generatedContent.instagram.posts[0].photoReference - 1].url} className="w-full h-full object-cover" />
                                 )}
                              </div>
                              <div className="flex-1 space-y-2">
                                 <p className="text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap">{generatedContent.instagram.posts[0].caption}</p>
                                 <p className="text-xs text-blue-500">{generatedContent.instagram.posts[0].hashtags.join(' ')}</p>
                              </div>
                           </div>
                       </div>
                    </div>
                 </div>
               )}

               {activeTab === 'twitter' && (
                 <div className="p-8 space-y-6">
                    <h4 className="font-bold text-slate-800 dark:text-white mb-2">Thread ({generatedContent.twitter.thread.length} Tweets)</h4>
                    {generatedContent.twitter.thread.map((tweet, i) => (
                       <div key={i} className="flex gap-4">
                          <div className="flex flex-col items-center">
                             <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex-shrink-0"></div>
                             {i !== generatedContent.twitter.thread.length - 1 && <div className="w-0.5 h-full bg-slate-200 dark:bg-slate-700 my-2"></div>}
                          </div>
                          <div className="flex-1 pb-6">
                             <div className="flex items-center gap-2 mb-1">
                                <span className="font-bold text-slate-900 dark:text-white">You</span>
                                <span className="text-slate-400 text-sm">@traveler</span>
                             </div>
                             <p className="text-slate-800 dark:text-slate-200 text-sm whitespace-pre-wrap">{tweet}</p>
                             
                             <div className="mt-2 flex gap-3">
                                 <button onClick={() => shareToTwitter(tweet)} className="text-xs flex items-center gap-1 text-blue-400 hover:underline">
                                     <Twitter className="w-3 h-3" /> Tweet this
                                 </button>
                             </div>
                          </div>
                       </div>
                    ))}
                 </div>
               )}

               {activeTab === 'linkedin' && (
                  <div className="p-8">
                     <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                           <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700"></div>
                           <div>
                              <h4 className="font-bold text-slate-900 dark:text-white">Your Name</h4>
                              <p className="text-xs text-slate-500">Travel Enthusiast</p>
                           </div>
                        </div>
                        <p className="text-slate-700 dark:text-slate-300 text-sm whitespace-pre-wrap leading-relaxed">
                           {generatedContent.linkedIn.post}
                        </p>
                        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex gap-2">
                           <button onClick={openLinkedIn} className="text-xs flex items-center gap-1 text-blue-600 font-semibold hover:underline">
                               <Linkedin className="w-3 h-3" /> Share on LinkedIn
                           </button>
                        </div>
                     </div>
                  </div>
               )}

               {activeTab === 'tiktok' && (
                  <div className="p-8">
                     <div className="bg-black text-white rounded-2xl p-6 shadow-xl">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                           <span className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-400 to-pink-500 flex items-center justify-center">
                              <Video className="w-4 h-4 text-white" />
                           </span>
                           TikTok Concept
                        </h3>
                        <div className="space-y-6">
                           {generatedContent.tiktok.concepts.map((concept, i) => (
                              <div key={i} className="border-l-2 border-pink-500 pl-4 space-y-2">
                                 <p className="text-pink-400 font-bold text-sm">Idea #{i+1}</p>
                                 <p className="text-sm"><strong className="text-slate-400">Narrative:</strong> {concept.narrative}</p>
                                 <p className="text-sm"><strong className="text-slate-400">Visual Hook:</strong> "{concept.hook}"</p>
                                 <p className="text-sm"><strong className="text-slate-400">Sound:</strong> {concept.sound}</p>
                              </div>
                           ))}
                        </div>
                     </div>
                  </div>
               )}

            </div>
          </div>
        )}
      </div>
      
      {/* Import icons needed */}
      <div className="hidden">
         <MapPin /> <MessageCircle />
      </div>
    </div>
  );
};