import re

file_path = 'src/components/DebatesManager.jsx'
with open(file_path, 'r') as f:
    content = f.read()

# Replace general colors and classes
replacements = {
    'bg-background': 'bg-vintage-paper',
    'bg-surface': 'bg-vintage-paper',
    'border-white/10': 'border-[4px] border-vintage-charcoal',
    'border-white/5': 'border-[4px] border-vintage-charcoal',
    'text-cream': 'text-vintage-charcoal',
    'text-muted': 'text-vintage-charcoal/80',
    'text-gold': 'text-vintage-red',
    'bg-gold': 'bg-vintage-red',
    'text-background': 'text-white',
    'bg-gold-light': 'bg-vintage-charcoal text-white',
    'glass-card': 'bg-vintage-paper border-[8px] border-vintage-charcoal shadow-[8px_8px_0px_0px_#1a1a1a]',
    'rounded-2xl': 'rounded-none',
    'rounded-full': 'rounded-none',
    'rounded-xl': 'rounded-none',
    'rounded-lg': 'rounded-none',
    'rounded': 'rounded-none',
}

for old, new in replacements.items():
    content = content.replace(old, new)

content = content.replace('<h2 className="text-4xl md:text-5xl font-display font-bold text-vintage-charcoal mb-4">THE DEBATE ROOM</h2>', 
                          '<h2 className="text-5xl md:text-7xl font-display text-vintage-charcoal uppercase leading-none mb-4">THE <span className="text-vintage-red">DEBATE ROOM</span></h2>')
                          
content = content.replace('<p className="text-vintage-charcoal/80 max-w-lg mb-8 md:mb-0">',
                          '<p className="text-vintage-charcoal/80 max-w-lg font-serif italic border-l-4 border-vintage-red pl-4 mb-8 md:mb-0">')

# Also add the vintage-paper bg to the main section
content = content.replace('<section id="debates" className="py-12 relative">',
                          '<section id="debates" className="py-16 relative bg-vintage-paper"><div className="absolute inset-0 bg-grunge opacity-20 mix-blend-multiply pointer-events-none"></div>')

with open(file_path, 'w') as f:
    f.write(content)
