/** 데모 UX 폴리시 — 토스트 · 점수 애니메이션 · 엔진 카드 */

function showToast(msg, type = 'info') {
  let root = document.getElementById('toastRoot');
  if (!root) {
    root = document.createElement('div');
    root.id = 'toastRoot';
    root.className = 'toast-root';
    document.body.appendChild(root);
  }
  const el = document.createElement('div');
  el.className = `toast toast--${type}`;
  el.textContent = msg;
  root.appendChild(el);
  requestAnimationFrame(() => el.classList.add('show'));
  setTimeout(() => {
    el.classList.remove('show');
    setTimeout(() => el.remove(), 300);
  }, 2800);
}

function animateScore(el, target, duration = 1200) {
  const node = typeof el === 'string' ? document.getElementById(el) : el;
  if (!node) return;
  const start = performance.now();
  const tick = (now) => {
    const p = Math.min(1, (now - start) / duration);
    const ease = 1 - Math.pow(1 - p, 4);
    node.textContent = Math.round(target * ease);
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

function initEngineCards() {
  const cards = document.querySelectorAll('.engine-card');
  const select = document.getElementById('engineSelect');
  if (!cards.length || !select) return;

  const sync = (val) => {
    cards.forEach((c) => c.classList.toggle('is-active', c.dataset.engine === val));
    select.value = val;
    if (typeof updateEngineUI === 'function') updateEngineUI();
  };

  cards.forEach((card) => {
    card.addEventListener('click', () => sync(card.dataset.engine));
  });
  select.addEventListener('change', () => sync(select.value));
  sync(select.value);
}

function renderScoreRing(pct) {
  const r = 54;
  const c = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;
  const color = pct >= 85 ? '#22c55e' : pct >= 60 ? '#0ea5e9' : pct >= 40 ? '#f97316' : '#ef4444';
  return `
    <div class="score-ring-wrap">
      <svg class="score-ring" viewBox="0 0 120 120" aria-hidden="true">
        <circle class="score-ring-bg" cx="60" cy="60" r="${r}" />
        <circle class="score-ring-fill" cx="60" cy="60" r="${r}"
          stroke="${color}"
          stroke-dasharray="${c}"
          stroke-dashoffset="${c}"
          data-target-offset="${offset}" />
      </svg>
      <div class="score-circle score-circle--ring">
        <span id="animatedScore">0</span><span>점</span>
      </div>
    </div>`;
}

function playScoreRing(pct) {
  requestAnimationFrame(() => {
    const fill = document.querySelector('.score-ring-fill');
    if (fill) {
      fill.style.strokeDashoffset = fill.dataset.targetOffset;
    }
    animateScore('animatedScore', pct);
  });
}

function staggerSkillBars() {
  document.querySelectorAll('.skill-fill').forEach((bar, i) => {
    const w = bar.style.width;
    bar.style.width = '0%';
    setTimeout(() => { bar.style.width = w; }, 200 + i * 120);
  });
}

document.addEventListener('DOMContentLoaded', initEngineCards);
