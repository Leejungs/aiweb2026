/**
 * AI 면접관 Live Demo — 랜덤 출제 · HUD · 타이머 · 업적
 */

const TOTAL_STEPS = 5;
const STORAGE_KEY = 'aiweb2026_interview_stats';
const XP_KEY = 'aiweb2026_interview_xp';

const state = {
  job: 'backend',
  interviewer: 'harin',
  mode: 'standard',
  steps: [],
  stepIndex: 0,
  picks: [],
  confidence: 70,
  rapport: 70,
  hintsLeft: 2,
  hintsUsed: 0,
  timedOut: 0,
  timerId: null,
  timerLeft: 0,
  combo: 0,
  stats: loadStats(),
  xp: loadXP(),
};

const $ = (id) => document.getElementById(id);

function loadStats() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {
      sessions: 0, bestScore: 0, streak80: 0, lastScores: [],
    };
  } catch {
    return { sessions: 0, bestScore: 0, streak80: 0, lastScores: [] };
  }
}

function saveStats(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function loadXP() {
  try {
    return JSON.parse(localStorage.getItem(XP_KEY)) || { level: 1, xp: 0 };
  } catch {
    return { level: 1, xp: 0 };
  }
}

function saveXP() {
  localStorage.setItem(XP_KEY, JSON.stringify(state.xp));
}

function xpForLevel(lv) {
  return 80 + (lv - 1) * 40;
}

function updateXPBar() {
  const need = xpForLevel(state.xp.level);
  const pct = Math.min(100, Math.round((state.xp.xp / need) * 100));
  $('xpLevel').textContent = state.xp.level;
  $('xpText').textContent = `${state.xp.xp} / ${need} XP`;
  $('xpFill').style.width = `${pct}%`;
}

function addXP(amount) {
  state.xp.xp += amount;
  let need = xpForLevel(state.xp.level);
  while (state.xp.xp >= need) {
    state.xp.xp -= need;
    state.xp.level++;
    showFloatPop(`🎉 LEVEL UP! Lv.${state.xp.level}`, true, window.innerWidth / 2, window.innerHeight / 2);
    need = xpForLevel(state.xp.level);
  }
  saveXP();
  updateXPBar();
}

function showFloatPop(text, positive, x, y) {
  const el = document.createElement('div');
  el.className = `float-pop ${positive ? 'positive' : 'negative'}`;
  el.textContent = text;
  el.style.left = `${x - 40}px`;
  el.style.top = `${y - 20}px`;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1200);
}

function updateCombo(grade) {
  const el = $('comboDisplay');
  if (grade === 'best') {
    state.combo++;
  } else {
    state.combo = 0;
  }
  if (state.combo >= 2) {
    el.classList.add('visible');
    $('comboCount').textContent = state.combo;
  } else {
    el.classList.remove('visible');
  }
}

function launchConfetti() {
  const canvas = $('confettiCanvas');
  if (!canvas) return;
  canvas.hidden = false;
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const colors = ['#f97316', '#0ea5e9', '#8b5cf6', '#22c55e', '#fbbf24', '#ec4899'];
  const pieces = Array.from({ length: 80 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height - canvas.height,
    r: 4 + Math.random() * 6,
    c: colors[Math.floor(Math.random() * colors.length)],
    vy: 2 + Math.random() * 4,
    vx: -2 + Math.random() * 4,
    rot: Math.random() * 360,
  }));
  let frame = 0;
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pieces.forEach((p) => {
      p.y += p.vy;
      p.x += p.vx;
      p.rot += 4;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rot * Math.PI) / 180);
      ctx.fillStyle = p.c;
      ctx.fillRect(-p.r / 2, -p.r / 2, p.r, p.r * 0.6);
      ctx.restore();
    });
    frame++;
    if (frame < 120) requestAnimationFrame(draw);
    else canvas.hidden = true;
  }
  draw();
}

