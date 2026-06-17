/**
 * AI 면접관 — 질문 풀 · 면접관 · 모드 설정
 * 매 세션마다 단계별 랜덤 출제
 */

const INTERVIEWERS = {
  harin: {
    id: 'harin',
    name: '김하린',
    emoji: '👩‍💼',
    role: '인사팀 면접관 · 5년차',
    style: 'friendly',
    greeting: '편하게 대화하듯 진행할게요. 솔직하게 답해 주세요!',
    reactions: { best: '😊', ok: '🙂', poor: '😐' },
  },
  junseo: {
    id: 'junseo',
    name: '박준서',
    emoji: '👨‍💻',
    role: '개발팀 테크리드 · 8년차',
    style: 'strict',
    greeting: '기술과 경험 위주로 깊게 질문드리겠습니다. 준비됐나요?',
    reactions: { best: '🤔✨', ok: '🧐', poor: '😶' },
  },
  suyeon: {
    id: 'suyeon',
    name: '이수연',
    emoji: '🎯',
    role: 'PM · 프로덕트 리드 · 6년차',
    style: 'logic',
    greeting: '답변의 논리와 데이터 근거를 중심으로 보겠습니다.',
    reactions: { best: '👏', ok: '📝', poor: '💭' },
  },
};

const MODES = {
  practice: { id: 'practice', label: '🌱 연습 모드', timer: 0, hints: 99, desc: '시간 제한 없음 · 힌트 무제한' },
  standard: { id: 'standard', label: '⚡ 실전 모드', timer: 50, hints: 2, desc: '문항당 50초 · 힌트 2회' },
  pressure: { id: 'pressure', label: '🔥 압박 모드', timer: 25, hints: 0, desc: '문항당 25초 · 힌트 없음' },
};

const JOBS = {
  backend: { label: '백엔드 개발', icon: '⚙️' },
  frontend: { label: '프론트엔드', icon: '🎨' },
  pm: { label: '프로덕트 매니저', icon: '📊' },
  data: { label: '데이터 분석', icon: '📈' },
  marketing: { label: '마케팅', icon: '📣' },
};

const STAGE_META = [
  { key: 'intro', label: '입장 & 자기소개', icon: '🚪' },
  { key: 'experience', label: '경험 & 프로젝트', icon: '💼' },
  { key: 'collaboration', label: '협업 & 갈등', icon: '🤝' },
  { key: 'skill', label: '직무 역량', icon: '🎯' },
  { key: 'closing', label: '마무리 & 역질문', icon: '🏁' },
];

/* 공통 선택지 템플릿 헬퍼 */
function c(best, ok, poor, ideal) {
  return [
    { text: best.t, score: 3, grade: 'best', feedback: best.f, skills: best.s || { structure: 2, communication: 2, technical: 1, motivation: 1 } },
    { text: ok.t, score: 2, grade: 'ok', feedback: ok.f, skills: ok.s || { structure: 1, communication: 1, technical: 0, motivation: 0 } },
    { text: poor.t, score: 1, grade: 'poor', feedback: poor.f, skills: poor.s || { structure: 0, communication: 0, technical: 0, motivation: -1 } },
  ].map((ch, i) => ({ ...ch, ideal: i === 0 ? ideal : null }));
}

const COMMON_INTRO = [
  {
    id: 'intro-1', tag: '인성',
    narration: '면접관이 미소를 지으며 첫 질문을 던집니다.',
    dialogue: '먼저 1분 안에 자기소개 부탁드릴게요. 지원 동기와 강점도 함께요.',
    choices: c(
      { t: '직무-핵심경험 2건-강점-지원동기 순으로 1분 내 요약한다.', f: '✓ 구조가 명확합니다. 면접관이 바로 꼬리 질문을 이어가기 좋아요.' },
      { t: '학창 시절부터 경력을 시간순으로 길게 설명한다.', f: '△ 핵심이 뒤로 밀립니다. "지금 지원 직무와 연결"을 앞에 두세요.' },
      { t: '긴장해서 "잘 부탁드립니다"만 반복한다.', f: '△ 첫 30초가 인상을 좌우합니다. 짧게라도 직무 연결 한 문장을 준비하세요.' },
      '저는 [직무] 경험 N년, [프로젝트]에서 [성과]를 냈고, [강점]으로 팀에 기여하고 싶습니다.'
    ),
  },
  {
    id: 'intro-2', tag: '인성',
    narration: '면접관이 이력서를 보며 고개를 끄덕입니다.',
    dialogue: '이력서에 적힌 것 말고, 본인만의 강점을 한 가지만 꼽는다면?',
    choices: c(
      { t: '직무와 연결된 강점 + 구체적 사례 1건을 30초 안에 말한다.', f: '✓ "강점 + 증거" 조합이 설득력 있습니다.' },
      { t: '성실함, 책임감 같은 추상적 단어만 나열한다.', f: '△ 추상어는 누구나 씁니다. "언제 어떻게 발휘했는지" 사례를 붙이세요.' },
      { t: '강점이 없다고 겸손하게 말한다.', f: '△ 겸손도 좋지만, 면접에서는 차별화 포인트를 분명히 말하는 게 유리합니다.' },
      '저의 강점은 ○○인데, [프로젝트]에서 [구체적 행동]으로 [결과]를 만들었습니다.'
    ),
  },
  {
    id: 'intro-3', tag: '압박',
    narration: '면접관이 잠깐 침묵한 뒤, 날카롭게 묻습니다.',
    dialogue: '솔직히 말씀해 주세요. 다른 지원자 대비 본인의 차별점은 무엇인가요?',
    choices: c(
      { t: '본인만의 경험·스킬 조합과 검증된 결과를 구체적으로 제시한다.', f: '✓ 비교 우위를 근거와 함께 말한 점이 좋습니다.' },
      { t: '"열정이 다릅니다"라고만 답한다.', f: '△ 열정만으로는 차별화가 어렵습니다. 숫자·포트폴리오·수상 등 근거를 넣으세요.' },
      { t: '다른 지원자를 모른다며 회피한다.', f: '△ 회피보다 "제가 특히 잘하는 것"을 직무 관점에서 말하세요.' },
      '저는 ○○와 △△를 모두 경험했고, [수치/결과]로 검증된 점이 다릅니다.'
    ),
  },
  {
    id: 'intro-4', tag: '인성',
    narration: '면접관이 펜을 듭니다.',
    dialogue: '왜 이 직무를 선택했고, 앞으로 3년간 어떤 전문가가 되고 싶나요?',
    choices: c(
      { t: '전환 계기 → 학습·경험 → 3년 목표를 일관된 스토리로 연결한다.', f: '✓ 커리어 내러티브가 분명합니다. 장기 비전이 느껴져요.' },
      { t: '연봉·안정성이 좋아서라고 솔직히 말한다.', f: '△ 솔직함은 좋지만, 성장·기여 관점을 함께 말하는 게 안전합니다.' },
      { t: '아직 잘 모르겠다고 답한다.', f: '△ "탐색 중"이라도 1년·3년 목표 초안은 준비해 두세요.' },
      '○○ 계기로 이 직무를 선택했고, 3년 안에 [구체적 역할/역량] 전문가가 되겠습니다.'
    ),
  },
  {
    id: 'intro-5', tag: '인성',
    narration: '면접관이 커피를 한 모금 마십니다.',
    dialogue: '주변에서 본인을 세 단어로 표현한다면, 동료들은 뭐라고 할까요?',
    choices: c(
      { t: '직무와 연결된 3키워드 + 각각 짧은 근거를 붙인다.', f: '✓ 자기 인식과 타인 평가를 연결한 답변입니다.' },
      { t: '착하다, 성실하다, 열심히 한다.', f: '△ 만능형 답변입니다. "협업·문제해결·주도성" 등 직무 키워드로 바꿔 보세요.' },
      { t: '모르겠다고 웃으며 넘긴다.', f: '△ 면접 전 동료·멘토에게 피드백 받아 두면 좋은 질문입니다.' },
      '○○, △△, □□ — 각각 [상황]에서 동료가 그렇게 평가했습니다.'
    ),
  },
  {
    id: 'intro-6', tag: '압박',
    narration: '면접관이 이력서의 공백 기간을 가리킵니다.',
    dialogue: '이 기간 동안 무엇을 했는지, 공백을 어떻게 설명하시겠어요?',
    choices: c(
      { t: '학습·자격증·프로젝트·성찰 등 생산적 활동을 구체적으로 설명한다.', f: '✓ 공백을 성장 기간으로 재프레이밍했습니다.' },
      { t: '쉬었습니다, 라고만 말한다.', f: '△ 그 기간에 읽은 책·온라인 강의·개인 프로젝트라도 언급하세요.' },
      { t: '사적인 이유라며 말하지 않겠다고 한다.', f: '△ 최소한 "역량 유지를 위해 ○○했다" 한 줄은 필요합니다.' },
      '공백 기간에 [학습/프로젝트]로 [역량]을 강화했고, 지금은 [직무]에 바로 기여할 준비가 됐습니다.'
    ),
  },
];

