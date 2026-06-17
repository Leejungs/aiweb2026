/**
 * 설정 — 테마 · 효과음 · 면접관 TTS · 접근성
 */
const SETTINGS_KEY = 'aiweb2026_settings';

const DEFAULT_SETTINGS = {
  theme: 'auto',
  sfx: true,
  sfxVol: 0.65,
  voice: true,
  voiceRate: 0.92,
  voicePitch: 1.05,
  reducedMotion: false,
};

let settings = loadSettings();
let audioCtx = null;
let lastTickSecond = -1;

function loadSettings() {
  try {
    return { ...DEFAULT_SETTINGS, ...JSON.parse(localStorage.getItem(SETTINGS_KEY)) };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

function saveSettings() {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  applySettings();
}

function getSettings() {
  return settings;
}

function applySettings() {
  const root = document.documentElement;
  root.dataset.theme = settings.theme === 'auto' ? '' : settings.theme;
  root.dataset.reducedMotion = settings.reducedMotion ? 'true' : '';
  if (settings.theme === 'auto') root.removeAttribute('data-theme');
}

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

function playTone(freq, duration, type = 'sine', volScale = 1) {
  if (!settings.sfx) return;
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const vol = settings.sfxVol * volScale;
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(vol * 0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  } catch { /* ignore */ }
}

function playSequence(notes) {
  if (!settings.sfx) return;
  notes.forEach(([freq, dur, delay, vol], i) => {
    setTimeout(() => playTone(freq, dur, 'sine', vol ?? 1), (delay ?? i * 80));
  });
}

const SFX = {
  click: () => playTone(620, 0.06, 'sine', 0.5),
  hover: () => playTone(480, 0.04, 'sine', 0.25),
  start: () => playSequence([[392, 0.12, 0], [523, 0.12, 100], [659, 0.18, 200, 1.2]]),
  submit: () => playSequence([[440, 0.08, 0], [554, 0.12, 60]]),
  success: () => playSequence([[523, 0.1, 0], [659, 0.1, 90], [784, 0.15, 180, 1.1]]),
  ok: () => playSequence([[440, 0.1, 0], [554, 0.12, 80]]),
  fail: () => playSequence([[330, 0.15, 0], [262, 0.2, 120, 1.1]], 'sine'),
  combo: () => playSequence([[784, 0.08, 0], [988, 0.1, 70], [1175, 0.12, 140]]),
  levelUp: () => playSequence([[523, 0.1, 0], [659, 0.1, 80], [784, 0.1, 160], [1047, 0.2, 240, 1.3]]),
  tick: () => playTone(880, 0.04, 'triangle', 0.4),
  warn: () => playTone(220, 0.12, 'square', 0.35),
  result: () => playSequence([[392, 0.12, 0], [494, 0.12, 100], [587, 0.12, 200], [784, 0.25, 300, 1.2]]),
  open: () => playTone(520, 0.07, 'sine', 0.45),
  close: () => playTone(420, 0.06, 'sine', 0.35),
};

function playSfx(name) {
  if (SFX[name]) SFX[name]();
}

function stopVoice() {
  if ('speechSynthesis' in window) speechSynthesis.cancel();
}

function pickKoreanVoice() {
  if (!('speechSynthesis' in window)) return null;
  const voices = speechSynthesis.getVoices();
  return voices.find((v) => v.lang.startsWith('ko'))
    || voices.find((v) => v.lang.includes('KR'))
    || voices[0]
    || null;
}

function speakInterviewer(text, interviewerId) {
  if (!settings.voice || !('speechSynthesis' in window)) return;
  stopVoice();
  const clean = String(text).replace(/["""]/g, '').trim();
  if (!clean) return;

  const u = new SpeechSynthesisUtterance(clean);
  u.lang = 'ko-KR';
  u.rate = settings.voiceRate;
  u.pitch = settings.voicePitch;
  u.volume = Math.min(1, settings.sfxVol + 0.15);

  const voice = pickKoreanVoice();
  if (voice) u.voice = voice;

  const pitchMap = { harin: 1.1, junseo: 0.9, suyeon: 1.05 };
  if (interviewerId && pitchMap[interviewerId]) {
    u.pitch = settings.voicePitch * pitchMap[interviewerId];
  }

  speechSynthesis.speak(u);
}

function speakEnding(text) {
  speakInterviewer(text);
}

if ('speechSynthesis' in window) {
  speechSynthesis.onvoiceschanged = () => pickKoreanVoice();
}

function playTimerTick(secondsLeft) {
  if (secondsLeft === lastTickSecond) return;
  lastTickSecond = secondsLeft;
  if (secondsLeft <= 5) playSfx('warn');
  else if (secondsLeft <= 10) playSfx('tick');
}

function resetTimerTick() {
  lastTickSecond = -1;
}

function initSettingsModal() {
  const modal = document.getElementById('settingsModal');
  const backdrop = document.getElementById('settingsBackdrop');
  const btnOpen = document.getElementById('btnSettings');
  const btnClose = document.getElementById('btnSettingsClose');
  if (!modal) return;

  const bind = (id, key, parser = (v) => v) => {
    const el = document.getElementById(id);
    if (!el) return;
    const apply = () => {
      if (el.type === 'checkbox') settings[key] = el.checked;
      else if (el.type === 'range') settings[key] = parser(el.value);
      else settings[key] = parser(el.value);
      saveSettings();
      syncSettingsUI();
    };
    el.addEventListener('input', apply);
    el.addEventListener('change', apply);
  };

  bind('setTheme', 'theme');
  bind('setSfx', 'sfx');
  bind('setSfxVol', 'sfxVol', Number);
  bind('setVoice', 'voice');
  bind('setVoiceRate', 'voiceRate', Number);
  bind('setVoicePitch', 'voicePitch', Number);
  bind('setReducedMotion', 'reducedMotion');

  const open = () => {
    syncSettingsUI();
    modal.hidden = false;
    backdrop.hidden = false;
    document.body.classList.add('settings-open');
    playSfx('open');
  };
  const close = () => {
    modal.hidden = true;
    backdrop.hidden = true;
    document.body.classList.remove('settings-open');
    playSfx('close');
  };

  btnOpen?.addEventListener('click', open);
  btnClose?.addEventListener('click', close);
  backdrop?.addEventListener('click', close);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.hidden) close();
  });

  document.getElementById('btnTestSfx')?.addEventListener('click', () => playSfx('success'));
  document.getElementById('btnTestVoice')?.addEventListener('click', () => {
    speakInterviewer('안녕하세요, 오늘 면접 잘 부탁드립니다. 먼저 간단한 자기소개 부탁드릴게요.', 'harin');
  });

  syncSettingsUI();
  applySettings();
}

function syncSettingsUI() {
  const set = (id, val) => {
    const el = document.getElementById(id);
    if (!el) return;
    if (el.type === 'checkbox') el.checked = !!val;
    else el.value = val;
  };
  set('setTheme', settings.theme);
  set('setSfx', settings.sfx);
  set('setSfxVol', settings.sfxVol);
  set('setVoice', settings.voice);
  set('setVoiceRate', settings.voiceRate);
  set('setVoicePitch', settings.voicePitch);
  set('setReducedMotion', settings.reducedMotion);

  const volLabel = document.getElementById('setSfxVolLabel');
  if (volLabel) volLabel.textContent = `${Math.round(settings.sfxVol * 100)}%`;
  const rateLabel = document.getElementById('setVoiceRateLabel');
  if (rateLabel) rateLabel.textContent = `${settings.voiceRate.toFixed(2)}x`;
}

document.addEventListener('DOMContentLoaded', initSettingsModal);
applySettings();