function initParallaxTilt() {
  const room = $('room3d');
  if (!room || window.matchMedia('(pointer: coarse)').matches) return;
  room.addEventListener('mousemove', (e) => {
    const rect = room.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    room.style.transform = `rotateY(${x * 8}deg) rotateX(${-y * 5}deg)`;
  });
  room.addEventListener('mouseleave', () => {
    room.style.transform = '';
  });
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickOne(pool) {
  return pool[Math.floor(Math.random() * pool.length)];
}

function buildSession(job) {
  const exp = JOB_EXPERIENCE[job] || JOB_EXPERIENCE.backend;
  const skill = JOB_SKILL[job] || JOB_SKILL.backend;
  return [
    { ...pickOne(COMMON_INTRO), stageKey: 'intro', stageLabel: STAGE_META[0] },
    { ...pickOne(exp), stageKey: 'experience', stageLabel: STAGE_META[1] },
    { ...pickOne(COMMON_COLLAB), stageKey: 'collaboration', stageLabel: STAGE_META[2] },
    { ...pickOne(skill), stageKey: 'skill', stageLabel: STAGE_META[3] },
    { ...pickOne(COMMON_CLOSING), stageKey: 'closing', stageLabel: STAGE_META[4] },
  ];
}

function getInterviewer() {
  return INTERVIEWERS[state.interviewer];
}

function getMode() {
  return MODES[state.mode];
}

const GRADE_LABEL = { best: '좋은 선택', ok: '괜찮은 선택', poor: '아쉬운 선택' };
const GRADE_CLASS = { best: 'grade-best', ok: 'grade-ok', poor: 'grade-poor' };

function showScreen(name) {
  $('screenStart').hidden = name !== 'start';
  $('screenPlay').hidden = name !== 'play';
  $('screenEnd').hidden = name !== 'end';
}

function updateStartStats() {
  const s = state.stats;
  $('statSessions').textContent = s.sessions;
  $('statBest').textContent = s.bestScore ? `${s.bestScore}점` : '—';
  $('statStreak').textContent = s.streak80 >= 2 ? `${s.streak80}연속` : '—';
}

function renderSetupPreview() {
  const job = $('jobSelect').value;
  const ivId = $('interviewerSelect').value;
  updateLobbyCharacters(ivId, job);
}

function syncStageCharacters(extra = {}) {
  updateStageCharacters({
    interviewerId: state.interviewer,
    job: state.job,
    interviewerMood: moodFromRapport(state.rapport),
    playerMood: moodFromConfidence(state.confidence),
    ...extra,
  });
}

function updateHUD() {
  const iv = getInterviewer();
  $('hudName').textContent = iv.name;
  $('hudConfidence').style.width = `${state.confidence}%`;
  $('hudRapport').style.width = `${state.rapport}%`;
  $('hudConfidenceVal').textContent = state.confidence;
  $('hudRapportVal').textContent = state.rapport;

  const mood = state.rapport >= 75 ? '😊' : state.rapport >= 50 ? '🙂' : '😐';
  $('hudMood').textContent = mood;

  $('hintCount').textContent = state.hintsLeft;
  $('btnHint').disabled = state.hintsLeft <= 0 || $('feedbackPanel').hidden === false;

  const mode = getMode();
  if (mode.timer > 0) {
    $('timerBox').hidden = false;
    $('timerText').textContent = state.timerLeft;
    $('timerBox').classList.toggle('timer-warn', state.timerLeft <= 10);
  } else {
    $('timerBox').hidden = true;
  }

  if (!$('screenPlay').hidden) {
    syncStageCharacters();
  }

  renderCharacter($('hudAvatar'), 'interviewer', state.interviewer, moodFromRapport(state.rapport));
}

function renderStepBar() {
  $('stepBar').innerHTML = state.steps.map((st, i) => {
    const meta = st.stageLabel;
    let cls = 'step-pill';
    if (i < state.stepIndex) cls += ' done';
    if (i === state.stepIndex) cls += ' active';
    return `<span class="${cls}" title="${meta.label}">${meta.icon}</span>`;
  }).join('');
}

function stopTimer() {
  if (state.timerId) {
    clearInterval(state.timerId);
    state.timerId = null;
  }
}

function startTimer() {
  stopTimer();
  const mode = getMode();
  if (!mode.timer) return;

  state.timerLeft = mode.timer;
  updateHUD();

  state.timerId = setInterval(() => {
    state.timerLeft--;
    updateHUD();
    if (state.timerLeft <= 0) {
      stopTimer();
      autoTimeout();
    }
  }, 1000);
}

function autoTimeout() {
  state.timedOut++;
  const data = state.steps[state.stepIndex];
  const choice = data.choices.find((c) => c.grade === 'poor') || data.choices[data.choices.length - 1];
  applyChoice(choice, true);
}

function typeDialogue(text, el, cb) {
  const iv = getInterviewer();
  el.innerHTML = `<strong>${iv.name}:</strong> "<span class="type-cursor"></span>"`;
  const span = el.querySelector('.type-cursor');
  let i = 0;
  const tick = () => {
    if (i < text.length) {
      span.textContent = text.slice(0, i + 1);
      i++;
      setTimeout(tick, 16 + Math.random() * 10);
    } else if (cb) cb();
  };
  tick();
}

function renderStep() {
  stopTimer();
  const data = state.steps[state.stepIndex];
  const iv = getInterviewer();
  const meta = data.stageLabel;

  renderStepBar();
  $('stepLabel').textContent = `${state.stepIndex + 1} / ${TOTAL_STEPS} · ${meta.label}`;
  $('questionTag').textContent = data.tag;
  $('questionTag').className = `question-tag tag-${data.tag === '압박' ? 'pressure' : data.tag === '직무' ? 'skill' : 'soft'}`;

  $('storyScene').textContent = `📍 ${meta.icon} ${meta.label}`;
  $('storyNarration').textContent = data.narration.replace('면접관', iv.name);

  $('choicePanel').hidden = false;
  $('feedbackPanel').hidden = true;
  $('idealBox').hidden = true;

  $('choices').innerHTML = data.choices.map((c, i) =>
    `<button class="choice-btn" type="button" data-index="${i}">
      <span class="choice-key">${String.fromCharCode(65 + i)}</span>
      <span class="choice-text">${c.text}</span>
    </button>`
  ).join('');

  typeDialogue(data.dialogue, $('storyDialogue'), () => {
    syncStageCharacters({ interviewerSpeaking: true, playerSpeaking: false });
    $('choices').querySelectorAll('.choice-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        stopTimer();
        selectChoice(Number(btn.dataset.index));
      });
    });
    startTimer();
  });

  syncStageCharacters({ interviewerSpeaking: true, playerSpeaking: false });
  updateHUD();
}

