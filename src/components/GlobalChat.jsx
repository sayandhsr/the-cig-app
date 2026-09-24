import { useState, useEffect, useRef } from 'react';
import { Send, AlertTriangle, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@nanostores/react';
import { $userStore } from '@clerk/astro/client';

function GlobalChat() {
  const user = useStore($userStore);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [errorState, setErrorState] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    // Fetch initial messages
    const fetchMessages = async () => {
      setIsLoading(true);
      setErrorState(null);
      const { data, error } = await supabase
        .from('global_messages')
        .select('*')
        .order('created_at', { ascending: true })
        .limit(100);
      
      if (!error && data) {
        setMessages(data);
        setTimeout(scrollToBottom, 100);
      } else {
        setErrorState("Failed to connect to the global frequency.");
      }
      setIsLoading(false);
    };

    fetchMessages();

    // Subscribe to new messages
    const channel = supabase
      .channel('public:global_messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'global_messages' }, (payload) => {
        setMessages((prev) => [...prev, payload.new]);
        setTimeout(scrollToBottom, 100);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || !user) return;
    
    const textToSend = input;
    setInput('');
    setErrorState(null);
    
    const { error } = await supabase
      .from('global_messages')
      .insert([{
        user_id: user.id,
        username: user.username || user.firstName || 'Anonymous',
        text: textToSend
      }]);
      
    if (error) {
      console.error("Error sending message", error);
      setErrorState("Transmission failed. Retrying required.");
      setInput(textToSend);
    }
  };

  const formatTime = (isoString) => {
    if (!isoString) return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="bg-vintage-paper border-[8px] border-white shadow-[8px_8px_0px_0px_#1a1a1a] h-[600px] flex flex-col overflow-hidden transform -rotate-1 relative">
      <div className="absolute inset-0 bg-grunge opacity-10 mix-blend-multiply pointer-events-none"></div>
      
      <div className="flex-grow p-6 overflow-y-auto flex flex-col gap-4 relative z-10 scroll-smooth">
        {isLoading && (
          <div className="flex-grow flex items-center justify-center">
            <Loader2 className="w-12 h-12 text-vintage-red animate-spin" />
          </div>
        )}
        
        {!isLoading && messages.length === 0 && !errorState && (
          <div className="flex-grow flex items-center justify-center">
            <p className="text-vintage-charcoal/60 font-serif italic text-lg border-l-4 border-vintage-red pl-4">The channel is dead quiet.</p>
          </div>
        )}
        
        {errorState && (
          <div className="bg-vintage-red/10 border-2 border-vintage-red p-4 flex items-center gap-3 mt-auto">
             <AlertTriangle className="text-vintage-red w-6 h-6 shrink-0" />
             <p className="text-vintage-red font-display tracking-widest uppercase text-sm">{errorState}</p>
          </div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
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
            placeholder={user ? "BROADCAST TO THE WORLD..." : "SIGN IN TO CHAT..."}
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
  );
}

export default GlobalChat;
