import React from 'react';
import { motion } from 'framer-motion';
import { Star, Wind, Snowflake, Zap, Droplets, Fan, Shield, Thermometer, Cpu } from 'lucide-react';

const brands = [
    { name: 'Samsung', icon: Zap },
    { name: 'LG', icon: Cpu },
    { name: 'Voltas', icon: Wind },
    { name: 'Mitsubishi', icon: Fan },
    { name: 'Daikin', icon: Snowflake },
    { name: 'Haier', icon: Droplets },
    { name: 'O General', icon: Star },
    { name: 'Panasonic', icon: Zap },
    { name: 'Whirlpool', icon: Droplets },
    { name: 'Bosch', icon: Shield },
    { name: 'Godrej', icon: Shield },
    { name: 'Hitachi', icon: Cpu },
    { name: 'Carrier', icon: Snowflake },
    { name: 'Lloyd', icon: Fan },
    { name: 'Blue Star', icon: Star }
];

const BrandsSection = () => {
    return (
        <section className="py-10 bg-white dark:bg-[#0a0f1c] border-y border-gray-200 dark:border-white/5 overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                    >
                        <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-4">
                            We Service <span className="text-primary-500">All Brands</span>
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 font-medium max-w-2xl mx-auto">
                            Expert repair and maintenance for top appliances and electronics brands.
                        </p>
                    </motion.div>
                </div>

                <div className="relative">
                    {/* Fading edges for the scrolling effect */}
                    <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-white dark:from-[#0a0f1c] to-transparent z-10 pointer-events-none"></div>
                    <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-white dark:from-[#0a0f1c] to-transparent z-10 pointer-events-none"></div>

                    <div className="overflow-hidden py-8">
                        <motion.div
                            animate={{ x: ["0%", "-50%"] }}
                            transition={{
                                x: {
                                    repeat: Infinity,
                                    repeatType: "loop",
                                    duration: 40,
                                    ease: "linear",
                                },
                            }}
                            className="flex w-[200%] gap-12 items-center"
                        >
                            {/* Double the brands array to create seamless loop */}
                            {[...brands, ...brands].map((brand, i) => {
                                const IconComponent = brand.icon;
                                return (
                                    <div
                                        key={i}
                                        className="flex-shrink-0 flex items-center gap-3 px-8 py-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-200 dark:border-white/10 opacity-70 hover:opacity-100 hover:scale-105 hover:bg-white dark:hover:bg-white/10 transition-all duration-300 cursor-default group shadow-sm hover:shadow-lg"
                                    >
                                        <IconComponent size={24} strokeWidth={1.5} className="text-gray-400 group-hover:text-primary-500 transition-colors" />
                                        <span className="text-lg md:text-xl font-black uppercase tracking-widest text-gray-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{brand.name}</span>
                                    </div>
                                );
                            })}
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default BrandsSection;