function selectChoice(index) {
  const data = state.steps[state.stepIndex];
  applyChoice(data.choices[index], false);
}

function applyChoice(choice, fromTimeout) {
  const data = state.steps[state.stepIndex];
  const iv = getInterviewer();

  if (fromTimeout) {
    choice = { ...choice, feedback: '⏱ 시간 초과! ' + choice.feedback };
  }

  const confDelta = choice.grade === 'best' ? 8 : choice.grade === 'ok' ? 0 : -12;
  const rapportDelta = choice.grade === 'best' ? 10 : choice.grade === 'ok' ? 2 : -15;
  state.confidence = Math.max(0, Math.min(100, state.confidence + confDelta));
  state.rapport = Math.max(0, Math.min(100, state.rapport + rapportDelta));

  state.picks.push({
    step: state.stepIndex + 1,
    scene: data.stageLabel.label,
    question: data.dialogue,
    choice,
    fromTimeout,
    skills: choice.skills || {},
  });

  updateCombo(choice.grade);
  const xpGain = choice.grade === 'best' ? 25 + state.combo * 5 : choice.grade === 'ok' ? 12 : 5;
  addXP(xpGain);

  const wrap = $('stagePlayerWrap');
  if (wrap) {
    const rect = wrap.getBoundingClientRect();
    showFloatPop(
      choice.grade === 'best' ? `+${rapportDelta} 호감 ✨` : choice.grade === 'poor' ? `${confDelta} 자신감` : '+OK',
      choice.grade !== 'poor',
      rect.left + rect.width / 2,
      rect.top
    );
  }

  $('choicePanel').hidden = true;
  $('feedbackPanel').hidden = false;

  $('reactionEmoji').textContent = iv.reactions[choice.grade];
  $('feedbackHeader').className = `feedback-header ${GRADE_CLASS[choice.grade]}`;
  $('feedbackHeader').textContent = GRADE_LABEL[choice.grade];
  $('feedbackText').textContent = choice.feedback;

  if (choice.ideal) {
    $('idealBox').hidden = false;
    $('idealText').textContent = choice.ideal;
  }

  const isLast = state.stepIndex >= TOTAL_STEPS - 1;
  $('btnNext').textContent = isLast ? '📊 면접 결과 보기' : '다음 질문 →';

  syncStageCharacters({
    interviewerSpeaking: false,
    playerSpeaking: true,
    playerMood: choice.grade === 'best' ? 'happy' : choice.grade === 'poor' ? 'nervous' : 'neutral',
  });

  updateHUD();
}

