import React, { useState, useEffect } from 'react';
import UrbanStyleHero from '../components/UrbanStyleHero';
import ServiceSection from '../components/ServiceSection';
import ProviderSection from '../components/ProviderSection';
import AppDownload from '../components/AppDownload';
import BannerSlider from '../components/BannerSlider';
import CollectionSection from '../components/CollectionSection';
import BrandsSection from '../components/BrandsSection';
import { contentService } from '../services/api';

const Home = () => {
    const [homeData, setHomeData] = useState({ banners: [], collections: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHomeData = async () => {
            try {
                const data = await contentService.getHome();
                setHomeData(data);
            } catch (error) {
                console.error('Error fetching home content:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchHomeData();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0a0f1c] text-slate-900 dark:text-white">
            {/* New Urban Company Style Hero & Categories */}
            <UrbanStyleHero />

            {/* Banner Slider */}
            {!loading && homeData.banners.length > 0 && (
                <div className="max-w-7xl mx-auto px-4 py-8">
                    <BannerSlider banners={homeData.banners} />
                </div>
            )}

            {/* Dynamic Collections */}
            {!loading && homeData.collections.map((collection) => (
                <CollectionSection
                    key={collection.id}
                    title={collection.title}
                    services={collection.services}
                />
            ))}

            {/* Popular Services (Fallback if no collections) */}
            {!loading && homeData.collections.length === 0 && (
                <ServiceSection
                    title="Popular Services"
                    subtitle="Most booked services this week"
                    showTrending={true}
                />
            )}

            {/* Top Providers */}
            <ProviderSection />

            {/* App Download Section */}
            <AppDownload />

            {/* Brands we service */}
            <BrandsSection />
        </div>
    );
};

export default Home;
