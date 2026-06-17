/**
 * AI 면접관 Live Demo — 5단계 이야기형 이지선다 시뮬레이션
 * LLM 없이 미리 작성된 시나리오 + 선택지별 피드백
 */

const CHARACTER = {
  name: '김하린',
  emoji: '👩‍💼',
  role: 'IT 기업 인사팀 면접관',
};

const STEPS = [
  {
    scene: '1단계 · 입장 & 자기소개',
    narration: '김하린이 메모장을 펼치며 첫 질문을 던집니다.',
    dialogue: '먼저 간단히 자기소개 부탁드릴게요. 지원 동기와 강점도 함께 말씀해 주시면 좋겠어요.',
    choices: [
      {
        text: '지원 직무와 관련 프로젝트 2건, 협업 경험, 회사에 기여할 수 있는 점을 1분 안에 정리해서 소개한다.',
        score: 3,
        grade: 'best',
        feedback: '✓ 핵심만 담은 구조적 자기소개입니다. 면접관이 다음 질문을 이어가기 좋아요.',
      },
      {
        text: '학창 시절부터 차례대로 경력을 길게 설명한다.',
        score: 1,
        grade: 'poor',
        feedback: '△ 시간이 길어지면 핵심이 흐려집니다. "직무-경험-강점" 순으로 1분 내 요약하는 연습이 필요해요.',
      },
      {
        text: '긴장해서 "잘 부탁드립니다"만 반복하고, 면접관이 다시 질문할 때까지 기다린다.',
        score: 1,
        grade: 'poor',
        feedback: '△ 자기소개는 면접의 첫인상입니다. 짧더라도 직무와 연결된 한 문장을 준비해 두세요.',
      },
    ],
  },
  {
    scene: '2단계 · 프로젝트 경험',
    narration: '김하린이 고개를 끄덕이며 관심 있는 표정으로 말을 이어갑니다.',
    dialogue: '가장 기억에 남는 프로젝트 하나만 골라서, 본인 역할과 결과를 알려주실 수 있을까요?',
    choices: [
      {
        text: 'STAR(상황-과제-행동-결과) 형식으로, 내가 맡은 역할과 수치 결과(예: 응답속도 40% 개선)를 포함해 설명한다.',
        score: 3,
        grade: 'best',
        feedback: '✓ STAR + 수치 조합은 설득력이 높습니다. "내가 무엇을 했는지"가 분명해요.',
      },
      {
        text: '팀 전체가 한 일을 중심으로 설명하고, 본인 기여는 대략적으로만 언급한다.',
        score: 2,
        grade: 'ok',
        feedback: '△ 팀 성과도 중요하지만, "그중에서 내가 한 일"을 한 문장 더 구체화하면 좋겠어요.',
      },
      {
        text: '프로젝트 이름과 사용 기술 스택만 나열한다.',
        score: 1,
        grade: 'poor',
        feedback: '△ 기술 나열만으로는 역량이 전달되지 않습니다. 문제 → 해결 → 결과 흐름을 추가하세요.',
      },
    ],
  },
  {
    scene: '3단계 · 협업 & 갈등',
    narration: '김하린이 펜을 들고 눈을 맞춥니다. 인성 면접의 핵심 질문입니다.',
    dialogue: '팀에서 의견이 충돌했던 경험이 있다면, 어떻게 해결했는지 말씀해 주세요.',
    choices: [
      {
        text: '상황을 설명하고, 상대 입장을 먼저 들은 뒤 데이터·근거로 합의점을 찾은 과정을 구체적으로 말한다.',
        score: 3,
        grade: 'best',
        feedback: '✓ 감정보다 과정과 결과를 말한 점이 좋습니다. 협업 역량이 잘 드러나요.',
      },
      {
        text: '팀장이나 선배가 중재해 줘서 해결됐다고만 말한다.',
        score: 1,
        grade: 'poor',
        feedback: '△ 본인의 행동이 빠져 있습니다. "내가 먼저 시도한 것"을 한 가지 넣어 보세요.',
      },
      {
        text: '갈등 경험이 없다고 단정 짓고 넘어간다.',
        score: 2,
        grade: 'ok',
        feedback: '△ 없다면 "의견 차이를 조율한 경험"으로 바꿔 답하는 것도 방법입니다.',
      },
    ],
  },
  {
    scene: '4단계 · 직무 역량',
    narration: '김하린이 노트북 화면을 잠깐 보더니, 직무 관련 질문을 던집니다.',
    dialogue: '실무에서 API를 설계할 때, 가장 먼저 챙기는 원칙이 있나요?',
    choices: [
      {
        text: '일관된 REST 규약, 에러 처리, 보안(인증·입력 검증), 문서화를 우선한다고 설명한다.',
        score: 3,
        grade: 'best',
        feedback: '✓ 기술 + 운영 관점이 균형 잡혀 있습니다. 실무 감각이 느껴져요.',
      },
      {
        text: '빠르게 기능부터 만들고, 나중에 리팩토링한다고 답한다.',
        score: 1,
        grade: 'poor',
        feedback: '△ 속도만 강조하면 유지보수 리스크가 커 보입니다. 품질 기준을 한 가지 추가하세요.',
      },
      {
        text: 'REST가 뭔지만 설명하고, 본인 경험과 연결하지 않는다.',
        score: 2,
        grade: 'ok',
        feedback: '△ 개념 설명도 좋지만, "내가 적용해 본 예시"를 붙이면 훨씬 설득력 있어요.',
      },
    ],
  },
  {
    scene: '5단계 · 마무리',
    narration: '김하린이 미소를 지으며 마지막 질문을 합니다. 거의 다 왔습니다.',
    dialogue: '마지막으로, 우리 회사에 지원한 이유와 입사 후 기여하고 싶은 점을 들려주세요.',
    choices: [
      {
        text: '회사 제품·미션과 본인 경험을 연결하고, 6개월·1년 목표를 구체적으로 말한다.',
        score: 3,
        grade: 'best',
        feedback: '✓ 지원 동기와 기여 의지가 명확합니다. 마무리가 인상적이에요.',
      },
      {
        text: '연봉·복지·워라밸이 좋아서 지원했다고 솔직하게 말한다.',
        score: 1,
        grade: 'poor',
        feedback: '△ 복지도 중요하지만, 면접에서는 "일하고 싶은 이유"를 직무·성장 중심으로 말하는 게 좋아요.',
      },
      {
        text: '열심히 하겠다는 말만 반복한다.',
        score: 2,
        grade: 'ok',
        feedback: '△ 의지는 좋지만, "무엇을, 어떻게" 기여할지 한 문장을 더하면 완성도가 올라갑니다.',
      },
    ],
  },
];