function useHint() {
  if (state.hintsLeft <= 0) return;
  const data = state.steps[state.stepIndex];
  const best = data.choices.find((c) => c.grade === 'best');
  if (!best) return;

  state.hintsLeft--;
  state.hintsUsed++;
  $('hintToast').hidden = false;
  $('hintToast').textContent = `💡 힌트: ${best.ideal || best.text.slice(0, 80) + '…'}`;
  updateHUD();
}

function calcSkills() {
  const totals = { structure: 0, communication: 0, technical: 0, motivation: 0 };
  state.picks.forEach((p) => {
    Object.entries(p.skills).forEach(([k, v]) => {
      totals[k] = (totals[k] || 0) + v;
    });
  });
  const max = TOTAL_STEPS * 3;
  return Object.fromEntries(
    Object.entries(totals).map(([k, v]) => [k, Math.max(0, Math.min(100, Math.round((v / max) * 100 + 40)))])
  );
}

function showResult() {
  showScreen('end');
  stopTimer();

  const total = state.picks.reduce((s, p) => s + p.choice.score, 0);
  const maxScore = TOTAL_STEPS * 3;
  const pct = Math.round((total / maxScore) * 100);
  const bonus = Math.round((state.confidence + state.rapport) / 20);
  const finalPct = Math.min(100, pct + bonus - state.timedOut * 5);

  let grade, ending;
  if (finalPct >= 85) {
    grade = '합격 가능성 높음 🎉';
    ending = '오늘 면접, 준비가 잘 되어 있었어요. 구조적 답변과 태도 모두 좋았습니다!';
  } else if (finalPct >= 60) {
    grade = '보완 후 재도전 추천 💪';
    ending = '기본기는 있습니다. 아쉬웠던 문항만 집중 연습하면 금방 올라갈 거예요.';
  } else {
    grade = '연습 더 필요 📚';
    ending = '면접은 반복이 답입니다. STAR 형식과 모범 답변을 참고해 다시 도전해 보세요.';
  }

  const iv = getInterviewer();
  $('endDialogue').textContent = `"${ending}" — ${iv.name}`;

  renderCharacter($('resultInterviewer'), 'interviewer', state.interviewer, finalPct >= 60 ? 'happy' : 'neutral');
  renderCharacter($('resultPlayer'), 'player', state.job, finalPct >= 60 ? 'happy' : finalPct >= 40 ? 'neutral' : 'sad');

  const skills = calcSkills();
  const bestCount = state.picks.filter((p) => p.choice.grade === 'best').length;

  $('resultScore').innerHTML = `
    ${finalPct >= 75 ? '<span class="trophy-3d">🏆</span>' : ''}
    <div class="score-circle">${finalPct}<span>점</span></div>
    <p class="score-grade">${grade}</p>
    <p class="score-sub">${JOBS[state.job].icon} ${JOBS[state.job].label} · ${getMode().label} · ${bestCount}/${TOTAL_STEPS} 좋은 선택</p>`;

  if (finalPct >= 75) launchConfetti();
  addXP(Math.round(finalPct / 3));

  $('skillRadar').innerHTML = Object.entries(skills).map(([k, v]) => {
    const labels = { structure: '구조력', communication: '소통', technical: '직무', motivation: '동기' };
    return `<div class="skill-bar"><span>${labels[k]}</span><div class="skill-track"><div class="skill-fill" style="width:${v}%"></div></div><span>${v}</span></div>`;
  }).join('');

  $('resultLog').innerHTML = state.picks.map((p) => `
    <div class="log-item">
      <div class="log-head">
        <strong>${p.step}단계 · ${p.scene}</strong>
        <span class="log-badge ${GRADE_CLASS[p.choice.grade]}">${GRADE_LABEL[p.choice.grade]}</span>
      </div>
      <p class="log-q">Q: ${p.question.slice(0, 70)}…</p>
      <p>${p.choice.feedback}</p>
    </div>`).join('');

  const sessionData = {
    completed: 1,
    pct: finalPct,
    bestCount,
    mode: state.mode,
    timedOut: state.timedOut,
    hintsUsed: state.hintsUsed,
    streak80: 0,
  };

  const st = state.stats;
  st.sessions++;
  st.lastScores = [finalPct, ...(st.lastScores || [])].slice(0, 10);
  st.bestScore = Math.max(st.bestScore, finalPct);
  if (finalPct >= 80) st.streak80 = (st.streak80 || 0) + 1;
  else st.streak80 = 0;
  sessionData.streak80 = st.streak80;
  saveStats(st);

  const earned = ACHIEVEMENTS.filter((a) => a.check(sessionData));
  $('achievements').innerHTML = earned.length
    ? earned.map((a) => `<span class="badge-item">${a.icon} ${a.name}</span>`).join('')
    : '<span class="badge-item muted">다음엔 업적에 도전해 보세요!</span>';
}

