import { Filter } from 'https://esm.run/bad-words';

// Supabase config
const SUPABASE_URL = 'https://loohohdpzirmanhoagfv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxvb2hvaGRwemlybWFuaG9hZ2Z2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5Mzc1MzgsImV4cCI6MjA4NjUxMzUzOH0.3ow3PaxcloWDXfABIYhgZlx1QA5YRN96vg0jnDoSAo4';

let supabaseClient = null;
try {
  supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
} catch (e) {
  console.warn('Supabase not configured yet:', e.message);
}

// Content filter — bad-words library + custom negative phrases
const filter = new Filter();
filter.addWords(
  'kill yourself', 'kys', 'go die', 'ugly', 'loser', 'worthless',
  'pathetic', 'disgusting', 'stupid', 'idiot', 'moron', 'dumb',
  'i hate', 'you suck', 'no one likes', 'nobody likes', 'fat', 'pp'
);

function containsBlockedContent(text) {
  return filter.isProfane(text);
}

// DOM elements
const addBtn = document.querySelector('.add-message-btn');
const overlay = document.getElementById('modal-overlay');
const closeBtn = document.getElementById('modal-close');
const input = document.getElementById('message-input');
const submitBtn = document.getElementById('modal-submit');
const confirmation = document.getElementById('modal-confirmation');
const rejection = document.getElementById('modal-rejection');
const messageEl = document.querySelector('.message');

// Rotating messages from Supabase
let messages = [];
let currentIndex = 0;

async function fetchMessages() {
  if (!supabaseClient) return;

  const { data, error } = await supabaseClient
    .from('messages')
    .select('content')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching messages:', error);
    return;
  }

  if (data && data.length > 0) {
    messages = data.map((row) => row.content);
    currentIndex = 0;
    messageEl.textContent = messages[0];
  }
}

function showNextMessage() {
  if (messages.length === 0) return;
  currentIndex = (currentIndex + 1) % messages.length;
  messageEl.textContent = messages[currentIndex];
}

fetchMessages();
setInterval(showNextMessage, 15000);

// Modal
function openModal() {
  input.value = '';
  confirmation.classList.remove('show');
  rejection.classList.remove('show');
  submitBtn.disabled = false;
  overlay.classList.add('active');
  input.focus();
}

function closeModal() {
  overlay.classList.remove('active');
}

addBtn.addEventListener('click', openModal);
closeBtn.addEventListener('click', closeModal);

// Close when clicking outside the modal
overlay.addEventListener('click', (e) => {
  if (e.target === overlay) closeModal();
});

// Submit message
submitBtn.addEventListener('click', async () => {
  const content = input.value.trim();
  if (!content) return;

  rejection.classList.remove('show');

  if (containsBlockedContent(content)) {
    rejection.classList.add('show');
    return;
  }

  submitBtn.disabled = true;

  if (supabaseClient) {
    const { error } = await supabaseClient
      .from('messages')
      .insert({ content });

    if (error) {
      console.error('Error saving message:', error);
      submitBtn.disabled = false;
      return;
    }

    // Add the new message to the rotation
    messages.push(content);
  } else {
    console.log('Message submitted (Supabase not configured):', content);
  }

  confirmation.classList.add('show');
  setTimeout(closeModal, 1500);
});