const COMMON_COLLAB = [
  {
    id: 'collab-1', tag: '인성',
    narration: '면접관의 눈빛이 진지해집니다.',
    dialogue: '팀에서 의견이 충돌했을 때, 본인은 어떻게 해결했나요?',
    choices: c(
      { t: '상황 → 내 행동 → 상대 입장 수렴 → 결과 순으로 STAR 답변.', f: '✓ 본인 주도적 행동이 드러납니다.' },
      { t: '팀장이 중재해 줬다고만 말한다.', f: '△ "내가 먼저 시도한 것"을 반드시 포함하세요.' },
      { t: '갈등 경험이 없다고 한다.', f: '△ "의견 차이 조율" 경험으로 바꿔 답할 수 있습니다.' },
      '의견 차이 상황에서 먼저 ○○했고, △△로 합의해 [결과]를 냈습니다.'
    ),
  },
  {
    id: 'collab-2', tag: '인성',
    narration: '면접관이 고개를 기울입니다.',
    dialogue: '마감이 촉박한데 팀원이 일을 늦게 끝낸 적 있나요? 어떻게 대처했나요?',
    choices: c(
      { t: '먼저 원인 파악 → 역할 재분배 or 본인이 보완 → 사후 회고까지 설명.', f: '✓ 문제 해결 + 팀워크 균형이 좋습니다.' },
      { t: '혼자 다 했다고 강조한다.', f: '△ 협업 질문에 "혼자"만 강조하면 팀플레이어 이미지가 약해집니다.' },
      { t: '불만만 털어놓는다.', f: '△ 불만보다 건설적 행동과 배운 점을 말하세요.' },
      '일정 리스크를 미리 공유하고, [구체적 조치]로 마감을 지켰습니다.'
    ),
  },
  {
    id: 'collab-3', tag: '인성',
    narration: '면접관이 메모를 적습니다.',
    dialogue: '받은 피드백 중 가장 기억에 남는 것과, 그 후 어떻게 바꿨나요?',
    choices: c(
      { t: '피드백 내용 → 반성 → 구체적 변화 → 결과를 연결한다.', f: '✓ 성장 마인드셋이 잘 보입니다.' },
      { t: '피드백을 잘 받지 않는 편이라고 솔직히 말한다.', f: '△ 수용성은 중요한 평가 요소입니다. 긍정적 사례로 답하세요.' },
      { t: '기억나는 피드백이 없다고 한다.', f: '△ 코드리뷰·멘토링·수업 피드백 중 하나를 골라 준비하세요.' },
      '[피드백]을 받고 [행동 변화]를 해 [개선 결과]를 만들었습니다.'
    ),
  },
  {
    id: 'collab-4', tag: '압박',
    narration: '면접관이 팔짱을 낀 채 묻습니다.',
    dialogue: '상사의 결정이 마음에 들지 않을 때, 어떻게 행동하나요?',
    choices: c(
      { t: '근거를 정리해 건설적으로 의견 제시 → 결정 존중 → 실행.', f: '✓ 프로페셔널한 태도입니다.' },
      { t: '무조건 따른다고만 답한다.', f: '△ 맹목적 순응보다 "의견 제시 후 협력"이 더 좋은 인상입니다.' },
      { t: '비공식적으로 불만을 털어놓는다.', f: '△ 조직 내 신뢰를 해칠 수 있는 답변입니다.' },
      '데이터·근거로 한 번 의견을 냈고, 최종 결정 후엔 팀 목표에 맞게 실행했습니다.'
    ),
  },
  {
    id: 'collab-5', tag: '인성',
    narration: '면접관이 부드럽게 묻습니다.',
    dialogue: '다른 부서·직군과 협업할 때 어려웠던 점과 해결법은?',
    choices: c(
      { t: '용어·목표 차이 → 공통 KPI 정의 → 정기 sync 등 구체적 방법.', f: '✓ 크로스펑셔널 협업 역량이 보입니다.' },
      { t: '협업은 항상 어렵다고만 말한다.', f: '△ 어려움 + 해결책 세트로 답하세요.' },
      { t: '협업 경험이 없다고 한다.', f: '△ 수업·동아리·프로젝트 협업도 경험으로 인정됩니다.' },
      '부서 간 목표를 [방법]으로 맞추고, [결과]를 냈습니다.'
    ),
  },
  {
    id: 'collab-6', tag: '인성',
    narration: '면접관이 미소 짓습니다.',
    dialogue: '팀 분위기를 좋게 만든 본인의 기여가 있었나요?',
    choices: c(
      { t: '구체적 행동(멘토링, 문서화, 회고 주도 등) + 팀 반응.', f: '✓ 리더십·팔로워십 모두 어필됩니다.' },
      { t: '분위기 메이커 역할을 한다고만 말한다.', f: '△ "무엇을 했는지" 행동으로 보여주세요.' },
      { t: '본인은 조용한 편이라 기여 없다고 한다.', f: '△ 작은 기여(일정 공유, 버그 제보)도 충분합니다.' },
      '[행동]으로 팀 커뮤니케이션을 개선해 [결과]가 나았습니다.'
    ),
  },
];

