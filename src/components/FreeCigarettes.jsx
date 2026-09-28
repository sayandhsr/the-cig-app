import { useState } from 'react';
import { motion } from 'framer-motion';

export default function FreeCigarettes() {
  const [ageVerified, setAgeVerified] = useState(null); // null, 'yes', 'no'

  if (ageVerified === null) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-vintage-paper p-4 text-center">
        <h1 className="text-4xl md:text-6xl font-display font-bold text-vintage-charcoal uppercase mb-8">
          Age Verification
        </h1>
        <p className="text-xl font-serif text-vintage-charcoal/80 mb-12">
          Are you 18 years or older?
        </p>
        <div className="flex gap-6">
          <button 
            onClick={() => setAgeVerified('yes')}
            className="px-10 py-4 bg-vintage-charcoal text-white font-display text-2xl uppercase hover:bg-vintage-red transition-colors"
          >
            Yes, I am
          </button>
          <button 
            onClick={() => setAgeVerified('no')}
            className="px-10 py-4 border-4 border-vintage-charcoal text-vintage-charcoal font-display text-2xl uppercase hover:bg-vintage-charcoal hover:text-white transition-colors"
          >
            No, I'm under 18
          </button>
        </div>
      </div>
    );
  }

  if (ageVerified === 'no') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black p-4 text-center">
        <motion.div 
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", bounce: 0.5 }}
        >
          <h1 className="text-4xl md:text-7xl font-display text-white mb-8">NICE TRY, KID</h1>
          <img 
            src="/images/cat-middle-finger.png" 
            alt="Get outta here" 
            className="max-w-[400px] w-full mx-auto border-8 border-white shadow-2xl rounded-sm"
          />
          <a href="/" className="inline-block mt-12 px-8 py-3 bg-white text-black font-display text-xl uppercase hover:bg-vintage-red hover:text-white transition-colors">
            Go Back
          </a>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center min-h-screen bg-vintage-paper pt-24 pb-12 px-4 selection:bg-vintage-red selection:text-white">
      <div className="max-w-4xl w-full mx-auto space-y-16">
        
        {/* Main "Free Cigarettes" Section */}
        <section className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-5xl md:text-8xl font-display font-bold text-vintage-charcoal uppercase mb-4 tracking-tighter">
              Free Cigarettes
            </h1>
            <p className="text-xl font-serif text-vintage-charcoal/70 mb-10">
              You clicked it. You opened it. Now face the truth.
            </p>
            <div className="relative mx-auto max-w-lg">
              <div className="absolute inset-0 bg-vintage-red transform rotate-3 translate-x-2 translate-y-2 opacity-50"></div>
              <img 
                src="/images/cat-pointing.png" 
                alt="Cat Pointing at You" 
                className="relative w-full h-auto border-8 border-vintage-charcoal shadow-xl z-10"
              />
            </div>
            <h2 className="text-3xl md:text-5xl font-display font-bold text-vintage-red uppercase mt-10">
              It's a trap!
            </h2>
          </motion.div>
        </section>

        <hr className="border-t-2 border-vintage-charcoal/20 w-32 mx-auto" />

        {/* Donation Section */}
        <section className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-4xl md:text-6xl font-display font-bold text-vintage-charcoal uppercase mb-6">
              Support the Cause
            </h2>
            <div className="relative mx-auto max-w-sm mb-8">
              <div className="absolute inset-0 bg-vintage-charcoal transform -rotate-2 -translate-x-1 translate-y-1 opacity-20"></div>
              <img 
                src="/images/cat-wallet.png" 
                alt="Empty Wallet Cat" 
                className="relative w-full h-auto border-4 border-vintage-charcoal shadow-lg z-10 grayscale hover:grayscale-0 transition-all duration-500"
              />
            </div>
            <div className="bg-vintage-charcoal text-vintage-paper p-8 inline-block shadow-2xl transform -rotate-1">
              <h3 className="text-3xl font-display uppercase tracking-widest text-vintage-red mb-2">
                Donations Coming Soon
              </h3>
              <p className="font-serif text-lg">
                We're currently too broke to even accept money. <br/> Check back later.
              </p>
            </div>
          </motion.div>
        </section>

        <div className="text-center mt-20">
          <a href="/" className="inline-block px-10 py-5 bg-transparent border-4 border-vintage-charcoal text-vintage-charcoal font-display text-xl tracking-widest uppercase hover:bg-vintage-charcoal hover:text-white transition-colors">
            Back to Home
          </a>
        </div>

      </div>
    </div>
  );
}