const ENDINGS = {
  high: '오늘 면접, 전반적으로 준비가 잘 되어 있었어요. 특히 구체적인 경험과 구조적인 답변이 인상적이었습니다. 다음 단계에서 뵐 수 있으면 좋겠네요!',
  mid: '기본기는 갖추고 계세요. 몇 가지 답변에서 본인 경험을 더 구체화하면 훨씬 좋아질 거예요. 한 번 더 연습해 보시길 추천드립니다.',
  low: '면접은 연습할수록 좋아집니다. STAR 형식과 "내가 한 일" 중심으로 답변을 정리해 보세요. 다음에 또 도전해 주세요!',
};

const GRADE_LABEL = { best: '좋은 선택', ok: '괜찮은 선택', poor: '아쉬운 선택' };
const GRADE_CLASS = { best: 'grade-best', ok: 'grade-ok', poor: 'grade-poor' };
const MAX_SCORE = STEPS.length * 3;

const state = { step: 0, picks: [] };

const $ = (id) => document.getElementById(id);

function renderStepBar() {
  $('stepBar').innerHTML = STEPS.map((_, i) =>
    `<span class="step-dot${i < state.step ? ' done' : ''}${i === state.step ? ' active' : ''}"></span>`
  ).join('');
}

function showScreen(name) {
  $('screenStart').hidden = name !== 'start';
  $('screenPlay').hidden = name !== 'play';
  $('screenEnd').hidden = name !== 'end';
}

