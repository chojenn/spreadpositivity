const SUPABASE_URL = 'https://loohohdpzirmanhoagfv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxvb2hvaGRwemlybWFuaG9hZ2Z2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5Mzc1MzgsImV4cCI6MjA4NjUxMzUzOH0.3ow3PaxcloWDXfABIYhgZlx1QA5YRN96vg0jnDoSAo4';

let supabaseClient = null;
try {
  supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
} catch (e) {
  console.warn('Supabase not configured yet:', e.message);
}

const sizes = ['heart-xs', 'heart-sm', 'heart-md', 'heart-lg', 'heart-xl'];
const container = document.getElementById('hearts-container');
const popupOverlay = document.getElementById('popup-overlay');
const popupMessage = document.getElementById('popup-message');
const popupClose = document.getElementById('popup-close');

async function loadHearts() {
  if (!supabaseClient) return;

  const { data, error } = await supabaseClient
    .from('messages')
    .select('content')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching messages:', error);
    return;
  }

  if (!data || data.length === 0) return;

  data.forEach((row) => {
    const span = document.createElement('span');
    span.className = 'heart ' + sizes[Math.floor(Math.random() * sizes.length)];
    span.textContent = '♡';
    span.addEventListener('click', () => {
      popupMessage.textContent = row.content;
      popupOverlay.classList.add('active');
    });
    container.appendChild(span);
  });
}

function closePopup() {
  popupOverlay.classList.remove('active');
}

popupClose.addEventListener('click', closePopup);
popupOverlay.addEventListener('click', (e) => {
  if (e.target === popupOverlay) closePopup();
});

loadHearts();
