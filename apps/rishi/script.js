const startButton = document.querySelector('#startQuest');
const quest = document.querySelector('#quest');
const score = document.querySelector('#score');
const logText = document.querySelector('#logText');
const unlock = document.querySelector('#unlock');
const lootButtons = [...document.querySelectorAll('[data-loot]')];
const found = new Set();
const lootMessages = [
  'XP CRATE OPENED: +1 level, +1 year of questionable decisions. The character development is real.',
  'RARE DROP ACQUIRED: A legendary year with excellent loot and suspiciously good luck.',
  'EXTRA LIFE FOUND: For every rough boss fight. Pause, heal, and get back out there.'
];
startButton.addEventListener('click', () => {
  quest.hidden = false;
  quest.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
  logText.textContent = 'Quest started. Three items are hidden in plain sight. Classic level design.';
});
lootButtons.forEach((button, index) => button.addEventListener('click', () => {
  if (found.has(index)) { logText.textContent = 'Already collected. Inventory management is hard enough.'; return; }
  found.add(index);
  button.classList.add('found');
  button.querySelector('.loot-state').textContent = '✓ COLLECTED';
  button.setAttribute('aria-label', button.querySelector('.loot-name').textContent + ', collected');
  score.textContent = String(found.size).padStart(2, '0');
  logText.textContent = lootMessages[index];
  if (found.size === 3) {
    unlock.hidden = false;
    logText.textContent = 'ALL ITEMS COLLECTED. FINAL REWARD UNLOCKED. GG.';
    unlock.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'nearest' });
  }
}));
document.querySelector('#replay').addEventListener('click', () => {
  found.clear(); score.textContent = '00'; unlock.hidden = true;
  lootButtons.forEach(button => { button.classList.remove('found'); button.querySelector('.loot-state').textContent = 'LOCKED'; });
  logText.textContent = 'New run started. Loot is back where you found it.';
  quest.scrollIntoView({ behavior: 'smooth', block: 'start' });
});