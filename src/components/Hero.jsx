import { useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

export default function Hero() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });
  
  const yText = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacityText = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <section ref={containerRef} className="relative min-h-screen flex flex-col items-center justify-center pt-24 overflow-hidden">
      {/* Background with dramatic lighting */}
      <div className="absolute inset-0 bg-background">
        <div className="absolute inset-0 bg-hero-glow"></div>
        {/* Subtle smoke texture overlay placeholder */}
        <div className="absolute inset-0 opacity-20 mix-blend-screen" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
      </div>

      <motion.div 
        style={{ y: yText, opacity: opacityText }}
        className="relative z-20 text-center max-w-4xl px-6"
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-bold text-cream tracking-tight leading-tight mb-6 drop-shadow-2xl">
            SMOKE. <span className="text-gold">CONNECT.</span> TALK.
          </h1>
          
          <h2 className="text-xl md:text-2xl text-cream/80 font-light mb-6 tracking-wide">
            Meet people. Start conversations. Share the moment.
          </h2>
          
          <p className="text-muted max-w-2xl mx-auto mb-12 text-sm md:text-base leading-relaxed">
            A social space for adults who enjoy smoking culture, conversation and meeting new people.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <button className="w-full sm:w-auto px-8 py-4 rounded-full bg-gold text-background font-bold tracking-widest hover:bg-gold-light transition-all shadow-[0_0_30px_rgba(212,175,55,0.2)] hover:shadow-[0_0_40px_rgba(212,175,55,0.4)] transform hover:-translate-y-1">
              FIND PEOPLE
            </button>
            <button className="w-full sm:w-auto px-8 py-4 rounded-full border border-white/20 glass-card text-cream font-medium tracking-widest hover:bg-white/10 transition-all transform hover:-translate-y-1">
              JOIN THE COMMUNITY
            </button>
          </div>
        </motion.div>
      </motion.div>

      {/* Cinematic 3D Element Placeholder */}
      <div className="absolute bottom-0 left-0 w-full h-[40vh] bg-gradient-to-t from-background to-transparent z-10 pointer-events-none"></div>
      
      {/* 101 Vertical Progress Bar Placeholder */}
      <div className="hidden lg:flex absolute right-12 top-1/2 -translate-y-1/2 flex-col items-center gap-4 z-30">
        <div className="text-[10px] text-muted tracking-widest rotate-90 mb-12">101 CONNECTIONS</div>
        <div className="w-1 h-64 bg-surface rounded-full relative overflow-hidden">
          <div className="absolute top-0 w-full h-1/3 bg-gold shadow-[0_0_10px_#D4AF37]"></div>
          {/* Animated ember effect */}
          <div className="absolute top-1/3 w-full h-2 bg-[#ff5722] shadow-[0_0_15px_#ff5722] animate-pulse"></div>
        </div>
      </div>
    </section>
  );
}
