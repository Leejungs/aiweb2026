/**
 * AI 면접관 — 캐릭터 SVG 스프라이트
 * 면접관 3명 + 직무별 지원자(나) 캐릭터
 */

const PLAYER_META = {
  backend:  { name: '나', role: '백엔드 지원자', label: '개발자 지원자' },
  frontend: { name: '나', role: '프론트 지원자', label: 'FE 지원자' },
  pm:       { name: '나', role: 'PM 지원자', label: 'PM 지원자' },
  data:     { name: '나', role: '데이터 지원자', label: 'DA 지원자' },
  marketing:{ name: '나', role: '마케팅 지원자', label: 'MK 지원자' },
};

/** 면접관 SVG (120×140 viewBox) */
const INTERVIEWER_SPRITES = {
  harin: `
    <svg viewBox="0 0 120 140" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <ellipse cx="60" cy="128" rx="28" ry="6" fill="rgba(0,0,0,0.08)"/>
      <rect x="38" y="88" width="44" height="42" rx="10" fill="#0ea5e9"/>
      <rect x="42" y="92" width="36" height="8" rx="2" fill="#fff" opacity="0.5"/>
      <path d="M48 88 L60 78 L72 88" fill="#0284c7"/>
      <rect x="34" y="96" width="10" height="28" rx="5" fill="#0369a1"/>
      <rect x="76" y="96" width="10" height="28" rx="5" fill="#0369a1"/>
      <circle cx="60" cy="52" r="26" fill="#fde68a"/>
      <path d="M34 48 Q60 18 86 48 Q82 32 60 28 Q38 32 34 48" fill="#78350f"/>
      <ellipse cx="60" cy="38" rx="22" ry="14" fill="#92400e"/>
      <circle cx="50" cy="52" r="3" fill="#1e293b"/>
      <circle cx="70" cy="52" r="3" fill="#1e293b"/>
      <path d="M54 62 Q60 67 66 62" stroke="#be123c" stroke-width="2" fill="none" stroke-linecap="round"/>
      <ellipse cx="44" cy="58" rx="4" ry="2" fill="#fda4af" opacity="0.5"/>
      <ellipse cx="76" cy="58" rx="4" ry="2" fill="#fda4af" opacity="0.5"/>
    </svg>`,
  junseo: `
    <svg viewBox="0 0 120 140" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <ellipse cx="60" cy="128" rx="28" ry="6" fill="rgba(0,0,0,0.08)"/>
      <rect x="36" y="86" width="48" height="44" rx="8" fill="#334155"/>
      <rect x="40" y="90" width="40" height="6" rx="1" fill="#64748b"/>
      <circle cx="60" cy="100" r="3" fill="#94a3b8"/>
      <rect x="32" y="94" width="12" height="30" rx="6" fill="#1e293b"/>
      <rect x="76" y="94" width="12" height="30" rx="6" fill="#1e293b"/>
      <circle cx="60" cy="50" r="27" fill="#fcd34d"/>
      <path d="M33 46 Q60 12 87 46 L87 56 Q60 40 33 56 Z" fill="#1e293b"/>
      <rect x="38" y="48" width="44" height="12" rx="6" fill="none" stroke="#475569" stroke-width="2"/>
      <circle cx="50" cy="52" r="4" fill="#fff"/><circle cx="50" cy="52" r="2" fill="#1e293b"/>
      <circle cx="70" cy="52" r="4" fill="#fff"/><circle cx="70" cy="52" r="2" fill="#1e293b"/>
      <line x1="42" y1="48" x2="48" y2="48" stroke="#94a3b8" stroke-width="1.5"/>
      <line x1="72" y1="48" x2="78" y2="48" stroke="#94a3b8" stroke-width="1.5"/>
      <path d="M54 64 L60 60 L66 64" stroke="#64748b" stroke-width="1.5" fill="none"/>
    </svg>`,
  suyeon: `
    <svg viewBox="0 0 120 140" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <ellipse cx="60" cy="128" rx="28" ry="6" fill="rgba(0,0,0,0.08)"/>
      <rect x="38" y="88" width="44" height="42" rx="10" fill="#7c3aed"/>
      <rect x="44" y="94" width="32" height="4" rx="1" fill="#a78bfa"/>
      <path d="M78 92 L92 78 L92 108 L78 108 Z" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1"/>
      <line x1="82" y="86" x2="88" y2="92" stroke="#64748b" stroke-width="1.5"/>
      <rect x="34" y="96" width="10" height="28" rx="5" fill="#5b21b6"/>
      <rect x="76" y="96" width="10" height="28" rx="5" fill="#5b21b6"/>
      <circle cx="60" cy="52" r="26" fill="#fecdd3"/>
      <path d="M34 44 Q38 20 60 24 Q82 20 86 44 L86 62 Q60 50 34 62 Z" fill="#881337"/>
      <circle cx="50" cy="52" r="3" fill="#1e293b"/>
      <circle cx="70" cy="52" r="3" fill="#1e293b"/>
      <path d="M55 62 Q60 66 65 62" stroke="#be123c" stroke-width="2" fill="none" stroke-linecap="round"/>
      <rect x="52" y="38" width="16" height="4" rx="2" fill="#fda4af" opacity="0.6"/>
    </svg>`,
};

