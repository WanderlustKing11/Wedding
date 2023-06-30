window.onload = function () {
  const menu_btn = document.querySelector('.hamburger');

  menu_btn.addEventListener('click', () => {
    menu_btn.classList.toggle('is-active');
  })
}