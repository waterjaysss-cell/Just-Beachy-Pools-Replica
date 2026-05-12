/* =========================================================================
   Just Beachy Pools — Homepage interactions (v3)
   - Hero slideshow: crossfade 4 images every 5000ms
   - Sticky header shadow on scroll
   - Hamburger toggle (mobile)
   - Smooth-scroll for anchor links
   - FAQ accordion: enforce one-open-per-column
   - Reviews carousel: auto-advance 6s + chevrons + dots + touch swipe + pause-on-hover
   - Dismissible Google rating widget
   ========================================================================= */
(() => {
  'use strict';

  /* -------- Hero slideshow: crossfade every 5s -------- */
  const slides = document.querySelectorAll('.hero-slideshow .slide');
  if (slides.length > 1) {
    let idx = 0;
    setInterval(() => {
      slides[idx].classList.remove('active');
      idx = (idx + 1) % slides.length;
      slides[idx].classList.add('active');
    }, 5000);
  }

  /* -------- Sticky header shadow -------- */
  const header = document.getElementById('siteHeader');
  const onScroll = () => {
    if (!header) return;
    header.classList.toggle('scrolled', window.scrollY > 40);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* -------- Hamburger toggle -------- */
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

  /* -------- FAQ: enforce one-open-per-column -------- */
  document.querySelectorAll('.faq__col').forEach((col) => {
    const items = col.querySelectorAll('details.faq-item');
    items.forEach((item) => {
      item.addEventListener('toggle', () => {
        if (item.open) {
          items.forEach((other) => { if (other !== item) other.open = false; });
        }
      });
    });
  });

  /* -------- Reviews carousel -------- */
  const track = document.getElementById('reviewsTrack');
  const dotsBox = document.getElementById('reviewsDots');
  const prevBtn = document.getElementById('reviewsPrev');
  const nextBtn = document.getElementById('reviewsNext');

  if (track && dotsBox) {
    const cards = Array.from(track.children);
    const totalCards = cards.length;
    let perView = 3;
    let pages = 0;
    let current = 0;
    let timer = null;
    const AUTO_MS = 6000;

    const calcPerView = () => {
      const w = window.innerWidth;
      if (w < 768) return 1;
      if (w < 1023) return 2;
      return 3;
    };

    const buildDots = () => {
      dotsBox.innerHTML = '';
      for (let i = 0; i < pages; i++) {
        const b = document.createElement('button');
        b.type = 'button';
        b.setAttribute('aria-label', `Page ${i + 1}`);
        if (i === current) b.classList.add('active');
        b.addEventListener('click', () => { go(i); restart(); });
        dotsBox.appendChild(b);
      }
    };

    const update = () => {
      const viewport = track.parentElement;
      const w = viewport.clientWidth;
      track.style.transform = `translateX(${-current * w}px)`;
      Array.from(dotsBox.children).forEach((d, i) => d.classList.toggle('active', i === current));
    };

    const go = (i) => { current = ((i % pages) + pages) % pages; update(); };
    const next = () => go(current + 1);
    const prev = () => go(current - 1);

    const layout = () => {
      perView = calcPerView();
      pages = Math.max(1, Math.ceil(totalCards / perView));
      if (current >= pages) current = 0;
      cards.forEach((c) => { c.style.flex = `0 0 calc(${100 / perView}% - ${(perView - 1) * 18 / perView}px)`; });
      buildDots();
      update();
    };

    const start = () => { stop(); timer = setInterval(next, AUTO_MS); };
    const stop = () => { if (timer) { clearInterval(timer); timer = null; } };
    const restart = () => { stop(); start(); };

    track.addEventListener('mouseenter', stop);
    track.addEventListener('mouseleave', start);
    if (prevBtn) prevBtn.addEventListener('click', () => { prev(); restart(); });
    if (nextBtn) nextBtn.addEventListener('click', () => { next(); restart(); });

    /* Touch swipe */
    let touchStartX = 0;
    let touchDelta = 0;
    track.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; touchDelta = 0; stop(); }, { passive: true });
    track.addEventListener('touchmove',  (e) => { touchDelta = e.touches[0].clientX - touchStartX; }, { passive: true });
    track.addEventListener('touchend',   () => {
      if (Math.abs(touchDelta) > 50) (touchDelta < 0 ? next : prev)();
      start();
    });

    let resizeId = null;
    window.addEventListener('resize', () => {
      clearTimeout(resizeId);
      resizeId = setTimeout(layout, 120);
    });

    layout();
    start();
  }

  /* -------- Dismissible Google rating widget -------- */
  const ratingWidget = document.getElementById('ratingWidget');
  const ratingClose = document.getElementById('ratingClose');
  if (ratingWidget && ratingClose) {
    ratingClose.addEventListener('click', () => ratingWidget.classList.add('hidden'));
  }
})();
