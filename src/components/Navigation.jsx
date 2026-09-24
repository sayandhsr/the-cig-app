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
    { name: 'Discover', href: '/discover' },
    { name: 'Profile', href: '/profile' }
  ];

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-vintage-charcoal/95 backdrop-blur-xl border-b-[4px] border-vintage-red shadow-[0_10px_30px_rgba(0,0,0,0.5)]' : 'bg-vintage-charcoal py-6 border-b-[4px] border-transparent'}`}>
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
        <a href="/" className="text-3xl font-display font-black tracking-widest group flex items-center gap-2 text-vintage-paper hover:text-white transition-colors">
          <span className="text-vintage-red">KILL</span> SWITCH
        </a>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a 
              key={link.name}
              href={link.href}
              className="text-sm font-display tracking-[0.2em] uppercase transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vintage-red focus-visible:ring-offset-4 focus-visible:ring-offset-vintage-charcoal text-vintage-paper/80 hover:text-vintage-red active:scale-95"
            >
              {link.name}
            </a>
          ))}
          
          <div className="pl-8 border-l border-vintage-paper/20 flex items-center gap-4">
            {!user ? (
              <SignInButton mode="modal">
                <button className="px-6 py-2 border-[3px] border-vintage-red text-vintage-red hover:bg-vintage-red hover:text-white transition-all font-display tracking-[0.2em] uppercase text-sm focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-vintage-red active:scale-95">
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
          className="md:hidden p-2 transition-transform active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vintage-red text-vintage-paper hover:text-white"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Nav */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-vintage-charcoal border-b border-white/5 p-6 flex flex-col gap-4 shadow-2xl origin-top animate-in fade-in slide-in-from-top-4 duration-200">
          {navLinks.map((link) => (
            <a 
              key={link.name}
              href={link.href}
              className="text-2xl font-display tracking-[0.2em] uppercase text-vintage-paper py-4 border-b border-white/5 hover:text-vintage-red transition-colors active:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vintage-red px-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.name}
            </a>
          ))}
          {!user ? (
            <div className="py-4">
              <SignInButton mode="modal">
                <button className="w-full px-6 py-4 bg-vintage-red text-white font-display text-xl tracking-[0.2em] uppercase shadow-lg transition-transform active:scale-95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white">
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
