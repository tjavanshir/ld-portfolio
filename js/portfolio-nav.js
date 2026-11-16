(() => {
  const nav = document.getElementById('mainNav');
  if (!nav) return;

  const navLinks = document.getElementById('navLinks');
  const hamburger = document.getElementById('hamburger');
  const indicator = document.getElementById('navIndicator');
  const navItems = [...(navLinks?.querySelectorAll('li:not(:has(.nav-cta)) a') || [])];

  window.addEventListener('scroll', () => nav.classList.toggle('scrolled', window.scrollY > 20));
  hamburger?.addEventListener('click', () => navLinks.classList.toggle('open'));
  navLinks?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => navLinks.classList.remove('open')));

  function moveIndicatorTo(link) {
    if (!link || !indicator || !navLinks) return;
    const item = link.closest('li');
    const listRect = navLinks.getBoundingClientRect();
    const itemRect = item.getBoundingClientRect();
    indicator.style.left = `${itemRect.left - listRect.left}px`;
    indicator.style.width = `${itemRect.width}px`;
    indicator.classList.add('visible');
  }
  function hideIndicator() { indicator?.classList.remove('visible'); }

  navItems.forEach((link) => link.addEventListener('mouseenter', () => moveIndicatorTo(link)));
  navLinks?.addEventListener('mouseleave', () => {
    const active = navLinks.querySelector('a.active:not(.nav-cta)');
    active ? moveIndicatorTo(active) : hideIndicator();
  });

  if (window.location.pathname === new URL(nav.querySelector('.nav-logo').href).pathname) {
    const sections = document.querySelectorAll('section[id]');
    const updateActiveNav = () => {
      let current = '';
      sections.forEach((section) => { if (window.scrollY >= section.offsetTop - 120) current = section.id; });
      navItems.forEach((link) => link.classList.toggle('active', link.getAttribute('href') === `#${current}`));
      const active = navLinks?.querySelector('a.active:not(.nav-cta)');
      if (active) requestAnimationFrame(() => moveIndicatorTo(active)); else hideIndicator();
    };
    window.addEventListener('scroll', updateActiveNav);
    window.addEventListener('load', updateActiveNav);
    updateActiveNav();
  }
})();
