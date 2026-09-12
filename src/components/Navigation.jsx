import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { SignedIn, SignedOut, UserButton, SignInButton } from '@clerk/clerk-react';
import { withClerk } from './withClerk.jsx';

function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'DISCOVER', href: '/discover' },
    { name: 'SPOT CHAT', href: '/spot-chat' },
    { name: 'GLOBAL CHAT', href: '/global-chat' },
    { name: 'DEBATES', href: '/debates' },
    { name: 'COMMUNITY', href: '/community' },
  ];

  return (
    <nav className={`fixed w-full z-40 transition-all duration-300 ${isScrolled ? 'bg-background/90 backdrop-blur-lg border-b border-white/5 py-4' : 'bg-transparent py-6'}`}>
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="text-2xl font-display font-bold tracking-widest text-gold">KILL SWITCH</div>
          <div className="px-1.5 py-0.5 rounded bg-red-900/50 border border-red-500/30 text-[10px] font-bold text-red-200 tracking-wider">18+</div>
        </div>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a key={link.name} href={link.href} className="text-sm font-medium tracking-widest text-cream/70 hover:text-gold transition-colors">
              {link.name}
            </a>
          ))}
        </div>

        {/* Right side actions */}
        <div className="hidden md:flex items-center gap-4">
          <SignedOut>
            <SignInButton mode="modal">
              <button className="text-sm font-medium tracking-widest text-cream hover:text-gold transition-colors">LOGIN</button>
            </SignInButton>
            <SignInButton mode="modal">
              <button className="text-sm font-medium tracking-widest px-6 py-2 rounded-full bg-gold text-background hover:bg-gold-light transition-colors">JOIN</button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden text-cream" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>
      
      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-surface border-b border-white/5 py-4 px-6 flex flex-col gap-4">
          {navLinks.map((link) => (
            <a key={link.name} href={link.href} className="text-sm font-medium tracking-widest text-cream/70 hover:text-gold transition-colors">
              {link.name}
            </a>
          ))}
          <div className="w-full h-px bg-white/5 my-2"></div>
          <SignedOut>
            <SignInButton mode="modal">
              <button className="text-sm font-medium tracking-widest text-cream text-left">LOGIN</button>
            </SignInButton>
            <SignInButton mode="modal">
              <button className="text-sm font-medium tracking-widest px-6 py-2 rounded-full bg-gold text-background text-center">JOIN</button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <div className="py-2">
              <UserButton afterSignOutUrl="/" />
            </div>
          </SignedIn>
        </div>
      )}
    </nav>
  );
}

export default withClerk(Navigation);
