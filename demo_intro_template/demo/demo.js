/**
 * AI 면접관 Live Demo — 클라이언트 시뮬레이션
 * 실제 배포 시 GPT API + LangChain 백엔드로 교체
 */

const TOTAL_QUESTIONS = 5;

const JOB_LABELS = {
  backend: '백엔드 개발자',
  frontend: '프론트엔드 개발자',
  pm: '프로덕트 매니저',
  data: '데이터 분석가',
  marketing: '마케팅',
};

const LEVEL_LABELS = {
  junior: '신입 (0~1년)',
  mid: '경력 (2~5년)',
  senior: '시니어 (5년+)',
};

const TYPE_LABELS = {
  general: '인성 + 직무 혼합',
  technical: '기술 면접',
  behavioral: '인성 면접 (STAR)',
};

const QUESTIONS = {
  backend: {
    general: [
      '본인을 간단히 소개해 주세요. 지원 동기와 강점을 포함해 답변해 주시면 좋겠습니다.',
      '가장 기억에 남는 프로젝트 경험을 STAR(상황·과제·행동·결과) 형식으로 설명해 주세요.',
      '팀 프로젝트에서 의견 충돌이 있었을 때 어떻게 해결했나요?',
      'REST API 설계 시 가장 중요하게 생각하는 원칙은 무엇인가요?',
      '마지막으로, 우리 회사에 지원한 이유와 입사 후 기여하고 싶은 점을 말씀해 주세요.',
    ],
    technical: [
      'HTTP와 HTTPS의 차이점을 설명해 주세요.',
      '데이터베이스 인덱스가 필요한 이유와 주의할 점을 설명해 주세요.',
      '동시성 문제를 경험한 적이 있다면, 어떻게 해결했는지 설명해 주세요.',
      '마이크로서비스와 모놀리식 아키텍처의 장단점을 비교해 주세요.',
      '최근에 관심 있게 공부한 백엔드 기술이나 트렌드가 있나요?',
    ],
    behavioral: [
      '본인의 강점과 약점을 솔직하게 말씀해 주세요.',
      '실패 경험과 그로부터 배운 점을 공유해 주세요.',
      '상사나 동료와 갈등이 있었을 때 어떻게 대처했나요?',
      '업무 우선순위를 정하는 본인만의 기준이 있나요?',
      '5년 후 어떤 개발자가 되고 싶은지 말씀해 주세요.',
    ],
  },
  frontend: {
    general: [
      '프론트엔드 개발자로서 본인을 소개해 주세요.',
      '반응형 웹을 구현할 때 가장 중요하게 생각하는 점은 무엇인가요?',
      'UX를 개선한 경험이 있다면 구체적으로 설명해 주세요.',
      'React(또는 Vue)를 선택한 이유와 경험을 말씀해 주세요.',
      '우리 팀에 합류하면 어떤 기여를 할 수 있을까요?',
    ],
    technical: [
      '브라우저 렌더링 과정을 간략히 설명해 주세요.',
      'Virtual DOM의 개념과 장점을 설명해 주세요.',
      '웹 접근성(a11y)을 고려한 개발 경험이 있나요?',
      '성능 최적화를 위해 적용해 본 방법을 설명해 주세요.',
      'TypeScript를 사용하는 이유와 경험을 말씀해 주세요.',
    ],
    behavioral: [
      '디자이너와 협업할 때 중요하게 생각하는 점은?',
      '촉박한 마감 기한 속에서 어떻게 일하나요?',
      '코드 리뷰를 받을 때와 줄 때 각각 어떤 태도를 갖나요?',
      '새로운 기술을 학습하는 본인만의 방법은?',
      '프론트엔드 개발자로서 가장 중요한 역량은 무엇이라고 생각하나요?',
    ],
  },
  pm: {
    general: [
      'PM으로서 본인을 소개하고, 이 직무에 관심을 갖게 된 계기를 말씀해 주세요.',
      '성공적으로 이끈 프로젝트 경험을 공유해 주세요.',
      '이해관계자 요구사항이 충돌할 때 어떻게 조율하나요?',
      '데이터 기반 의사결정을 한 경험이 있나요?',
      '우리 제품/서비스에 대해 어떤 아이디어가 있으신가요?',
    ],
    technical: [
      'PRD(Product Requirements Document) 작성 시 포함하는 핵심 항목은?',
      'KPI와 OKR의 차이를 설명하고, 본인이 사용한 경험을 말씀해 주세요.',
      'A/B 테스트를 설계하고 분석한 경험이 있나요?',
      '애자일/스크럼 방법론을 어떻게 적용해 왔나요?',
      '우선순위를 정할 때 사용하는 프레임워크가 있나요?',
    ],
    behavioral: [
      '실패한 제품/기능 출시 경험과 배운 점은?',
      '개발팀과 갈등이 있었을 때 어떻게 해결했나요?',
      '사용자 피드백을 제품에 반영한 구체적 사례를 말씀해 주세요.',
      'PM으로서 가장 어려웠던 순간과 극복 방법은?',
      '리더십을 발휘한 경험을 STAR 형식으로 설명해 주세요.',
    ],
  },
  data: {
    general: [
      '데이터 분석가로서 본인을 소개해 주세요.',
      '분석 결과가 비즈니스 의사결정에 기여한 경험을 말씀해 주세요.',
      'SQL과 Python 중 더 자신 있는 도구와 그 이유는?',
      '데이터 품질 문제를 발견하고 해결한 경험이 있나요?',
      '우리 회사에서 어떤 데이터 분석을 하고 싶으신가요?',
    ],
    technical: [
      'A/B 테스트 결과를 통계적으로 해석하는 방법을 설명해 주세요.',
      '결측치와 이상치를 처리하는 본인만의 방법은?',
      '대시보드를 설계할 때 고려하는 UX 원칙은?',
      '머신러닝 모델을 실무에 적용한 경험이 있나요?',
      'ETL 파이프라인 구축 경험을 설명해 주세요.',
    ],
    behavioral: [
      '분석 결과가 기대와 다를 때 어떻게 대처하나요?',
      '비기술 팀원에게 분석 결과를 설명하는 방법은?',
      '데이터 윤리와 프라이버시를 어떻게 고려하나요?',
      '동시에 여러 분석 요청이 들어올 때 우선순위는?',
      '데이터 분석가로서 3년 후 목표는 무엇인가요?',
    ],
  },
  marketing: {
    general: [
      '마케터로서 본인을 소개하고, 이 분야를 선택한 이유를 말씀해 주세요.',
      '가장 성과가 좋았던 마케팅 캠페인 경험을 공유해 주세요.',
      '타겟 고객을 정의하고 접근하는 본인만의 방법은?',
      'SNS 마케팅과 퍼formance 마케팅 중 경험을 말씀해 주세요.',
      '우리 브랜드에 대해 첫인상과 마케팅 아이디어를 말씀해 주세요.',
    ],
    technical: [
      'ROAS, CPA, CTR 등 핵심 지표를 어떻게 해석하나요?',
      'GA4 또는 유사 분석 도구 사용 경험을 설명해 주세요.',
      '콘텐츠 마케팅 전략을 수립한 경험이 있나요?',
      'A/B 테스트로 광고 카피를 최적화한 경험은?',
      'CRM/이메일 마케팅 자동화 경험을 말씀해 주세요.',
    ],
    behavioral: [
      '캠페인이 기대 이하의 성과를 냈을 때 어떻게 대응했나요?',
      '예산이 제한적일 때 마케팅 우선순위를 어떻게 정하나요?',
      '크리에이티브팀과 협업할 때 중요하게 생각하는 점은?',
      '트렌드 변화에 빠르게 대응한 경험이 있나요?',
      '마케터로서 가장 중요한 역량 3가지는 무엇인가요?',
    ],
  },
};