/** 지원자(나) SVG — 직무별 */
const PLAYER_SPRITES = {
  backend: `
    <svg viewBox="0 0 120 140" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <ellipse cx="60" cy="128" rx="28" ry="6" fill="rgba(0,0,0,0.08)"/>
      <rect x="34" y="84" width="52" height="46" rx="12" fill="#1e293b"/>
      <text x="44" y="108" font-size="10" fill="#22c55e" font-family="monospace">&lt;/&gt;</text>
      <rect x="30" y="92" width="12" height="32" rx="6" fill="#0f172a"/>
      <rect x="78" y="92" width="12" height="32" rx="6" fill="#0f172a"/>
      <circle cx="60" cy="50" r="27" fill="#fde68a"/>
      <path d="M33 42 Q60 8 87 42 Q84 30 60 26 Q36 30 33 42" fill="#44403c"/>
      <circle cx="50" cy="52" r="3" fill="#1e293b"/>
      <circle cx="70" cy="52" r="3" fill="#1e293b"/>
      <path d="M54 64 Q60 68 66 64" stroke="#78716c" stroke-width="2" fill="none" stroke-linecap="round"/>
    </svg>`,
  frontend: `
    <svg viewBox="0 0 120 140" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <ellipse cx="60" cy="128" rx="28" ry="6" fill="rgba(0,0,0,0.08)"/>
      <rect x="34" y="86" width="52" height="44" rx="10" fill="#f97316"/>
      <rect x="38" y="90" width="16" height="16" rx="3" fill="#ef4444" opacity="0.8"/>
      <rect x="58" y="90" width="16" height="16" rx="3" fill="#0ea5e9" opacity="0.8"/>
      <rect x="78" y="90" width="4" height="16" rx="1" fill="#eab308" opacity="0.8"/>
      <rect x="30" y="94" width="12" height="30" rx="6" fill="#ea580c"/>
      <rect x="78" y="94" width="12" height="30" rx="6" fill="#ea580c"/>
      <circle cx="60" cy="50" r="27" fill="#fcd34d"/>
      <path d="M33 40 Q60 6 87 40 L90 55 Q60 45 30 55 Z" fill="#713f12"/>
      <circle cx="50" cy="52" r="3" fill="#1e293b"/>
      <circle cx="70" cy="52" r="3" fill="#1e293b"/>
      <ellipse cx="38" cy="58" rx="8" ry="5" fill="none" stroke="#64748b" stroke-width="2"/>
      <ellipse cx="82" cy="58" rx="8" ry="5" fill="none" stroke="#64748b" stroke-width="2"/>
      <line x1="46" y1="58" x2="74" y2="58" stroke="#64748b" stroke-width="2"/>
    </svg>`,
  pm: `
    <svg viewBox="0 0 120 140" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <ellipse cx="60" cy="128" rx="28" ry="6" fill="rgba(0,0,0,0.08)"/>
      <rect x="36" y="88" width="48" height="42" rx="10" fill="#059669"/>
      <rect x="42" y="94" width="36" height="5" rx="1" fill="#6ee7b7"/>
      <rect x="32" y="96" width="12" height="28" rx="6" fill="#047857"/>
      <rect x="76" y="96" width="12" height="28" rx="6" fill="#047857"/>
      <circle cx="60" cy="50" r="27" fill="#fde68a"/>
      <path d="M33 44 Q60 14 87 44 Q83 32 60 28 Q37 32 33 44" fill="#292524"/>
      <circle cx="50" cy="52" r="3" fill="#1e293b"/>
      <circle cx="70" cy="52" r="3" fill="#1e293b"/>
      <path d="M55 64 Q60 67 65 64" stroke="#be123c" stroke-width="2" fill="none"/>
      <rect x="22" y="78" width="20" height="28" rx="3" fill="#ecfdf5" stroke="#cbd5e1"/>
      <line x1="26" y1="86" x2="38" y2="86" stroke="#94a3b8" stroke-width="1"/>
      <line x1="26" y1="92" x2="38" y2="92" stroke="#94a3b8" stroke-width="1"/>
    </svg>`,
  data: `
    <svg viewBox="0 0 120 140" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <ellipse cx="60" cy="128" rx="28" ry="6" fill="rgba(0,0,0,0.08)"/>
      <rect x="36" y="88" width="48" height="42" rx="10" fill="#2563eb"/>
      <rect x="32" y="96" width="12" height="28" rx="6" fill="#1d4ed8"/>
      <rect x="76" y="96" width="12" height="28" rx="6" fill="#1d4ed8"/>
      <circle cx="60" cy="50" r="27" fill="#fecdd3"/>
      <path d="M33 42 Q60 10 87 42 L87 58 Q60 44 33 58 Z" fill="#4c1d95"/>
      <rect x="38" y="48" width="44" height="10" rx="5" fill="none" stroke="#6366f1" stroke-width="2"/>
      <circle cx="50" cy="52" r="3.5" fill="#fff"/><circle cx="50" cy="52" r="1.5" fill="#1e293b"/>
      <circle cx="70" cy="52" r="3.5" fill="#fff"/><circle cx="70" cy="52" r="1.5" fill="#1e293b"/>
      <rect x="78" y="72" width="18" height="22" rx="2" fill="#fff" stroke="#cbd5e1"/>
      <rect x="82" y="82" width="4" height="8" fill="#0ea5e9"/>
      <rect x="88" y="78" width="4" height="12" fill="#f97316"/>
      <rect x="94" y="74" width="4" height="16" fill="#22c55e"/>
    </svg>`,
  marketing: `
    <svg viewBox="0 0 120 140" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <ellipse cx="60" cy="128" rx="28" ry="6" fill="rgba(0,0,0,0.08)"/>
      <rect x="34" y="86" width="52" height="44" rx="10" fill="#ec4899"/>
      <rect x="30" y="94" width="12" height="30" rx="6" fill="#db2777"/>
      <rect x="78" y="94" width="12" height="30" rx="6" fill="#db2777"/>
      <circle cx="60" cy="50" r="27" fill="#fde68a"/>
      <path d="M33 40 Q60 6 87 40 Q84 28 60 24 Q36 28 33 40" fill="#b45309"/>
      <circle cx="50" cy="52" r="3" fill="#1e293b"/>
      <circle cx="70" cy="52" r="3" fill="#1e293b"/>
      <path d="M54 64 Q60 68 66 64" stroke="#be123c" stroke-width="2" fill="none"/>
      <rect x="76" y="70" width="6" height="14" rx="3" fill="#64748b"/>
      <ellipse cx="79" cy="68" rx="8" ry="5" fill="none" stroke="#64748b" stroke-width="2"/>
      <circle cx="48" cy="78" r="6" fill="#fef08a" stroke="#eab308" stroke-width="1"/>
      <text x="45" y="81" font-size="7" fill="#ca8a04">★</text>
    </svg>`,
};

