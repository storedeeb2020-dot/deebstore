// ================================================
// ✨ GSAP Animation Engine Module
// ================================================

import { renderProducts } from './products.js';

export function initGSAP() {
  if (typeof gsap === 'undefined') return;
  gsap.registerPlugin(ScrollTrigger, TextPlugin);

  // ── Cursor Glow ──
  const cursorGlow = document.getElementById('cursor-glow');
  if (cursorGlow && window.matchMedia('(pointer: fine)').matches) {
    let mx = 0, my = 0;
    window.addEventListener('mousemove', (e) => {
      mx = e.clientX; my = e.clientY;
      gsap.to(cursorGlow, {
        x: mx, y: my,
        duration: 0.6,
        ease: 'power2.out',
        overwrite: true
      });
    });
  }

  // ── Particle Canvas ──
  initParticles();

  // ── Magnetic Enter Button ──
  const enterBtn = document.getElementById('enter-btn');
  if (enterBtn) {
    enterBtn.addEventListener('mousemove', (e) => {
      const r = enterBtn.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      gsap.to(enterBtn, {
        x: dx * 0.25,
        y: dy * 0.25,
        duration: 0.4,
        ease: 'power2.out'
      });
    });
    enterBtn.addEventListener('mouseleave', () => {
      gsap.to(enterBtn, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.4)' });
    });
  }
}

export function initParticles() {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W = canvas.width = window.innerWidth;
  let H = canvas.height = window.innerHeight;
  window.addEventListener('resize', () => {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  });

  const GOLD = 'rgba(212,175,55,';
  const particles = Array.from({ length: 60 }, () => ({
    x: Math.random() * W,
    y: Math.random() * H,
    r: Math.random() * 1.5 + 0.3,
    dx: (Math.random() - 0.5) * 0.3,
    dy: (Math.random() - 0.5) * 0.3,
    alpha: Math.random() * 0.5 + 0.1,
    pulse: Math.random() * Math.PI * 2,
  }));

  function drawParticles() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => {
      p.x += p.dx;
      p.y += p.dy;
      p.pulse += 0.02;
      const a = p.alpha * (0.5 + 0.5 * Math.sin(p.pulse));

      if (p.x < 0) p.x = W;
      if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H;
      if (p.y > H) p.y = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = GOLD + a + ')';
      ctx.fill();
    });

    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dist = Math.hypot(particles[i].x - particles[j].x, particles[i].y - particles[j].y);
        if (dist < 100) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = GOLD + (0.06 * (1 - dist / 100)) + ')';
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(drawParticles);
  }
  drawParticles();
}

