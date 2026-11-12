const archive = document.querySelector('#archive');
const openArchive = document.querySelector('#openArchive');
const closeArchive = document.querySelector('#closeArchive');
const reopenArchive = document.querySelector('#reopenArchive');

const scrollToElement = (element) => {
  element?.scrollIntoView({
    behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
    block: 'start'
  });
};

openArchive.addEventListener('click', () => {
  archive.hidden = false;
  scrollToElement(archive);
});

reopenArchive?.addEventListener('click', () => {
  document.querySelector('#archive-closed').hidden = true;
  archive.hidden = false;
  scrollToElement(archive);
});

closeArchive?.addEventListener('click', () => {
  archive.hidden = true;
  document.querySelector('#archive-closed').hidden = false;
  scrollToElement(document.querySelector('#archive-closed'));
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

document.querySelectorAll('[data-memory]').forEach(card => {
  card.addEventListener('click', () => {
    card.classList.toggle('expanded');
    card.setAttribute('aria-expanded', card.classList.contains('expanded'));
  });
});

document.querySelectorAll('[data-evidence]').forEach(card => {
  card.addEventListener('click', () => {
    card.classList.toggle('expanded');
    card.setAttribute('aria-expanded', card.classList.contains('expanded'));
  });
});

document.querySelectorAll('.small-thing').forEach(card => {
  card.addEventListener('click', () => {
    card.classList.toggle('active');
  });
});

const contentLinks = document.querySelectorAll('.contents a');
contentLinks.forEach(link => {
  link.addEventListener('click', () => {
    archive.hidden = false;
    link.classList.add('visited');
  });
});

if ('IntersectionObserver' in window) {
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const link = document.querySelector(`.contents a[href="#${entry.target.id}"]`);
      link?.classList.add('visited');
    });
  }, { threshold: 0.2, rootMargin: '-10% 0px -55% 0px' });

  document.querySelectorAll('[data-section]').forEach(section => sectionObserver.observe(section));
}

let gilahriClicks = 0;
const gilahriCard = document.querySelector('[data-character="gilahri"]');
gilahriCard?.addEventListener('click', () => {
  gilahriClicks += 1;

  if (gilahriClicks === 5) {
    const hiddenMemory = document.querySelector('#hidden-memory');
    hiddenMemory.hidden = false;
    hiddenMemory.classList.add('revealed');
    hiddenMemory.scrollIntoView({
      behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      block: 'center'
    });
  }
});

document.querySelectorAll('.contents a').forEach(link => {
  link.addEventListener('click', () => {
    archive.hidden = false;
  });
});
