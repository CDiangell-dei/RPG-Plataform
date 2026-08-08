const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://rcqspgdfgufhxpigfvrn.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJjcXNwZ2RmZ3VmaHhwaWdmdnJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU5NzQ5NDUsImV4cCI6MjEwMTU1MDk0NX0.cQkFLglRbefN1RwYzhwMoPseqZqL37sQbd4FaKTbRDY');

async function test() {
  const { data, error } = await supabase.auth.signUp({
    email: 'test44@bellum.com',
    password: 'short'
  });
  console.log('Result for short pass:', error ? error.message : 'success');

  const { data: d2, error: e2 } = await supabase.auth.signUp({
    email: 'test55@bellum.com',
    password: 'longpassword123'
  });
  console.log('Result for long pass:', e2 ? e2.message : 'success');
}
test();