export function initSiteAnimations() {
  if (typeof gsap === 'undefined') return;
  gsap.registerPlugin(ScrollTrigger, TextPlugin);

  const heroBg = document.querySelector('.hero-bg img');
  if (heroBg) {
    gsap.to(heroBg, {
      yPercent: 20,
      ease: 'none',
      scrollTrigger: {
        trigger: '.hero-section',
        start: 'top top',
        end: 'bottom top',
        scrub: 1.5,
      }
    });
  }

  const heroTitle = document.getElementById('hero-title');
  if (heroTitle) {
    const text = heroTitle.textContent;
    heroTitle.setAttribute('data-text', text);
    heroTitle.innerHTML = text.split('').map(c =>
      c === ' ' ? ' ' : `<span class="char" style="display:inline-block">${c}</span>`
    ).join('');

    gsap.from('.hero-title .char', {
      opacity: 0,
      y: 60,
      rotateX: -90,
      stagger: 0.04,
      duration: 0.8,
      ease: 'back.out(2)',
      delay: 0.3,
    });
  }

  gsap.from('.hero-subtitle, .hero-btn', {
    opacity: 0,
    y: 30,
    stagger: 0.15,
    duration: 0.7,
    ease: 'power3.out',
    delay: 0.9,
  });

  gsap.from('.navbar', {
    opacity: 0,
    y: -20,
    duration: 0.6,
    ease: 'power2.out',
  });

  gsap.utils.toArray('[data-gsap="fade-up"]').forEach(el => {
    gsap.from(el, {
      opacity: 0,
      y: 50,
      duration: 0.8,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
        toggleActions: 'play none none none',
      }
    });
  });

  gsap.utils.toArray('[data-gsap="clip-up"]').forEach(el => {
    gsap.from(el, {
      clipPath: 'inset(100% 0 0 0)',
      opacity: 0,
      duration: 0.9,
      ease: 'power4.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
      }
    });
    el.style.clipPath = 'inset(0 0 0 0)';
  });

  gsap.from('.feature-item', {
    opacity: 0,
    y: 20,
    stagger: 0.1,
    duration: 0.5,
    ease: 'power2.out',
    scrollTrigger: {
      trigger: '.features-strip',
      start: 'top 90%',
    }
  });

  gsap.from('.cat-btn', {
    opacity: 0,
    scale: 0.85,
    stagger: 0.06,
    duration: 0.4,
    ease: 'back.out(1.7)',
    scrollTrigger: {
      trigger: '.category-filter',
      start: 'top 90%',
    }
  });

  gsap.from('.contact-card', {
    opacity: 0,
    y: 40,
    scale: 0.92,
    stagger: 0.12,
    duration: 0.6,
    ease: 'back.out(1.5)',
    scrollTrigger: {
      trigger: '.contact-grid',
      start: 'top 80%',
    }
  });

  document.querySelectorAll('.nav-icon-btn').forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const r = btn.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      gsap.to(btn, { x: dx * 0.3, y: dy * 0.3, duration: 0.3, ease: 'power2.out' });
    });
    btn.addEventListener('mouseleave', () => {
      gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.4)' });
    });
  });

  document.querySelectorAll('.btn-gold, .btn-checkout').forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const r = btn.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      btn.style.setProperty('--mx', `${((e.clientX - r.left) / r.width * 100)}%`);
      btn.style.setProperty('--my', `${((e.clientY - r.top) / r.height * 100)}%`);
      gsap.to(btn, { x: dx * 0.15, y: dy * 0.15, duration: 0.3, ease: 'power2.out' });
    });
    btn.addEventListener('mouseleave', () => {
      gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.4)' });
    });
  });

  function animateProductCards() {
    const cards = document.querySelectorAll('.product-card');
    cards.forEach((card, i) => {
      if (!card.classList.contains('gsap-revealed')) {
        card.classList.add('gsap-revealed');
        gsap.from(card, {
          opacity: 0,
          y: 60,
          scale: 0.88,
          duration: 0.65,
          delay: (i % 3) * 0.1,
          ease: 'back.out(1.4)',
          scrollTrigger: {
            trigger: card,
            start: 'top 90%',
            toggleActions: 'play none none none',
          }
        });

        card.addEventListener('mousemove', (e) => {
          const r = card.getBoundingClientRect();
          const xPct = ((e.clientX - r.left) / r.width - 0.5) * 2;
          const yPct = ((e.clientY - r.top) / r.height - 0.5) * 2;
          gsap.to(card, {
            rotateY: xPct * 6,
            rotateX: -yPct * 4,
            transformPerspective: 800,
            duration: 0.4,
            ease: 'power2.out',
          });
        });
        card.addEventListener('mouseleave', () => {
          gsap.to(card, {
            rotateY: 0,
            rotateX: 0,
            duration: 0.6,
            ease: 'elastic.out(1, 0.4)',
          });
        });
      }
    });
  }

  const origRender = window._origRenderProducts || renderProducts;
  window._origRenderProducts = origRender;
  window.renderProducts = function(products) {
    origRender(products);
    requestAnimationFrame(() => {
      animateProductCards();
      ScrollTrigger.refresh();
    });
  };

  requestAnimationFrame(() => animateProductCards());

  gsap.from('.site-footer', {
    opacity: 0,
    y: 30,
    duration: 0.8,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: '.site-footer',
      start: 'top 95%',
    }
  });

  setTimeout(() => {
    gsap.from('.chatbot-toggle', {
      scale: 0,
      opacity: 0,
      duration: 0.6,
      ease: 'back.out(2)',
    });
  }, 1000);
}