const state = {
  job: 'backend',
  level: 'junior',
  type: 'general',
  currentQ: 0,
  answers: [],
  feedbacks: [],
  active: false,
};

const $ = (id) => document.getElementById(id);

function getQuestions() {
  return QUESTIONS[state.job][state.type];
}

function analyzeAnswer(answer, question) {
  const len = answer.trim().length;
  const hasNumber = /\d/.test(answer);
  const hasStar = /상황|과제|행동|결과|STAR|situation|task|action|result/i.test(answer);
  const hasExperience = /경험|프로젝트|팀|협업|개발|분석|캠페인|성과|결과|개선|해결/.test(answer);
  const hasMotivation = /지원|동기|관심|열정|목표|기여|성장/.test(answer);
  const isShort = len < 50;
  const isGood = len >= 100 && hasExperience;

  const strengths = [];
  const improves = [];
  const tips = [];

  if (isGood) {
    strengths.push('구체적인 경험과 맥락을 잘 전달했습니다.');
  } else if (hasExperience) {
    strengths.push('관련 경험을 언급한 점이 좋습니다.');
  } else {
    improves.push('구체적인 경험이나 사례를 추가하면 설득력이 높아집니다.');
  }

  if (hasNumber) {
    strengths.push('수치나 정량적 결과를 포함해 신뢰도가 높습니다.');
  } else {
    tips.push('가능하다면 "30% 개선", "3개월간" 같은 수치를 넣어 보세요.');
  }

  if (/STAR|상황|과제|행동|결과/.test(question) && hasStar) {
    strengths.push('STAR 형식에 맞게 구조화된 답변입니다.');
  } else if (/STAR|상황|과제|행동|결과/.test(question)) {
    improves.push('상황 → 과제 → 행동 → 결과 순서로 답변을 재구성해 보세요.');
  }

  if (/지원|동기|회사/.test(question) && hasMotivation) {
    strengths.push('지원 동기와 열정이 잘 드러납니다.');
  } else if (/지원|동기|회사/.test(question)) {
    improves.push('회사·직무와 연결된 지원 동기를 한 문장 추가하세요.');
  }

  if (isShort) {
    improves.push('답변이 다소 짧습니다. 2~3문장 더 보완하면 좋겠습니다.');
  }

  if (strengths.length === 0) {
    strengths.push('면접에 임하는 태도가 성실합니다.');
  }
  if (improves.length === 0) {
    improves.push('다음 답변에서 더 구체적인 에피소드를 하나 추가해 보세요.');
  }
  if (tips.length === 0) {
    tips.push('답변 마무리에 "그 경험을 통해 ~을 배웠습니다"로 마무리하면 인상적입니다.');
  }

  const score = Math.min(100, Math.max(40,
    50 + (isGood ? 25 : hasExperience ? 15 : 0) + (hasNumber ? 15 : 0) + (hasStar ? 10 : 0) - (isShort ? 15 : 0)
  ));

  return { strengths, improves, tips, score };
}

