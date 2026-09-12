import { motion } from 'framer-motion';

export default function AdBanner() {
  return (
    <div className="w-full flex flex-col items-center">
      <div className="text-[9px] text-muted tracking-widest uppercase mb-2">Advertisement</div>
      
      <motion.div 
        whileHover={{ scale: 1.02 }}
        className="w-full h-[600px] rounded-lg overflow-hidden relative cursor-pointer group shadow-2xl border border-white/10"
      >
        {/* Placeholder for Marlboro Ad */}
        <div className="absolute inset-0 bg-[#E32636] flex flex-col items-center justify-between py-12 px-4 text-center">
          
          <div className="flex flex-col items-center">
            <div className="w-12 h-16 border-t-[8px] border-white relative mb-8">
              {/* Abstract chevron logo */}
              <div className="absolute top-0 left-0 w-full h-full bg-white clip-chevron-down"></div>
            </div>
            
            <h3 className="text-white font-display font-bold text-3xl tracking-wider leading-tight">
              MARLBORO
            </h3>
            <p className="text-white/80 text-sm mt-2 font-medium tracking-widest">
              CLASSIC RED
            </p>
          </div>

          <div className="w-full border-t border-white/30 pt-6">
            <p className="text-white/60 text-xs leading-relaxed uppercase tracking-wider">
              Rich Flavor.<br/>Smooth Finish.
            </p>
            <button className="mt-6 px-6 py-2 bg-white text-[#E32636] font-bold text-xs uppercase tracking-widest rounded shadow-lg hover:bg-gray-100 transition-colors w-full">
              Discover More
            </button>
          </div>
        </div>

        {/* Gloss overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-black/20 via-transparent to-white/10 pointer-events-none"></div>
      </motion.div>
    </div>
  );
}
