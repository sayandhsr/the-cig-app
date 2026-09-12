import { useState, useEffect, useRef } from 'react';
import { Send, MapPin, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { getBoundsOfDistance } from 'geolib';

// Fix Leaflet's default icon path issues with bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

import { useStore } from '@nanostores/react';
import { $userStore } from '@clerk/astro/client';

function SpotChat() {
  const user = useStore($userStore);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [location, setLocation] = useState(null);
  const [loadingLoc, setLoadingLoc] = useState(true);
  const [locError, setLocError] = useState('');
  const messagesEndRef = useRef(null);
  const RADIUS_KM = 15;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    // 1. Get user location
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setLoadingLoc(false);
        },
        (err) => {
          console.error(err);
          setLocError("Location access denied. We need your location to find local chats.");
          setLoadingLoc(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      setLocError("Geolocation is not supported by your browser.");
      setLoadingLoc(false);
    }
  }, []);

  useEffect(() => {
    if (!location) return;

    // 2. Calculate bounding box for 15km
    const bounds = getBoundsOfDistance(
      { latitude: location.lat, longitude: location.lng },
      RADIUS_KM * 1000
    );
    const minLat = bounds[0].latitude;
    const maxLat = bounds[1].latitude;
    const minLng = bounds[0].longitude;
    const maxLng = bounds[1].longitude;

    // 3. Fetch initial local messages
    const fetchLocalMessages = async () => {
      const { data, error } = await supabase
        .from('spot_messages')
        .select('*')
        .gte('latitude', minLat)
        .lte('latitude', maxLat)
        .gte('longitude', minLng)
        .lte('longitude', maxLng)
        .order('created_at', { ascending: true })
        .limit(100);
      
      if (!error && data) {
        setMessages(data);
        setTimeout(scrollToBottom, 100);
      }
    };

    fetchLocalMessages();

    // 4. Subscribe to new spot messages
    const channel = supabase
      .channel('public:spot_messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'spot_messages' }, (payload) => {
        const msg = payload.new;
        // Verify it falls within our radius locally
        if (msg.latitude >= minLat && msg.latitude <= maxLat && msg.longitude >= minLng && msg.longitude <= maxLng) {
          setMessages((prev) => [...prev, msg]);
          setTimeout(scrollToBottom, 100);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [location]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || !user || !location) return;
    
    const textToSend = input;
    setInput('');
    
    const { error } = await supabase
      .from('spot_messages')
      .insert([{
        user_id: user.id,
        username: user.username || user.firstName || 'Anonymous',
        text: textToSend,
        latitude: location.lat,
        longitude: location.lng
      }]);
      
    if (error) {
      console.error("Error sending message", error);
      setInput(textToSend);
    }
  };

  if (loadingLoc) {
    return (
      <div className="flex flex-col items-center justify-center h-[500px] glass-card rounded-2xl">
        <Loader2 className="w-8 h-8 text-gold animate-spin mb-4" />
        <p className="text-cream font-medium tracking-wide">Acquiring satellite lock...</p>
      </div>
    );
  }

  if (locError) {
    return (
      <div className="flex flex-col items-center justify-center h-[500px] glass-card rounded-2xl p-6 text-center">
        <MapPin className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-cream mb-2">Location Required</h2>
        <p className="text-muted">{locError}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[700px]">
      {/* Map Section */}
      <div className="glass-card rounded-2xl overflow-hidden relative z-10 border border-white/5">
        <MapContainer 
          center={[location.lat, location.lng]} 
          zoom={12} 
          style={{ height: '100%', width: '100%', background: '#121212' }}
        >
          {/* Dark theme tiles */}
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          />
          <Marker position={[location.lat, location.lng]}>
            <Popup>
              You are here. Chatting within 15km.
            </Popup>
          </Marker>
          <Circle 
            center={[location.lat, location.lng]} 
            pathOptions={{ color: '#D4AF37', fillColor: '#D4AF37', fillOpacity: 0.1 }} 
            radius={RADIUS_KM * 1000} 
          />
        </MapContainer>
      </div>

      {/* Chat Section */}
      <div className="glass-card rounded-2xl flex flex-col overflow-hidden border border-white/5">
        <div className="p-4 border-b border-white/5 bg-surface/50">
          <h2 className="text-xl font-display font-bold text-cream flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            Local Radar ({RADIUS_KM}km)
          </h2>
        </div>
        
        <div className="flex-grow p-6 overflow-y-auto flex flex-col gap-4">
          {messages.length === 0 && (
            <div className="text-center text-muted py-10 italic">
              No messages in your area yet. Be the first to spot chat!
            </div>
          )}
          {messages.map((msg) => (
            <div key={msg.id} className={`flex flex-col ${msg.user_id === user?.id ? 'items-end' : 'items-start'}`}>
              <div className="flex items-baseline gap-2 mb-1">
                <span className={`text-sm font-medium ${msg.user_id === user?.id ? 'text-gold' : 'text-cream'}`}>{msg.username}</span>
              </div>
              <div className={`px-4 py-2 rounded-2xl max-w-[80%] ${msg.user_id === user?.id ? 'bg-tobacco text-cream rounded-tr-none' : 'bg-surface border border-white/5 text-cream/90 rounded-tl-none'}`}>
                {msg.text}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        
        <div className="p-4 bg-surface border-t border-white/5">
          <form onSubmit={handleSend} className="flex gap-2">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={!user}
              placeholder={user ? "Broadcast to locals..." : "Sign in to chat..."}
              className="flex-grow bg-background border border-white/10 rounded-full px-6 py-3 text-sm text-cream focus:outline-none focus:border-gold transition-colors disabled:opacity-50"
            />
            <button 
              type="submit"
              disabled={!user || !input.trim()}
              className="w-12 h-12 rounded-full bg-gold text-background flex items-center justify-center hover:bg-gold-light transition-colors disabled:opacity-50"
            >
              <Send className="w-5 h-5 ml-[-2px]" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default SpotChat;
