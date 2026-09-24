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
    <section ref={containerRef} className="relative min-h-screen flex flex-col md:flex-row items-center justify-center pt-24 overflow-hidden bg-vintage-paper selection:bg-vintage-red selection:text-white">
      
      {/* Background with texture */}
      <div className="absolute inset-0 opacity-10 mix-blend-multiply" style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '10px 10px' }}></div>
      <div className="absolute inset-0 bg-hero-gradient mix-blend-overlay"></div>
      {/* Grunge overlay */}
      <div className="absolute inset-0 bg-grunge opacity-20 pointer-events-none mix-blend-multiply"></div>

      <div className="w-full md:w-1/2 flex flex-col justify-center px-6 md:pl-20 z-20 relative h-full">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
        >
          <div className="inline-block px-3 py-1 bg-vintage-red text-white font-display text-sm md:text-xl tracking-[0.3em] mb-4 uppercase">
            Rasa Mantap Hitam
          </div>
          
          <h1 className="text-7xl md:text-8xl lg:text-[10rem] font-display font-bold text-vintage-charcoal tracking-tighter leading-[0.8] mb-6 uppercase">
            Kill <br />
            <span className="text-vintage-red">Switch</span>
          </h1>
          
          <h2 className="text-xl md:text-2xl text-vintage-charcoal/80 font-serif mb-6 tracking-wide border-l-4 border-vintage-charcoal pl-4 py-2">
            The ultimate smoking community. Connect with others who appreciate the culture.
          </h2>
          
          <p className="text-vintage-charcoal/80 max-w-md mb-12 text-sm md:text-base leading-relaxed font-sans font-medium uppercase tracking-widest">
            Open debates, anonymous spots, real talk. Enter the smoke.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <button className="w-full sm:w-auto px-10 py-5 bg-vintage-charcoal text-vintage-paper font-display text-xl tracking-[0.2em] uppercase hover:bg-vintage-red hover:text-white transition-all transform hover:-translate-y-1 shadow-2xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-vintage-red active:scale-95 active:translate-y-0">
              Enter
            </button>
            <button className="w-full sm:w-auto px-10 py-5 border-[4px] border-vintage-charcoal text-vintage-charcoal font-display text-xl tracking-[0.2em] uppercase hover:bg-vintage-charcoal hover:text-vintage-paper transition-all transform hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-vintage-charcoal active:scale-95 active:translate-y-0">
              About
            </button>
          </div>
        </motion.div>
      </div>

      <div className="w-full md:w-1/2 h-full flex items-center justify-center relative z-10 p-10 mt-12 md:mt-0">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="relative w-full max-w-lg aspect-[3/4]"
        >
          {/* Main gritty image placeholder */}
          <div className="absolute inset-0 bg-vintage-charcoal shadow-2xl overflow-hidden rounded-sm border-[12px] border-white transform rotate-2">
            <img src="/images/jesse.png" alt="Community Member" className="w-full h-full object-cover grayscale mix-blend-luminosity contrast-150 brightness-75" />
            
            {/* Color accent wash */}
            <div className="absolute inset-0 bg-vintage-red mix-blend-multiply opacity-20"></div>
            
            <div className="absolute bottom-8 left-8 right-8">
               <h3 className="text-white font-display text-7xl leading-none drop-shadow-2xl">JESSE<br/>PINKMAN</h3>
               <p className="text-white/80 font-serif italic text-sm mt-2 max-w-[250px]">
                 "A fictional character from the acclaimed series..."
               </p>
            </div>
          </div>

          {/* Djarum stylistic accent */}
          <div className="absolute -bottom-16 -right-8 w-48 h-64 shadow-2xl transform -rotate-6 border-8 border-[#1a1a1a] flex flex-col justify-end overflow-hidden group">
            <img src="/images/djarum.jpg" alt="Djarum" className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
          </div>
        </motion.div>
      </div>

      {/* Decorative typography */}
      <div className="absolute top-0 right-0 p-8 hidden lg:block opacity-[0.03] pointer-events-none z-0 mix-blend-multiply">
        <span className="font-display text-[15vw] text-vintage-charcoal leading-none whitespace-nowrap">SMOKE</span>
      </div>

    </section>
  );
}
