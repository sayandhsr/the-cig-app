import { useState, useEffect, useRef } from 'react';
import { Send } from 'lucide-react';
import { supabase } from '../lib/supabase';

import { useStore } from '@nanostores/react';
import { $userStore } from '@clerk/astro/client';

function GlobalChat() {
  const user = useStore($userStore);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    // Fetch initial messages
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('global_messages')
        .select('*')
        .order('created_at', { ascending: true })
        .limit(100);
      
      if (!error && data) {
        setMessages(data);
        setTimeout(scrollToBottom, 100);
      }
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
    
    const { error } = await supabase
      .from('global_messages')
      .insert([{
        user_id: user.id,
        username: user.username || user.firstName || 'Anonymous',
        text: textToSend
      }]);
      
    if (error) {
      console.error("Error sending message", error);
      // Optional: restore input if failed
      setInput(textToSend);
    }
  };

  const formatTime = (isoString) => {
    if (!isoString) return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="glass-card rounded-2xl h-[600px] flex flex-col overflow-hidden">
      <div className="flex-grow p-6 overflow-y-auto flex flex-col gap-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.user_id === user?.id ? 'items-end' : 'items-start'}`}>
            <div className="flex items-baseline gap-2 mb-1">
              <span className={`text-sm font-medium ${msg.user_id === user?.id ? 'text-gold' : 'text-cream'}`}>{msg.username}</span>
              <span className="text-[10px] text-muted">{formatTime(msg.created_at)}</span>
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
            placeholder={user ? "Type a message to the global community..." : "Sign in to chat..."}
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
  );
}

export default GlobalChat;
