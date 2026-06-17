/**
 * Cloudflare Pages Function — AI 면접관 API
 * Workers AI (Llama) 또는 OPENAI_API_KEY 환경변수(GPT-4o mini) 사용
 */

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

const MODEL_OPENAI = 'gpt-4o-mini';
const MODEL_WORKERS = '@cf/meta/llama-3-8b-instruct';

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS },
  });
}

function extractJSON(text) {
  const raw = String(text || '').trim();
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fenced ? fenced[1].trim() : raw;
  const start = candidate.indexOf('{');
  const end = candidate.lastIndexOf('}');
  if (start === -1 || end === -1) throw new Error('JSON not found');
  return JSON.parse(candidate.slice(start, end + 1));
}

function buildQuestionPrompt(body) {
  const { job, jobLabel, interviewer, stage, stepIndex } = body;
  return `당신은 ${interviewer.name}(${interviewer.role})입니다. 말투: ${interviewer.style}.
${jobLabel} 지원자 1:1 면접 ${stepIndex + 1}/5단계 — "${stage.label}"입니다.

한국어로 면접 질문 1개를 만드세요. narration은 1문장 장면 묘사, dialogue는 면접관이 실제로 하는 질문입니다.
tag는 "인성", "직무", "협업", "압박" 중 하나.

반드시 아래 JSON만 출력:
{"narration":"...","dialogue":"...","tag":"..."}`;
}

function buildEvaluatePrompt(body) {
  const { jobLabel, interviewer, stage, question, answer } = body;
  return `당신은 ${interviewer.name}(${interviewer.role}) 면접관입니다.
${jobLabel} 지원 면접 · ${stage.label} 단계

질문: ${question}
지원자 답변: ${answer}

답변을 평가하세요. grade는 best(우수)/ok(보통)/poor(미흡). score는 best=3, ok=2, poor=1.
feedback은 2~3문장 한국어. ideal은 모범 답변 2~3문장.
skills 각 항목 0~3 정수: structure, communication, technical, motivation.

반드시 아래 JSON만 출력:
{"grade":"best|ok|poor","score":1,"feedback":"...","ideal":"...","skills":{"structure":0,"communication":0,"technical":0,"motivation":0}}`;
}

function buildHintPrompt(body) {
  const { jobLabel, stage, question } = body;
  return `${jobLabel} 면접 · ${stage.label}
질문: ${question}

지원자에게 도움이 되는 힌트 1~2문장(정답 그대로 말하지 말 것). JSON만:
{"hint":"..."}`;
}

async function runOpenAI(apiKey, prompt) {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL_OPENAI,
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
    throw new Error(`OpenAI ${res.status}: ${err.slice(0, 200)}`);
  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content || '';
}

async function runWorkersAI(ai, prompt) {
  const res = await ai.run(MODEL_WORKERS, {
    messages: [
      { role: 'system', content: 'You are a Korean interview coach. Output valid JSON only.' },
      { role: 'user', content: prompt },
    ],
    max_tokens: 600,
  });
  return res.response || res.result || '';
}

async function dispatchAI(env, prompt) {
  if (env.OPENAI_API_KEY) {
    const text = await runOpenAI(env.OPENAI_API_KEY, prompt);
    return { provider: 'openai', data: extractJSON(text) };
  }
  if (env.AI) {
    const text = await runWorkersAI(env.AI, prompt);
    return { provider: 'cloudflare', data: extractJSON(text) };
  }
  throw new Error('AI not configured. Set OPENAI_API_KEY in Cloudflare or enable Workers AI.');
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS });
}

export async function onRequestPost(context) {
  try {
    const body = await context.request.json();
    const action = body.action;
    let prompt;

    if (action === 'question') prompt = buildQuestionPrompt(body);
    else if (action === 'evaluate') prompt = buildEvaluatePrompt(body);
    else if (action === 'hint') prompt = buildHintPrompt(body);
    else return json({ error: 'Unknown action' }, 400);

    const { provider, data } = await dispatchAI(context.env, prompt);
    return json({ ok: true, provider, ...data });
  } catch (err) {
    return json({ ok: false, error: err.message || 'AI request failed' }, 502);
  }
}
