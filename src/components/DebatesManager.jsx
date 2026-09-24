import { useState, useEffect } from 'react';
import { Flame, MessageCircle, Plus, ChevronUp, ChevronDown, Check, X } from 'lucide-react';
import { supabase } from '../lib/supabase';

import { useStore } from '@nanostores/react';
import { $userStore } from '@clerk/astro/client';

function DebatesManager() {
  const user = useStore($userStore);
  const [debates, setDebates] = useState([]);
  const [comments, setComments] = useState({});
  const [showCreate, setShowCreate] = useState(false);
  const [expandedDebate, setExpandedDebate] = useState(null);

  // Create form state
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [type, setType] = useState('debate'); // 'debate' | 'poll'
  const [options, setOptions] = useState(['', '']);
  const [commentInput, setCommentInput] = useState('');

  useEffect(() => {
    fetchDebates();

    const debatesSub = supabase
      .channel('debates_channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'debates' }, fetchDebates)
      .subscribe();

    return () => {
      supabase.removeChannel(debatesSub);
    };
  }, []);

  const fetchDebates = async () => {
    const { data, error } = await supabase
      .from('debates')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setDebates(data);
  };

  const fetchComments = async (debateId) => {
    const { data } = await supabase
      .from('debate_comments')
      .select('*')
      .eq('debate_id', debateId)
      .order('created_at', { ascending: true });
    if (data) {
      setComments(prev => ({ ...prev, [debateId]: data }));
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!user) return alert("Must be logged in!");

    const newDebate = {
      title,
      description: desc,
      type,
      author_id: user.id,
      author_name: user.username || user.firstName || 'Anonymous',
      options: type === 'poll' ? options.filter(o => o.trim()) : [],
      votes: {}
    };

    await supabase.from('debates').insert([newDebate]);
    setShowCreate(false);
    setTitle('');
    setDesc('');
    setOptions(['', '']);
  };

  const handleVote = async (debate, voteValue) => {
    if (!user) return alert("Must be logged in!");
    
    // Toggle vote logic
    const currentVotes = { ...debate.votes };
    if (currentVotes[user.id] === voteValue) {
      delete currentVotes[user.id]; // Undo vote
    } else {
      currentVotes[user.id] = voteValue; // Cast vote
    }

    await supabase
      .from('debates')
      .update({ votes: currentVotes })
      .eq('id', debate.id);
  };

  const handleComment = async (debateId) => {
    if (!user || !commentInput.trim()) return;
    
    await supabase.from('debate_comments').insert([{
      debate_id: debateId,
      author_id: user.id,
      author_name: user.username || user.firstName || 'Anonymous',
      text: commentInput
    }]);

    setCommentInput('');
    fetchComments(debateId);
  };

  const getVoteCount = (debate) => {
    if (debate.type === 'poll') {
      return Object.keys(debate.votes).length; // Total poll votes
    } else {
      return Object.values(debate.votes).reduce((a, b) => a + b, 0); // Net upvotes
    }
  };

  const toggleExpand = (debateId) => {
    if (expandedDebate === debateId) {
      setExpandedDebate(null);
    } else {
      setExpandedDebate(debateId);
      fetchComments(debateId);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-12 flex flex-col md:flex-row justify-between items-end gap-6">
        <div>
          <h1 className="text-4xl font-display font-bold text-vintage-charcoal mb-2">Community Debates</h1>
          <p className="text-vintage-charcoal/80">Discuss, debate, vote, and share your perspective.</p>
        </div>
        <button 
          onClick={() => setShowCreate(true)}
          className="px-6 py-3 rounded-none bg-vintage-red text-white font-bold tracking-widest hover:bg-vintage-charcoal transition-colors shadow-[0_0_15px_rgba(212,175,55,0.2)]"
        >
          START A DEBATE
        </button>
      </div>

      {showCreate && (
        <div className="bg-vintage-paper border-[8px] border-vintage-charcoal shadow-[8px_8px_0px_0px_#1a1a1a] p-6 rounded-none mb-8 relative border border-gold/30">
          <button onClick={() => setShowCreate(false)} className="absolute top-4 right-4 text-vintage-charcoal/80 hover:text-white">
            <X className="w-6 h-6" />
          </button>
          <h2 className="text-2xl font-bold text-vintage-charcoal mb-6">Create New Topic</h2>
          <form onSubmit={handleCreate} className="flex flex-col gap-4">
            <input 
              required
              type="text" 
              placeholder="Title (e.g. Favorite Evening Smoke?)" 
              value={title} onChange={e=>setTitle(e.target.value)}
              className="bg-vintage-paper border-[4px] border-vintage-charcoal rounded-none p-3 text-vintage-charcoal focus:outline-none focus-visible:ring-4 focus-visible:ring-vintage-red"
            />
            <textarea 
              placeholder="Provide some context or your stance..." 
              value={desc} onChange={e=>setDesc(e.target.value)}
              className="bg-vintage-paper border-[4px] border-vintage-charcoal rounded-none p-3 text-vintage-charcoal h-24 resize-none focus:outline-none focus-visible:ring-4 focus-visible:ring-vintage-red"
            />
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-vintage-charcoal cursor-pointer">
                <input type="radio" checked={type === 'debate'} onChange={() => setType('debate')} className="accent-gold" /> Open Debate
              </label>
              <label className="flex items-center gap-2 text-vintage-charcoal cursor-pointer">
                <input type="radio" checked={type === 'poll'} onChange={() => setType('poll')} className="accent-gold" /> Poll
              </label>
            </div>
            
            {type === 'poll' && (
              <div className="flex flex-col gap-2 mt-2">
                {options.map((opt, idx) => (
                  <input 
                    key={idx}
                    type="text" 
                    placeholder={`Option ${idx + 1}`} 
                    value={opt} 
                    onChange={e => {
                      const newOpts = [...options];
                      newOpts[idx] = e.target.value;
                      setOptions(newOpts);
                    }}
                    className="bg-vintage-paper border border-[4px] border-vintage-charcoal rounded-none p-2 text-sm text-vintage-charcoal w-2/3"
                  />
                ))}
                <button type="button" onClick={() => setOptions([...options, ''])} className="text-vintage-red text-sm text-left mt-1">+ Add Option</button>
              </div>
            )}
            
            <button type="submit" className="mt-4 py-3 rounded-none bg-vintage-red text-white font-bold tracking-widest hover:bg-vintage-charcoal transition-all w-full sm:w-auto self-end px-8 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-vintage-red active:scale-95">
              POST TOPIC
            </button>
          </form>
        </div>
      )}

      <div className="space-y-6">
        {debates.length === 0 && <p className="text-vintage-charcoal/80 italic text-center py-10">No debates yet. Be the first to start one!</p>}
        
        {debates.map((debate) => {
          const isExpanded = expandedDebate === debate.id;
          const userVote = user ? debate.votes[user.id] : null;
          
          return (
            <div key={debate.id} className="bg-vintage-paper border-[8px] border-vintage-charcoal shadow-[8px_8px_0px_0px_#1a1a1a] p-6 rounded-none flex flex-col gap-6 group hover:border-vintage-red transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-start gap-6">
                
                {/* Voting Left Column */}
                {debate.type === 'debate' ? (
                  <div className="flex flex-row sm:flex-col items-center gap-2 sm:min-w-[60px] bg-vintage-paper sm:bg-transparent p-2 sm:p-0 rounded-none">
                    <button onClick={() => handleVote(debate, 1)} className={`hover:text-vintage-red transition-colors ${userVote === 1 ? 'text-vintage-red' : 'text-vintage-charcoal/80'}`}>
                      <ChevronUp className="w-8 h-8" />
                    </button>
                    <span className="text-lg font-bold text-vintage-charcoal">{getVoteCount(debate)}</span>
                    <button onClick={() => handleVote(debate, -1)} className={`hover:text-red-500 transition-colors ${userVote === -1 ? 'text-red-500' : 'text-vintage-charcoal/80'}`}>
                      <ChevronDown className="w-8 h-8" />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-row sm:flex-col items-center gap-2 sm:min-w-[60px] bg-vintage-paper sm:bg-transparent p-2 sm:p-0 rounded-none">
                     <div className="w-10 h-10 rounded-none border border-[4px] border-vintage-charcoal flex items-center justify-center text-vintage-red">
                      <Flame className="w-5 h-5" />
                    </div>
                    <span className="text-xs text-vintage-charcoal/80 text-center">{getVoteCount(debate)} votes</span>
                  </div>
                )}
                
                {/* Content */}
                <div className="flex-grow cursor-pointer" onClick={() => toggleExpand(debate.id)}>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-[10px] uppercase tracking-widest px-2 py-1 bg-white/5 text-vintage-red rounded-none">{debate.type}</span>
                    <span className="text-xs text-vintage-charcoal/80">Posted by {debate.author_name} • {new Date(debate.created_at).toLocaleDateString()}</span>
                  </div>
                  <h3 className="text-xl font-display font-medium text-vintage-charcoal group-hover:text-vintage-red transition-colors mb-2">
                    {debate.title}
                  </h3>
                  <p className="text-vintage-charcoal/80 text-sm mb-4 line-clamp-2">{debate.description}</p>
                  
                  <div className="flex items-center gap-2 text-sm text-vintage-charcoal/80">
                    <MessageCircle className="w-4 h-4" />
                    {comments[debate.id]?.length || 0} Comments {isExpanded ? '(Click to collapse)' : '(Click to view)'}
                  </div>
                </div>
              </div>

              {/* Expanded View */}
              {isExpanded && (
                <div className="mt-4 pt-6 border-t border-[4px] border-vintage-charcoal pl-0 sm:pl-[84px]">
                  
                  {/* Poll Options */}
                  {debate.type === 'poll' && (
                    <div className="flex flex-col gap-3 mb-8">
                      <h4 className="text-vintage-charcoal font-medium mb-2">Cast your vote:</h4>
                      {debate.options.map((opt, idx) => {
                        const votesForOpt = Object.values(debate.votes).filter(v => v === idx).length;
                        const totalVotes = Object.keys(debate.votes).length || 1;
                        const pct = Math.round((votesForOpt / totalVotes) * 100);
                        const isSelected = userVote === idx;

                        return (
                          <div 
                            key={idx} 
                            onClick={() => handleVote(debate, idx)}
                            className={`relative p-3 rounded-none border ${isSelected ? 'border-vintage-red bg-vintage-red/10' : 'border-[4px] border-vintage-charcoal bg-vintage-paper hover:bg-white/5'} cursor-pointer flex justify-between items-center z-10 overflow-hidden`}
                          >
                            <div className="absolute top-0 left-0 h-full bg-vintage-red/20 -z-10 transition-all duration-1000 ease-out" style={{ width: `${pct}%` }}></div>
                            <span className="text-vintage-charcoal flex items-center gap-2">
                              {isSelected && <Check className="w-4 h-4 text-vintage-red" />} {opt}
                            </span>
                            <span className="text-vintage-charcoal/80 text-sm">{votesForOpt} ({pct}%)</span>
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {/* Comments Section */}
                  <h4 className="text-vintage-charcoal font-medium mb-4">Discussion</h4>
                  <div className="flex flex-col gap-4 mb-6 max-h-64 overflow-y-auto pr-2">
                    {(!comments[debate.id] || comments[debate.id].length === 0) && (
                      <p className="text-sm text-vintage-charcoal/80 italic">No comments yet.</p>
                    )}
                    {comments[debate.id]?.map(comment => (
                      <div key={comment.id} className="bg-vintage-paper p-3 rounded-none">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-bold text-vintage-red">{comment.author_name}</span>
                          <span className="text-[10px] text-vintage-charcoal/80">{new Date(comment.created_at).toLocaleDateString()}</span>
                        </div>
                        <p className="text-sm text-vintage-charcoal/90">{comment.text}</p>
                      </div>
                    ))}
                  </div>
                  
                  {/* Add Comment */}
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Add to the discussion..." 
                      value={commentInput}
                      onChange={e => setCommentInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleComment(debate.id)}
                      disabled={!user}
                      className="flex-grow bg-vintage-paper border-[4px] border-vintage-charcoal rounded-none px-4 py-2 text-sm text-vintage-charcoal focus:outline-none focus-visible:ring-4 focus-visible:ring-vintage-red"
                    />
                    <button 
                      onClick={() => handleComment(debate.id)}
                      disabled={!user || !commentInput.trim()}
                      className="px-6 py-2 rounded-none bg-vintage-red text-white font-bold text-sm hover:bg-vintage-charcoal disabled:opacity-50 transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-vintage-red active:scale-95"
                    >
                      Post
                    </button>
                  </div>

                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default DebatesManager;
