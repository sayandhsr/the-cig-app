import re

file_path = 'src/components/DebatesManager.jsx'
with open(file_path, 'r') as f:
    content = f.read()

# Fix broken class names from previous naive replace
content = content.replace('rounded-none-none', 'rounded-none')
content = content.replace('hover:bg-vintage-red-light', 'hover:bg-vintage-charcoal')
content = content.replace('hover:border-gold/30', 'hover:border-vintage-red')
content = content.replace('border-gold bg-vintage-red/10', 'border-vintage-red bg-vintage-red/10')
content = content.replace('focus:border-gold', 'focus-visible:ring-4 focus-visible:ring-vintage-red')

# Add active/focus to buttons
content = content.replace(
    'className="mt-4 py-3 rounded-none bg-vintage-red text-white font-bold tracking-widest hover:bg-vintage-charcoal transition-colors w-full sm:w-auto self-end px-8"',
    'className="mt-4 py-3 rounded-none bg-vintage-red text-white font-bold tracking-widest hover:bg-vintage-charcoal transition-all w-full sm:w-auto self-end px-8 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-vintage-red active:scale-95"'
)

content = content.replace(
    '<button onClick={() => setCreating(true)} className="px-6 py-3 rounded-none bg-vintage-red text-white font-bold tracking-widest hover:bg-vintage-charcoal transition-colors flex items-center gap-2">',
    '<button onClick={() => setCreating(true)} className="px-6 py-3 rounded-none bg-vintage-red text-white font-bold tracking-widest hover:bg-vintage-charcoal transition-all flex items-center gap-2 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-vintage-red active:scale-95">'
)

content = content.replace(
    'className="px-6 py-2 rounded-none bg-vintage-red text-white font-bold text-sm hover:bg-vintage-charcoal disabled:opacity-50"',
    'className="px-6 py-2 rounded-none bg-vintage-red text-white font-bold text-sm hover:bg-vintage-charcoal disabled:opacity-50 transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-vintage-red active:scale-95"'
)

# Add Poll bar animation
content = content.replace(
    '<div className="absolute top-0 left-0 h-full bg-white/5 -z-10" style={{ width: `${pct}%` }}></div>',
    '<div className="absolute top-0 left-0 h-full bg-vintage-red/20 -z-10 transition-all duration-1000 ease-out" style={{ width: `${pct}%` }}></div>'
)

# Fix input borders
content = content.replace(
    'className="bg-vintage-paper border border-[4px] border-vintage-charcoal rounded-none p-3 text-vintage-charcoal"',
    'className="bg-vintage-paper border-[4px] border-vintage-charcoal rounded-none p-3 text-vintage-charcoal focus:outline-none focus-visible:ring-4 focus-visible:ring-vintage-red"'
)

content = content.replace(
    'className="bg-vintage-paper border border-[4px] border-vintage-charcoal rounded-none p-3 text-vintage-charcoal h-24 resize-none"',
    'className="bg-vintage-paper border-[4px] border-vintage-charcoal rounded-none p-3 text-vintage-charcoal h-24 resize-none focus:outline-none focus-visible:ring-4 focus-visible:ring-vintage-red"'
)

content = content.replace(
    'className="flex-grow bg-vintage-paper border border-[4px] border-vintage-charcoal rounded-none px-4 py-2 text-sm text-vintage-charcoal focus:outline-none focus-visible:ring-4 focus-visible:ring-vintage-red"',
    'className="flex-grow bg-vintage-paper border-[4px] border-vintage-charcoal rounded-none px-4 py-2 text-sm text-vintage-charcoal focus:outline-none focus-visible:ring-4 focus-visible:ring-vintage-red"'
)

with open(file_path, 'w') as f:
    f.write(content)
