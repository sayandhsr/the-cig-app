import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AgeGate() {
  const [verified, setVerified] = useState(false);
  const [show, setShow] = useState(true);

  useEffect(() => {
    const isVerified = localStorage.getItem('age-verified') === 'true';
    if (isVerified) {
      setVerified(true);
      setShow(false);
      window.dispatchEvent(new Event('age-verified'));
    }
  }, []);

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
          className="fixed inset-0 z-50 flex items-center justify-center bg-background p-6"
        >
          {/* Subtle background element */}
          <div className="absolute inset-0 bg-hero-glow opacity-30"></div>
          
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="relative glass-card max-w-md w-full p-10 rounded-2xl text-center flex flex-col items-center"
          >
            <div className="w-16 h-16 rounded-full border border-red-500/30 bg-red-500/10 flex items-center justify-center mb-6">
              <span className="text-xl font-bold text-red-400">18+</span>
            </div>
            
            <h2 className="text-3xl font-display font-bold text-cream mb-4">Adults Only</h2>
            <p className="text-muted mb-8 leading-relaxed">
              This community is intended for adults only. By entering, you confirm that you are at least 18 years old and of legal age to view this content in your jurisdiction.
            </p>
            
            <div className="flex flex-col gap-4 w-full">
              <button 
                onClick={handleVerify}
                className="w-full py-4 rounded-full bg-gold text-background font-bold tracking-widest hover:bg-gold-light transition-colors shadow-[0_0_20px_rgba(212,175,55,0.3)]"
              >
                I AM 18+
              </button>
              <button 
                onClick={handleExit}
                className="w-full py-4 rounded-full border border-white/10 text-cream font-medium tracking-widest hover:bg-white/5 transition-colors"
              >
                EXIT
              </button>
            </div>
            
            <p className="text-[10px] text-muted/50 mt-8">
              We promote a responsible community. Please refer to your local laws regarding smoking and social connections.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
