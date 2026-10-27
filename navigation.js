/* Native details preserve keyboard access and work before JavaScript loads. */
(() => {
 const nav = document.querySelector('[data-nav]');
 const button = document.querySelector('[data-menu]');
 const languages = document.querySelector('.language-menu');
 const summary = languages?.querySelector('summary');
 const lang = document.documentElement.lang;
 const labels = {
  fr: ['Ouvrir le menu', 'Fermer le menu'],
  en: ['Open menu', 'Close menu'],
  nl: ['Menu openen', 'Menu sluiten']
 }[lang] || ['Open menu', 'Close menu'];
 const closeLanguages = () => { if (languages) languages.open = false; };
 const closeNav = (restoreFocus = false) => {
  nav?.classList.remove('open');
  button?.setAttribute('aria-expanded', 'false');
  button?.setAttribute('aria-label', labels[0]);
  closeLanguages();
  if (restoreFocus) button?.focus();
 };
 button?.addEventListener('click', () => {
  const open = button.getAttribute('aria-expanded') === 'true';
  button.setAttribute('aria-label', labels[open ? 1 : 0]);
  if (!open) closeLanguages();
 });
 document.addEventListener('click', event => {
  if (!languages?.contains(event.target)) closeLanguages();
  if (!nav?.contains(event.target) && !button?.contains(event.target)) closeNav();
 });
 document.addEventListener('keydown', event => {
  if (event.key !== 'Escape') return;
  if (languages?.open) { closeLanguages(); summary?.focus(); }
  else if (nav?.classList.contains('open')) closeNav(true);
 });
 nav?.addEventListener('focusout', event => {
  if (!nav.contains(event.relatedTarget) && !button?.contains(event.relatedTarget)) closeNav();
  else if (languages?.open && !languages.contains(event.relatedTarget)) closeLanguages();
 });
 window.matchMedia('(min-width:1241px)').addEventListener('change', () => closeNav());
})();

// The client ribbon can be paused independently of pointer hover.
for (const button of document.querySelectorAll('[data-client-pause]')) {
 const ribbon = button.closest('.client-strip').querySelector('.client-marquee');
 const track = ribbon.querySelector('.client-track');
 const group = track.querySelector('.client-group');
 const setSpeed = () => track.style.setProperty('--client-duration', `${(group.getBoundingClientRect().width / 42).toFixed(2)}s`);
 setSpeed();
 if ('ResizeObserver' in window) new ResizeObserver(setSpeed).observe(group);
 const labels = {
  fr: ['Mettre le défilement en pause', 'Reprendre le défilement'],
  en: ['Pause client scrolling', 'Resume client scrolling'],
  nl: ['Scrollen pauzeren', 'Scrollen hervatten']
 }[document.documentElement.lang] || ['Pause client scrolling', 'Resume client scrolling'];
 button.hidden = false;
 button.addEventListener('click', () => {
  const paused = !ribbon.hasAttribute('data-paused');
  ribbon.toggleAttribute('data-paused', paused);
  button.setAttribute('aria-pressed', String(paused));
  // Keep a stable accessible toggle label; communicate state with aria-pressed.
  button.textContent = labels[0];
 });
}
