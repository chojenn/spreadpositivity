const messages = [
  "Happiness is a mindset.",
  "You are enough, just as you are.",
  "Today is full of possibilities.",
  "Kindness is always in season.",
  "You make the world a better place.",
  "Every day is a fresh start.",
  "Your smile can change someone's day.",
  "Believe in the good ahead.",
  "Small steps lead to big changes.",
  "You are stronger than you think.",
  "Joy is found in the little things.",
  "Spread love wherever you go.",
  "The best is yet to come.",
  "You deserve all good things.",
  "Be gentle with yourself today."
];

const messageEl = document.querySelector(".message");
let currentIndex = 0;

function showNextMessage() {
  messageEl.classList.add("fade-out");

  setTimeout(() => {
    currentIndex = (currentIndex + 1) % messages.length;
    messageEl.textContent = messages[currentIndex];
    messageEl.classList.remove("fade-out");
  }, 600);
}

setInterval(showNextMessage, 5000);
