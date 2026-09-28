const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://dghyxtmqgjnoglvndxxi.supabase.co', 'sb_publishable_ZbpLZ2hhqg8cjc1nuScNYg_yaCpCTiC');

async function run() {
  const mockDebates = [
    {
      title: "Why do men smoke more?",
      description: "Is it a macho thing? 🦍 Or do they just complain less about the smell? Discuss.",
      type: "debate",
      author_id: "system",
      author_name: "AdminCat 🐱",
      options: [],
      votes: {}
    },
    {
      title: "Is smoking more about stress or social influence?",
      description: "Did you start because of exams or because the cool kids were behind the gym? 🚬👀",
      type: "poll",
      author_id: "system",
      author_name: "AdminCat 🐱",
      options: ["Stress 😫", "Social Influence 😎", "Both 🤷"],
      votes: {}
    },
    {
      title: "Should smoking areas be completely separated from public spaces?",
      description: "Like, should we have a glass box in the middle of the street? 📦💨",
      type: "debate",
      author_id: "system",
      author_name: "AdminCat 🐱",
      options: [],
      votes: {}
    },
    {
      title: "Does advertising influence people to start smoking?",
      description: "I mean, that camel looked pretty cool back in the day... 🐫😎",
      type: "poll",
      author_id: "system",
      author_name: "AdminCat 🐱",
      options: ["Yes, advertising works 📺", "No, I make my own choices 🦅", "Maybe subconsciously 🧠"],
      votes: {}
    },
    {
      title: "Is quitting smoking harder because of addiction or habit?",
      description: "Is it the nicotine screaming or just missing holding something with your coffee? ☕🚬",
      type: "poll",
      author_id: "system",
      author_name: "AdminCat 🐱",
      options: ["The Chemical Addiction 🧪", "The Daily Habit 🔄", "The Social Aspect 🗣️"],
      votes: {}
    }
  ];

  for (const d of mockDebates) {
    const { data: existing } = await supabase.from('debates').select('*').eq('title', d.title);
    if (!existing || existing.length === 0) {
      const { data, error } = await supabase.from('debates').insert([d]).select();
      if (error) console.error(error);
      else if (data && data.length > 0) {
        // Add a mock comment
        const debateId = data[0].id;
        await supabase.from('debate_comments').insert([{
          debate_id: debateId,
          author_id: "system2",
          author_name: "RandomSmoker 💨",
          text: "Bro, this is so true 😂. Literally me yesterday."
        }]);
      }
    }
  }
  console.log("Mock debates inserted.");
}

run();