const COMMON_CLOSING = [
  {
    id: 'close-1', tag: '마무리',
    narration: '면접관이 시계를 glance합니다. 마지막 질문입니다.',
    dialogue: '우리 회사에 지원한 이유와, 입사 후 6개월·1년 목표를 말씀해 주세요.',
    choices: c(
      { t: '회사 미션·제품과 본인 경험 연결 + 구체적 기여 목표.', f: '✓ 지원 동기와 실행 계획이 명확합니다.' },
      { t: '복지·연봉이 좋아서라고 말한다.', f: '△ 복지는 부수적 이유로, 성장·기여를 중심에 두세요.' },
      { t: '열심히 하겠다만 반복한다.', f: '△ "무엇을, 어떻게" 한 문장을 더하세요.' },
      '귀사 [제품/미션]에 [경험]으로 기여하고, 6개월 내 [목표], 1년 내 [목표]를 달성하겠습니다.'
    ),
  },
  {
    id: 'close-2', tag: '마무리',
    narration: '면접관이 고개를 끄덕이며 묻습니다.',
    dialogue: '마지막으로, 저희에게 궁금한 점 있으신가요?',
    choices: c(
      { t: '팀 문화·성장 기회·온보딩 등 준비한 역질문 1~2개를 한다.', f: '✓ 관심과 준비도가 느껴집니다. 좋은 마무리!' },
      { t: '없습니다, 라고 한다.', f: '△ "없음"은 관심 부족으로 보일 수 있습니다. 1개는 준비하세요.' },
      { t: '연봉·퇴근 시간만 묻는다.', f: '△ 처음 면접에선 성장·역할·팀 질문이 더 적합합니다.' },
      '신입/주니어의 성장 경로와, 입사 후 첫 3개월 기대 역할이 궁금합니다.'
    ),
  },
  {
    id: 'close-3', tag: '마무리',
    narration: '면접관이 진지한 표정으로 묻습니다.',
    dialogue: '다른 회사 offer와 비교한다면, 저희를 선택할 이유는?',
    choices: c(
      { t: '회사·직무·성장 fit을 구체적 근거와 함께 설명.', f: '✓ 선택 이유가 설득력 있습니다.' },
      { t: '아직 다른 곳 결과 안 나왔다고만 한다.', f: '△ "이 회사에 끌리는 이유"는 미리 정리해 두세요.' },
      { t: '연봉이 제일 높으면 온다고 말한다.', f: '△ fit과 성장 narrative가 더 중요합니다.' },
      '[제품/팀/문화]가 제 [강점/목표]와 맞아 최우선 선택지입니다.'
    ),
  },
  {
    id: 'close-4', tag: '압박',
    narration: '면접관이 날카롭게 묻습니다.',
    dialogue: '솔직히, 본인의 약점 하나와 극복 노력을 말해 주세요.',
    choices: c(
      { t: '실제 약점 + 인식 계기 + 구체적 개선 행동 + 진행 상황.', f: '✓ 자기 인식과 성장 의지가 균형 잡혔습니다.' },
      { t: '완벽주의가 약점이라며 사실은 칭찬으로 돌린다.', f: '△ 클리셰입니다. 진짜 약점 + 개선 노력이 더 신뢰됩니다.' },
      { t: '약점이 없다고 한다.', f: '△ 약점 인식과 개선 의지는 필수 질문입니다.' },
      '[약점]을 인식하고, [행동]으로 개선 중이며 [변화]가 보입니다.'
    ),
  },
  {
    id: 'close-5', tag: '마무리',
    narration: '면접관이 일어서며 악수를 청합니다.',
    dialogue: '오늘 면접 중 가장 잘했다고 생각하는 답변과, 아쉬웠던 점은?',
    choices: c(
      { t: '구체적 문항을 짚고, 아쉬운 점 + 보완 계획까지 말한다.', f: '✓ 자기 성찰 능력이 돋보입니다.' },
      { t: '다 잘했다고만 말한다.', f: '△ 겸손한 성찰이 더 좋은 인상을 줍니다.' },
      { t: '다 망했다고 과하게 부정한다.', f: '△ 균형 잡힌 자기 평가가 좋습니다.' },
      '[문항]에서 [강점]을 보였고, [문항]은 [보완]이 필요해 연습하겠습니다.'
    ),
  },
  {
    id: 'close-6', tag: '마무리',
    narration: '면접관이 미소 지으며 묻습니다.',
    dialogue: '입사하면 가장 먼저 하고 싶은 일은 무엇인가요?',
    choices: c(
      { t: '온보딩 → 팀 이해 → 단기 기여 목표를 30·60·90일로 설명.', f: '✓ 실행력 있는 입사 후 계획입니다.' },
      { t: '적응부터 하겠다고만 말한다.', f: '△ "적응 + 기여" 둘 다 말하면 더 좋습니다.' },
      { t: '잘 모르겠다고 한다.', f: '△ JD와 팀 정보를 바탕으로 1개라도 준비하세요.' },
      '첫 30일은 [학습], 60일은 [기여], 90일은 [성과] 목표로 임하겠습니다.'
    ),
  },
];

