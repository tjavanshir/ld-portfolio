/* Portfolio Main JS */
const nav=document.querySelector('nav');
window.addEventListener('scroll',()=>{nav.classList.toggle('scrolled',window.scrollY>20);updateActiveNav();});
// GA4 loads on the public portfolio; advertising features stay disabled.
const GA4_MEASUREMENT_ID='G-T1S6E67NJB';
function loadPortfolioAnalytics(){
 if(window.location.hostname!=='tjavanshir.github.io'||window.__portfolioGa4Loaded)return;
 window.__portfolioGa4Loaded=true;window.__portfolioGa4Enabled=true;
 window.dataLayer=window.dataLayer||[];window.gtag=function(){window.dataLayer.push(arguments);};
 window.gtag('js',new Date());
 window.gtag('consent','default',{analytics_storage:'granted',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});
 window.gtag('config',GA4_MEASUREMENT_ID,{allow_google_signals:false,allow_ad_personalization_signals:false,page_location:window.location.origin+window.location.pathname});
 const tag=document.createElement('script');tag.async=true;tag.src='https://www.googletagmanager.com/gtag/js?id='+GA4_MEASUREMENT_ID;document.head.appendChild(tag);
}
loadPortfolioAnalytics();
function trackPortfolioEvent(name,details){if(window.__portfolioGa4Enabled&&typeof window.gtag==='function')window.gtag('event',name,details);}
document.querySelectorAll('.sample-link').forEach(link=>link.addEventListener('click',()=>{
 const card=link.closest('.sample-card');const title=card?.querySelector('h3')?.textContent?.trim()||'Learning sample';const host=new URL(link.href,window.location.href).hostname;let platform='Other';
 if(host.includes('instructure'))platform='Canvas';else if(host.includes('moodlecloud'))platform='Moodle';else if(host.includes('articulate'))platform='Rise';else if(host.includes('scorm'))platform='SCORM Cloud';trackPortfolioEvent('portfolio_sample_open',{sample_name:title,platform});
}));
const hamburger=document.getElementById('hamburger');const navLinks=document.getElementById('navLinks');hamburger?.addEventListener('click',()=>navLinks.classList.toggle('open'));
navLinks?.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>navLinks.classList.remove('open')));
const indicator=document.getElementById('navIndicator');const navItems=navLinks?[...navLinks.querySelectorAll('li:not(:has(.nav-cta)) a')]:[];
function moveIndicatorTo(el){if(!el||!indicator)return;const li=el.closest('li');const listRect=navLinks.getBoundingClientRect();const liRect=li.getBoundingClientRect();indicator.style.left=(liRect.left-listRect.left)+'px';indicator.style.width=liRect.width+'px';indicator.classList.add('visible');}
function hideIndicator(){indicator?.classList.remove('visible');}
navItems.forEach(a=>a.addEventListener('mouseenter',()=>moveIndicatorTo(a)));
navLinks?.addEventListener('mouseleave',()=>{const active=navLinks.querySelector('a.active:not(.nav-cta)');active?moveIndicatorTo(active):hideIndicator();});
const sections=document.querySelectorAll('section[id]');
function updateActiveNav(){let current='';sections.forEach(sec=>{if(window.scrollY>=sec.offsetTop-120)current=sec.id;});navItems.forEach(a=>{const href=a.getAttribute('href')?.replace('#','');a.classList.toggle('active',href===current);});const active=navLinks?.querySelector('a.active:not(.nav-cta)');if(active)requestAnimationFrame(()=>moveIndicatorTo(active));else hideIndicator();}
window.addEventListener('load',updateActiveNav);
const observer=new IntersectionObserver((entries)=>{entries.forEach((entry,i)=>{if(entry.isIntersecting){setTimeout(()=>entry.target.classList.add('visible'),i*80);observer.unobserve(entry.target);}});},{threshold:.1});
document.querySelectorAll('.fade-up').forEach(el=>observer.observe(el));
document.getElementById('contactForm')?.addEventListener('submit',async function(e){e.preventDefault();const submitBtn=document.getElementById('submitBtn');submitBtn.disabled=true;submitBtn.textContent='Sending...';const data={name:document.getElementById('name').value,email:document.getElementById('email').value,project:document.getElementById('project').value,message:document.getElementById('message').value};try{await fetch('https://script.google.com/macros/s/AKfycbxsydOP6nMs1tlHuPUPYQunsNYWjUkWOfoJ3OOii_gWcE0VHtJzk0XvDRTdzY7Y5ESWhw/exec',{method:'POST',mode:'no-cors',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(data)});trackPortfolioEvent('contact_form_success',{form_name:'portfolio_contact'});showToast('Thanks! Your message has been received.');this.reset();}catch(error){showToast('Error sending message. Please try again.');console.error(error);}finally{submitBtn.disabled=false;submitBtn.textContent='Send Message';}});
function showToast(msg){const toast=document.getElementById('toast');toast.textContent=msg;toast.classList.add('show');setTimeout(()=>toast.classList.remove('show'),4000);}
