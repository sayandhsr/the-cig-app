import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useStore } from '@nanostores/react';
import { $userStore } from '@clerk/astro/client';
import { Loader2, MessageSquare, Send, UserX, Check, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function InboxManager() {
  const user = useStore($userStore);
  const [loading, setLoading] = useState(true);
  
  // Data
  const [connections, setConnections] = useState([]);
  const [profiles, setProfiles] = useState({}); // id -> profile
  
  // UI State
  const [activeTab, setActiveTab] = useState('messages'); // 'messages' or 'requests'
  const [activeChat, setActiveChat] = useState(null); // connection_id
  
  // Chat state
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!user) return;
    
    const fetchInbox = async () => {
      // Fetch all connections
      const { data: conns } = await supabase
        .from('connections')
        .select('*')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`);
        
      if (conns) {
        setConnections(conns);
        
        // Fetch profiles for all connected users
        const otherUserIds = conns.map(c => c.sender_id === user.id ? c.receiver_id : c.sender_id);
        if (otherUserIds.length > 0) {
          const { data: profs } = await supabase
            .from('user_profiles')
            .select('*')
            .in('user_id', otherUserIds);
            
          if (profs) {
            const profMap = {};
            profs.forEach(p => profMap[p.user_id] = p);
            setProfiles(profMap);
          }
        }
      }
    };
    
    fetchInbox().then(() => setLoading(false));
    
    const interval = setInterval(fetchInbox, 5000);
    return () => clearInterval(interval);
  }, [user]);

  // Handle Realtime Messages when activeChat is selected
  useEffect(() => {
    if (!activeChat || !user) return;
    
    const fetchMessages = async () => {
      const { data } = await supabase
        .from('direct_messages')
        .select('*')
        .eq('connection_id', activeChat)
        .order('created_at', { ascending: true });
      if (data) setMessages(data);
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };
    fetchMessages();
    
    const sub = supabase
      .channel(`dm_${activeChat}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'direct_messages', filter: `connection_id=eq.${activeChat}` }, payload => {
        setMessages(prev => [...prev, payload.new]);
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      })
      .subscribe();
      
    return () => { supabase.removeChannel(sub); };
  }, [activeChat, user]);

  const handleRequestAction = async (connectionId, action) => {
    if (action === 'accept') {
      await supabase.from('connections').update({ status: 'accepted' }).eq('id', connectionId);
      setConnections(prev => prev.map(c => c.id === connectionId ? { ...c, status: 'accepted' } : c));
    } else {
      await supabase.from('connections').delete().eq('id', connectionId);
      setConnections(prev => prev.filter(c => c.id !== connectionId));
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat) return;
    
    const text = newMessage;
    setNewMessage('');
    
    await supabase.from('direct_messages').insert({
      connection_id: activeChat,
      sender_id: user.id,
      text
    });
  };

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto flex flex-col items-center justify-center py-20 border-[8px] border-vintage-red bg-vintage-charcoal shadow-[8px_8px_0px_0px_#bd2620]">
        <p className="text-vintage-paper font-display text-3xl uppercase tracking-widest text-center px-4">You must sign in to view your Inbox.</p>
      </div>
    );
  }

  const friends = connections.filter(c => c.status === 'accepted');
  const pendingRequests = connections.filter(c => c.status === 'pending' && c.receiver_id === user.id);
  const sentRequests = connections.filter(c => c.status === 'pending' && c.sender_id === user.id);

  return (
    <div className="max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row gap-8 h-[75vh]">
      
      {/* Sidebar */}
      <div className="w-full md:w-1/3 bg-vintage-paper border-[6px] border-vintage-charcoal shadow-[6px_6px_0px_0px_#1a1a1a] flex flex-col overflow-hidden">
        <div className="flex border-b-[4px] border-vintage-charcoal">
          <button 
            onClick={() => { setActiveTab('messages'); setActiveChat(null); }}
            className={`flex-1 py-4 font-display uppercase tracking-widest text-sm transition-all ${activeTab === 'messages' ? 'bg-vintage-charcoal text-vintage-paper' : 'bg-transparent text-vintage-charcoal hover:bg-vintage-red/10'}`}
          >
            Direct Comm
          </button>
          <button 
            onClick={() => { setActiveTab('requests'); setActiveChat(null); }}
            className={`flex-1 py-4 font-display uppercase tracking-widest text-sm transition-all relative ${activeTab === 'requests' ? 'bg-vintage-charcoal text-vintage-paper' : 'bg-transparent text-vintage-charcoal hover:bg-vintage-red/10'}`}
          >
            Requests {pendingRequests.length > 0 && <span className="absolute top-2 right-2 w-3 h-3 bg-vintage-red rounded-full"></span>}
          </button>
        </div>

        <div className="flex-grow overflow-y-auto p-4">
          {loading ? (
            <div className="flex justify-center p-8"><Loader2 className="animate-spin text-vintage-red" /></div>
          ) : activeTab === 'messages' ? (
            <div className="flex flex-col gap-2">
              {friends.length === 0 ? (
                <p className="text-center font-serif italic text-vintage-charcoal/50 py-8">No connections yet. Head to The Network.</p>
              ) : (
                friends.map(c => {
                  const otherId = c.sender_id === user.id ? c.receiver_id : c.sender_id;
                  const profile = profiles[otherId];
                  if (!profile) return null;
                  return (
                    <button 
                      key={c.id}
                      onClick={() => setActiveChat(c.id)}
                      className={`flex items-center gap-3 p-3 border-[3px] transition-all text-left ${activeChat === c.id ? 'border-vintage-red bg-vintage-red/10' : 'border-transparent hover:border-vintage-charcoal/20'}`}
                    >
                      <div className="w-10 h-10 bg-vintage-charcoal flex items-center justify-center text-white font-display uppercase">
                        {profile.name.charAt(0)}
                      </div>
                      <div className="flex-grow overflow-hidden">
                        <div className="font-display tracking-widest text-vintage-charcoal truncate">{profile.name}</div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              <div>
                <h4 className="font-display uppercase tracking-widest text-xs text-vintage-red mb-3">Pending Action</h4>
                {pendingRequests.length === 0 ? (
                   <p className="text-sm font-serif italic text-vintage-charcoal/50">No incoming requests.</p>
                ) : (
                  pendingRequests.map(c => {
                    const profile = profiles[c.sender_id];
                    return (
                      <div key={c.id} className="border-[3px] border-vintage-charcoal p-3 mb-2 flex flex-col gap-3 bg-white">
                        <div className="font-display tracking-widest text-vintage-charcoal uppercase">{profile?.name || 'Unknown'}</div>
                        <div className="flex gap-2">
                          <button onClick={() => handleRequestAction(c.id, 'accept')} className="flex-1 bg-vintage-charcoal text-white text-xs font-display py-2 hover:bg-vintage-red transition-all"><Check className="w-4 h-4 mx-auto" /></button>
                          <button onClick={() => handleRequestAction(c.id, 'reject')} className="flex-1 border-2 border-vintage-charcoal text-vintage-charcoal text-xs font-display py-2 hover:bg-vintage-charcoal hover:text-white transition-all"><UserX className="w-4 h-4 mx-auto" /></button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="w-full md:w-2/3 bg-vintage-paper border-[6px] border-vintage-charcoal shadow-[6px_6px_0px_0px_#1a1a1a] flex flex-col h-full overflow-hidden">
        {activeChat ? (
          <>
            <div className="p-4 border-b-[4px] border-vintage-charcoal bg-vintage-charcoal text-vintage-paper font-display uppercase tracking-widest flex items-center gap-3">
              <MessageSquare className="w-5 h-5 text-vintage-red" />
              Direct Channel
            </div>
            
            <div className="flex-grow overflow-y-auto p-6 bg-vintage-paper/50 flex flex-col gap-4">
              {messages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-vintage-charcoal/40 font-serif italic text-lg">
                  Connection established. Secure channel open.
                </div>
              ) : (
                messages.map((m, idx) => (
                  <motion.div 
                    key={m.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${m.sender_id === user.id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[80%] p-4 border-[3px] font-sans text-sm md:text-base ${m.sender_id === user.id ? 'bg-vintage-charcoal text-vintage-paper border-vintage-charcoal' : 'bg-white text-vintage-charcoal border-vintage-charcoal shadow-[4px_4px_0px_0px_#bd2620]'}`}>
                      {m.text}
                    </div>
                  </motion.div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
            
            <div className="p-4 bg-vintage-charcoal border-t-[6px] border-white">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input 
                  type="text" 
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  placeholder="Transmit message..."
                  className="flex-grow bg-vintage-paper border-[4px] border-transparent p-3 text-vintage-charcoal font-sans font-bold focus:outline-none focus:border-vintage-red placeholder:font-serif placeholder:font-normal placeholder:text-vintage-charcoal/50 uppercase tracking-widest"
                />
                <button type="submit" disabled={!newMessage.trim()} className="bg-vintage-red text-white px-6 font-display tracking-widest uppercase hover:bg-white hover:text-vintage-red border-[4px] border-transparent hover:border-vintage-red transition-all disabled:opacity-50 flex items-center justify-center">
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-vintage-charcoal p-8 text-center bg-vintage-charcoal/5">
            <AlertTriangle className="w-16 h-16 text-vintage-red mb-6 opacity-80" />
            <h2 className="text-4xl font-display uppercase tracking-widest mb-4">No Active Channel</h2>
            <p className="font-serif italic text-vintage-charcoal/70 text-xl max-w-md">
              Select a connection from your dossier on the left to initiate direct comms, or check for pending requests.
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
