const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://dghyxtmqgjnoglvndxxi.supabase.co', 'sb_publishable_ZbpLZ2hhqg8cjc1nuScNYg_yaCpCTiC');
async function test() {
  console.log('Testing Supabase...');
  const { data, error } = await supabase.from('global_messages').select('*').limit(1);
  if (error) console.error('Error:', error);
  else console.log('Success!', data);
}
test();