function addMessage(type, label, content, extraClass = '') {
  const log = $('chatLog');
  const msg = document.createElement('div');
  msg.className = `msg ${type} ${extraClass}`.trim();

  if (type === 'feedback') {
    msg.innerHTML = `
      <div class="feedback-card">
        <h4>⚡ 실시간 피드백</h4>
        ${content}
      </div>`;
  } else {
    msg.innerHTML = `
      <div class="msg-avatar">${type === 'interviewer' ? '🤖' : '👤'}</div>
      <div class="msg-bubble">
        <div class="msg-label">${label}</div>
        <div>${content}</div>
      </div>`;
  }

  log.appendChild(msg);
  log.scrollTop = log.scrollHeight;
  return msg;
}

function showTyping() {
  const log = $('chatLog');
  const el = document.createElement('div');
  el.className = 'msg interviewer';
  el.id = 'typingIndicator';
  el.innerHTML = `
    <div class="msg-avatar">🤖</div>
    <div class="msg-bubble">
      <div class="typing"><span></span><span></span><span></span></div>
    </div>`;
  log.appendChild(el);
  log.scrollTop = log.scrollHeight;
}

function hideTyping() {
  const el = $('typingIndicator');
  if (el) el.remove();
}

function updateProgress() {
  const pct = (state.currentQ / TOTAL_QUESTIONS) * 100;
  $('progressFill').style.width = `${pct}%`;
  $('progressText').textContent = `${state.currentQ} / ${TOTAL_QUESTIONS}`;
}

function askQuestion() {
  const questions = getQuestions();
  const q = questions[state.currentQ];

  showTyping();
  $('btnSubmit').disabled = true;
  $('answerInput').disabled = true;

  setTimeout(() => {
    hideTyping();
    addMessage('interviewer', 'AI 면접관', `Q${state.currentQ + 1}. ${q}`);
    $('answerInput').disabled = false;
    $('answerInput').value = '';
    $('answerInput').focus();
    $('charCount').textContent = '0자';
  }, 800 + Math.random() * 600);
}

function submitAnswer() {
  const answer = $('answerInput').value.trim();
  if (!answer || answer.length < 10) return;

  const questions = getQuestions();
  const question = questions[state.currentQ];

  addMessage('user', '나', answer.replace(/\n/g, '<br>'));

  const feedback = analyzeAnswer(answer, question);
  state.answers.push(answer);
  state.feedbacks.push(feedback);

  const fbHtml = [
    ...feedback.strengths.map(s => `<div class="feedback-item strength">✓ 강점: ${s}</div>`),
    ...feedback.improves.map(i => `<div class="feedback-item improve">△ 개선: ${i}</div>`),
    ...feedback.tips.map(t => `<div class="feedback-item tip">💡 추천: ${t}</div>`),
  ].join('');

  addMessage('feedback', '', fbHtml, 'feedback');

  state.currentQ++;
  updateProgress();

  $('answerPanel').style.display = state.currentQ >= TOTAL_QUESTIONS ? 'none' : 'block';

  if (state.currentQ >= TOTAL_QUESTIONS) {
    setTimeout(showReport, 1000);
  } else {
    setTimeout(askQuestion, 1200);
  }
}