const MOOD_CLASS = {
  neutral: '',
  speaking: 'mood-speaking',
  listening: 'mood-listening',
  happy: 'mood-happy',
  nervous: 'mood-nervous',
  thinking: 'mood-thinking',
  sad: 'mood-sad',
};

function getPlayerMeta(job) {
  return PLAYER_META[job] || PLAYER_META.backend;
}

function getInterviewerSprite(id) {
  return INTERVIEWER_SPRITES[id] || INTERVIEWER_SPRITES.harin;
}

function getPlayerSprite(job) {
  return PLAYER_SPRITES[job] || PLAYER_SPRITES.backend;
}

/**
 * 캐릭터 스프라이트를 컨테이너에 렌더
 * @param {HTMLElement} container
 * @param {'interviewer'|'player'} role
 * @param {string} id — interviewer id 또는 job key
 * @param {string} mood
 */
function renderCharacter(container, role, id, mood = 'neutral') {
  if (!container) return;
  const svg = role === 'interviewer' ? getInterviewerSprite(id) : getPlayerSprite(id);
  const moodCls = MOOD_CLASS[mood] || '';
  container.innerHTML = `<div class="char-sprite ${moodCls}" data-role="${role}">${svg}</div>`;
}

/**
 * 스테이지 전체 업데이트 (면접 진행 화면)
 */
