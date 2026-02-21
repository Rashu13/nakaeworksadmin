import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const BannerSlider = ({ banners }) => {
    const [current, setCurrent] = useState(0);

    useEffect(() => {
        if (!banners || banners.length <= 1) return;

        const timer = setInterval(() => {
            setCurrent(prev => (prev === banners.length - 1 ? 0 : prev + 1));
        }, 5000);

        return () => clearInterval(timer);
    }, [banners]);

    if (!banners || banners.length === 0) return null;

    const next = () => setCurrent(prev => (prev === banners.length - 1 ? 0 : prev + 1));
    const prev = () => setCurrent(prev => (prev === 0 ? banners.length - 1 : prev - 1));

    return (
        <div className="relative w-full h-[300px] md:h-[450px] overflow-hidden group">
            <div
                className="flex transition-transform duration-700 ease-in-out h-full"
                style={{ transform: `translateX(-${current * 100}%)` }}
            >
                {banners.map((banner, index) => (
                    <div key={banner.id} className="min-w-full h-full relative">
                        <img
                            src={banner.imageUrl}
                            alt={banner.title}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex items-center px-12 md:px-24">
                            <div className="max-w-md text-white">
                                <h2 className="text-3xl md:text-5xl font-bold mb-4 animate-fade-in-up">
                                    {banner.title}
                                </h2>
                                {banner.link && (
                                    <Link
                                        to={banner.link}
                                        className="inline-block px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-blue-500/25"
                                    >
                                        Book Now
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {banners.length > 1 && (
                <>
                    <button
                        onClick={prev}
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <button
                        onClick={next}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <ChevronRight size={24} />
                    </button>

                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                        {banners.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrent(i)}
                                className={`w-3 h-3 rounded-full transition-all ${current === i ? 'bg-white w-8' : 'bg-white/40'}`}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default BannerSlider;
