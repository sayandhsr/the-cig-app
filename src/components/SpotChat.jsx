import { useState, useEffect, useRef } from 'react';
import { MapPin, Send, Loader2, AlertTriangle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import { getBoundsOfDistance } from 'geolib';
import 'leaflet/dist/leaflet.css';
import { motion, AnimatePresence } from 'framer-motion';

// Fix for leaflet marker icon in react
import L from 'leaflet';
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
  const [chatError, setChatError] = useState(null);
  const [isLoadingChat, setIsLoadingChat] = useState(false);
  const messagesEndRef = useRef(null);
  const RADIUS_KM = 15;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
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

    const bounds = getBoundsOfDistance(
      { latitude: location.lat, longitude: location.lng },
      RADIUS_KM * 1000
    );
    const minLat = bounds[0].latitude;
    const maxLat = bounds[1].latitude;
    const minLng = bounds[0].longitude;
    const maxLng = bounds[1].longitude;

    const fetchLocalMessages = async () => {
      setIsLoadingChat(true);
      setChatError(null);
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
      } else {
        setChatError("Failed to fetch local radar data.");
      }
      setIsLoadingChat(false);
    };

    fetchLocalMessages();

    const channel = supabase
      .channel('public:spot_messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'spot_messages' }, (payload) => {
        const msg = payload.new;
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
    setChatError(null);
    
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
      setChatError("Message transmission failed.");
      setInput(textToSend);
    }
  };

  const formatTime = (isoString) => {
    if (!isoString) return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loadingLoc) {
    return (
      <div className="flex flex-col items-center justify-center h-[500px] bg-vintage-paper border-[8px] border-vintage-charcoal rounded-none">
        <Loader2 className="w-12 h-12 text-vintage-red animate-spin mb-4" />
        <p className="text-vintage-charcoal font-display uppercase tracking-widest">Acquiring satellite lock...</p>
      </div>
    );
  }

  if (locError) {
    return (
      <div className="flex flex-col items-center justify-center h-[500px] bg-vintage-paper border-[8px] border-white shadow-[8px_8px_0px_0px_rgba(26,26,26,1)] rounded-none p-6 text-center transform -rotate-1 relative">
        <div className="absolute inset-0 bg-grunge opacity-10 mix-blend-multiply pointer-events-none"></div>
        <MapPin className="w-16 h-16 text-vintage-red mb-4 relative z-10" />
        <h2 className="text-4xl font-display uppercase tracking-wider text-vintage-charcoal mb-2 relative z-10">Location Required</h2>
        <p className="text-vintage-charcoal/80 font-serif italic text-lg relative z-10">{locError}</p>
        <button onClick={() => window.location.reload()} className="mt-6 px-8 py-4 bg-vintage-charcoal text-vintage-paper font-display uppercase tracking-widest hover:bg-vintage-red transition-all shadow-[4px_4px_0px_0px_#bd2620] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] relative z-10 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-vintage-red active:scale-95">
          RETRY
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[700px]">
      {/* Map Section */}
      <div className="bg-vintage-paper border-[8px] border-white shadow-[8px_8px_0px_0px_#1a1a1a] overflow-hidden relative z-10 transform -rotate-1">
        <MapContainer 
          center={[location.lat, location.lng]} 
          zoom={12} 
          style={{ height: '100%', width: '100%', background: '#dfcdb4' }}
        >
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}"
            attribution='Tiles &copy; Esri'
          />
          <Marker position={[location.lat, location.lng]}>
            <Popup>
              <span className="font-display uppercase tracking-wider text-vintage-red">You are here.</span>
            </Popup>
          </Marker>
          <Circle 
            center={[location.lat, location.lng]} 
            pathOptions={{ color: '#bd2620', fillColor: '#bd2620', fillOpacity: 0.15, weight: 2 }} 
            radius={RADIUS_KM * 1000} 
          />
        </MapContainer>
        <div className="absolute top-4 left-4 z-[400] bg-vintage-charcoal text-vintage-paper px-4 py-2 font-display uppercase tracking-widest text-sm shadow-xl flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-vintage-red animate-ping inline-block"></span>
          Radar Active
        </div>
      </div>

      {/* Chat Section */}
      <div className="bg-vintage-paper border-[8px] border-white shadow-[8px_8px_0px_0px_#1a1a1a] h-[700px] flex flex-col overflow-hidden transform rotate-1 relative">
        <div className="absolute inset-0 bg-grunge opacity-10 mix-blend-multiply pointer-events-none"></div>
        <div className="p-6 border-b-[6px] border-white bg-vintage-charcoal relative z-10">
          <h2 className="text-2xl font-display uppercase tracking-widest text-vintage-paper flex items-center gap-3">
            <MapPin className="text-vintage-red w-6 h-6" />
            Local Radar ({RADIUS_KM}km)
          </h2>
        </div>
        
        <div className="flex-grow p-6 overflow-y-auto flex flex-col gap-4 relative z-10 scroll-smooth">
          {isLoadingChat && (
            <div className="flex-grow flex items-center justify-center">
              <Loader2 className="w-12 h-12 text-vintage-red animate-spin" />
            </div>
          )}

          {!isLoadingChat && messages.length === 0 && !chatError && (
             <div className="flex-grow flex items-center justify-center">
               <p className="text-vintage-charcoal/60 font-serif italic text-lg border-l-4 border-vintage-red pl-4">No radar blips. You are alone.</p>
             </div>
          )}

          {chatError && (
             <div className="bg-vintage-red/10 border-2 border-vintage-red p-4 flex items-center gap-3 mt-auto mb-4">
                <AlertTriangle className="text-vintage-red w-6 h-6 shrink-0" />
                <p className="text-vintage-red font-display tracking-widest uppercase text-sm">{chatError}</p>
             </div>
          )}

          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div 
                initial={{ opacity: 0, x: msg.user_id === user?.id ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
                key={msg.id} 
                className={`flex flex-col ${msg.user_id === user?.id ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-baseline gap-2 mb-1">
                  <span className={`text-xs font-display tracking-widest uppercase ${msg.user_id === user?.id ? 'text-vintage-red' : 'text-vintage-charcoal/70'}`}>{msg.username}</span>
                  <span className="text-[10px] text-vintage-charcoal/50 font-serif">{formatTime(msg.created_at)}</span>
                </div>
                <div className={`px-5 py-3 font-serif text-lg leading-relaxed ${msg.user_id === user?.id ? 'bg-vintage-red text-white shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]' : 'bg-white text-vintage-charcoal shadow-[4px_4px_0px_0px_rgba(189,38,32,0.5)] border-2 border-vintage-charcoal'}`}>
                  {msg.text}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>
        
        <div className="p-4 bg-vintage-charcoal border-t-[6px] border-white relative z-10">
          <form onSubmit={handleSend} className="flex gap-2 group">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={!user}
              placeholder={user ? "BROADCAST LOCALLY..." : "SIGN IN TO CHAT..."}
              className="flex-grow bg-vintage-paper border-[4px] border-transparent text-vintage-charcoal font-serif px-6 py-3 focus:outline-none focus-visible:ring-4 focus-visible:ring-vintage-red transition-colors disabled:opacity-50 placeholder:text-vintage-charcoal/50"
            />
            <button 
              type="submit"
              disabled={!user || !input.trim()}
              className="w-16 h-12 bg-vintage-red text-white font-display tracking-widest flex items-center justify-center hover:bg-white hover:text-vintage-red border-[4px] border-transparent hover:border-vintage-red transition-all disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white active:scale-95"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default SpotChat;
