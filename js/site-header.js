(() => {
  const scriptUrl = document.currentScript.src;
  const siteRoot = new URL('../', scriptUrl);
  const asset = (path) => new URL(path, siteRoot).href;

  const style = document.createElement('link');
  style.rel = 'stylesheet';
  style.href = asset('css/site-header.css?v=20261116-home-header-v2');
  document.head.append(style);
  if (!document.querySelector('link[href*="fonts.googleapis.com/css2?family=Inter"]')) {
    const font = document.createElement('link');
    font.rel = 'stylesheet';
    font.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap';
    document.head.append(font);
  }

  const loadHeaderBehavior = () => {
    if (document.querySelector('script[data-portfolio-nav]')) return;
    const behavior = document.createElement('script');
    behavior.src = asset('js/portfolio-nav.js?v=20261116-home-header-v2');
    behavior.dataset.portfolioNav = 'true';
    document.body.append(behavior);
  };

  const existingHeader = document.getElementById('mainNav');
  if (existingHeader) {
    loadHeaderBehavior();
    return;
  }

  // Reuse the homepage's own navigation markup as the shared component.
  fetch(asset('index.html?v=20261116-home-header'))
    .then((response) => {
      if (!response.ok) throw new Error(`Portfolio navigation unavailable (${response.status})`);
      return response.text();
    })
    .then((homepage) => {
      const source = new DOMParser().parseFromString(homepage, 'text/html');
      const header = source.getElementById('mainNav');
      if (!header) throw new Error('Homepage navigation markup not found');

      const sharedHeader = document.importNode(header, true);
      sharedHeader.querySelector('.nav-logo').href = siteRoot.href;
      sharedHeader.querySelectorAll('.nav-links a[href^="#"]').forEach((link) => {
        link.href = `${siteRoot.href}${link.getAttribute('href')}`;
      });

      document.querySelectorAll('body > .case-nav, body > header.top, body > header.topbar')
        .forEach((bar) => bar.remove());
      document.body.classList.add('has-portfolio-header');
      document.body.prepend(sharedHeader);
      loadHeaderBehavior();
    })
    .catch((error) => console.error('Could not load the shared portfolio header:', error));
})();
