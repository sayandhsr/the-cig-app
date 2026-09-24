import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useStore } from '@nanostores/react';
import { $userStore } from '@clerk/astro/client';
import { Loader2, Save, User as UserIcon } from 'lucide-react';

export default function ProfileForm() {
  const user = useStore($userStore);
  
  const [formData, setFormData] = useState({
    name: '',
    gender: '',
    age: '',
    bio: '',
    priority: '',
    finding: '',
    interest: ''
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!user) return;
    
    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
        
      if (data) {
        setFormData({
          name: data.name || user.firstName || '',
          gender: data.gender || '',
          age: data.age || '',
          bio: data.bio || '',
          priority: data.priority || '',
          finding: data.finding || '',
          interest: data.interest || ''
        });
      } else {
        setFormData(prev => ({
          ...prev,
          name: user.firstName || user.username || ''
        }));
      }
      setLoading(false);
    };
    
    fetchProfile();
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setMessage('');
    
    const email = user.emailAddresses?.[0]?.emailAddress || '';
    const avatar_url = user.imageUrl || '';
    
    const { error } = await supabase
      .from('user_profiles')
      .upsert({
        user_id: user.id,
        name: formData.name,
        email: email,
        avatar_url: avatar_url,
        gender: formData.gender,
        age: formData.age ? parseInt(formData.age) : null,
        bio: formData.bio,
        priority: formData.priority,
        finding: formData.finding,
        interest: formData.interest,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' });
      
    if (error) {
      console.error(error);
      setMessage('FAILED TO SAVE PROFILE.');
    } else {
      setMessage('PROFILE SAVED SUCCESSFULLY.');
    }
    setSaving(false);
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-20 border-[8px] border-vintage-red bg-vintage-charcoal shadow-[8px_8px_0px_0px_#bd2620]">
        <p className="text-vintage-paper font-display text-3xl uppercase tracking-widest text-center px-4">You must sign in to view your Dossier.</p>
        <p className="text-vintage-paper/50 font-sans tracking-widest mt-4 uppercase">Use the SIGN IN button in the top right corner.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-12 h-12 text-vintage-red animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-vintage-paper border-[8px] border-vintage-charcoal shadow-[8px_8px_0px_0px_#1a1a1a] p-8 md:p-12 relative max-w-4xl mx-auto">
      <div className="absolute inset-0 bg-grunge opacity-10 mix-blend-multiply pointer-events-none"></div>
      
      <div className="relative z-10 flex flex-col md:flex-row gap-8 mb-10 items-center md:items-start border-b-[4px] border-vintage-charcoal pb-8">
        <div className="w-32 h-32 bg-vintage-charcoal border-[4px] border-vintage-red shadow-[4px_4px_0px_0px_#1a1a1a] overflow-hidden">
          {user.imageUrl ? (
            <img src={user.imageUrl} alt="Profile" className="w-full h-full object-cover grayscale contrast-150 mix-blend-luminosity" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-vintage-paper">
              <UserIcon className="w-16 h-16" />
            </div>
          )}
        </div>
        <div className="text-center md:text-left">
          <h2 className="text-4xl font-display text-vintage-charcoal uppercase tracking-widest">{formData.name || 'ANONYMOUS'}</h2>
          <p className="text-vintage-red font-serif italic text-lg">{user.emailAddresses?.[0]?.emailAddress}</p>
          <div className="inline-block mt-4 px-3 py-1 bg-vintage-charcoal text-vintage-paper font-display text-xs uppercase tracking-widest">
            ID: {user.id.substring(0,8)}...
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8">
        
        <div className="space-y-2">
          <label className="text-xs font-display text-vintage-red uppercase tracking-[0.2em]">Display Name</label>
          <input 
            type="text" name="name" value={formData.name} onChange={handleChange} required
            className="w-full bg-transparent border-[4px] border-vintage-charcoal px-4 py-3 text-vintage-charcoal font-sans font-medium uppercase tracking-widest focus:outline-none focus:border-vintage-red"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-display text-vintage-red uppercase tracking-[0.2em]">Age</label>
          <input 
            type="number" name="age" value={formData.age} onChange={handleChange} min="18"
            className="w-full bg-transparent border-[4px] border-vintage-charcoal px-4 py-3 text-vintage-charcoal font-sans font-medium uppercase tracking-widest focus:outline-none focus:border-vintage-red"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-display text-vintage-red uppercase tracking-[0.2em]">Gender</label>
          <select 
            name="gender" value={formData.gender} onChange={handleChange}
            className="w-full bg-transparent border-[4px] border-vintage-charcoal px-4 py-3 text-vintage-charcoal font-sans font-medium uppercase tracking-widest focus:outline-none focus:border-vintage-red appearance-none"
          >
            <option value="">SELECT...</option>
            <option value="Male">MALE</option>
            <option value="Female">FEMALE</option>
            <option value="Non-Binary">NON-BINARY</option>
            <option value="Other">OTHER</option>
            <option value="Prefer not to say">PREFER NOT TO SAY</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-display text-vintage-red uppercase tracking-[0.2em]">Interests</label>
          <input 
            type="text" name="interest" value={formData.interest} onChange={handleChange} placeholder="e.g. Cigars, Debates, Nightlife"
            className="w-full bg-transparent border-[4px] border-vintage-charcoal px-4 py-3 text-vintage-charcoal font-sans font-medium uppercase tracking-widest focus:outline-none focus:border-vintage-red"
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="text-xs font-display text-vintage-red uppercase tracking-[0.2em]">Bio</label>
          <textarea 
            name="bio" value={formData.bio} onChange={handleChange} rows="3" placeholder="Tell the community who you are..."
            className="w-full bg-transparent border-[4px] border-vintage-charcoal px-4 py-3 text-vintage-charcoal font-serif text-lg focus:outline-none focus:border-vintage-red resize-none"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-display text-vintage-red uppercase tracking-[0.2em]">Priority</label>
          <select 
            name="priority" value={formData.priority} onChange={handleChange}
            className="w-full bg-transparent border-[4px] border-vintage-charcoal px-4 py-3 text-vintage-charcoal font-sans font-medium uppercase tracking-widest focus:outline-none focus:border-vintage-red appearance-none"
          >
            <option value="">SELECT...</option>
            <option value="Networking">NETWORKING</option>
            <option value="Socializing">SOCIALIZING</option>
            <option value="Debating">DEBATING</option>
            <option value="Just Browsing">JUST BROWSING</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-display text-vintage-red uppercase tracking-[0.2em]">What are you finding?</label>
          <input 
            type="text" name="finding" value={formData.finding} onChange={handleChange} placeholder="e.g. Smoking buddies, intense talks"
            className="w-full bg-transparent border-[4px] border-vintage-charcoal px-4 py-3 text-vintage-charcoal font-sans font-medium uppercase tracking-widest focus:outline-none focus:border-vintage-red"
          />
        </div>

        <div className="md:col-span-2 mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="font-display tracking-widest text-sm uppercase">
            {message && (
              <span className={message.includes('FAILED') ? 'text-vintage-red' : 'text-green-700'}>{message}</span>
            )}
          </div>
          
          <button 
            type="submit" 
            disabled={saving}
            className="w-full sm:w-auto px-10 py-4 bg-vintage-red text-white font-display text-xl tracking-[0.2em] uppercase hover:bg-vintage-charcoal transition-all shadow-[6px_6px_0px_0px_#1a1a1a] hover:shadow-none hover:translate-y-[6px] hover:translate-x-[6px] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-vintage-charcoal flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            UPDATE DOSSIER
          </button>
        </div>
      </form>
    </div>
  );
}
