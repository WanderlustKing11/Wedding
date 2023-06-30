window.onload = function () {
  const menu_btn = document.querySelector('.hamburger');
  const mobile_menu = document.querySelector('.mobile-menu');

  menu_btn.addEventListener('click', () => {
    const expanded = menu_btn.getAttribute('aria-expanded') === 'true' || false;
    menu_btn.setAttribute('aria-expanded', !expanded);
    mobile_menu.setAttribute('aria-hidden', expanded);
    menu_btn.classList.toggle('is-active');
    mobile_menu.classList.toggle('is-active');
  });
};