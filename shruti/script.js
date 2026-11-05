const world = document.querySelector('#world');
document.querySelector('#openWorld').addEventListener('click', () => {
  world.hidden = false;
  world.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
});
const modal = document.querySelector('#modal');
const modalTitle = document.querySelector('#modalTitle');
const modalKicker = document.querySelector('#modalKicker');
const modalBody = document.querySelector('#modalBody');
const content = {
  photos: { kicker: 'THE MEMORY WALL', title: 'Little moments, kept close.', body: `<p>Some memories deserve their own tiny frame. Replace these three placeholders with photos of you two before sharing the site.</p><div class="memory-grid"><div class="memory"><span>Photo 01<br>add <code>assets/shruti-1.jpg</code></span></div><div class="memory"><span>Photo 02<br>add <code>assets/shruti-2.jpg</code></span></div><div class="memory"><span>Photo 03<br>add <code>assets/shruti-3.jpg</code></span></div><div class="memory"><span>Photo 04<br>add <code>assets/shruti-4.jpg</code></span></div></div>` },
  note: { kicker: 'A NOTE FOR YOU', title: 'A tiny reminder.', body: `<div class="letter">I hope this next trip around the sun brings you more reasons to laugh until your face hurts, more people who make you feel understood, and more days that feel like they were made just for you.<br><br>Keep being your particular kind of wonderful. The world would be a much duller place without it. Happy birthday, Shruti. ♡</div><p style="font-size:.78rem">Personalise this note in <code>shruti/script.js</code> before sharing.</p>` },
  wish: { kicker: 'BIRTHDAY MAGIC', title: 'Make a little wish.', body: `<p>Take a breath. Think of one thing you want more of this year.</p><button class="wish-button" id="wishBtn">I made my wish ✨</button><p class="wish-result" id="wishResult" hidden>May it find its way to you, one small lovely thing at a time. ♡</p>` }
};
function openModal(key) { const item = content[key]; modalKicker.textContent = item.kicker; modalTitle.textContent = item.title; modalBody.innerHTML = item.body; modal.classList.add('open'); modal.setAttribute('aria-hidden','false'); document.body.style.overflow='hidden'; document.querySelector('#wishBtn')?.addEventListener('click', () => { document.querySelector('#wishResult').hidden = false; document.querySelector('#wishBtn').textContent = 'Wish sent into the universe ✓'; }); modal.querySelector('.close').focus(); }
function closeModal() { modal.classList.remove('open'); modal.setAttribute('aria-hidden','true'); document.body.style.overflow=''; }
document.querySelectorAll('[data-modal]').forEach(button => button.addEventListener('click', () => openModal(button.dataset.modal)));
modal.querySelectorAll('[data-close]').forEach(el => el.addEventListener('click', closeModal));
document.addEventListener('keydown', event => { if (event.key === 'Escape') closeModal(); });