function updateStageCharacters(opts = {}) {
  const {
    interviewerId = 'harin',
    job = 'backend',
    interviewerMood = 'neutral',
    playerMood = 'neutral',
    interviewerSpeaking = false,
    playerSpeaking = false,
  } = opts;

  const ivMood = interviewerSpeaking ? 'speaking' : interviewerMood;
  const plMood = playerSpeaking ? 'speaking' : playerMood;

  renderCharacter(document.getElementById('stageInterviewer'), 'interviewer', interviewerId, ivMood);
  renderCharacter(document.getElementById('stagePlayer'), 'player', job, plMood);

  const iv = typeof INTERVIEWERS !== 'undefined' ? INTERVIEWERS[interviewerId] : null;
  const pm = getPlayerMeta(job);

  const ivName = document.getElementById('stageInterviewerName');
  const plName = document.getElementById('stagePlayerName');
  const plRole = document.getElementById('stagePlayerRole');
  if (ivName && iv) ivName.textContent = iv.name;
  if (plName) plName.textContent = pm.name;
  if (plRole) plRole.textContent = pm.role;

  const ivInd = document.getElementById('interviewerIndicator');
  const plInd = document.getElementById('playerIndicator');
  if (ivInd) ivInd.hidden = !interviewerSpeaking;
  if (plInd) plInd.hidden = !playerSpeaking;

  const ivWrap = document.getElementById('stageInterviewerWrap');
  const plWrap = document.getElementById('stagePlayerWrap');
  if (ivWrap) ivWrap.classList.toggle('is-active', interviewerSpeaking);
  if (plWrap) plWrap.classList.toggle('is-active', playerSpeaking);
}

/**
 * 대기실 미리보기 (양쪽 캐릭터)
 */
function updateLobbyCharacters(interviewerId, job) {
  renderCharacter(document.getElementById('previewInterviewer'), 'interviewer', interviewerId, 'neutral');
  renderCharacter(document.getElementById('previewPlayer'), 'player', job, 'neutral');

  const iv = typeof INTERVIEWERS !== 'undefined' ? INTERVIEWERS[interviewerId] : null;
  const pm = getPlayerMeta(job);

  const el = (id, text) => { const e = document.getElementById(id); if (e) e.textContent = text; };
  if (iv) {
    el('previewName', iv.name);
    el('previewRole', iv.role);
    el('previewGreeting', `"${iv.greeting}"`);
    el('previewInterviewerName', iv.name);
  }
  el('previewPlayerName', pm.name);
  el('previewPlayerRole', pm.role);
}

/** confidence 기반 지원자 mood */
function moodFromConfidence(confidence) {
  if (confidence >= 75) return 'happy';
  if (confidence >= 50) return 'neutral';
  if (confidence >= 30) return 'nervous';
  return 'sad';
}

/** rapport 기반 면접관 mood */
function moodFromRapport(rapport) {
  if (rapport >= 75) return 'happy';
  if (rapport >= 50) return 'neutral';
  return 'thinking';
}
