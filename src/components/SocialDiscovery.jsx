import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, MessageCircle, UserPlus, Save, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useUser } from '@clerk/clerk-react';

export default function SocialDiscovery() {
  const { user } = useUser();
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterBrand, setFilterBrand] = useState('');
  
  // User's own profile state
  const [myLocation, setMyLocation] = useState(null);
  const [myStatus, setMyStatus] = useState('Open to chat');
  const [myBrand, setMyBrand] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Attempt to get location to find nearby users
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setMyLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
          fetchProfiles(position.coords.latitude, position.coords.longitude, filterBrand);
        },
        () => {
          // If no location, just fetch random
          fetchProfiles(null, null, filterBrand);
        }
      );
    } else {
      fetchProfiles(null, null, filterBrand);
    }
  }, [filterBrand]);

  useEffect(() => {
    if (user) {
      fetchMyProfile();
    }
  }, [user]);

  const fetchMyProfile = async () => {
    const { data } = await supabase.from('discovery_profiles').select('*').eq('user_id', user.id).single();
    if (data) {
      setMyStatus(data.status || 'Open to chat');
      setMyBrand(data.brand || '');
    }
  };

  const handleUpdateProfile = async () => {
    if (!user) return alert("Please sign in first.");
    setIsSaving(true);
    
    const profileData = {
      user_id: user.id,
      username: user.username || user.firstName || 'Anonymous',
      status: myStatus,
      brand: myBrand,
      updated_at: new Date().toISOString()
    };
    
    if (myLocation) {
      profileData.latitude = myLocation.lat;
      profileData.longitude = myLocation.lng;
    }
    
    await supabase.from('discovery_profiles').upsert(profileData);
    setIsSaving(false);
    alert("Profile updated and broadcasted!");
    fetchProfiles(myLocation?.lat, myLocation?.lng, filterBrand);
  };

  const fetchProfiles = async (lat, lng, brand) => {
    setLoading(true);
    let query = supabase.from('discovery_profiles').select('*');
    
    if (brand) {
      query = query.eq('brand', brand);
    }

    const { data, error } = await query.limit(50);
    
    if (!error && data) {
      let filtered = data.filter(p => p.user_id !== user?.id); // exclude self
      
      // If we have location, try to find nearby (< 50km)
      if (lat && lng) {
        const nearby = filtered.filter(p => {
          if (!p.latitude || !p.longitude) return false;
          // Rough distance calculation (Pythagorean on lat/lng for short distances)
          const latDiff = (p.latitude - lat) * 111.32;
          const lngDiff = (p.longitude - lng) * 111.32 * Math.cos(lat * (Math.PI / 180));
          const distKm = Math.sqrt(latDiff*latDiff + lngDiff*lngDiff);
          p.distance = distKm;
          return distKm <= 50;
        });
        
        if (nearby.length > 0) {
          nearby.sort((a, b) => a.distance - b.distance);
          setProfiles(nearby.slice(0, 9));
          setLoading(false);
          return;
        }
      }
      
      // Fallback: Random assortment if no one is nearby or location is off
      const shuffled = [...filtered].sort(() => 0.5 - Math.random());
      setProfiles(shuffled.slice(0, 9));
    }
    setLoading(false);
  };

  return (
    <section id="discover" className="py-12 relative">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div>
            <h2 className="text-4xl md:text-5xl font-display font-bold text-cream mb-4">WHO'S AROUND?</h2>
            <p className="text-muted max-w-lg">Discover people nearby who share your interests. We show users within 50km first; if none, we expand globally.</p>
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto">
            <select 
              value={filterBrand}
              onChange={(e) => setFilterBrand(e.target.value)}
              className="bg-surface border border-white/10 text-cream text-sm rounded-lg px-4 py-2 focus:outline-none focus:border-gold w-full md:w-auto"
            >
              <option value="">All Preferred Brands</option>
              <option value="marlboro">Marlboro</option>
              <option value="camel">Camel</option>
              <option value="vape">Vape / E-Cig</option>
              <option value="cigars">Cigars</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        {/* User's Broadcast Settings */}
        {user && (
          <div className="glass-card rounded-xl p-4 md:p-6 mb-12 border border-gold/20 flex flex-col md:flex-row items-center gap-4 md:gap-8 bg-surface/50">
            <div className="flex-grow flex flex-col md:flex-row gap-4 w-full">
              <input 
                type="text"
                placeholder="Your Status (e.g., Looking for a smoking companion)"
                value={myStatus}
                onChange={e => setMyStatus(e.target.value)}
                className="flex-grow bg-background border border-white/10 rounded-lg px-4 py-2 text-sm text-cream focus:outline-none focus:border-gold"
              />
              <select 
                value={myBrand}
                onChange={(e) => setMyBrand(e.target.value)}
                className="bg-background border border-white/10 text-cream text-sm rounded-lg px-4 py-2 focus:outline-none focus:border-gold md:w-48"
              >
                <option value="">No Brand Preference</option>
                <option value="marlboro">Marlboro</option>
                <option value="camel">Camel</option>
                <option value="vape">Vape / E-Cig</option>
                <option value="cigars">Cigars</option>
                <option value="other">Other</option>
              </select>
            </div>
            <button 
              onClick={handleUpdateProfile}
              disabled={isSaving}
              className="w-full md:w-auto px-6 py-2 rounded-lg bg-gold text-background font-bold tracking-widest hover:bg-gold-light transition-colors flex items-center justify-center gap-2"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} 
              BROADCAST ME
            </button>
          </div>
        )}

        {loading ? (
           <div className="flex justify-center py-20">
             <Loader2 className="w-10 h-10 text-gold animate-spin" />
           </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {profiles.length === 0 ? (
              <div className="col-span-full text-center py-10 text-muted italic">
                Nobody found! Be the first to broadcast yourself.
              </div>
            ) : (
              profiles.map((p, idx) => (
                <motion.div 
                  key={p.user_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05, duration: 0.4 }}
                  className="glass-card rounded-2xl p-6 group hover:-translate-y-2 transition-transform duration-300"
                >
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-tobacco-dark border-2 border-gold/30 flex items-center justify-center text-xl font-display font-bold text-gold uppercase">
                        {p.username.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-xl font-display text-cream">{p.username}</h3>
                        <div className="flex items-center gap-1 text-xs text-muted mt-1">
                          <MapPin className="w-3 h-3" />
                          {p.distance ? `${Math.round(p.distance)}km away` : 'Global'}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mb-6">
                    <div className="text-xs text-muted uppercase tracking-widest mb-1">Status</div>
                    <div className="text-sm text-gold-light font-medium">{p.status || 'Chilling'}</div>
                    <div className="text-xs text-muted uppercase tracking-widest mt-4 mb-1">Brand</div>
                    <div className="text-sm text-cream/80 capitalize">{p.brand || 'No Preference'}</div>
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
              ))
            )}
          </div>
        )}
      </div>
    </section>
  );
}
