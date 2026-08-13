/* Portfolio Main JS */

// Nav scroll effect
const nav = document.querySelector('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 20);
  updateActiveNav();
});

// Mobile hamburger
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');
hamburger?.addEventListener('click', () => {
  navLinks.classList.toggle('open');
});

// Close nav on link click (mobile)
navLinks?.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => navLinks.classList.remove('open'));
});

// ── Animated nav indicator ──
const indicator = document.getElementById('navIndicator');
const navItems = navLinks ? [...navLinks.querySelectorAll('li:not(:has(.nav-cta)) a')] : [];

function moveIndicatorTo(el) {
  if (!el || !indicator) return;
  const li = el.closest('li');
  const listRect = navLinks.getBoundingClientRect();
  const liRect = li.getBoundingClientRect();
  indicator.style.left = (liRect.left - listRect.left) + 'px';
  indicator.style.width = liRect.width + 'px';
  indicator.classList.add('visible');
}

function hideIndicator() {
  indicator?.classList.remove('visible');
}

// Hover behaviour
navItems.forEach(a => {
  a.addEventListener('mouseenter', () => moveIndicatorTo(a));
});
navLinks?.addEventListener('mouseleave', () => {
  // Return to active item or hide
  const active = navLinks.querySelector('a.active:not(.nav-cta)');
  active ? moveIndicatorTo(active) : hideIndicator();
});

// Active section detection on scroll
const sections = document.querySelectorAll('section[id]');

function updateActiveNav() {
  let current = '';
  sections.forEach(sec => {
    if (window.scrollY >= sec.offsetTop - 120) current = sec.id;
  });
  navItems.forEach(a => {
    const href = a.getAttribute('href')?.replace('#', '');
    a.classList.toggle('active', href === current);
  });
  const active = navLinks?.querySelector('a.active:not(.nav-cta)');
  if (active) {
    // Wait for layout to settle after class change
    requestAnimationFrame(() => moveIndicatorTo(active));
  } else {
    hideIndicator();
  }
}

// Run once on load so the indicator is placed correctly after fonts render
window.addEventListener('load', () => {
  updateActiveNav();
});

// Scroll-triggered fade-up
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), i * 80);
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));

// Contact form
document.getElementById('contactForm')?.addEventListener('submit', async function(e) {
  e.preventDefault();
  const submitBtn = document.getElementById('submitBtn');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Sending...';

  const data = {
    name: document.getElementById('name').value,
    email: document.getElementById('email').value,
    project: document.getElementById('project').value,
    message: document.getElementById('message').value
  };

  try {
    const response = await fetch('https://script.google.com/macros/s/AKfycbxOC-tTHq4zNrvynTE9ZJRn6vTDzjW2vscble4FTWTrc1EtT2pyHnq-P9bCsikIrfoF/e', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    showToast('Thanks! Your message has been received.');
    this.reset();
  } catch (error) {
    showToast('Error sending message. Please try again.');
    console.error(error);
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Send Message';
  }
});

function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 4000);
}
