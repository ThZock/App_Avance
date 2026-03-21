const audio = document.getElementById('bg-music');
const START_SECONDS = 150;

if (audio) {
  audio.addEventListener('play', () => {
    if (audio.currentTime < START_SECONDS - 1) {
      audio.currentTime = START_SECONDS;
    }
  });

  audio.addEventListener('loadedmetadata', () => {
    if (audio.duration > START_SECONDS) {
      audio.currentTime = START_SECONDS;
    }
  });
}

const petalsContainer = document.querySelector('.petals');

function createPetal() {
  if (!petalsContainer) return;

  const petal = document.createElement('span');
  petal.className = 'petal';
  petal.textContent = Math.random() > 0.5 ? '🌼' : '🌻';
  petal.style.left = `${Math.random() * 100}vw`;
  petal.style.animationDuration = `${6 + Math.random() * 5}s`;
  petal.style.opacity = String(0.7 + Math.random() * 0.3);
  petalsContainer.appendChild(petal);

  setTimeout(() => petal.remove(), 12000);
}

setInterval(createPetal, 450);
