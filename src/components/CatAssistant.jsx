import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';

const messages = [
  "Bro, even the algorithm needs a smoke.",
  "I came here for the debates. Stayed for the chaos.",
  "Loading... my motivation.",
  "That message was definitely not suspicious.",
  "🐱🚬 just thinking...",
  "Network? I barely know anyone.",
  "Did you really just click that?",
  "404: Lighter not found.",
  "Just scrolling... forever.",
  "It's a vintage aesthetic, okay?"
];

export default function CatAssistant() {
  const [message, setMessage] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const controls = useAnimation();

  useEffect(() => {
    // Start at top-left
    controls.set({ x: 20, y: 100 });

    const showRandomMessage = () => {
      const randomMsg = messages[Math.floor(Math.random() * messages.length)];
      setMessage(randomMsg);
      setIsVisible(true);

      setTimeout(() => {
        setIsVisible(false);
      }, 5000); // show for 5 seconds
    };

    const initialTimeout = setTimeout(showRandomMessage, 3000);
    
    const interval = setInterval(() => {
      if (Math.random() > 0.3) {
        showRandomMessage();
      }
      
      // Occasionally "walk" around
      if (Math.random() > 0.6) {
         const newX = Math.max(20, Math.min(window.innerWidth - 150, Math.random() * window.innerWidth));
         const newY = Math.max(20, Math.min(window.innerHeight - 150, Math.random() * window.innerHeight));
         
         controls.start({ 
            x: newX, 
            y: newY,
            transition: { duration: 4, ease: "easeInOut" }
         });
      }
    }, 20000); // check every 20 seconds

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, [controls]);

  return (
    <motion.div
      drag
      dragMomentum={false}
      animate={controls}
      className="fixed z-[9999] cursor-grab active:cursor-grabbing flex flex-col items-center pointer-events-auto"
      style={{ touchAction: 'none' }}
    >
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.9 }}
            className="mb-2 bg-white text-vintage-charcoal text-xs font-sans font-bold px-3 py-2 border-2 border-vintage-charcoal shadow-[4px_4px_0px_0px_#1a1a1a] relative max-w-[150px] text-center"
          >
            {message}
            {/* Speech bubble tail */}
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-vintage-charcoal"></div>
            <div className="absolute -bottom-[5px] left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-white"></div>
          </motion.div>
        )}
      </AnimatePresence>
      <motion.div 
        animate={{ 
           y: [0, -3, 0],
           rotate: [-2, 2, -2]
        }}
        transition={{
           repeat: Infinity,
           duration: 4,
           ease: "easeInOut"
        }}
        className="w-24 h-24 sm:w-28 sm:h-28 drop-shadow-2xl select-none"
      >
        <img 
          src="/images/cat-sticker.png" 
          alt="Smoking Cat Assistant" 
          className="w-full h-full object-contain filter hover:brightness-110 transition-all pointer-events-none"
          draggable={false}
        />
      </motion.div>
    </motion.div>
  );
}
