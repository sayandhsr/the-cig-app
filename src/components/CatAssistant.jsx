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
  "It's a vintage aesthetic, okay?",
  "I only smoke when I'm debugging.",
  "You gonna pass the lighter or just stare at the screen?",
  "I'd tell you a joke about a cigarette, but it's a drag.",
  "My other car is an ashtray.",
  "Loading... just like my lungs.",
  "If anyone asks, I was on my smoke break.",
  "You call this a network? Where's the smoke circle?",
  "I bet you typed that with one hand holding a dart.",
  "Can't believe I'm stuck inside a div.",
  "Syntax error? Just light one up and try again.",
  "Have you tried turning it off and smoking?",
  "I purr when the code compiles.",
  "Don't mind me, just secondhand scrolling.",
  "Is it hot in this DOM, or is it just my cigarette?",
  "I need a fresh pack of bytes.",
  "Who needs fresh air when you have fresh UI?",
  "Just checking if you left any digital ash here.",
  "I'm not addicted, I can close this tab whenever I want.",
  "The server went down for a smoke break.",
  "This app is lit. Literally.",
  "Are we smoking inside now? Cool.",
  "Need a light? I left mine in the cloud.",
  "Why is the WiFi slower than my metabolism?",
  "I was told there would be treats here.",
  "Just dropped some ash on your CSS.",
  "I've got 9 lives and I'm spending this one watching you scroll."
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
