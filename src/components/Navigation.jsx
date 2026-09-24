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
    <nav className={`fixed w-full z-40 transition-all duration-300 ${isScrolled ? 'bg-vintage-charcoal/95 backdrop-blur-xl border-b border-white/5 py-4 shadow-2xl' : 'bg-transparent py-6'}`}>
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
        <a href="/" className={`text-3xl font-display font-black tracking-widest group flex items-center gap-2 ${isScrolled ? 'text-vintage-paper' : 'text-vintage-charcoal'}`}>
          <span className="text-vintage-red">KILL</span> SWITCH
        </a>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a 
              key={link.name}
              href={link.href}
              className={`text-sm font-display tracking-[0.2em] uppercase transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vintage-red focus-visible:ring-offset-4 focus-visible:ring-offset-transparent active:scale-95 ${isScrolled ? 'text-vintage-paper/80 hover:text-vintage-red' : 'text-vintage-charcoal/80 hover:text-vintage-red'}`}
            >
              {link.name}
            </a>
          ))}
          
          <div className="pl-8 border-l border-current/20 flex items-center gap-4">
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
          className={`md:hidden p-2 transition-transform active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vintage-red ${isScrolled ? 'text-vintage-paper' : 'text-vintage-charcoal'}`}
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
