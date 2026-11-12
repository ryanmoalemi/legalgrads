/* Mobile menu for the static attorney pages. Mirrors the Next.js Header in src/components/Chrome.tsx:
   a real button with aria-expanded and aria-controls, a nonmodal disclosure, Escape closes and returns focus. */
(function () {
  var button = document.querySelector('.lg-menu-toggle');
  var menu = document.getElementById('lg-menu');
  if (!button || !menu) return;
  function set(open) {
    button.setAttribute('aria-expanded', open ? 'true' : 'false');
    menu.classList.toggle('is-open', open);
    var label = button.querySelector('.lg-sr');
    if (label) label.textContent = open ? 'Close menu' : 'Open menu';
  }
  button.addEventListener('click', function () { set(button.getAttribute('aria-expanded') !== 'true'); });
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && button.getAttribute('aria-expanded') === 'true') { set(false); button.focus(); }
  });
  document.addEventListener('click', function (event) {
    if (button.getAttribute('aria-expanded') === 'true' && !menu.contains(event.target) && !button.contains(event.target)) set(false);
  });
})();
