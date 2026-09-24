import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AgeGate() {
  const [verified, setVerified] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('age-verified') === 'true';
    }
    return false;
  });
  const [show, setShow] = useState(!verified);

  useEffect(() => {
    if (verified && show) {
      setShow(false);
      window.dispatchEvent(new Event('age-verified'));
    }
  }, [verified, show]);

  const handleVerify = () => {
    localStorage.setItem('age-verified', 'true');
    setVerified(true);
    setTimeout(() => {
      setShow(false);
      window.dispatchEvent(new Event('age-verified'));
    }, 500);
  };

  const handleExit = () => {
    window.location.href = '/sorry';
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div 
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.8, ease: 'easeInOut' } }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-vintage-charcoal p-6"
        >
          {/* Subtle background element */}
          <div className="absolute inset-0 bg-grunge opacity-20 mix-blend-multiply"></div>
          
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="relative bg-vintage-paper max-w-md w-full p-10 border-[10px] border-white text-center flex flex-col items-center shadow-2xl rotate-1"
          >
            {/* Stamp texture */}
            <div className="absolute -top-8 -right-8 w-32 h-32 border-8 border-vintage-red/30 rounded-full flex items-center justify-center -rotate-12 pointer-events-none">
              <span className="text-vintage-red/30 font-display text-4xl tracking-widest uppercase">18+</span>
            </div>
            
            <h2 className="text-5xl font-display text-vintage-charcoal mb-4 uppercase leading-none mt-4">Adults<br/><span className="text-vintage-red">Only</span></h2>
            <p className="text-vintage-charcoal/80 mb-8 leading-relaxed font-serif italic border-l-4 border-vintage-red pl-4 text-left">
              This community is intended for adults only. By entering, you confirm that you are at least 18 years old and of legal age to view this content in your jurisdiction.
            </p>
            
            <div className="flex flex-col gap-4 w-full mt-4">
              <button 
                onClick={handleVerify}
                className="w-full py-5 bg-vintage-charcoal text-vintage-paper font-display text-xl tracking-[0.2em] uppercase transition-all shadow-[6px_6px_0px_0px_#bd2620] hover:bg-vintage-red hover:text-white hover:shadow-none hover:translate-y-[6px] hover:translate-x-[6px] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-vintage-red active:scale-[0.98]"
              >
                I AM 18+
              </button>
              <button 
                onClick={handleExit}
                className="w-full py-4 text-vintage-charcoal font-sans font-medium tracking-[0.1em] uppercase transition-all underline decoration-2 underline-offset-4 mt-2 hover:text-vintage-red focus-visible:outline-none focus-visible:text-vintage-red active:scale-[0.98]"
              >
                I am under 18
              </button>
            </div>
            
            <a href="/legal" className="mt-8 text-xs font-sans uppercase tracking-widest text-vintage-charcoal/50 hover:text-vintage-red transition-colors">
              Terms & Privacy
            </a>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