function startInterview() {
  state.job = $('jobSelect').value;
  state.interviewer = $('interviewerSelect').value;
  state.mode = $('modeSelect').value;
  state.stepIndex = 0;
  state.picks = [];
  state.confidence = 70;
  state.rapport = 70;
  state.hintsUsed = 0;
  state.timedOut = 0;
  state.hintsLeft = getMode().hints;
  state.combo = 0;
  $('comboDisplay').classList.remove('visible');
  state.steps = buildSession(state.job);

  showScreen('play');
  $('hintToast').hidden = true;
  renderStep();
}

function nextStep() {
  if (state.stepIndex >= TOTAL_STEPS - 1) {
    showResult();
    return;
  }
  state.stepIndex++;
  $('hintToast').hidden = true;
  renderStep();
}

function restart() {
  stopTimer();
  showScreen('start');
  updateStartStats();
  renderSetupPreview();
}

function initSetupOptions() {
  $('jobSelect').innerHTML = Object.entries(JOBS).map(([k, v]) =>
    `<option value="${k}">${v.icon} ${v.label}</option>`
  ).join('');

  $('interviewerSelect').innerHTML = Object.entries(INTERVIEWERS).map(([k, v]) =>
    `<option value="${k}">${v.emoji} ${v.name} — ${v.role.split('·')[0]}</option>`
  ).join('');

  $('modeSelect').innerHTML = Object.entries(MODES).map(([k, v]) =>
    `<option value="${k}">${v.label}</option>`
  ).join('');

  $('modeSelect').addEventListener('change', () => {
    $('modeDesc').textContent = MODES[$('modeSelect').value].desc;
  });
  $('modeDesc').textContent = MODES.standard.desc;

  ['jobSelect', 'interviewerSelect'].forEach((id) => {
    $(id).addEventListener('change', renderSetupPreview);
  });
}
$('btnStart').addEventListener('click', startInterview);
$('btnNext').addEventListener('click', nextStep);
$('btnRestart').addEventListener('click', restart);
$('btnHint').addEventListener('click', useHint);

initSetupOptions();
renderSetupPreview();
updateStartStats();
updateXPBar();
initParallaxTilt();
