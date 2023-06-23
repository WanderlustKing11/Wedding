const hamburgerIcon = document.getElementById('hamburger-icon');
const menu = document.querySelector('.menu');
let animationPlayed = false;

hamburgerIcon.addEventListener('click', () => {
  if (!animationPlayed) {
    menu.classList.toggle('hidden');
    hamburgerIcon.classList.add('active');
    hamburgerIcon.style.backgroundImage = 'url(/public/src/images/hamburger.gif)'; // Replace with the path to your GIF file
    hamburgerIcon.disabled = true;
    hamburgerIcon.removeEventListener('click', handleClick);
    animationPlayed = true;
    console.log('Clicked');
  }
});

function handleClick() {
  hamburgerIcon.click();
}

hamburgerIcon.addEventListener('animationiteration', () => {
  if (animationPlayed) {
    hamburgerIcon.classList.remove('active');
    hamburgerIcon.disabled = false;
    hamburgerIcon.addEventListener('click', handleClick);
    hamburgerIcon.style.backgroundImage = 'url(/public/src/images/icon.png)'; // Replace with the path to your static icon image
    animationPlayed = false;
  }
});