const JOB_EXPERIENCE = {
  backend: [
    { id: 'be-exp-1', tag: '직무', narration: '테크리드 표정으로 고개를 끄덕입니다.', dialogue: '백엔드에서 가장 어려웠던 장애/버그 경험과 해결 과정을 알려주세요.',
      choices: c({ t: '장애 규모·원인 분석·내 조치·재발 방지까지 STAR+수치.', f: '✓ 장애 대응 역량과 시스템 사고가 보입니다.' }, { t: '버그 고쳤다고만 말한다.', f: '△ 규모·원인·영향·재발 방지를 추가하세요.' }, { t: '장애 경험이 없다고 한다.', f: '△ 팀 프로젝트·개인 서버 경험도 OK입니다.' }, '트래픽 급증 시 [원인]을 [도구]로 찾아 [조치]해 다운타임 N분으로 줄였습니다.') },
    { id: 'be-exp-2', tag: '직무', narration: '면접관이 아키텍처 화이트보드를 가리킵니다.', dialogue: 'DB 설계나 쿼리 최적화로 성과를 낸 경험이 있나요?',
      choices: c({ t: 'Before/After 쿼리·인덱스·응답 시간 수치 포함.', f: '✓ 성능 개선을 정량화했습니다.' }, { t: '인덱스 썼다고만 말한다.', f: '△ 어떤 쿼리, 몇 ms→몇 ms인지 구체화하세요.' }, { t: 'DB는 잘 모른다고 한다.', f: '△ 학습 중이라도 시도한 경험을 말하세요.' }, 'N+1 문제를 [방법]으로 해결해 API 응답 800ms→120ms로 개선했습니다.') },
    { id: 'be-exp-3', tag: '직무', narration: '면접관이 API 문서를 펼칩니다.', dialogue: 'REST API를 처음부터 설계해 본 경험이 있다면 설명해 주세요.',
      choices: c({ t: '리소스 설계·버저닝·에러 규약·인증·문서화까지.', f: '✓ API 설계 전반을 이해하고 있습니다.' }, { t: 'CRUD만 만들었다고 한다.', f: '△ 에러 처리·보안·문서화도 언급하세요.' }, { t: 'API 경험 없다고 한다.', f: '△ side project라도 설계 경험을 준비하세요.' }, '리소스 [설계], OpenAPI 문서, JWT 인증, 표준 에러 코드를 적용했습니다.') },
    { id: 'be-exp-4', tag: '직무', narration: '면접관이 Docker 로고 스티커를 보며 묻습니다.', dialogue: '배포·CI/CD 파이프라인을 구축하거나 개선한 경험이 있나요?',
      choices: c({ t: '파이프라인 단계·자동화·배포 시간 단축 수치.', f: '✓ DevOps 감각이 있습니다.' }, { t: 'Docker 써봤다고만 한다.', f: '△ CI/CD 흐름과 본인 기여를 설명하세요.' }, { t: '배포는 다른 사람이 한다고 한다.', f: '△ 학습·참관 경험도 어필 가능합니다.' }, 'GitHub Actions로 [단계] 자동화, 배포 시간 40분→8분으로 단축했습니다.') },
    { id: 'be-exp-5', tag: '압박', narration: '면접관이 눈썹을 치켜올립니다.', dialogue: '레거시 코드를 리팩토링해야 할 때, 어디부터 손대나요?',
      choices: c({ t: '테스트·모니터링 확보 → 핫스팟 식별 → 점진적 리팩토링.', f: '✓ 안전한 리팩토링 접근법입니다.' }, { t: '전부 새로 짠다고 한다.', f: '△ 빅뱅 리팩토링은 리스크가 큽니다.' }, { t: '리팩토링 경험 없다고 한다.', f: '△ 작은 모듈 분리 경험도 OK입니다.' }, '커버리지·로그로 병목 찾고, [모듈]부터 테스트 추가 후 분리했습니다.') },
  ],
  frontend: [
    { id: 'fe-exp-1', tag: '직무', narration: '면접관이 모바일 목업을 보여줍니다.', dialogue: '반응형·접근성을 고려해 UI를 개선한 경험이 있나요?',
      choices: c({ t: '문제·접근성 기준·구현·측정(Lighthouse 등).', f: '✓ UX 품질 의식이 높습니다.' }, { t: '반응형은 media query 썼다고만.', f: '△ a11y·성능 지표도 함께 말하세요.' }, { t: '디자인은 디자이너 몫이라고 한다.', f: '△ FE도 a11y·반응형 책임이 있습니다.' }, '키보드 내비·ARIA 적용으로 Lighthouse a11y 62→98 올렸습니다.') },
    { id: 'fe-exp-2', tag: '직무', narration: '면접관이 React 로고를 가리킵니다.', dialogue: '상태 관리를 어떻게 선택하고, 실제 프로젝트에 적용했나요?',
      choices: c({ t: '선택 기준(규모·팀·복잡도) + 적용 사례.', f: '✓ 기술 선택에 trade-off 사고가 있습니다.' }, { t: 'Redux만 써봤다고 한다.', f: '△ 왜 그 도구인지 이유를 설명하세요.' }, { t: 'useState만 썼다고 한다.', f: '△ 규모 커질 때 전략도 언급하세요.' }, '서버 상태는 TanStack Query, UI 상태는 Zustand로 분리했습니다.') },
    { id: 'fe-exp-3', tag: '직무', narration: '면접관이 느린 페이지 스크린샷을 보여줍니다.', dialogue: '프론트엔드 성능 병목을 찾고 개선한 경험을 말해 주세요.',
      choices: c({ t: 'DevTools·번들 분석·lazy load·이미지 최적화 + 수치.', f: '✓ 성능 최적화 경험이 구체적입니다.' }, { t: '코드 스플리팅 들어봤다고만.', f: '△ 실제 적용 사례와 수치를 넣으세요.' }, { t: '성능은 백엔드 문제라고 한다.', f: '△ FE도 LCP·CLS 등 개선 여지가 많습니다.' }, '번들 1.2MB→400KB, LCP 4.2s→1.8s로 개선했습니다.') },
    { id: 'fe-exp-4', tag: '직무', narration: '면접관이 Figma 화면을 가리킵니다.', dialogue: '디자이너와 협업할 때, 구현 과정에서 이슈를 어떻게 해결했나요?',
      choices: c({ t: '디자인-개발 gap → 소통 방식 → 타협/대안 제시.', f: '✓ 협업·커뮤니케이션 역량이 보입니다.' }, { t: '시안 그대로만 구현한다고 한다.', f: '△ 기술적 제약 설명·대안 제시 경험도 좋습니다.' }, { t: '디자이너와 잘 안 맞았다고 불평.', f: '△ 건설적 협업 사례로 답하세요.' }, '구현 불가 UI에 [대안]을 제안해 일정 내 출시했습니다.') },
    { id: 'fe-exp-5', tag: '직무', narration: '면접관이 TypeScript 파일을 넘깁니다.', dialogue: 'TypeScript 도입 또는 타입 안전성을 높인 경험이 있나요?',
      choices: c({ t: '도입 배경·전략·에러 감소·팀 onboarding.', f: '✓ 타입 시스템 이해와 실무 적용력.' }, { t: 'any 많이 쓴다고 솔직히 말한다.', f: '△ any 줄이기 노력·strict 설정 경험을 말하세요.' }, { t: 'JS만 써봤다고 한다.', f: '△ 학습 중·side project TS 경험도 OK.' }, '점진적 strict 전환으로 런타임 버그 30% 감소했습니다.') },
  ],
  pm: [
    { id: 'pm-exp-1', tag: '직무', narration: '면접관이 PRD 목차를 보여줍니다.', dialogue: 'PRD를 작성하고 이해관계자 설득에 성공한 경험이 있나요?',
      choices: c({ t: '문제 정의·지표·범위·리스크·결과 수치.', f: '✓ PM 핵심 역량이 드러납니다.' }, { t: 'PRD 써봤다고만 한다.', f: '△ 설득 과정과 outcome을 추가하세요.' }, { t: 'PRD 경험 없다고 한다.', f: '△ 수업·동아리 기획안도 경험입니다.' }, '이탈률 15% 문제를 PRD로 정의, 출시 후 8%로 개선했습니다.') },
    { id: 'pm-exp-2', tag: '직무', narration: '면접관이 A/B 테스트 그래프를 가리킵니다.', dialogue: '데이터 기반으로 기능 우선순위를 정한 사례를 말해 주세요.',
      choices: c({ t: '가설·지표·데이터·결정·결과.', f: '✓ data-driven PM 이미지입니다.' }, { t: '감으로 prioritization 한다고 한다.', f: '△ 데이터·유저 리서치 근거를 넣으세요.' }, { t: '데이터 분석은 못한다고 한다.', f: '△ 기본 지표 해석 경험을 준비하세요.' }, '퍼널 분석으로 [병목] 발견, [기능] 우선 개발해 전환율 +12%.') },
    { id: 'pm-exp-3', tag: '직무', narration: '면접관이 스프린트 보드를 가리킵니다.', dialogue: '개발 일정이 지연될 때, PM으로서 어떻게 대응했나요?',
      choices: c({ t: '원인 파악·scope 조정·stakeholder 커뮤니케이션.', f: '✓ 일정·리스크 관리 역량.' }, { t: '개발팀 탓이라고 한다.', f: '△ PM은 조율자 역할입니다.' }, { t: '경험 없다고 한다.', f: '△ 팀 프로젝트 일정 조율도 OK.' }, 'MVP scope 재정의로 2주 지연을 3일로 단축했습니다.') },
    { id: 'pm-exp-4', tag: '직무', narration: '면접관이 유저 인터뷰 메모를 넘깁니다.', dialogue: '유저 리서치 결과를 제품에 반영한 경험을 설명해 주세요.',
      choices: c({ t: '리서치 방법·인사이트·기능 변경·지표 변화.', f: '✓ 유저 중심 사고가 있습니다.' }, { t: '설문만 돌렸다고 한다.', f: '△ 인사이트→액션 연결을 설명하세요.' }, { t: '리서치 경험 없다고 한다.', f: '△ 친구·가족 인터뷰·설문도 경험입니다.' }, '인터뷰 12명에서 [pain] 발견, 온보딩 개선으로 activation +20%.') },
    { id: 'pm-exp-5', tag: '압박', narration: '면접관이 진지하게 묻습니다.', dialogue: '출시 후 KPI가 기대 이하였을 때, 어떻게 대응했나요?',
      choices: c({ t: '원인 분석·실험· pivot/ iterate 결정.', f: '✓ 실패 학습과 실행력.' }, { t: '운이 나빴다고 한다.', f: '△ 가설·실험·학습 관점으로 답하세요.' }, { t: '실패 경험 없다고 한다.', f: '△ side project·수업 프로젝트도 OK.' }, 'KPI 미달 원인을 [분석]하고 [실험] 3회 후 지표 회복.') },
  ],
  data: [
    { id: 'da-exp-1', tag: '직무', narration: '면접관이 SQL 쿼리를 보여줍니다.', dialogue: '복잡한 SQL로 비즈니스 인사이트를 도출한 경험을 말해 주세요.',
      choices: c({ t: '비즈니스 질문→쿼리 설계→인사이트→액션.', f: '✓ 분석가적 사고가 보입니다.' }, { t: 'JOIN 쓸 줄 안다고만.', f: '△ 비즈니스 impact를 연결하세요.' }, { t: 'SQL 잘 모른다고 한다.', f: '△ 학습·연습 프로젝트도 언급하세요.' }, '코호트 분석으로 이탈 구간 발견, retention +8% 기여.') },
    { id: 'da-exp-2', tag: '직무', narration: '면접관이 대시보드 스크린샷을 가리킵니다.', dialogue: '대시보드를 설계할 때, 이해관계자별로 어떻게 다른가요?',
      choices: c({ t: 'stakeholder·KPI·시각화·업데이트 주기.', f: '✓ 커뮤니케이션·시각화 역량.' }, { t: '그래프 예쁘게 만든다고만.', f: '△ 의사결정에 필요한 KPI 중심으로.' }, { t: '대시보드 경험 없다고 한다.', f: '△ Excel·Google Sheets도 OK.' }, '경영진용 KPI 5개, 팀용 drill-down 대시보드 분리 설계.') },
    { id: 'da-exp-3', tag: '직무', narration: '면접관이 A/B 테스트 결과표를 넘깁니다.', dialogue: 'A/B 테스트 설계·분석·해석 경험이 있나요?',
      choices: c({ t: '가설·샘플·유의성·실무적 해석·한계.', f: '✓ 통계적 사고와 실무 감각.' }, { t: 'p-value만 본다고 한다.', f: '△ 실무적 유의미성·표본 크기도 언급.' }, { t: 'A/B 못한다고 한다.', f: '△ 수업·온라인 실습 경험도 OK.' }, 'CTR +3%지만 표본 부족으로 추가 2주 테스트 후 rollout.') },
    { id: 'da-exp-4', tag: '직무', narration: '면접관이 더티 데이터 표를 가리킵니다.', dialogue: '데이터 품질 문제를 발견하고 해결한 경험은?',
      choices: c({ t: '문제 발견·원인·클린징·재발 방지 프로세스.', f: '✓ 데이터 거버넌스 의식.' }, { t: '결측치 drop 했다고만.', f: '△ imputation·검증 규칙도 설명하세요.' }, { t: '깨끗한 데이터만 써봤다고.', f: '△ real data는 항상 dirty합니다.' }, '중복·NULL 규칙 정의, ETL validation 추가로 오류 90%↓.') },
    { id: 'da-exp-5', tag: '직무', narration: '면접관이 비개발자 동료를 가리킵니다.', dialogue: '비기술 팀에 분석 결과를 설명한 경험이 있나요?',
      choices: c({ t: '청중 맞춤·스토리·시각화·Q&A.', f: '✓ 데이터 스토리텔링 역량.' }, { t: 'PPT 많이 넣었다고만.', f: '△ so what·action item을 명확히.' }, { t: '발표 경험 없다고 한다.', f: '△ 수업 발표·보고서도 경험입니다.' }, '3-slide rule로 핵심 1메시지, 의사결정 same day.') },
  ],
  marketing: [
    { id: 'mk-exp-1', tag: '직무', narration: '면접관이 캠페인 ROI 표를 보여줍니다.', dialogue: '가장 성과 좋았던 마케팅 캠페인과 KPI를 설명해 주세요.',
      choices: c({ t: '목표·타겟·채널·크리에이티브·ROAS/CPA 수치.', f: '✓ 성과 중심 마케터입니다.' }, { t: '좋아요 많이 받았다고만.', f: '△ 비즈니스 KPI(전환·매출)로 연결.' }, { t: '캠페인 경험 없다고 한다.', f: '△ SNS·동아리 홍보도 경험입니다.' }, 'Instagram 릴스 캠페인 ROAS 320%, CPA 40%↓.') },
    { id: 'mk-exp-2', tag: '직무', narration: '면접관이 퍼널 다이어그램을 가리킵니다.', dialogue: '퍼널 어느 단계 병목을 발견하고 개선했나요?',
      choices: c({ t: '단계·지표·가설·실험·결과.', f: '✓ 퍼널 사고와 실험 mindset.' }, { t: '광고만 많이 돌렸다고.', f: '△ 전환율·이탈 구간 분석을 추가.' }, { t: '퍼널 모른다고 한다.', f: '△ AIDA·전환 퍼널 기본을 학습하세요.' }, '랜딩→가입 전환 2%→5%, CTA·카피 A/B 3회.') },
    { id: 'mk-exp-3', tag: '직무', narration: '면접관이 브랜드 가이드를 넘깁니다.', dialogue: '브랜드 톤앤매너를 유지하면서 바이럴을 만든 경험?',
      choices: c({ t: '브랜드 가치·콘텐츠 전략·채널·바이럴 지표.', f: '✓ 브랜드·퍼formance 균형.' }, { t: '밈만 써서 터뜨렸다고.', f: '△ 브랜드 fit·장기 이미지도 고려.' }, { t: '바이럴 경험 없다고.', f: '△ 소규모 UGC·챌린지도 OK.' }, '브랜드 캐릭터 UGC 챌린지, 참여 2만·브랜드 recall +15%.') },
    { id: 'mk-exp-4', tag: '직무', narration: '면접관이 예산 시트를 가리킵니다.', dialogue: '예산이 절반으로 줄었을 때, 어떻게 realloc 했나요?',
      choices: c({ t: 'ROI 분석·채널 재배분·저비용 고효율 실험.', f: '✓ 리소스 최적화 역량.' }, { t: '광고 다 끊었다고.', f: '△ organic·CRM·retargeting 대안.' }, { t: '예산 관리 경험 없다고.', f: '△ side project·동아리 예산도 OK.' }, '저성과 채널 cut, retargeting 집중해 CPA 유지.') },
    { id: 'mk-exp-5', tag: '압박', narration: '면접관이 부정적 댓글 캡처를 보여줍니다.', dialogue: 'SNS 위기(악성 댓글·불만) 대응 경험이 있나요?',
      choices: c({ t: '모니터링·대응 원칙·커뮤니케이션·사후 개선.', f: '✓ 위기 커뮤니케이션 역량.' }, { t: '댓글 삭제만 했다고.', f: '△ 투명한 대응·FAQ·개선도 언급.' }, { t: '위기 경험 없다고.', f: '△ 가상 시나리오 대응 plan도 준비.' }, '1시간 내 공식 답변, FAQ 게시, 재발 방지 프로세스.') },
  ],
};

