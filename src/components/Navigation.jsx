import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { UserButton, SignInButton } from '@clerk/astro/react';
import { useStore } from '@nanostores/react';
import { $userStore } from '@clerk/astro/client';

function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const user = useStore($userStore);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Spot Chat', href: '/spot-chat' },
    { name: 'Global Chat', href: '/global-chat' },
    { name: 'Debates', href: '/debates' },
    { name: 'Discover', href: '/discover' }
  ];

  return (
    <nav className={`fixed w-full z-40 transition-all duration-300 ${isScrolled ? 'bg-background/80 backdrop-blur-xl border-b border-white/5 py-4' : 'bg-transparent py-6'}`}>
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
        <a href="/" className="text-2xl font-display font-black tracking-widest text-cream group flex items-center gap-2">
          <span className="text-gold">KILL</span> SWITCH
        </a>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a 
              key={link.name}
              href={link.href}
              className="text-sm font-medium tracking-widest text-muted hover:text-gold transition-colors"
            >
              {link.name}
            </a>
          ))}
          
          <div className="pl-8 border-l border-white/10 flex items-center gap-4">
            {!user ? (
              <SignInButton mode="modal">
                <button className="px-6 py-2 rounded-full border border-gold/30 text-gold hover:bg-gold/10 transition-colors text-sm font-medium tracking-widest">
                  SIGN IN
                </button>
              </SignInButton>
            ) : (
              <UserButton afterSignOutUrl="/" />
            )}
          </div>
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className="md:hidden text-cream p-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Nav */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-background border-b border-white/5 p-6 flex flex-col gap-4 shadow-2xl">
          {navLinks.map((link) => (
            <a 
              key={link.name}
              href={link.href}
              className="text-lg font-medium tracking-widest text-cream py-2 border-b border-white/5"
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.name}
            </a>
          ))}
          {!user ? (
            <div className="py-4">
              <SignInButton mode="modal">
                <button className="w-full px-6 py-3 rounded-lg bg-gold text-background font-bold tracking-widest">
                  SIGN IN
                </button>
              </SignInButton>
            </div>
          ) : (
            <div className="py-4 flex justify-center">
              <UserButton afterSignOutUrl="/" />
            </div>
          )}
        </div>
      )}
    </nav>
  );
}

export default Navigation;
