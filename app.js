const screens = {
  gate: document.getElementById('gate'),
  home: document.getElementById('home'),
  room: document.getElementById('room'),
};
const canvas = document.getElementById('seaCanvas');
const ctx = canvas.getContext('2d');
const fish = document.getElementById('fish');
const roomOwner = document.getElementById('roomOwner');
const roomMood = document.getElementById('roomMood');
const giftLayer = document.getElementById('giftLayer');
const rippleLayer = document.getElementById('rippleLayer');
const roomWorld = document.getElementById('roomWorld');
const giftSheet = document.getElementById('giftSheet');
const visitHint = document.getElementById('visitHint');

let currentRoom = 'mine';
let particles = [];
let w = 0;
let h = 0;
let dpr = Math.min(window.devicePixelRatio || 1, 2);

function showScreen(name) {
  Object.values(screens).forEach((el) => el.classList.remove('active'));
  screens[name].classList.add('active');
}

function dailyState(room) {
  const today = new Date();
  const key = `${today.getFullYear()}-${today.getMonth()+1}-${today.getDate()}-${room}`;
  let hash = 0;
  for (let i = 0; i < key.length; i++) hash = ((hash << 5) - hash) + key.charCodeAt(i) | 0;
  const calm = 56 + Math.abs(hash % 29);
  const activity = 34 + Math.abs((hash >> 3) % 40);
  const depth = 48 + Math.abs((hash >> 5) % 32);
  return { calm, activity, depth };
}

function applyRoom(room) {
  currentRoom = room;
  const state = dailyState(room);
  const isPartner = room === 'partner';
  roomOwner.textContent = isPartner ? 'PARTNER DEEP ROOM' : 'MY DEEP ROOM';
  roomMood.textContent = state.calm > 72 ? 'やわらかな潮' : state.activity > 58 ? '少し動く潮' : 'しずかな潮';
  fish.classList.toggle('fish-partner', isPartner);
  fish.classList.toggle('fish-mine', !isPartner);
  visitHint.textContent = isPartner
    ? '触れると、波紋だけが残ります。通知は届きません。'
    : '今日は、海の様子を眺めるだけでも。';
  document.getElementById('giftButton').style.display = isPartner ? 'block' : 'none';

  const darkness = Math.max(0.1, Math.min(0.44, (100 - state.depth) / 120));
  roomWorld.style.boxShadow = `inset 0 -80px 120px rgba(0,0,0,${darkness}), 0 30px 80px rgba(0,0,0,.22)`;
  renderStoredGifts();
}

function createRipple(x, y, strong = false) {
  const r = document.createElement('span');
  r.className = 'ripple';
  r.style.left = `${x}px`;
  r.style.top = `${y}px`;
  if (strong) r.style.borderColor = 'rgba(220,255,250,.75)';
  rippleLayer.appendChild(r);
  setTimeout(() => r.remove(), 2500);
}

function giftStorageKey() { return 'nemu-alpha-gifts-partner'; }
function getGifts() {
  try { return JSON.parse(localStorage.getItem(giftStorageKey()) || '[]'); }
  catch { return []; }
}
function saveGift(type) {
  const gifts = getGifts();
  const seed = Date.now();
  const x = 24 + (seed % 53);
  const y = 28 + ((seed >> 2) % 45);
  gifts.push({ type, x, y, at: seed });
  localStorage.setItem(giftStorageKey(), JSON.stringify(gifts.slice(-8)));
}
function renderStoredGifts() {
  giftLayer.innerHTML = '';
  if (currentRoom !== 'partner') return;
  getGifts().forEach((gift) => {
    const el = document.createElement('span');
    el.className = `gift-visual gift-${gift.type}`;
    el.style.left = `${gift.x}%`;
    el.style.top = `${gift.y}%`;
    giftLayer.appendChild(el);
  });
}

function openSheet() {
  giftSheet.classList.add('open');
  giftSheet.setAttribute('aria-hidden', 'false');
}
function closeSheet() {
  giftSheet.classList.remove('open');
  giftSheet.setAttribute('aria-hidden', 'true');
}

document.getElementById('enterGate').addEventListener('click', () => {
  createRipple(window.innerWidth / 2, window.innerHeight / 2, true);
  setTimeout(() => showScreen('home'), 420);
});

document.querySelectorAll('[data-room]').forEach((button) => {
  button.addEventListener('click', () => {
    applyRoom(button.dataset.room);
    showScreen('room');
  });
});

document.getElementById('backHome').addEventListener('click', () => showScreen('home'));
document.getElementById('giftButton').addEventListener('click', openSheet);
document.getElementById('sheetBackdrop').addEventListener('click', closeSheet);

document.querySelectorAll('.gift-option').forEach((button) => {
  button.addEventListener('click', () => {
    const type = button.dataset.gift;
    saveGift(type);
    renderStoredGifts();
    closeSheet();
    visitHint.textContent = '置いてきました。気づくのは、相手がここへ戻ったとき。';
    if (type === 'tone') {
      const rect = roomWorld.getBoundingClientRect();
      createRipple(rect.width * .56, rect.height * .48, true);
    }
  });
});

document.getElementById('leaveRipple').addEventListener('pointerdown', (event) => {
  const rect = roomWorld.getBoundingClientRect();
  createRipple(event.clientX - rect.left, event.clientY - rect.top);
});

document.getElementById('soundToggle').addEventListener('click', (e) => {
  e.currentTarget.classList.toggle('muted');
  visitHint.textContent = e.currentTarget.classList.contains('muted')
    ? '音は静かになりました。'
    : '音はまだ試作中。今は深海の静けさだけ。';
});

function resizeCanvas() {
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  w = window.innerWidth;
  h = window.innerHeight;
  canvas.width = Math.floor(w * dpr);
  canvas.height = Math.floor(h * dpr);
  canvas.style.width = `${w}px`;
  canvas.style.height = `${h}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  makeParticles();
}

function makeParticles() {
  const count = Math.min(90, Math.floor((w * h) / 11000));
  particles = Array.from({ length: count }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    r: .35 + Math.random() * 1.25,
    a: .10 + Math.random() * .38,
    vx: -.025 + Math.random() * .05,
    vy: -.035 - Math.random() * .08,
    phase: Math.random() * Math.PI * 2,
  }));
}

function drawSea(time) {
  const t = time * .00018;
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, '#082e35');
  grad.addColorStop(.42, '#052029');
  grad.addColorStop(1, '#01090e');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  const glow = ctx.createRadialGradient(w*.48, h*.10, 0, w*.48, h*.10, Math.max(w,h)*.72);
  glow.addColorStop(0, `rgba(113, 218, 205, ${.07 + Math.sin(t)*.012})`);
  glow.addColorStop(.5, 'rgba(41, 113, 112, .035)');
  glow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);

  particles.forEach((p) => {
    p.x += p.vx + Math.sin(t + p.phase) * .035;
    p.y += p.vy;
    if (p.y < -5) { p.y = h + 5; p.x = Math.random() * w; }
    if (p.x < -5) p.x = w + 5;
    if (p.x > w + 5) p.x = -5;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(202, 255, 247, ${p.a})`;
    ctx.fill();
  });

  requestAnimationFrame(drawSea);
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();
requestAnimationFrame(drawSea);
