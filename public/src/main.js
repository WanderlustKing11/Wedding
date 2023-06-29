const hamburgerIcon = document.getElementById('hamburger-icon');
const menu = document.querySelector('.menu');
let animationPlayed = false;

hamburgerIcon.addEventListener('click', () => {
  if (!animationPlayed) {
    menu.classList.toggle('hidden');
    hamburgerIcon.classList.add('active');
    hamburgerIcon.innerHTML = `<img src='/public/src/images/hamburger.gif' alt='Hamburger Icon' />`; // Replace with the path to your GIF file
    hamburgerIcon.disabled = true;
    hamburgerIcon.removeEventListener('click', handleClick);
    animationPlayed = true;
    console.log('Clicked');
  }
});

function handleClick() {
  hamburgerIcon.click();
}

hamburgerIcon.addEventListener('animationend', () => {
  if (animationPlayed) {
    hamburgerIcon.classList.remove('active');
    hamburgerIcon.disabled = false;
    hamburgerIcon.addEventListener('click', handleClick);
    hamburgerIcon.innerHTML = `<img src='/public/src/images/hamburger-icon.png' alt='Hamburger Icon' />`; // Replace with the path to your image file
  }
});