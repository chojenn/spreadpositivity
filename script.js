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

// Content filter — bad-words library + custom block list
const filter = new Filter();

// Custom block list for words/phrases the library misses
const CUSTOM_BLOCKED_WORDS = [
  // Direct harassment & hate
  'kill yourself', 'kys', 'go die', 'go kys', 'neck yourself',
  'end yourself', 'unalive yourself', 'die already',
  // Insults
  'ugly', 'loser', 'worthless', 'pathetic', 'disgusting',
  'stupid', 'idiot', 'moron', 'dumb', 'dumbass', 'fatass',
  'lame', 'trash', 'garbage', 'clown', 'braindead', 'brainless',
  'degenerate', 'incel', 'simp', 'creep', 'weirdo',
  // Negative phrases
  'i hate', 'you suck', 'no one likes', 'nobody likes',
  'no one cares', 'nobody cares', 'shut up', 'stfu', 'gtfo',
  'go away', 'you deserve', 'hope you', 'wish you were dead',
  // Body shaming
  'fat', 'fatso', 'skinny', 'anorexic',
  // Sexual / inappropriate
  'pp', 'deez nuts', 'booty', 'boobs', 'tiddy', 'tiddies',
  'sugma', 'ligma', 'balls', 'smd', 'succ',
  // Slurs & variants the library may miss
  'retard', 'retarded', 'r3tard', 'ret4rd',
  'f4g', 'f4gg0t', 'tr4nny',
  'n1g', 'n1gg', 'nigg', 'n i g',
  // Leet speak / evasion variants
  'b1tch', 'b!tch', 'bi+ch', 'btch',
  'a$$', 'a ss', 'a s s',
  'sh1t', 'sh!t', 's h i t',
  'f u c k', 'fvck', 'fuk', 'phuck', 'phuk',
  'd1ck', 'd!ck',
  'p u s s y', 'pu$$y',
  'wh0re', 'h0e', 'sk4nk', 'slvt',
];

filter.addWords(...CUSTOM_BLOCKED_WORDS);

// Blocked emojis
const BLOCKED_EMOJIS = [
  '🖕', // middle finger
  '🍆', // eggplant
  '🍑', // peach
  '💀', // skull
  '☠️', // skull and crossbones
  '🔫', // gun
  '💩', // poop
  '🤮', // vomiting
  '👎', // thumbs down
  '😈', // devil
  '👿', // angry devil
  '💣', // bomb
  '🔪', // knife
  '⚰️', // coffin
  '🖕🏻', '🖕🏼', '🖕🏽', '🖕🏾', '🖕🏿', // middle finger skin tones
  '👎🏻', '👎🏼', '👎🏽', '👎🏾', '👎🏿', // thumbs down skin tones
];

function containsBlockedContent(text) {
  if (BLOCKED_EMOJIS.some((emoji) => text.includes(emoji))) return true;

  const lower = text.toLowerCase();
  // Check original text
  if (filter.isProfane(lower)) return true;

  // Check with spaces stripped (catches "s t u p i d", "f u c k", etc.)
  const stripped = lower.replace(/\s+/g, '');
  if (filter.isProfane(stripped)) return true;

  // Block any word starting with "nigg" (catches all variants)
  if (/\bnigg/i.test(lower) || /\bn\s*i\s*g\s*g/i.test(lower)) return true;

  // Check with common leet substitutions normalized
  const normalized = lower
    .replace(/0/g, 'o')
    .replace(/1/g, 'i')
    .replace(/3/g, 'e')
    .replace(/4/g, 'a')
    .replace(/5/g, 's')
    .replace(/\$/g, 's')
    .replace(/@/g, 'a')
    .replace(/!/g, 'i')
    .replace(/\+/g, 't');
  if (filter.isProfane(normalized)) return true;

  return false;
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
