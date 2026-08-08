const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://rcqspgdfgufhxpigfvrn.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJjcXNwZ2RmZ3VmaHhwaWdmdnJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU5NzQ5NDUsImV4cCI6MjEwMTU1MDk0NX0.cQkFLglRbefN1RwYzhwMoPseqZqL37sQbd4FaKTbRDY');

async function test() {
  const { data: d2, error: e2 } = await supabase.auth.signUp({
    email: 'test66@bellum.com',
    password: 'longpassword123'
  });
  console.log('Signup session:', d2.session ? 'created' : 'null');

  const { data: d3, error: e3 } = await supabase.auth.signInWithPassword({
    email: 'test66@bellum.com',
    password: 'longpassword123'
  });
  console.log('Login error:', e3 ? e3.message : 'success');
}
test();
