document.addEventListener('DOMContentLoaded', () => {

  /* ═══════════════════════════════════
     CUSTOM CURSOR
  ═══════════════════════════════════ */
  const cursorDot  = document.getElementById('cursor-dot');
  const cursorRing = document.getElementById('cursor-ring');
  let mouseX = 0, mouseY = 0, ringX = 0, ringY = 0;

  if (window.matchMedia('(hover: hover)').matches) {
    document.addEventListener('mousemove', e => {
      mouseX = e.clientX; mouseY = e.clientY;
      cursorDot.style.left  = mouseX + 'px';
      cursorDot.style.top   = mouseY + 'px';
    });

    (function animCursor() {
      ringX += (mouseX - ringX) * 0.4;
      ringY += (mouseY - ringY) * 0.4;
      cursorRing.style.left = ringX + 'px';
      cursorRing.style.top  = ringY + 'px';
      requestAnimationFrame(animCursor);
    })();

    document.querySelectorAll('a,button,.nav-link,.gal-item,.nav-inquire,.btn-gold,.btn-outline,.contact-channel,.gal-filter').forEach(el => {
      el.addEventListener('mouseenter', () => cursorRing.classList.add('hovering'));
      el.addEventListener('mouseleave', () => cursorRing.classList.remove('hovering'));
    });

    document.addEventListener('mousedown', () => cursorRing.classList.add('clicking'));
    document.addEventListener('mouseup',   () => cursorRing.classList.remove('clicking'));
  }

  /* ═══════════════════════════════════
     SPLASH SCREEN
  ═══════════════════════════════════ */
  const splash   = document.getElementById('splash');
  const progress = document.getElementById('splash-progress');
  const pctLabel = document.getElementById('splash-pct');
  let pct = 0;

  if (splash) {
    const timer = setInterval(() => {
      pct += Math.random() * 14 + 3;
      if (pct >= 100) {
        pct = 100;
        clearInterval(timer);
        setTimeout(() => {
          splash.classList.add('splash-hidden');
          document.getElementById('viewfinder')?.classList.add('visible');
        }, 600);
      }
      if (progress) progress.style.width = pct + '%';
      if (pctLabel) pctLabel.textContent = Math.round(pct) + '%';
    }, 90);
  }

  /* ═══════════════════════════════════
     BOKEH PARTICLES
  ═══════════════════════════════════ */
  function createBokeh() {
    const container = document.getElementById('bokeh-container');
    if (!container) return;
    const sizes = [60, 90, 120, 50, 80, 140, 70, 100];
    sizes.forEach((size, i) => {
      const b = document.createElement('div');
      b.className = 'bokeh';
      b.style.cssText = `
        width:${size}px; height:${size}px;
        left:${Math.random() * 100}%;
        top:${Math.random() * 100}%;
        animation-duration:${8 + Math.random() * 8}s;
        animation-delay:${-Math.random() * 8}s;
      `;
      container.appendChild(b);
    });
  }
  createBokeh();

  /* ═══════════════════════════════════
     CONTACT FORM → GMAIL
  ═══════════════════════════════════ */
  document.getElementById('contact-form')?.addEventListener('submit', e => {
    e.preventDefault();
    const nome    = document.getElementById('fc-nome')?.value || '';
    const email   = document.getElementById('fc-email')?.value || '';
    const projeto = document.getElementById('fc-projeto')?.value || '';
    const msg     = document.getElementById('fc-msg')?.value || '';
    const subject = encodeURIComponent(`[Portfólio] ${projeto || 'Novo Contato'} — ${nome}`);
    const body    = encodeURIComponent(`Olá Jordão,\n\nMeu nome é ${nome} (${email}).\n\nTipo de Projeto: ${projeto}\n\n${msg}\n\nAguardo retorno! 🙏`);
    window.open(`https://mail.google.com/mail/?view=cm&to=jordao@hnnbl.com.br&su=${subject}&body=${body}`, '_blank');
    const success = document.getElementById('form-success');
    if (success) success.style.display = 'block';
  });

  /* ═══════════════════════════════════
     SCROLL: NAV + PARALLAX + PROGRESS + FABs
  ═══════════════════════════════════ */
  const nav          = document.getElementById('nav');
  const heroBgImg    = document.querySelector('.hero-bg img');
  const heroContent  = document.querySelector('.hero-content');
  const heroIsoImg   = document.getElementById('hero-iso-img');
  const progressBar  = document.getElementById('page-progress-bar');
  const scrollTopBtn = document.getElementById('scroll-top');
  const waFab        = document.getElementById('wa-fab');
  const igFab        = document.getElementById('ig-fab');

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    const docH    = document.documentElement.scrollHeight - window.innerHeight;

    // Nav
    scrollY > 50 ? nav.classList.add('scrolled') : nav.classList.remove('scrolled');

    // Progress bar
    if (progressBar) progressBar.style.width = (scrollY / docH * 100) + '%';

    // Parallax (hero only)
    if (scrollY < window.innerHeight) {
      if (heroBgImg)   heroBgImg.style.transform   = `translateY(${scrollY * 0.38}px) scale(1.05)`;
      if (heroContent) {
        heroContent.style.transform = `translateY(${scrollY * 0.22}px)`;
        heroContent.style.opacity   = Math.max(0, 1 - scrollY / 650);
      }
      if (heroIsoImg)  heroIsoImg.style.transform   = `translateY(${scrollY * 0.14}px)`;
    }

    // FABs visibility
    if (scrollY > 300) {
      scrollTopBtn?.classList.add('visible');
      waFab?.classList.add('visible');
      igFab?.classList.add('visible');
    } else {
      scrollTopBtn?.classList.remove('visible');
      waFab?.classList.remove('visible');
      igFab?.classList.remove('visible');
    }
  }, { passive: true });

  scrollTopBtn?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  /* ═══════════════════════════════════
     SCROLL REVEAL
  ═══════════════════════════════════ */
  const revealObs = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.05, rootMargin: '0px 0px -40px 0px' });

  function initReveal() {
    document.querySelectorAll('[data-reveal]').forEach(el => {
      el.setAttribute('data-js-reveal', '');
      revealObs.observe(el);
    });
    // Force reveal for elements above fold
    setTimeout(() => {
      document.querySelectorAll('[data-reveal]').forEach(el => {
        if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add('revealed');
      });
    }, 100);
  }
  initReveal();

  /* ═══════════════════════════════════
     PAGE SWITCHING
  ═══════════════════════════════════ */
  function switchPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const target = document.getElementById(`${pageId}-page`);
    if (target) {
      target.classList.add('active', 'page-entering');
      setTimeout(() => target.classList.remove('page-entering'), 700);
      window.scrollTo({ top: 0, behavior: 'smooth' });

      // Re-trigger scroll reveal for new page
      target.querySelectorAll('[data-js-reveal]').forEach(el => {
        el.classList.remove('revealed');
        revealObs.observe(el);
      });
      setTimeout(() => {
        target.querySelectorAll('[data-reveal]').forEach(el => {
          if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add('revealed');
        });
      }, 120);

      // Re-observe cursor hoverable items in new page
      if (window.matchMedia('(hover: hover)').matches) {
        target.querySelectorAll('a,button,.gal-item').forEach(el => {
          el.addEventListener('mouseenter', () => cursorRing.classList.add('hovering'));
          el.addEventListener('mouseleave', () => cursorRing.classList.remove('hovering'));
        });
      }
    }
  }

  /* ═══════════════════════════════════
     INSTAGRAM / GALLERY
  ═══════════════════════════════════ */
  let allPosts = [];

  async function loadInstagramFeed() {
    try {
      const r = await fetch('src/data/instagram_final_filtrado.json');
      if (r.ok) {
        const data = await r.json();
        if (data && data.length > 0) {
          let flat = [], n = 1;
          data.forEach(post => {
            const urls = Array.isArray(post.url) ? post.url : [post.url];
            urls.forEach(u => {
              flat.push({
                ...post, url: u, numericId: n++,
                cat: (post.cat && post.cat.toLowerCase().includes('nature')) ? 'nature' : 'social'
              });
            });
          });
          allPosts = flat.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
          filterGallery('destaques');
          return;
        }
      }
    } catch(e) { console.warn('JSON local não disponível, usando fallback.'); }

    // Fallback posts
    allPosts = [
      ...Array.from({length:10}, (_,i) => ({
        id: i+1,
        url: `https://picsum.photos/seed/nature-jn-${i+1}/800/1000`,
        permalink: 'https://www.instagram.com/jordaonunes/',
        caption: ['Fungo na Floresta Amazônica','Detalhe da chuva sobre a flora','Biodiversidade paraense','Caminhos da floresta secundária','Bromélia nativa em detalhe','Arara Canindé em vôo livre','Garça branca no Rio Itacaiúnas','Gavião caratã caçando','Perereca verde amazônica','Tejupã sobre pedras do Rio'][i],
        cat: 'nature'
      })),
      ...Array.from({length:10}, (_,i) => ({
        id: i+11,
        url: `https://picsum.photos/seed/social-jn-${i+1}/800/1000`,
        permalink: 'https://www.instagram.com/jordaonunes/',
        caption: ['Ponte Ana Miranda — Marabá PA','Marabá ao entardecer','Geometria da fachada histórica','Rua sob chuva tropical','Skyline do Tocantins','Evento técnico de fotografia','Retrato documental','Parceria projeto cultural','Workshop fotógrafos do Pará','Festival cultural de Marabá'][i],
        cat: 'social'
      }))
    ];
    filterGallery('destaques');
  }

  function filterGallery(category) {
    const grid   = document.getElementById('home-gallery-grid');
    const header = document.getElementById('gallery-header');
    if (!grid) return;

    grid.classList.add('loading');

    setTimeout(() => {
      grid.innerHTML = '';
      if (header) header.style.display = (!category || category === 'destaques') ? 'block' : 'none';

      let filtered;
      if (!category || category === 'destaques') {
        filtered = [...allPosts].sort(() => 0.5 - Math.random()).slice(0, 12);
      } else {
        filtered = allPosts.filter(p => p.cat === category);
      }

      filtered.forEach((post, i) => {
        const item = buildGalItem(post);
        item.style.transitionDelay = `${(i % 6) * 0.05}s`;
        item.addEventListener('click', () => openLightbox(post, filtered, i));
        grid.appendChild(item);
        revealObs.observe(item);
      });

      grid.classList.remove('loading');

      setTimeout(() => {
        grid.querySelectorAll('[data-reveal]').forEach(el => {
          if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add('revealed');
        });
      }, 60);
    }, 200);
  }

  function renderPortfolio() {
    const grid = document.getElementById('portfolio-grid');
    if (!grid || grid.children.length > 0) return;
    const ordered = [...allPosts].sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp));
    ordered.forEach((post, i) => {
      const item = buildGalItem(post);
      item.addEventListener('click', () => openLightbox(post, ordered, i));
      grid.appendChild(item);
      revealObs.observe(item);
    });
    setTimeout(() => {
      grid.querySelectorAll('[data-reveal]').forEach(el => {
        if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add('revealed');
      });
    }, 80);
  }

  function buildGalItem(post) {
    const item = document.createElement('div');
    item.className = 'gal-item';
    item.setAttribute('data-reveal', '');
    item.setAttribute('data-js-reveal', '');
    item.innerHTML = `
      <img src="${post.url}" alt="${post.caption}" loading="lazy">
      <div class="gal-overlay">
        <span class="gal-info-tag">${post.cat.toUpperCase()}</span>
        <h3 class="gal-info-name">${post.caption.substring(0, 40)}${post.caption.length > 40 ? '...' : ''}</h3>
      </div>
    `;
    if (window.matchMedia('(hover: hover)').matches) {
      item.addEventListener('mouseenter', () => cursorRing?.classList.add('hovering'));
      item.addEventListener('mouseleave', () => cursorRing?.classList.remove('hovering'));
    }
    return item;
  }

  /* ═══════════════════════════════════
     LIGHTBOX
  ═══════════════════════════════════ */
  const lightbox  = document.getElementById('lightbox');
  const lbImg     = document.getElementById('lb-img');
  const lbCat     = document.getElementById('lb-cat');
  const lbCaption = document.getElementById('lb-caption');
  const lbLink    = document.getElementById('lb-link');
  let lbPosts = [], lbIndex = 0;

  function openLightbox(post, posts, index) {
    lbPosts = posts; lbIndex = index;
    updateLb();
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function updateLb() {
    const post = lbPosts[lbIndex];
    lbImg.src = ''; // force animation re-trigger
    requestAnimationFrame(() => { lbImg.src = post.url; });
    lbImg.alt = post.caption;
    lbCat.textContent = post.cat.toUpperCase();
    lbCaption.textContent = post.caption;
    lbLink.href = post.permalink;
  }
  function closeLb() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
    lbImg.src = '';
  }
  function lbNav(dir) {
    lbIndex = (lbIndex + dir + lbPosts.length) % lbPosts.length;
    updateLb();
  }

  document.getElementById('lb-close')?.addEventListener('click', closeLb);
  document.getElementById('lb-prev')?.addEventListener('click', () => lbNav(-1));
  document.getElementById('lb-next')?.addEventListener('click', () => lbNav(1));
  lightbox?.addEventListener('click', e => { if (e.target === lightbox) closeLb(); });
  document.addEventListener('keydown', e => {
    if (!lightbox?.classList.contains('open')) return;
    if (e.key === 'Escape') closeLb();
    if (e.key === 'ArrowLeft')  lbNav(-1);
    if (e.key === 'ArrowRight') lbNav(1);
  });

  /* Swipe support */
  let touchStartX = 0;
  lightbox?.addEventListener('touchstart', e => { touchStartX = e.changedTouches[0].screenX; }, { passive: true });
  lightbox?.addEventListener('touchend', e => {
    const diff = touchStartX - e.changedTouches[0].screenX;
    if (Math.abs(diff) > 50) lbNav(diff > 0 ? 1 : -1);
  });

  /* ═══════════════════════════════════
     HAMBURGER MENU
  ═══════════════════════════════════ */
  const hamburger     = document.getElementById('hamburger');
  const mobileOverlay = document.getElementById('mobile-overlay');

  hamburger?.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    mobileOverlay.classList.toggle('open');
    document.body.style.overflow = mobileOverlay.classList.contains('open') ? 'hidden' : '';
  });

  function closeMobileMenu() {
    hamburger?.classList.remove('open');
    mobileOverlay?.classList.remove('open');
    document.body.style.overflow = '';
  }

  document.getElementById('mob-home')?.addEventListener('click',      () => { closeMobileMenu(); switchPage('home'); filterGallery('destaques'); setActiveNav('nav-home'); });
  document.getElementById('mob-portfolio')?.addEventListener('click', () => { closeMobileMenu(); switchPage('portfolio'); renderPortfolio(); setActiveNav('nav-portfolio'); });
  document.getElementById('mob-about')?.addEventListener('click',     () => { closeMobileMenu(); switchPage('about'); setActiveNav('nav-about'); });
  document.getElementById('mob-contact')?.addEventListener('click',   () => { closeMobileMenu(); switchPage('contact'); setActiveNav('nav-contact'); });

  /* ═══════════════════════════════════
     CENTRALIZED NAVIGATION
  ═══════════════════════════════════ */
  function setActiveNav(id) {
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    document.getElementById(id)?.classList.add('active');
  }

  document.body.addEventListener('click', e => {
    const target = e.target.closest('.nav-link, #logo, .nav-inquire, #nav-cta-btn, #hero-portfolio-btn, #hero-contact-btn');
    if (!target) return;
    const id = target.id;

    if (id === 'logo' || id === 'nav-home') {
      switchPage('home');
      document.querySelectorAll('.gal-filter').forEach(f => f.classList.remove('active'));
      filterGallery('destaques');
      setActiveNav('nav-home');
    } else if (id === 'nav-portfolio' || id === 'hero-portfolio-btn') {
      switchPage('portfolio');
      renderPortfolio();
      setActiveNav('nav-portfolio');
    } else if (id === 'nav-about') {
      switchPage('about');
      setActiveNav('nav-about');
    } else if (id === 'nav-contact' || id === 'hero-contact-btn' || id === 'nav-cta-btn' || (target.classList.contains('nav-inquire') && !target.closest('.mobile-overlay'))) {
      switchPage('contact');
      setActiveNav('nav-contact');
    } else if (target.classList.contains('gal-filter')) {
      if (!document.getElementById('home-page').classList.contains('active')) {
        switchPage('home'); setActiveNav('nav-home');
      }
      filterGallery(id);
      document.querySelectorAll('.gal-filter').forEach(f => f.classList.remove('active'));
      target.classList.add('active');
    }
  });

  /* ═══════════════════════════════════
     INIT
  ═══════════════════════════════════ */
  loadInstagramFeed();

});