const JOB_SKILL = {
  backend: [
    { id: 'be-skill-1', tag: '직무', narration: '면접관이 API 설계 질문을 던집니다.', dialogue: 'REST API 설계 시 가장 먼저 챙기는 원칙 3가지는?',
      choices: c({ t: '일관된 규약·에러/보안·문서화·버저닝.', f: '✓ 실무 API 설계 감각.' }, { t: '빠르게 CRUD만 만든다.', f: '△ 품질·보안 기준을 추가하세요.' }, { t: 'REST 정의만 설명.', f: '△ 본인 적용 경험을 연결하세요.' }, 'HTTP semantics, idempotency, OpenAPI spec, auth.') },
    { id: 'be-skill-2', tag: '직무', narration: '면접관이 트랜잭션을 묻습니다.', dialogue: 'DB 트랜잭션 격리 수준, 실무에서 어떻게 선택하나요?',
      choices: c({ t: 'Read Committed vs Serializable trade-off + 사례.', f: '✓ DB 깊이 이해.' }, { t: '트랜잭션 잘 모른다.', f: '△ ACID·격리 수준 기본 학습.' }, { t: '항상 Serializable.', f: '△ 성능 trade-off 설명 필요.' }, '결제는 Serializable, 조회는 RC + optimistic lock.') },
    { id: 'be-skill-3', tag: '압박', narration: '면접관이 갑자기 묻습니다.', dialogue: '캐시(Redis)를 쓸 때, cache invalidation 전략은?',
      choices: c({ t: 'TTL·write-through/invalidate·stale data 대응.', f: '✓ 캐싱 실무 이해.' }, { t: 'Redis에 넣기만 한다.', f: '△ invalidation은 hard problem — 전략 필수.' }, { t: '캐시 안 써봤다.', f: '△ 개념·side project라도 준비.' }, 'write-through + event-driven invalidation.') },
    { id: 'be-skill-4', tag: '직무', narration: '면접관이 마이크로서비스를 언급합니다.', dialogue: 'Monolith vs Microservices, 언제 MSAs로 갈아타나요?',
      choices: c({ t: '팀 규모·배포·도메인 경계·운영 비용 trade-off.', f: '✓ 아키텍처 trade-off 사고.' }, { t: '무조건 MSA가 좋다.', f: '△ premature MSA 리스크 언급.' }, { t: 'Monolith만 안다.', f: '△ 학습·관심 표현도 OK.' }, '도메인 명확·팀 2-pizza·독립 배포 필요 시.') },
    { id: 'be-skill-5', tag: '직무', narration: '면접관이 보안을 묻습니다.', dialogue: 'API 보안에서 OWASP Top 3 관련해 본인이 신경 쓰는 것은?',
      choices: c({ t: 'Injection·Broken Auth·Rate limit·입력 검증.', f: '✓ 보안 awareness.' }, { t: 'HTTPS만 쓴다.', f: '△ auth·validation·logging도.' }, { t: '보안은 infra팀 몫.', f: '△ dev도 secure coding 책임.' }, 'parameterized query, JWT refresh, input sanitize.') },
  ],
  frontend: [
    { id: 'fe-skill-1', tag: '직무', narration: '면접관이 브라우저를 가리킵니다.', dialogue: 'URL 입력부터 화면 렌더링까지, 간략히 설명해 주세요.',
      choices: c({ t: 'DNS→TCP→HTTP→parse→DOM/CSSOM→render tree→paint.', f: '✓ 렌더링 파이프라인 이해.' }, { t: '서버에서 HTML 받는다만.', f: '△ critical rendering path 추가.' }, { t: '모른다.', f: '△ FE 필수 기본 — 학습 필요.' }, 'DNS lookup → TCP/TLS → request → parse → layout → paint.') },
    { id: 'fe-skill-2', tag: '직무', narration: '면접관이 React를 묻습니다.', dialogue: 'useEffect vs useLayoutEffect 차이와 사용 시점은?',
      choices: c({ t: '실행 타이밍·paint blocking·DOM measure 사례.', f: '✓ React lifecycle 깊이.' }, { t: '둘 다 비슷하다.', f: '△ 타이밍 차이 명확히.' }, { t: 'Hooks 잘 모른다.', f: '△ 기본 Hook 학습.' }, 'layout effect는 paint 전 sync, DOM 측정에.') },
    { id: 'fe-skill-3', tag: '직무', narration: '면접관이 CORS 에러 로그를 보여줍니다.', dialogue: 'CORS 에러가 났을 때, 원인과 해결 방법은?',
      choices: c({ t: 'same-origin·preflight·header·proxy·credentials.', f: '✓ 네트워크·보안 이해.' }, { t: '백엔드 탓이라고만.', f: '△ FE도 CORS mechanism 이해 필요.' }, { t: 'CORS 처음 들어본다.', f: '△ FE 필수 — 학습하세요.' }, 'Access-Control-Allow-Origin, preflight OPTIONS.') },
    { id: 'fe-skill-4', tag: '압박', narration: '면접관이 코드 리뷰를 요청합니다.', dialogue: 'useState로 heavy list 렌더링이 느릴 때, 접근법은?',
      choices: c({ t: 'memo·virtualization·key·state colocation.', f: '✓ 성능 디버깅 사고.' }, { t: '서버가 느린 것.', f: '△ FE profiling 먼저.' }, { t: '모르겠다.', f: '△ react-window·useMemo 학습.' }, 'React.memo + virtual list + debounce search.') },
    { id: 'fe-skill-5', tag: '직무', narration: '면접관이 SEO를 묻습니다.', dialogue: 'SPA SEO 문제와, 어떻게 해결하나요?',
      choices: c({ t: 'SSR/SSG·meta·sitemap·Core Web Vitals.', f: '✓ FE + SEO 이해.' }, { t: 'SEO는 마케팅 몫.', f: '△ FE도 meta·SSR 책임.' }, { t: 'SPA SEO 문제 없다.', f: '△ crawling·indexing 이슈 학습.' }, 'Next.js SSG, dynamic meta, structured data.') },
  ],
  pm: [
    { id: 'pm-skill-1', tag: '직무', narration: '면접관이 KPI vs OKR을 묻습니다.', dialogue: 'KPI와 OKR 차이, 팀에 어떻게 적용했나요?',
      choices: c({ t: 'KPI=유지·OKR=도전·cadence·예시.', f: '✓ goal setting framework.' }, { t: '같은 거 아닌가.', f: '△ 차이·예시 학습.' }, { t: '몰라.', f: '△ PM 필수.' }, 'KPI retention 90%, OKR 신규 기능 adoption 30%.') },
    { id: 'pm-skill-2', tag: '직무', narration: '면접관이 RICE를 적습니다.', dialogue: '기능 우선순위 프레임워크(RICE 등) 사용 경험?',
      choices: c({ t: 'Reach·Impact·Confidence·Effort + 실제 ranking.', f: '✓ prioritization skill.' }, { t: '많이 요청한 거 먼저.', f: '△ framework + data.' }, { t: '프레임워크 모름.', f: '△ RICE·MoSCoW 학습.' }, 'RICE score로 backlog top 5 sprint planning.') },
    { id: 'pm-skill-3', tag: '직무', narration: '면접관이 North Star Metric을 묻습니다.', dialogue: '우리 제품의 North Star Metric은 뭐라고 생각하나요?',
      choices: c({ t: '제품·유저·비즈니스 연결 + 가설.', f: '✓ product sense.' }, { t: 'DAU만 중요.', f: '△ vanity vs actionable metric.' }, { t: '모르겠다.', f: '△ 면접 전 제품 분석 필수.' }, 'activation rate — first value experience within 7 days.') },
    { id: 'pm-skill-4', tag: '압박', narration: '면접관이 압박합니다.', dialogue: 'CEO가 "내일 출시"라고 하면 PM은?',
      choices: c({ t: '리스크·scope·quality trade-off·대안 제시.', f: '✓ stakeholder management.' }, { t: '무조건 한다.', f: '△ quality·burnout risk.' }, { t: '거절만 한다.', f: '△ 대안(MVP·phased) 제시.' }, 'MVP scope 정의, critical bug list, phased rollout.') },
    { id: 'pm-skill-5', tag: '직무', narration: '면접관이 roadmap을 묻습니다.', dialogue: '6개월 roadmap을 어떻게 세우나요?',
      choices: c({ t: 'vision·themes·now-next-later·stakeholder input.', f: '✓ strategic planning.' }, { t: '기능 wishlist 나열.', f: '△ themes·outcomes 중심.' }, { t: 'roadmap 경험 없음.', f: '△ side project roadmap도 OK.' }, 'Q1 retention, Q2 monetization themes, monthly review.') },
  ],
  data: [
    { id: 'da-skill-1', tag: '직무', narration: '면접관이 p-value를 묻습니다.', dialogue: 'p-value 0.04면 "반드시 효과 있다"고 말할 수 있나요?',
      choices: c({ t: '통계적 유의≠실무적 유의·effect size·sample.', f: '✓ 통계 literacy.' }, { t: '0.05 미만이면 yes.', f: '△ effect size·power·context.' }, { t: 'p-value 뭐지.', f: '△ 통계 기본 학습.' }, '유의하지만 effect size·비즈니스 impact 별도 판단.') },
    { id: 'da-skill-2', tag: '직무', narration: '면접관이 correlation을 묻습니다.', dialogue: '상관관계 0.9면 인과관계인가요? 예시를 들어 주세요.',
      choices: c({ t: 'correlation≠causation + confounder 예시.', f: '✓ 인과 추론 awareness.' }, { t: '0.9면 causation.', f: '△ classic fallacy.' }, { t: '모름.', f: '△ 필수 개념.' }, '아이스크ream-익사 상관, confounding variable.') },
    { id: 'da-skill-3', tag: '직무', narration: '면접관이 SQL window function을 묻습니다.', dialogue: 'ROW_NUMBER vs RANK vs DENSE_RANK 차이는?',
      choices: c({ t: 'tie handling·use case·예시 query.', f: '✓ SQL proficiency.' }, { t: '다 같다.', f: '△ tie behavior 차이.' }, { t: 'window function 모름.', f: '△ SQL 심화 학습.' }, 'RANK: tie skip, DENSE_RANK: no skip.') },
    { id: 'da-skill-4', tag: '직무', narration: '면접관이 ML을 묻습니다.', dialogue: '분류 모델 precision vs recall, 비즈니스에서 어떻게 선택?',
      choices: c({ t: 'FP vs FN cost·threshold tuning·use case.', f: '✓ ML + business.' }, { t: 'accuracy만 본다.', f: '△ imbalanced data — useless.' }, { t: 'ML 모름.', f: '△ 기본 metric 학습.' }, '사기탐지: recall↑ (FN costly), spam: precision↑.') },
    { id: 'da-skill-5', tag: '압박', narration: '면접관이 ethics를 묻습니다.', dialogue: '개인정보 없이 유저 행동 분석, 주의할 점은?',
      choices: c({ t: 'anonymization·aggregation·consent·k-anonymity.', f: '✓ data ethics.' }, { t: '익명이면 OK.', f: '△ re-identification risk.' }, { t: '생각 안 해봤다.', f: '△ GDPR·개인정보보호법 학습.' }, 'pseudonymization, minimum aggregation, consent log.') },
  ],
  marketing: [
    { id: 'mk-skill-1', tag: '직무', narration: '면접관이 ROAS를 묻습니다.', dialogue: 'ROAS 200%인데도 캠페인 중단해야 할 수 있나요?',
      choices: c({ t: 'LTV·margin·incrementality·saturation.', f: '✓ marketing analytics depth.' }, { t: '200%면 무조건 continue.', f: '△ LTV·marginal ROAS.' }, { t: 'ROAS 모름.', f: '△ 기본 metric 학습.' }, 'LTV<CAC, marginal ROAS declining → pause.') },
    { id: 'mk-skill-2', tag: '직무', narration: '면접관이 attribution을 묻습니다.', dialogue: 'Last-click attribution의 한계는?',
      choices: c({ t: 'upper funnel 무시·multi-touch·view-through.', f: '✓ attribution understanding.' }, { t: 'last-click이 best.', f: '△ multi-touch models.' }, { t: 'attribution 모름.', f: '△ digital marketing basic.' }, 'awareness 채널 undervalued, data-driven MTA.') },
    { id: 'mk-skill-3', tag: '직무', narration: '면접관이 CRM을 묻습니다.', dialogue: '이메일 open rate 하락 시, 점검할 것 3가지?',
      choices: c({ t: 'subject·segment·deliverability·frequency.', f: '✓ CRM ops.' }, { t: '더 많이 보낸다.', f: '△ fatigue·spam risk.' }, { t: '이메일 마케팅 안 해봄.', f: '△ basic CRM 학습.' }, 'subject A/B, list hygiene, send time optimization.') },
    { id: 'mk-skill-4', tag: '직무', narration: '면접관이 persona를 묻습니다.', dialogue: 'Buyer persona 만들 때, 어떤 데이터를 쓰나요?',
      choices: c({ t: 'quant survey + qual interview + CRM segment.', f: '✓ research-driven persona.' }, { t: '상상으로 만든다.', f: '△ data-backed persona.' }, { t: 'persona 모름.', f: '△ marketing 101.' }, 'GA4 behavior + 10 user interviews + purchase data.') },
    { id: 'mk-skill-5', tag: '압박', narration: '면접관이 competitor를 묻습니다.', dialogue: '경쟁사가 우리보다 50% 저렴하게 공격하면?',
      choices: c({ t: 'differentiation·value prop·segment·non-price compete.', f: '✓ competitive strategy.' }, { t: '우리도 price cut.', f: '△ race to bottom.' }, { t: '모르겠다.', f: '△ value·brand·service angle.' }, 'premium segment focus, bundle value, loyalty program.') },
  ],
};

const ACHIEVEMENTS = [
  { id: 'first', icon: '🎉', name: '첫 면접 완료', check: (s) => s.completed >= 1 },
  { id: 'star', icon: '⭐', name: 'STAR 마스터', check: (s) => s.bestCount >= 4 },
  { id: 'perfect', icon: '🏆', name: '만점에 가깝게', check: (s) => s.pct >= 95 },
  { id: 'pressure', icon: '🔥', name: '압박 면접 생존', check: (s) => s.mode === 'pressure' && s.pct >= 60 },
  { id: 'speed', icon: '⚡', name: '침착함', check: (s) => s.mode !== 'practice' && s.timedOut === 0 },
  { id: 'hintless', icon: '🧠', name: '힌트 없이', check: (s) => s.hintsUsed === 0 && s.pct >= 70 },
  { id: 'triple', icon: '🎖️', name: '3회 연속 80점+', check: (s) => s.streak80 >= 3 },
];
