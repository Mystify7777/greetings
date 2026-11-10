const archive = document.querySelector('#archive');
const openArchive = document.querySelector('#openArchive');

openArchive.addEventListener('click', () => {
  archive.hidden = false;
  archive.scrollIntoView({
    behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
    block: 'start'
  });
});

const characterNotes = {
  gilahri: 'Pyaar Gilahri mode: soft, sentimental, aur thodi si cute. ♡',
  naraz: 'Naraz Pari mode: “kuch nahi hua” bolke 47 alag reasons se naraz.',
  sookhi: 'Sookhi Pari mode: teasing allowed. Complaints department permanently closed.'
};

document.querySelectorAll('[data-character]').forEach(card => {
  card.addEventListener('click', () => {
    document.querySelectorAll('[data-character]').forEach(item => item.classList.remove('active'));
    card.classList.add('active');
    document.querySelector('#characterNote').textContent = characterNotes[card.dataset.character];
  });
});

document.querySelectorAll('.contents a').forEach(link => {
  link.addEventListener('click', () => {
    archive.hidden = false;
  });
});