function renderStep() {
  const data = STEPS[state.step];
  renderStepBar();

  $('stepLabel').textContent = `${state.step + 1} / ${STEPS.length} 단계`;
  $('storyScene').textContent = `📍 ${data.scene}`;
  $('storyNarration').textContent = data.narration;
  $('storyDialogue').innerHTML = `<strong>${CHARACTER.name}:</strong> "${data.dialogue}"`;

  $('choicePanel').hidden = false;
  $('feedbackPanel').hidden = true;

  $('choices').innerHTML = data.choices.map((c, i) =>
    `<button class="choice-btn" type="button" data-index="${i}">${c.text}</button>`
  ).join('');

  $('choices').querySelectorAll('.choice-btn').forEach((btn) => {
    btn.addEventListener('click', () => selectChoice(Number(btn.dataset.index)));
  });
}

function selectChoice(index) {
  const data = STEPS[state.step];
  const choice = data.choices[index];

  state.picks.push({ step: state.step + 1, choice, scene: data.scene });

  $('choicePanel').hidden = true;
  $('feedbackPanel').hidden = false;

  $('feedbackHeader').className = `feedback-header ${GRADE_CLASS[choice.grade]}`;
  $('feedbackHeader').textContent = GRADE_LABEL[choice.grade];
  $('feedbackText').textContent = choice.feedback;

  const isLast = state.step >= STEPS.length - 1;
  $('btnNext').textContent = isLast ? '면접 결과 보기 →' : '다음 단계 →';
}

function showResult() {
  showScreen('end');

  const total = state.picks.reduce((s, p) => s + p.choice.score, 0);
  const pct = Math.round((total / MAX_SCORE) * 100);

  let ending, grade;
  if (pct >= 80) { ending = ENDINGS.high; grade = '합격 가능성 높음'; }
  else if (pct >= 55) { ending = ENDINGS.mid; grade = '보완 후 재도전 추천'; }
  else { ending = ENDINGS.low; grade = '연습 필요'; }

  $('endDialogue').textContent = `"${ending}" — ${CHARACTER.name} 면접관`;

  $('resultScore').innerHTML = `
    <div class="score-circle">${pct}<span>점</span></div>
    <p class="score-grade">${grade}</p>
    <p class="score-sub">${state.picks.filter(p => p.choice.grade === 'best').length}개 좋은 선택 · ${STEPS.length}단계 완료</p>`;

  $('resultSummary').innerHTML = `
    <h3>📋 선택 요약</h3>
    <ul>${state.picks.map(p =>
      `<li><strong>${p.step}단계</strong> — ${GRADE_LABEL[p.choice.grade]} (${p.choice.score}점)</li>`
    ).join('')}</ul>`;

  $('resultLog').innerHTML = `
    <h3>💡 단계별 피드백</h3>
    ${state.picks.map(p => `
      <div class="log-item">
        <strong>${p.scene}</strong>
        <p>${p.choice.feedback}</p>
      </div>`).join('')}`;
}

function startStory() {
  state.step = 0;
  state.picks = [];
  showScreen('play');
  renderStep();
}

function nextStep() {
  if (state.step >= STEPS.length - 1) {
    showResult();
    return;
  }
  state.step++;
  renderStep();
}

function restart() {
  state.step = 0;
  state.picks = [];
  showScreen('start');
}

$('btnStart').addEventListener('click', startStory);
$('btnNext').addEventListener('click', nextStep);
$('btnRestart').addEventListener('click', restart);
