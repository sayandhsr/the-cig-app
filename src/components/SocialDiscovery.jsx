import { motion } from 'framer-motion';
import { MapPin, MessageCircle, UserPlus } from 'lucide-react';

const users = [
  { id: 1, name: 'James', area: 'Downtown', interest: 'Cigars & Jazz', status: 'Looking for a smoking companion' },
  { id: 2, name: 'Sarah', area: 'City Center', interest: 'Vape & Coffee', status: 'Open to chat' },
  { id: 3, name: 'Michael', area: 'Arts District', interest: 'Classic Brands', status: 'Just here to talk' }
];

export default function SocialDiscovery() {
  return (
    <section id="discover" className="py-24 bg-surface relative">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div>
            <h2 className="text-4xl md:text-5xl font-display font-bold text-cream mb-4">WHO'S AROUND?</h2>
            <p className="text-muted max-w-lg">Discover people nearby who share your interests. Connect, chat, or meet up for a smoke in your local area.</p>
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto">
            <select className="bg-surface border border-white/10 text-cream text-sm rounded-lg px-4 py-2 focus:outline-none focus:border-gold w-full md:w-auto">
              <option value="">All Preferred Brands</option>
              <option value="marlboro">Marlboro</option>
              <option value="camel">Camel</option>
              <option value="vape">Vape / E-Cig</option>
              <option value="cigars">Cigars</option>
              <option value="other">Other</option>
            </select>
            <button className="px-6 py-2 border-b border-gold text-gold font-medium tracking-widest hover:text-gold-light transition-colors whitespace-nowrap">
              VIEW MAP
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {users.map((user, idx) => (
            <motion.div 
              key={user.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.6 }}
              className="glass-card rounded-2xl p-6 group hover:-translate-y-2 transition-transform duration-300"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-tobacco-dark border-2 border-gold/30 flex items-center justify-center text-xl font-display font-bold text-gold">
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-xl font-display text-cream">{user.name}</h3>
                    <div className="flex items-center gap-1 text-xs text-muted mt-1">
                      <MapPin className="w-3 h-3" />
                      {user.area} (Approx.)
                    </div>
                  </div>
                </div>
                <div className="px-2 py-1 rounded bg-background/50 border border-white/5 text-[10px] text-muted whitespace-nowrap">
                  101 ×1
                </div>
              </div>

              <div className="mb-6">
                <div className="text-xs text-muted uppercase tracking-widest mb-1">Status</div>
                <div className="text-sm text-gold-light font-medium">{user.status}</div>
                <div className="text-xs text-muted uppercase tracking-widest mt-4 mb-1">Interests</div>
                <div className="text-sm text-cream/80">{user.interest}</div>
              </div>

              <div className="flex items-center gap-3 mt-auto pt-6 border-t border-white/5">
                <button className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg bg-gold/10 text-gold hover:bg-gold hover:text-background transition-colors text-sm font-medium tracking-wide">
                  <MessageCircle className="w-4 h-4" /> CHAT
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg bg-white/5 text-cream hover:bg-white/10 transition-colors text-sm font-medium tracking-wide">
                  <UserPlus className="w-4 h-4" /> CONNECT
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
