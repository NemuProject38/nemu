import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js';
import { getAuth, signInAnonymously } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js';
import { firebaseConfig } from './firebase-config.js';

const ocean = document.getElementById('ocean');
const particleLayer = document.getElementById('particles');
const rippleLayer = document.getElementById('ripples');
const giftLayer = document.getElementById('giftLayer');

function seedParticles(count = 34) {
  const frag = document.createDocumentFragment();
  for (let i = 0; i < count; i += 1) {
    const p = document.createElement('i');
    p.className = 'particle';
    p.style.left = `${Math.random() * 100}%`;
    p.style.bottom = `${-8 - Math.random() * 28}%`;
    p.style.setProperty('--dur', `${13 + Math.random() * 19}s`);
    p.style.setProperty('--delay', `${-Math.random() * 28}s`);
    p.style.setProperty('--drift', `${-18 + Math.random() * 36}px`);
    p.style.setProperty('--alpha', `${0.18 + Math.random() * 0.48}`);
    const size = 1 + Math.random() * 3.2;
    p.style.width = `${size}px`;
    p.style.height = `${size}px`;
    frag.appendChild(p);
  }
  particleLayer.appendChild(frag);
}

function rippleAt(x, y) {
  const ring = document.createElement('span');
  ring.className = 'ripple';
  ring.style.left = `${x}px`;
  ring.style.top = `${y}px`;
  rippleLayer.appendChild(ring);
  ring.addEventListener('animationend', () => ring.remove(), { once: true });
}

function bloomGift() {
  giftLayer.innerHTML = '';
  const flower = document.createElement('span');
  flower.className = 'gift-flower';
  giftLayer.appendChild(flower);
  window.setTimeout(() => flower.remove(), 5200);
}

ocean.addEventListener('pointerdown', (event) => {
  if (event.target.closest('button')) return;
  rippleAt(event.clientX, event.clientY);
});

document.querySelector('[data-action="ripple"]').addEventListener('click', () => {
  rippleAt(innerWidth / 2, innerHeight * 0.48);
});

document.querySelector('[data-action="flower"]').addEventListener('click', bloomGift);

document.querySelector('[data-action="visit"]').addEventListener('click', () => {
  // v0.2 visual prototype: no navigation yet. A quiet ripple acknowledges the touch.
  rippleAt(innerWidth * 0.72, innerHeight * 0.42);
});

seedParticles();

// ----------------- Firebase 初期化 + 匿名認証（ここからが今回の追加分） -----------------
try {
  const firebaseApp = initializeApp(firebaseConfig);
  const auth = getAuth(firebaseApp);

  signInAnonymously(auth)
    .then((userCredential) => {
      console.log('Firebase anonymous sign-in success. UID:', userCredential.user.uid);
    })
    .catch((error) => {
      console.error('Firebase anonymous sign-in failed:', error);
    });
} catch (err) {
  console.error('Firebase initialization error:', err);
}
// ------------------------------------------------------------------------------------
