/**
 * AI 면접관 — 3D 치비 캐릭터 렌더러
 */

const PLAYER_META = {
  backend:  { name: '나', role: '백엔드 지원자', label: '개발자 지원자' },
  frontend: { name: '나', role: '프론트 지원자', label: 'FE 지원자' },
  pm:       { name: '나', role: 'PM 지원자', label: 'PM 지원자' },
  data:     { name: '나', role: '데이터 지원자', label: 'DA 지원자' },
  marketing:{ name: '나', role: '마케팅 지원자', label: 'MK 지원자' },
};

const CHAR_THEMES = {
  harin: {
    skin: '#ffe4bc', hair: '#5c3d2e', body: '#38bdf8', bodyDark: '#0284c7',
    pants: '#1e3a5f', prop: 'badge', propEmoji: '📎', facing: 'right',
  },
  junseo: {
    skin: '#fde68a', hair: '#1e293b', body: '#475569', bodyDark: '#334155',
    pants: '#0f172a', prop: 'glasses', propEmoji: '💻', facing: 'right',
  },
  suyeon: {
    skin: '#fecdd3', hair: '#881337', body: '#a78bfa', bodyDark: '#7c3aed',
    pants: '#4c1d95', prop: 'clipboard', propEmoji: '📋', facing: 'right',
  },
  'pl-backend': {
    skin: '#fde68a', hair: '#44403c', body: '#334155', bodyDark: '#1e293b',
    pants: '#0f172a', prop: 'code', propEmoji: '</>', facing: 'left',
  },
  'pl-frontend': {
    skin: '#fcd34d', hair: '#713f12', body: '#fb923c', bodyDark: '#ea580c',
    pants: '#7c2d12', prop: 'palette', propEmoji: '🎨', facing: 'left',
  },
  'pl-pm': {
    skin: '#fde68a', hair: '#292524', body: '#34d399', bodyDark: '#059669',
    pants: '#064e3b', prop: 'chart', propEmoji: '📊', facing: 'left',
  },
  'pl-data': {
    skin: '#fecdd3', hair: '#4c1d95', body: '#60a5fa', bodyDark: '#2563eb',
    pants: '#1e3a8a', prop: 'graph', propEmoji: '📈', facing: 'left',
  },
  'pl-marketing': {
    skin: '#fde68a', hair: '#b45309', body: '#f472b6', bodyDark: '#ec4899',
    pants: '#831843', prop: 'megaphone', propEmoji: '📣', facing: 'left',
  },
};

const MOOD_CLASS = {
  neutral: '', speaking: 'mood-speaking', listening: 'mood-listening',
  happy: 'mood-happy', nervous: 'mood-nervous', thinking: 'mood-thinking', sad: 'mood-sad',
};

function getCharKey(role, id) {
  return role === 'interviewer' ? id : `pl-${id}`;
}

function getTheme(role, id) {
  return CHAR_THEMES[getCharKey(role, id)] || CHAR_THEMES.harin;
}

function getPlayerMeta(job) {
  return PLAYER_META[job] || PLAYER_META.backend;
}

function buildChibiHTML(role, id, mood = 'neutral') {
  const theme = getTheme(role, id);
  const moodCls = MOOD_CLASS[mood] || '';
  const faceLeft = theme.facing === 'left';

  return `
    <div class="chibi-3d ${moodCls} ${faceLeft ? 'face-left' : 'face-right'}"
         style="--skin:${theme.skin};--hair:${theme.hair};--body:${theme.body};--body-dark:${theme.bodyDark};--pants:${theme.pants}">
      <div class="chibi-shadow"></div>
      <div class="chibi-model">
        <div class="chibi-prop">${theme.propEmoji}</div>
        <div class="chibi-head">
          <div class="chibi-hair-back"></div>
          <div class="chibi-face">
            <div class="chibi-eyes">
              <span class="chibi-eye"></span>
              <span class="chibi-eye"></span>
            </div>
            <span class="chibi-blush chibi-blush-l"></span>
            <span class="chibi-blush chibi-blush-r"></span>
            <span class="chibi-mouth"></span>
          </div>
          <div class="chibi-hair-front"></div>
          ${theme.prop === 'glasses' ? '<div class="chibi-glasses"></div>' : ''}
        </div>
        <div class="chibi-neck"></div>
        <div class="chibi-torso">
          <div class="chibi-collar"></div>
        </div>
        <div class="chibi-arms">
          <span class="chibi-arm chibi-arm-l"></span>
          <span class="chibi-arm chibi-arm-r"></span>
        </div>
        <div class="chibi-legs">
          <span class="chibi-leg"></span>
          <span class="chibi-leg"></span>
        </div>
      </div>
    </div>`;
}

function renderCharacter(container, role, id, mood = 'neutral') {
  if (!container) return;
  container.innerHTML = buildChibiHTML(role, id, mood);
}

function updateStageCharacters(opts = {}) {
  const {
    interviewerId = 'harin', job = 'backend',
    interviewerMood = 'neutral', playerMood = 'neutral',
    interviewerSpeaking = false, playerSpeaking = false,
  } = opts;

  const ivMood = interviewerSpeaking ? 'speaking' : interviewerMood;
  const plMood = playerSpeaking ? 'speaking' : playerMood;

  renderCharacter(document.getElementById('stageInterviewer'), 'interviewer', interviewerId, ivMood);
  renderCharacter(document.getElementById('stagePlayer'), 'player', job, plMood);

  const iv = typeof INTERVIEWERS !== 'undefined' ? INTERVIEWERS[interviewerId] : null;
  const pm = getPlayerMeta(job);

  const set = (id, t) => { const e = document.getElementById(id); if (e) e.textContent = t; };
  if (iv) set('stageInterviewerName', iv.name);
  set('stagePlayerName', pm.name);
  set('stagePlayerRole', pm.role);

  const ivInd = document.getElementById('interviewerIndicator');
  const plInd = document.getElementById('playerIndicator');
  if (ivInd) ivInd.hidden = !interviewerSpeaking;
  if (plInd) plInd.hidden = !playerSpeaking;

  document.getElementById('stageInterviewerWrap')?.classList.toggle('is-active', interviewerSpeaking);
  document.getElementById('stagePlayerWrap')?.classList.toggle('is-active', playerSpeaking);
}

function updateLobbyCharacters(interviewerId, job) {
  renderCharacter(document.getElementById('previewInterviewer'), 'interviewer', interviewerId, 'neutral');
  renderCharacter(document.getElementById('previewPlayer'), 'player', job, 'neutral');

  const iv = typeof INTERVIEWERS !== 'undefined' ? INTERVIEWERS[interviewerId] : null;
  const pm = getPlayerMeta(job);
  const set = (id, t) => { const e = document.getElementById(id); if (e) e.textContent = t; };
  if (iv) {
    set('previewInterviewerName', iv.name);
    set('previewGreeting', `"${iv.greeting}"`);
  }
  set('previewPlayerName', pm.name);
  set('previewPlayerRole', pm.role);
}

function moodFromConfidence(c) {
  if (c >= 75) return 'happy';
  if (c >= 50) return 'neutral';
  if (c >= 30) return 'nervous';
  return 'sad';
}

function moodFromRapport(r) {
  if (r >= 75) return 'happy';
  if (r >= 50) return 'neutral';
  return 'thinking';
}
