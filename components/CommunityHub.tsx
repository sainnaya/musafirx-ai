
import React, { useState, useEffect } from 'react';
import { CommunityPost } from '../types';
import { MessageCircle, Heart, MapPin, UserPlus, Send, Camera, Search, Loader2, Sparkles, RefreshCw } from 'lucide-react';
import { generateCommunityPosts } from '../services/geminiService';

interface CommunityHubProps {
    destination?: string;
}

export const CommunityHub: React.FC<CommunityHubProps> = ({ destination }) => {
    const [posts, setPosts] = useState<CommunityPost[]>([]);
    const [isPosting, setIsPosting] = useState(false);
    const [newPostContent, setNewPostContent] = useState("");
    const [newPostLocation, setNewPostLocation] = useState("");
    const [loading, setLoading] = useState(false);
    const [activeTopic, setActiveTopic] = useState(destination || "Global Travel");
    const [searchInput, setSearchInput] = useState("");

    useEffect(() => {
        if (destination) {
            setActiveTopic(destination);
        }
    }, [destination]);

    useEffect(() => {
        let mounted = true;
        const fetchPosts = async () => {
            setLoading(true);
            try {
                const data = await generateCommunityPosts(activeTopic);
                if (mounted && data.length > 0) {
                    setPosts(data);
                }
            } catch (e) {
                console.error("Failed to fetch posts", e);
            } finally {
                if (mounted) setLoading(false);
            }
        };
        fetchPosts();
        return () => { mounted = false; };
    }, [activeTopic]);

    const handleSearchTopic = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchInput.trim()) {
            setActiveTopic(searchInput);
        }
    };

    const handleCreatePost = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newPostContent.trim()) return;

        const newPost: CommunityPost = {
            id: Date.now().toString(),
            user: 'You (Traveler)', // Simulating logged-in user
            location: newPostLocation || activeTopic || 'Unknown Location',
            content: newPostContent,
            likes: 0,
            tags: ['#NewTrip'],
            timestamp: Date.now(),
            imageUrl: `https://picsum.photos/600/400?random=${Math.floor(Math.random() * 100)}`
        };

        setPosts([newPost, ...posts]);
        setNewPostContent("");
        setNewPostLocation("");
        setIsPosting(false);
    };

    const PlusIcon = () => (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 3.33334V12.6667" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M3.33334 8H12.6667" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in max-w-6xl mx-auto">
            {/* Left Sidebar - Filters */}
            <div className="hidden lg:block lg:col-span-3 space-y-6">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 sticky top-24">
                    <div className="flex items-center gap-2 mb-6 text-slate-900 dark:text-white font-bold text-lg">
                        <Search className="w-5 h-5 text-teal-600 dark:text-teal-400" /> Discover
                    </div>

                    <form onSubmit={handleSearchTopic} className="mb-6">
                        <input
                            type="text"
                            placeholder="Find topics or places..."
                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                            value={searchInput}
                            onChange={e => setSearchInput(e.target.value)}
                        />
                    </form>

                    <ul className="space-y-1">
                        <li
                            onClick={() => setActiveTopic("Global Travel")}
                            className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors ${activeTopic === "Global Travel" ? "bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 font-medium" : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50"}`}
                        >
                            <span>Trending Now</span>
                            {activeTopic === "Global Travel" && <div className="w-1.5 h-1.5 rounded-full bg-teal-500"></div>}
                        </li>
                        {destination && (
                            <li
                                onClick={() => setActiveTopic(destination)}
                                className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors ${activeTopic === destination ? "bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 font-medium" : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50"}`}
                            >
                                <span className="truncate max-w-[150px]">{destination}</span>
                                {activeTopic === destination && <div className="w-1.5 h-1.5 rounded-full bg-teal-500"></div>}
                            </li>
                        )}
                        {['Food & Drink', 'Adventure', 'Budget Tips', 'Photography'].map((item) => (
                            <li
                                key={item}
                                onClick={() => setActiveTopic(item)}
                                className={`p-3 rounded-xl cursor-pointer transition-colors font-medium text-sm ${activeTopic === item ? "bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300" : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-white"}`}
                            >
                                {item}
                            </li>
                        ))}
                    </ul>

                    <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-700">
                        <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4">Popular Tags</p>
                        <div className="flex flex-wrap gap-2">
                            {['#Japan', '#SoloTravel', '#Foodie', '#Budget'].map(tag => (
                                <span key={tag} onClick={() => setActiveTopic(tag)} className="px-2 py-1 bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-700 rounded text-xs text-slate-500 dark:text-slate-400 hover:border-teal-200 dark:hover:border-teal-800 hover:text-teal-600 dark:hover:text-teal-400 cursor-pointer transition-colors">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Feed */}
            <div className="lg:col-span-6 space-y-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white capitalize flex items-center gap-2">
                        {activeTopic}
                        {loading && <Loader2 className="w-4 h-4 animate-spin text-teal-500" />}
                    </h2>
                    <button
                        onClick={() => setIsPosting(!isPosting)}
                        className="bg-teal-600 text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-teal-700 transition shadow-lg shadow-teal-200 dark:shadow-teal-900/50 flex items-center gap-2"
                    >
                        {isPosting ? 'Cancel' : (<><PlusIcon /> Create Post</>)}
                    </button>
                </div>
            </div>

            {/* Create Post Form */}
            {isPosting && (
                <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-lg shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700 mb-6 animate-fade-in relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-500 to-cyan-500"></div>
                    <div className="flex gap-4 mb-4">
                        <div className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-slate-400 dark:text-slate-300">Y</div>
                        <div className="flex-1">
                            <h4 className="font-semibold text-slate-800 dark:text-white text-sm">You</h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Sharing with Public</p>
                        </div>
                    </div>
                    <form onSubmit={handleCreatePost} className="space-y-4">
                        <input
                            type="text"
                            placeholder="Add location"
                            className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 rounded-xl border border-transparent dark:border-slate-700 text-sm focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-teal-200 dark:focus:border-teal-800 focus:ring-2 focus:ring-teal-500/10 dark:text-white transition-all"
                            value={newPostLocation}
                            onChange={e => setNewPostLocation(e.target.value)}
                        />
                        <textarea
                            rows={3}
                            placeholder="Share your travel experience..."
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-transparent dark:border-slate-700 text-sm focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-teal-200 dark:focus:border-teal-800 focus:ring-2 focus:ring-teal-500/10 dark:text-white transition-all resize-none"
                            value={newPostContent}
                            onChange={e => setNewPostContent(e.target.value)}
                        />
                        <div className="flex justify-between items-center pt-2">
                            <div className="flex gap-2">
                                <button type="button" className="p-2 rounded-full text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-teal-600 dark:hover:text-teal-400 transition">
                                    <Camera className="w-5 h-5" />
                                </button>
                                <button type="button" className="p-2 rounded-full text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-teal-600 dark:hover:text-teal-400 transition">
                                    <MapPin className="w-5 h-5" />
                                </button>
                            </div>
                            <button type="submit" className="bg-teal-600 text-white px-6 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 hover:bg-teal-700 transition shadow-md shadow-teal-200 dark:shadow-teal-900/50">
                                <Send className="w-4 h-4" /> Post
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {loading && posts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-800 rounded-2xl">
                    <Loader2 className="w-8 h-8 text-teal-500 animate-spin mb-3" />
                    <p className="text-slate-500 text-sm">Curating discussions for {activeTopic}...</p>
                </div>
            ) : (
                posts.map(post => (
                    <div key={post.id} className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden hover:shadow-md transition-shadow duration-300">
                        <div className="p-5">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-teal-100 to-cyan-100 dark:from-teal-900 dark:to-cyan-900 rounded-full flex items-center justify-center font-bold text-teal-600 dark:text-teal-400 border border-white dark:border-slate-700 shadow-sm">
                                        {post.user.charAt(0)}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-800 dark:text-white text-sm">{post.user}</h4>
                                        <div className="flex items-center text-xs text-slate-500 dark:text-slate-400 font-medium">
                                            <MapPin className="w-3 h-3 mr-1 text-rose-500" />
                                            {post.location}
                                            <span className="mx-2 text-slate-300 dark:text-slate-600">•</span>
                                            {new Date(post.timestamp).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                                <button className="text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/30 p-2 rounded-full transition">
                                    <UserPlus className="w-4 h-4" />
                                </button>
                            </div>
                            <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed mb-4">
                                {post.content}
                            </p>

                            <div className="flex flex-wrap gap-2 mb-4">
                                {(post.tags ?? []).map((tag) => (
                                    <span
                                        key={tag}
                                        className="text-xs text-teal-600 dark:text-teal-400 font-medium bg-teal-50 dark:bg-teal-900/30 px-2.5 py-1 rounded-md"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {post.imageUrl && (
                            <div className="w-full h-64 bg-slate-100 dark:bg-slate-900 overflow-hidden">
                                <img src={post.imageUrl} alt="Post content" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
                            </div>
                        )}

                        <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                            <div className="flex gap-4">
                                <button className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 hover:text-rose-500 transition text-sm font-medium group">
                                    <Heart className="w-5 h-5 group-hover:scale-110 transition-transform" /> {post.likes}
                                </button>
                                <button className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 transition text-sm font-medium group">
                                    <MessageCircle className="w-5 h-5 group-hover:scale-110 transition-transform" /> Comment
                                </button>
                            </div>
                        </div>
                    </div>
                ))
            )}


            {/* Right Sidebar - Suggested Groups */}
            <div className="hidden lg:block lg:col-span-3">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-4">
                    Suggested Groups
                </h3>

                <div className="space-y-3">
                    {["Solo Female Travelers", "Digital Nomads Japan", "Budget Backpackers"].map(
                        (group, i) => (
                            <div
                                key={group}
                                className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-3 shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                                        <img
                                            src={`https://picsum.photos/100/100?random=${i + 20}`}
                                            className="w-full h-full object-cover"
                                            alt={group} />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
                                            {group}
                                        </p>

                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                            {120 + i * 50} members
                                        </p>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    className="w-full mt-3 py-2 rounded-lg border border-teal-200 dark:border-teal-800 text-teal-600 dark:text-teal-400 text-xs font-semibold hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-colors">
                                    Join
                                </button>
                            </div>
                        )
                    )}
                </div>

                <div className="mt-8 p-4 bg-gradient-to-br from-teal-600 to-cyan-600 rounded-xl text-white shadow-lg shadow-teal-500/30 dark:shadow-none">
                    <p className="font-bold text-sm mb-1">
                        Invite Friends
                    </p>

                    <p className="text-xs text-teal-100 mb-3 opacity-90">
                        Plan trips together in real-time.
                    </p>

                    <button
                        type="button"
                        className="w-full bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 text-xs font-semibold py-2 rounded-lg transition-colors">
                        Send Invite
                    </button>
                </div>
            </div>
        </div>
    );
};