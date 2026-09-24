import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useStore } from '@nanostores/react';
import { $userStore } from '@clerk/astro/client';
import { Loader2, UserPlus, Check, UserIcon } from 'lucide-react';

export default function CommunityDirectory() {
  const user = useStore($userStore);
  const [profiles, setProfiles] = useState([]);
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDirectory = async () => {
      setLoading(true);
      // Fetch all user profiles
      const { data: users, error: userErr } = await supabase
        .from('user_profiles')
        .select('*')
        .order('updated_at', { ascending: false });
        
      if (!userErr && users) {
        setProfiles(users);
      }

      // If logged in, fetch current connection statuses
      if (user) {
        const { data: conns, error: connErr } = await supabase
          .from('connections')
          .select('*')
          .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`);
          
        if (!connErr && conns) {
          setConnections(conns);
        }
      }
      setLoading(false);
    };
    
    fetchDirectory();
  }, [user]);

  const handleConnect = async (receiverId) => {
    if (!user) return alert("You must sign in to connect.");
    
    const { data, error } = await supabase
      .from('connections')
      .insert({
        sender_id: user.id,
        receiver_id: receiverId,
        status: 'pending'
      })
      .select();
      
    if (!error && data) {
      setConnections(prev => [...prev, data[0]]);
    }
  };

  const getConnectionStatus = (otherUserId) => {
    const conn = connections.find(c => 
      (c.sender_id === user?.id && c.receiver_id === otherUserId) || 
      (c.receiver_id === user?.id && c.sender_id === otherUserId)
    );
    if (!conn) return 'none';
    if (conn.status === 'accepted') return 'friends';
    if (conn.status === 'pending' && conn.sender_id === user?.id) return 'sent';
    if (conn.status === 'pending' && conn.receiver_id === user?.id) return 'received';
    return 'none';
  };

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto flex flex-col items-center justify-center py-20 border-[8px] border-vintage-red bg-vintage-charcoal shadow-[8px_8px_0px_0px_#bd2620]">
        <p className="text-vintage-paper font-display text-3xl uppercase tracking-widest text-center px-4">You must sign in to view The Network.</p>
        <p className="text-vintage-paper/50 font-sans tracking-widest mt-4 uppercase">Use the SIGN IN button in the top right corner.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto relative z-10">
      <div className="mb-12 border-b-[4px] border-vintage-red pb-6">
        <h1 className="text-6xl md:text-8xl font-display uppercase tracking-widest text-vintage-paper leading-none mb-4">THE <span className="text-vintage-red">NETWORK</span></h1>
        <p className="text-vintage-paper/80 font-serif italic text-xl border-l-4 border-vintage-red pl-4">The global directory of active smokers.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-12 h-12 text-vintage-red animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {profiles.filter(p => p.user_id !== user?.id).map((profile) => {
            const status = getConnectionStatus(profile.user_id);
            return (
              <div key={profile.user_id} className="bg-vintage-paper border-[6px] border-vintage-charcoal p-6 shadow-[6px_6px_0px_0px_#1a1a1a] flex flex-col h-full">
                <div className="flex gap-4 items-start mb-6">
                  <div className="w-16 h-16 bg-vintage-charcoal border-[3px] border-vintage-red flex-shrink-0">
                    {profile.avatar_url ? (
                      <img src={profile.avatar_url} alt={profile.name} className="w-full h-full object-cover grayscale contrast-150 mix-blend-luminosity" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-vintage-paper bg-vintage-charcoal"><UserIcon /></div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-2xl font-display text-vintage-charcoal uppercase tracking-widest leading-none">{profile.name}</h3>
                    <div className="text-xs font-sans text-vintage-red uppercase tracking-widest mt-1">{profile.gender || 'Unknown'} / {profile.age || '?'}</div>
                  </div>
                </div>
                
                <div className="flex-grow mb-6">
                  <p className="text-sm text-vintage-charcoal/80 font-serif italic border-l-2 border-vintage-red pl-3 line-clamp-3">
                    "{profile.bio || 'No bio provided.'}"
                  </p>
                  
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    {profile.priority && (
                      <div className="bg-vintage-charcoal/10 p-2 text-[10px] font-display uppercase tracking-widest text-vintage-charcoal">
                        <span className="text-vintage-red block mb-1">Priority:</span> {profile.priority}
                      </div>
                    )}
                    {profile.interest && (
                      <div className="bg-vintage-charcoal/10 p-2 text-[10px] font-display uppercase tracking-widest text-vintage-charcoal line-clamp-2">
                        <span className="text-vintage-red block mb-1">Interests:</span> {profile.interest}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-auto pt-4 border-t-[3px] border-vintage-charcoal">
                  {status === 'none' && (
                    <button 
                      onClick={() => handleConnect(profile.user_id)}
                      className="w-full py-3 bg-vintage-charcoal text-vintage-paper font-display tracking-widest uppercase text-sm hover:bg-vintage-red hover:text-white transition-all flex items-center justify-center gap-2"
                    >
                      <UserPlus className="w-4 h-4" /> CONNECT
                    </button>
                  )}
                  {status === 'sent' && (
                    <button disabled className="w-full py-3 bg-vintage-charcoal/50 text-vintage-charcoal font-display tracking-widest uppercase text-sm cursor-not-allowed border-2 border-vintage-charcoal flex items-center justify-center gap-2">
                      PENDING...
                    </button>
                  )}
                  {status === 'received' && (
                    <a href="/inbox" className="w-full py-3 bg-vintage-red text-white font-display tracking-widest uppercase text-sm hover:bg-vintage-charcoal transition-all block text-center">
                      REVIEW REQUEST
                    </a>
                  )}
                  {status === 'friends' && (
                    <a href="/inbox" className="w-full py-3 bg-white text-vintage-charcoal font-display tracking-widest uppercase text-sm border-[3px] border-vintage-charcoal hover:bg-vintage-charcoal hover:text-white transition-all flex items-center justify-center gap-2">
                      <Check className="w-4 h-4" /> MESSAGE
                    </a>
                  )}
                </div>
              </div>
            );
          })}
          {profiles.length <= 1 && (
             <div className="col-span-full py-10 text-center font-serif text-xl italic text-vintage-paper/50">
               No other users found in the dossier network yet.
             </div>
          )}
        </div>
      )}
    </div>
  );
}
