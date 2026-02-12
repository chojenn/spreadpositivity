// Supabase config — replace with your project's values
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY';

let supabaseClient = null;
try {
  supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
} catch (e) {
  console.warn('Supabase not configured yet:', e.message);
}

// DOM elements
const addBtn = document.querySelector('.add-message-btn');
const overlay = document.getElementById('modal-overlay');
const closeBtn = document.getElementById('modal-close');
const input = document.getElementById('message-input');
const submitBtn = document.getElementById('modal-submit');
const confirmation = document.getElementById('modal-confirmation');

function openModal() {
  input.value = '';
  confirmation.classList.remove('show');
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
  } else {
    console.log('Message submitted (Supabase not configured):', content);
  }

  confirmation.classList.add('show');
  setTimeout(closeModal, 1500);
});
