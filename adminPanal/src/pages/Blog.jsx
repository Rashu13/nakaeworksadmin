import React from 'react';
import { ArrowRight, Clock, User, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

const Blog = () => {
    // Array of mock blog posts
    const blogPosts = [
        {
            id: 1,
            title: "5 Essential Tips for AC Maintenance Before Summer",
            excerpt: "Get your air conditioner ready for the sweltering heat with these simple yet effective maintenance tips that will save you money on energy bills and prevent sudden breakdowns.",
            category: "Maintenance",
            thumbnail: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&q=80",
            author: "Technical Expert",
            date: "Apr 15, 2024",
            readTime: "5 min read"
        },
        {
            id: 2,
            title: "Why Regular Deep Home Cleaning is Mandatory",
            excerpt: "A clean home is a happy home. Discover the hidden benefits of professional deep cleaning and why standard vacuuming just isn't enough to keep your living space truly sanitized.",
            category: "Lifestyle",
            thumbnail: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&q=80",
            author: "Cleaning Pro",
            date: "May 02, 2024",
            readTime: "4 min read"
        },
        {
            id: 3,
            title: "Smart Home Devices: Which Ones Are Worth Installing?",
            excerpt: "From smart thermostats to video doorbells, we review the top smart home gadgets that add real value, security, and convenience to your daily routine.",
            category: "Technology",
            thumbnail: "https://images.unsplash.com/photo-1558002038-1055907df827?w=800&q=80",
            author: "Tech Enthusiast",
            date: "May 18, 2024",
            readTime: "7 min read"
        },
        {
            id: 4,
            title: "Common Plumbing Issues and How to Spot Them Early",
            excerpt: "Don't ignore that leaky faucet! Learn how to identify early signs of home plumbing disasters before they cause expensive water damage.",
            category: "Home Repair",
            thumbnail: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=800&q=80",
            author: "Master Plumber",
            date: "Jun 10, 2024",
            readTime: "6 min read"
        },
        {
            id: 5,
            title: "Creating a Minimalist Living Room Aesthetic",
            excerpt: "Transform your cluttered space into a serene, minimalist haven. Expert tips on layout planning, color palettes, and furniture selection.",
            category: "Interior Design",
            thumbnail: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800&q=80",
            author: "Interior Designer",
            date: "Jul 05, 2024",
            readTime: "8 min read"
        },
        {
            id: 6,
            title: "The Ultimate Guide to Pre-Winter Appliance Checkups",
            excerpt: "Ensure your heating systems, water heaters, and other essential appliances are ready for the cold months ahead with this comprehensive checklist.",
            category: "Maintenance",
            thumbnail: "https://images.unsplash.com/photo-1563453392212-326f5e854473?w=800&q=80",
            author: "Senior Technician",
            date: "Aug 20, 2024",
            readTime: "10 min read"
        }
    ];

    return (
        <div className="bg-gray-50 dark:bg-gray-50 dark:bg-[#0a0d14] min-h-screen pt-32 pb-12 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header Section */}
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-slate-900 dark:text-white mb-6">
                        NakaeWorks <span className="text-primary-500">Blog</span>
                    </h1>
                    <p className="text-xl text-gray-600 dark:text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                        Insights, tips, and expert advice on home maintenance, lifestyle improvements, and modern living solutions.
                    </p>
                </div>

                {/* Featured Post */}
                <div className="mb-16">
                    <div className="bg-white dark:bg-white dark:bg-slate-900/40 rounded-[2.5rem] border border-gray-100 dark:border-gray-200 dark:border-white/5 shadow-2xl overflow-hidden group flex flex-col lg:flex-row relative">
                        <div className="absolute right-0 top-0 w-64 h-64 bg-primary-600/5 blur-[100px] pointer-events-none"></div>
                        <div className="lg:w-1/2 overflow-hidden">
                            <img
                                src={blogPosts[0].thumbnail}
                                alt={blogPosts[0].title}
                                className="w-full h-full object-cover min-h-[300px] lg:min-h-full group-hover:scale-105 transition-transform duration-700"
                            />
                        </div>
                        <div className="lg:w-1/2 p-10 flex flex-col justify-center">
                            <span className="inline-block px-4 py-1.5 bg-primary-100 dark:bg-primary-500/10 text-primary-600 dark:text-primary-500 text-xs font-black uppercase tracking-widest rounded-full mb-6 max-w-fit">
                                Featured • {blogPosts[0].category}
                            </span>
                            <h2 className="text-3xl font-black text-gray-900 dark:text-slate-900 dark:text-white mb-4 group-hover:text-primary-500 transition-colors">
                                {blogPosts[0].title}
                            </h2>
                            <p className="text-lg text-gray-600 dark:text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                                {blogPosts[0].excerpt}
                            </p>
                            <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400 dark:text-gray-600 dark:text-gray-400 font-medium mb-8">
                                <span className="flex items-center gap-2"><User size={16} /> {blogPosts[0].author}</span>
                                <span className="flex items-center gap-2"><Calendar size={16} /> {blogPosts[0].date}</span>
                                <span className="flex items-center gap-2"><Clock size={16} /> {blogPosts[0].readTime}</span>
                            </div>
                            <button className="flex items-center gap-2 text-primary-500 font-black uppercase tracking-widest hover:gap-4 transition-all w-max bg-primary-500/10 px-6 py-3 rounded-xl border border-primary-500/20">
                                Read Article <ArrowRight size={18} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Grid Layout for other posts */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {blogPosts.slice(1).map((post) => (
                        <div key={post.id} className="bg-white dark:bg-white dark:bg-slate-900/40 rounded-3xl border border-gray-100 dark:border-gray-200 dark:border-white/5 shadow-xl hover:-translate-y-2 transition-transform duration-300 group flex flex-col overflow-hidden">
                            <div className="relative h-56 overflow-hidden">
                                <img
                                    src={post.thumbnail}
                                    alt={post.title}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                />
                                <div className="absolute top-4 left-4 bg-white/90 dark:bg-black/60 backdrop-blur-md text-gray-900 dark:text-slate-900 dark:text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                                    {post.category}
                                </div>
                            </div>
                            <div className="p-8 flex flex-col flex-grow">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-slate-900 dark:text-white mb-3 group-hover:text-primary-500 transition-colors line-clamp-2">
                                    {post.title}
                                </h3>
                                <p className="text-gray-600 dark:text-gray-600 dark:text-gray-400 text-sm mb-6 flex-grow line-clamp-3">
                                    {post.excerpt}
                                </p>
                                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 dark:text-gray-600 dark:text-gray-400 font-medium pt-6 border-t border-gray-100 dark:border-gray-200 dark:border-white/10">
                                    <span className="flex items-center gap-1.5"><Calendar size={14} /> {post.date}</span>
                                    <span className="flex items-center gap-1.5"><Clock size={14} /> {post.readTime}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Keep Exploring Button */}
                <div className="mt-16 text-center">
                    <button className="px-10 py-4 bg-transparent border-2 border-primary-500 text-primary-500 font-black uppercase tracking-widest rounded-2xl hover:bg-primary-500 hover:text-slate-900 transition-all shadow-[0_0_20px_rgba(28,56,102,0.1)] hover:shadow-[0_0_30px_rgba(28,56,102,0.3)]">
                        Load More Articles
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Blog;
