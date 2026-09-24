import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, MessageCircle, UserPlus, Save, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { getDistance } from 'geolib';

import { useStore } from '@nanostores/react';
import { $userStore } from '@clerk/astro/client';

function SocialDiscovery() {
  const user = useStore($userStore);
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
          // Use geolib for accurate distance calculation
          const distMeters = getDistance(
            { latitude: lat, longitude: lng },
            { latitude: p.latitude, longitude: p.longitude }
          );
          const distKm = distMeters / 1000;
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
    <section id="discover" className="py-16 relative bg-vintage-paper">
      <div className="absolute inset-0 bg-grunge opacity-20 mix-blend-multiply pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div>
            <h2 className="text-5xl md:text-7xl font-display text-vintage-charcoal uppercase leading-none mb-4">WHO'S <span className="text-vintage-red">AROUND?</span></h2>
            <p className="text-vintage-charcoal/80 max-w-lg font-serif italic border-l-4 border-vintage-red pl-4">Discover people nearby who share your interests. We show users within 50km first; if none, we expand globally.</p>
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto">
            <select 
              value={filterBrand}
              onChange={(e) => setFilterBrand(e.target.value)}
              className="bg-vintage-charcoal border-[4px] border-vintage-charcoal text-vintage-paper font-sans text-sm rounded-none px-6 py-3 focus:outline-none focus:border-vintage-red w-full md:w-auto uppercase tracking-widest"
            >
              <option value="">All Brands</option>
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
          <div className="bg-vintage-charcoal rounded-none p-6 md:p-8 mb-16 border-[8px] border-white shadow-[8px_8px_0px_0px_#bd2620] flex flex-col md:flex-row items-center gap-6 md:gap-8 transform -rotate-1 relative">
            <div className="absolute -top-4 -right-4 w-12 h-12 bg-vintage-red rounded-full flex items-center justify-center animate-pulse">
               <span className="text-white font-display text-xs tracking-widest">LIVE</span>
            </div>
            <div className="flex-grow flex flex-col md:flex-row gap-4 w-full">
              <input 
                type="text"
                placeholder="YOUR STATUS (e.g., Looking for a smoking companion)"
                value={myStatus}
                onChange={e => setMyStatus(e.target.value)}
                className="flex-grow bg-vintage-paper border-[4px] border-transparent px-6 py-3 text-vintage-charcoal font-serif focus:outline-none focus:border-vintage-red placeholder:text-vintage-charcoal/50"
              />
              <select 
                value={myBrand}
                onChange={(e) => setMyBrand(e.target.value)}
                className="bg-vintage-paper border-[4px] border-transparent text-vintage-charcoal font-sans text-sm uppercase tracking-widest px-6 py-3 focus:outline-none focus:border-vintage-red md:w-56"
              >
                <option value="">No Preference</option>
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
              className="w-full md:w-auto px-8 py-4 bg-vintage-red text-white font-display text-xl tracking-[0.2em] uppercase hover:bg-white hover:text-vintage-red transition-all flex items-center justify-center gap-3 border-[4px] border-transparent hover:border-vintage-red"
            >
              {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />} 
              BROADCAST
            </button>
          </div>
        )}

        {loading ? (
           <div className="flex justify-center py-20">
             <Loader2 className="w-12 h-12 text-vintage-red animate-spin" />
           </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {profiles.length === 0 ? (
              <div className="col-span-full text-center py-10 text-vintage-charcoal font-serif italic text-xl">
                Nobody found! Be the first to broadcast yourself.
              </div>
            ) : (
              profiles.map((p, idx) => (
                <motion.div 
                  key={p.user_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05, duration: 0.4 }}
                  className="bg-vintage-paper border-[6px] border-vintage-charcoal p-8 shadow-[6px_6px_0px_0px_#1a1a1a] hover:shadow-none hover:translate-x-[6px] hover:translate-y-[6px] transition-all relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-10 font-display text-6xl text-vintage-charcoal -mt-4 -mr-2 pointer-events-none">
                    {String(idx + 1).padStart(2, '0')}
                  </div>
                  
                  <div className="flex items-start justify-between mb-8 relative z-10">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-vintage-red border-4 border-vintage-charcoal flex items-center justify-center text-3xl font-display text-white uppercase shadow-[4px_4px_0px_0px_#1a1a1a]">
                        {p.username.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-2xl font-display text-vintage-charcoal uppercase tracking-widest">{p.username}</h3>
                        <div className="flex items-center gap-1 text-sm text-vintage-charcoal/60 font-serif mt-1">
                          <MapPin className="w-3 h-3" />
                          {p.distance ? `${Math.round(p.distance)}km away` : 'Global'}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mb-8 relative z-10">
                    <div className="text-xs text-vintage-red font-display uppercase tracking-[0.2em] mb-2">Status</div>
                    <div className="text-lg text-vintage-charcoal font-serif border-l-2 border-vintage-charcoal/20 pl-3 mb-6">{p.status || 'Chilling'}</div>
                    
                    <div className="text-xs text-vintage-red font-display uppercase tracking-[0.2em] mb-2">Brand</div>
                    <div className="text-lg text-vintage-charcoal font-sans font-medium uppercase tracking-widest">{p.brand || 'No Preference'}</div>
                  </div>

                  <div className="flex items-center gap-4 mt-auto pt-6 border-t-[4px] border-vintage-charcoal relative z-10">
                    <button className="flex-1 flex items-center justify-center gap-2 py-4 bg-vintage-charcoal text-vintage-paper hover:bg-vintage-red hover:text-white transition-all text-sm font-display tracking-[0.2em] uppercase focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-vintage-red active:scale-95">
                      <MessageCircle className="w-4 h-4" /> CHAT
                    </button>
                    <button onClick={() => alert("Direct messaging is coming soon!")} className="flex-1 flex items-center justify-center gap-2 py-4 border-[4px] border-vintage-charcoal text-vintage-charcoal hover:bg-vintage-charcoal hover:text-vintage-paper transition-all text-sm font-display tracking-[0.2em] uppercase focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-vintage-charcoal active:scale-95">
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

export default SocialDiscovery;