function showReport() {
  $('session').hidden = true;
  $('report').hidden = false;

  const avgScore = Math.round(
    state.feedbacks.reduce((s, f) => s + f.score, 0) / state.feedbacks.length
  );

  let grade, gradeColor;
  if (avgScore >= 85) { grade = '우수'; }
  else if (avgScore >= 70) { grade = '양호'; }
  else if (avgScore >= 55) { grade = '보통'; }
  else { grade = '개선 필요'; }

  $('reportMeta').textContent =
    `${JOB_LABELS[state.job]} · ${LEVEL_LABELS[state.level]} · ${TYPE_LABELS[state.type]} · ${TOTAL_QUESTIONS}문항`;

  $('reportScore').innerHTML = `
    <div class="score-circle">${avgScore}</div>
    <div class="score-label">종합 점수 — ${grade}</div>
    <p style="color:var(--muted);margin:0.5rem 0 0;font-size:0.9rem">
      AI 면접관이 ${TOTAL_QUESTIONS}개 답변을 분석한 결과입니다.
    </p>`;

  const allStrengths = [...new Set(state.feedbacks.flatMap(f => f.strengths))].slice(0, 3);
  const allImproves = [...new Set(state.feedbacks.flatMap(f => f.improves))].slice(0, 3);
  const allTips = [...new Set(state.feedbacks.flatMap(f => f.tips))].slice(0, 3);

  $('reportSections').innerHTML = `
    <div class="report-section">
      <h3>💪 잘한 점</h3>
      <ul>${allStrengths.map(s => `<li>${s}</li>`).join('')}</ul>
    </div>
    <div class="report-section">
      <h3>📈 개선 포인트</h3>
      <ul>${allImproves.map(i => `<li>${i}</li>`).join('')}</ul>
    </div>
    <div class="report-section">
      <h3>💡 다음 면접 팁</h3>
      <ul>${allTips.map(t => `<li>${t}</li>`).join('')}</ul>
    </div>
    <div class="report-section">
      <h3>📝 문항별 요약</h3>
      ${state.answers.map((a, i) => `
        <p><strong>Q${i + 1}</strong> (${state.feedbacks[i].score}점): ${a.slice(0, 60)}${a.length > 60 ? '…' : ''}</p>
      `).join('')}
    </div>`;
}

function startInterview() {
  state.job = $('jobSelect').value;
  state.level = $('levelSelect').value;
  state.type = $('typeSelect').value;
  state.currentQ = 0;
  state.answers = [];
  state.feedbacks = [];
  state.active = true;

  $('welcome').hidden = true;
  $('session').hidden = false;
  $('report').hidden = true;
  $('chatLog').innerHTML = '';
  $('answerPanel').style.display = 'block';
  $('progressBox').hidden = false;

  $('jobSelect').disabled = true;
  $('levelSelect').disabled = true;
  $('typeSelect').disabled = true;
  $('btnStart').disabled = true;

  updateProgress();

  addMessage('interviewer', 'AI 면접관',
    `안녕하세요! ${JOB_LABELS[state.job]} ${LEVEL_LABELS[state.level]} 면접을 시작하겠습니다. ` +
    `총 ${TOTAL_QUESTIONS}문항이며, 답변마다 실시간 피드백을 드리겠습니다. 긴장하지 마시고 편하게 답변해 주세요.`);

  setTimeout(askQuestion, 1500);
}

function restartInterview() {
  state.active = false;
  $('welcome').hidden = false;
  $('session').hidden = true;
  $('report').hidden = true;
  $('progressBox').hidden = true;
  $('chatLog').innerHTML = '';

  $('jobSelect').disabled = false;
  $('levelSelect').disabled = false;
  $('typeSelect').disabled = false;
  $('btnStart').disabled = false;
}

$('btnStart').addEventListener('click', startInterview);
$('btnSubmit').addEventListener('click', submitAnswer);
$('btnRestart').addEventListener('click', restartInterview);

$('answerInput').addEventListener('input', () => {
  const len = $('answerInput').value.trim().length;
  $('charCount').textContent = `${len}자`;
  $('btnSubmit').disabled = len < 10;
});

$('answerInput').addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
    submitAnswer();
  }
});
