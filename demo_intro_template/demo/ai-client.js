/**
 * AI 면접관 클라이언트 — GPT-4o mini / Cloudflare Workers AI
 */

const AI_KEY_STORAGE = 'aiweb2026_openai_key';
const OPENAI_MODEL = 'gpt-4o-mini';

function getOpenAIKey() {
  return localStorage.getItem(AI_KEY_STORAGE) || '';
}

function saveOpenAIKey(key) {
  if (key) localStorage.setItem(AI_KEY_STORAGE, key.trim());
  else localStorage.removeItem(AI_KEY_STORAGE);
}

function apiBase() {
  const path = window.location.pathname;
  if (path.includes('/demo/')) return '../api/interview';
  return '/api/interview';
}

function extractJSON(text) {
  const raw = String(text || '').trim();
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fenced ? fenced[1].trim() : raw;
  const start = candidate.indexOf('{');
  const end = candidate.lastIndexOf('}');
  if (start === -1 || end === -1) throw new Error('AI 응답 파싱 실패');
  return JSON.parse(candidate.slice(start, end + 1));
}

async function callOpenAIDirect(prompt) {
  const key = getOpenAIKey();
  if (!key) throw new Error('OpenAI API 키가 필요합니다');

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      temperature: 0.7,
      messages: [
        { role: 'system', content: 'You are a Korean interview coach. Output valid JSON only.' },
        { role: 'user', content: prompt },
      ],
      response_format: { type: 'json_object' },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI 오류 (${res.status})`);
  }

  const data = await res.json();
  const text = data.choices?.[0]?.message?.content || '';
  return { provider: 'openai-direct', ...extractJSON(text) };
}

async function callInterviewAPI(payload) {
  let proxyError = null;
  try {
    const res = await fetch(apiBase(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (data.ok) return data;
    proxyError = new Error(data.error || 'API 오류');
  } catch (e) {
    proxyError = e;
  }
  if (getOpenAIKey()) {
    return callOpenAIDirect(buildPrompt(payload));
  }
  throw proxyError || new Error('AI API를 사용할 수 없습니다. OpenAI API 키를 입력하세요.');
}

function buildPrompt(payload) {
  const { action, jobLabel, interviewer, stage, stepIndex, question, answer } = payload;
  if (action === 'question') {
    return `당신은 ${interviewer.name}(${interviewer.role})입니다. 말투: ${interviewer.style}.
${jobLabel} 지원자 면접 ${stepIndex + 1}/5 — "${stage.label}".
한국어 JSON만: {"narration":"장면 1문장","dialogue":"질문","tag":"인성|직무|협업|압박"}`;
  }
  if (action === 'evaluate') {
    return `면접관 ${interviewer.name}. ${jobLabel} · ${stage.label}
질문: ${question}
답변: ${answer}
JSON만: {"grade":"best|ok|poor","score":1,"feedback":"...","ideal":"...","skills":{"structure":0,"communication":0,"technical":0,"motivation":0}}`;
  }
  if (action === 'hint') {
    return `${jobLabel} · ${stage.label} 질문: ${question}
힌트 1~2문장 JSON: {"hint":"..."}`;
  }
  throw new Error('Unknown action');
}

function interviewPayload(action, ctx) {
  const iv = INTERVIEWERS[ctx.interviewerId];
  const job = JOBS[ctx.job];
  return {
    action,
    job: ctx.job,
    jobLabel: job.label,
    interviewer: {
      name: iv.name,
      role: iv.role,
      style: iv.style,
    },
    stage: ctx.stage,
    stepIndex: ctx.stepIndex,
    question: ctx.question,
    answer: ctx.answer,
  };
}

async function generateAIQuestion(ctx) {
  const data = await callInterviewAPI(interviewPayload('question', ctx));
  return {
    narration: data.narration || '면접관이 질문을 준비합니다.',
    dialogue: data.dialogue || '자기소개를 간단히 부탁드립니다.',
    tag: data.tag || '인성',
    provider: data.provider,
  };
}

async function evaluateAIAnswer(ctx) {
  const data = await callInterviewAPI(interviewPayload('evaluate', ctx));
  const grade = ['best', 'ok', 'poor'].includes(data.grade) ? data.grade : 'ok';
  const scoreMap = { best: 3, ok: 2, poor: 1 };
  return {
    grade,
    score: data.score || scoreMap[grade],
    feedback: data.feedback || '피드백을 생성하지 못했습니다.',
    ideal: data.ideal || '',
    skills: data.skills || {},
    provider: data.provider,
  };
}

async function fetchAIHint(ctx) {
  const data = await callInterviewAPI(interviewPayload('hint', ctx));
  return data.hint || 'STAR 형식(상황·과제·행동·결과)으로 답해 보세요.';
}

async function checkAIAvailable() {
  try {
    await fetch(apiBase(), { method: 'OPTIONS' });
    return { mode: 'proxy', label: 'Cloudflare AI' };
  } catch {
    if (getOpenAIKey()) return { mode: 'direct', label: 'OpenAI (본인 키)' };
    return { mode: 'none', label: 'API 키 필요' };
  }
}
