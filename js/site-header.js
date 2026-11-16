(() => {
  const script = document.currentScript;
  const siteRoot = new URL('../', script.src);
  const asset = (path) => new URL(path, siteRoot).href;

  const style = document.createElement('link');
  style.rel = 'stylesheet';
  style.href = asset('css/site-header.css');
  document.head.append(style);
  const font = document.createElement('link');
  font.rel = 'stylesheet';
  font.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap';
  document.head.append(font);

  // These bars only link back to the portfolio; the shared navigation replaces them.
  document.querySelectorAll('body > .case-nav, body > header.top, body > header.topbar')
    .forEach((bar) => bar.remove());

  const nav = document.createElement('header');
  nav.className = 'portfolio-global-header';
  nav.innerHTML = `
    <div class="portfolio-global-inner">
      <a class="portfolio-global-brand" href="${siteRoot.href}" aria-label="Tim Javanshir, portfolio home">
        <svg class="portfolio-global-mark" viewBox="0 0 38 38" aria-hidden="true">
          <defs><linearGradient id="portfolioGlobalGradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#1e3a8a"/><stop offset="100%" stop-color="#0d9488"/></linearGradient></defs>
          <rect width="38" height="38" rx="10" fill="url(#portfolioGlobalGradient)"/>
          <path d="M10 12 Q19 10 19 10 Q19 10 28 12 L28 28 Q19 26 19 26 Q19 26 10 28 Z" fill="none" stroke="rgba(255,255,255,.9)" stroke-width="1.5"/>
          <path d="M19 10v16M12 16l6-1m8 1-6-1M12 19l6-1m8 1-6-1M12 22l6-1m8 1-6-1" fill="none" stroke="rgba(255,255,255,.65)" stroke-width="1"/>
        </svg>
        <span>Tim <b>Javanshir</b></span>
      </a>
      <button class="portfolio-global-toggle" type="button" aria-expanded="false" aria-controls="portfolioGlobalLinks" aria-label="Open navigation"><i></i><i></i><i></i></button>
      <nav class="portfolio-global-nav" aria-label="Portfolio navigation">
        <ul id="portfolioGlobalLinks">
          <li><a href="${siteRoot.href}#portfolio">Work Samples</a></li>
          <li><a href="${siteRoot.href}#about">About</a></li>
          <li><a href="${siteRoot.href}#experience">Experience</a></li>
          <li><a href="${siteRoot.href}#skills">Expertise</a></li>
          <li><a href="${siteRoot.href}#process">Process</a></li>
          <li class="portfolio-global-contact"><a href="${siteRoot.href}#contact">Get in Touch</a></li>
        </ul>
      </nav>
    </div>`;
  document.body.prepend(nav);

  const toggle = nav.querySelector('.portfolio-global-toggle');
  const links = nav.querySelector('.portfolio-global-nav');
  toggle.addEventListener('click', () => {
    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!expanded));
    toggle.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');
    links.classList.toggle('is-open', !expanded);
  });
})();
