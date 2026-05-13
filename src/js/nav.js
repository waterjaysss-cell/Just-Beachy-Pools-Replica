/* nav.js — site-wide navigation interactions:
   - Hero slideshow crossfade (home page only; null-checks elsewhere)
   - Sticky header shadow on scroll
   - Hamburger toggle (mobile)
   - Dismissible Google rating widget
*/
(() => {
  'use strict';

  // Hero slideshow: crossfade every 5s (home only)
  const slides = document.querySelectorAll('.hero-slideshow .slide');
  if (slides.length > 1) {
    let idx = 0;
    setInterval(() => {
      slides[idx].classList.remove('active');
      idx = (idx + 1) % slides.length;
      slides[idx].classList.add('active');
    }, 5000);
  }

  // Sticky header shadow
  const header = document.getElementById('siteHeader');
  const onScroll = () => {
    if (!header) return;
    header.classList.toggle('scrolled', window.scrollY > 40);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Hamburger toggle
  const hamburger = document.getElementById('hamburger');
  const navRight = document.getElementById('navRight');
  if (hamburger && navRight) {
    hamburger.addEventListener('click', () => {
      const open = navRight.classList.toggle('open');
      hamburger.classList.toggle('open', open);
      hamburger.setAttribute('aria-expanded', String(open));
    });
    navRight.querySelectorAll('a').forEach((a) => {
      a.addEventListener('click', () => {
        navRight.classList.remove('open');
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // Dismissible Google rating widget
  const ratingWidget = document.getElementById('ratingWidget');
  const ratingClose = document.getElementById('ratingClose');
  if (ratingWidget && ratingClose) {
    ratingClose.addEventListener('click', () => ratingWidget.classList.add('hidden'));
  }
})();
