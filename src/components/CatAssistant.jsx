import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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

  useEffect(() => {
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
    }, 20000); // check every 20 seconds

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, []);

  return (
    <motion.div
      drag
      dragMomentum={false}
      initial={{ x: 20, y: 100 }}
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
      <div className="text-4xl drop-shadow-md select-none filter hover:brightness-110 transition-all">
        🐱🚬
      </div>
    </motion.div>
  );
}
