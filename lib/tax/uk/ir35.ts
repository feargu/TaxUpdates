/**
 * IR35 status indicator — weighted scoring against the key factors from case law.
 *
 * Not a Status Determination Statement under the off-payroll working rules. Not a
 * substitute for HMRC's CEST tool. Indicative only; borderline cases should be reviewed
 * professionally.
 *
 * Factor weights reflect tribunal practice: substitution and MoO are the "irreducible
 * minimum" per *Ready Mixed Concrete v MoPNI [1968]*; control is the third foundational
 * pillar; the remaining factors are secondary indicators.
 *
 * Sources cited per question — HMRC Employment Status Manual (ESM) + key case law.
 */

export type AnswerKey = 'clearlyInside' | 'leaningInside' | 'unsure' | 'leaningOutside' | 'clearlyOutside';

export interface AnswerOption {
  key: AnswerKey;
  label: string;
  /** Per-question score contribution. -2 (inside) to +2 (outside). Unsure = 0. */
  score: number;
}

export interface IR35Question {
  id: string;
  /** Short factor name shown in result summary. */
  factor: string;
  /** The question stem (second person). */
  prompt: string;
  /** What the factor means and why it matters. */
  explainer: string;
  /** Weight applied to the answer score. Substitution and MoO weight 1.5x. */
  weight: number;
  /** HMRC ESM section and/or key case reference. */
  source: { label: string; url: string };
  options: AnswerOption[];
}

const STANDARD_OPTIONS = (labels: {
  clearlyInside: string;
  leaningInside: string;
  leaningOutside: string;
  clearlyOutside: string;
}): AnswerOption[] => [
  { key: 'clearlyOutside', label: labels.clearlyOutside, score: 2 },
  { key: 'leaningOutside', label: labels.leaningOutside, score: 1 },
  { key: 'unsure', label: 'Unsure', score: 0 },
  { key: 'leaningInside', label: labels.leaningInside, score: -1 },
  { key: 'clearlyInside', label: labels.clearlyInside, score: -2 },
];

export const IR35_QUESTIONS: IR35Question[] = [
  {
    id: 'substitution',
    factor: 'Right of substitution',
    prompt:
      'Could the worker send a substitute (a colleague or sub-contractor) to do the work in their place?',
    explainer:
      'A genuine, unfettered right of substitution is the strongest "outside IR35" indicator. The client must accept any qualified substitute the worker chooses.',
    weight: 1.5,
    source: {
      label: 'ESM0535 + Pimlico Plumbers v Smith [2018]',
      url: 'https://www.gov.uk/hmrc-internal-manuals/employment-status-manual/esm0535',
    },
    options: STANDARD_OPTIONS({
      clearlyOutside: 'Yes — unfettered; client must accept any qualified substitute',
      leaningOutside: 'Yes — but client must approve the substitute',
      leaningInside: 'Only in narrow cases (short-term cover, illness)',
      clearlyInside: 'No — hired personally; cannot send anyone else',
    }),
  },
  {
    id: 'control',
    factor: 'Control',
    prompt: 'Who decides how the work is performed — methods, sequence, day-to-day approach?',
    explainer:
      'Control over the "what, how, when, where" is the second foundational test. More client control points to employment. Control over the output is normal in any contract — it\'s control over the method that signals employment.',
    weight: 1.3,
    source: {
      label: 'ESM0518',
      url: 'https://www.gov.uk/hmrc-internal-manuals/employment-status-manual/esm0518',
    },
    options: STANDARD_OPTIONS({
      clearlyOutside: 'Worker decides entirely — client only specifies the deliverable',
      leaningOutside: 'Worker decides, with high-level direction from client',
      leaningInside: 'Client provides detailed direction on methods',
      clearlyInside: 'Daily supervision — client manages the worker like an employee',
    }),
  },
  {
    id: 'moo',
    factor: 'Mutuality of Obligation',
    prompt:
      'Is the client obliged to offer continuing work, and is the worker obliged to accept whatever is offered?',
    explainer:
      'Mutuality of Obligation (MoO) is the third irreducible minimum. The absence of MoO — each engagement standing alone — strongly suggests self-employment. HMRC\'s CEST tool is famously weak on MoO; do not rely on it alone for borderline cases.',
    weight: 1.5,
    source: {
      label: 'ESM0543 + Carmichael v National Power [1999]',
      url: 'https://www.gov.uk/hmrc-internal-manuals/employment-status-manual/esm0543',
    },
    options: STANDARD_OPTIONS({
      clearlyOutside: 'No to both — each engagement is a separate contract',
      leaningOutside: 'Single-engagement only — no rolling obligation',
      leaningInside: 'Rolling arrangement with expectation of continuing work',
      clearlyInside: 'Guaranteed hours; worker must accept work assigned',
    }),
  },
  {
    id: 'financial-risk',
    factor: 'Financial risk',
    prompt:
      'Does the worker bear genuine financial risk — fixed-price work, rectifying defects at own cost, exposure to bad debts?',
    explainer:
      'Real business risk is a strong "outside" indicator. Being paid by the hour with no exposure to losses looks like employment.',
    weight: 1.0,
    source: {
      label: 'ESM0537 + Hall v Lorimer [1992]',
      url: 'https://www.gov.uk/hmrc-internal-manuals/employment-status-manual/esm0537',
    },
    options: STANDARD_OPTIONS({
      clearlyOutside: 'Yes — material financial risk on each engagement',
      leaningOutside: 'Some risk — fixed-price elements, defect rectification',
      leaningInside: 'Limited risk — mostly paid for time worked',
      clearlyInside: 'No risk — paid hourly/daily regardless of outcome',
    }),
  },
  {
    id: 'equipment',
    factor: 'Equipment',
    prompt: 'Who provides the equipment and tools needed for the work?',
    explainer:
      'Providing one\'s own equipment is an "outside" indicator, though weaker than the foundational tests. Modern knowledge work often blurs this since clients often require their own security-controlled devices.',
    weight: 0.7,
    source: {
      label: 'ESM0538',
      url: 'https://www.gov.uk/hmrc-internal-manuals/employment-status-manual/esm0538',
    },
    options: STANDARD_OPTIONS({
      clearlyOutside: 'Worker provides all equipment and software',
      leaningOutside: 'Mostly worker\'s, with limited client equipment for access',
      leaningInside: 'Mostly client equipment, some of the worker\'s',
      clearlyInside: 'Client provides everything — laptop, software, workspace',
    }),
  },
  {
    id: 'integration',
    factor: 'Integration',
    prompt:
      'How integrated is the worker into the client\'s organisation (org chart, internal systems, managing client staff, internal-only events)?',
    explainer:
      'A worker who is "part and parcel" of the organisation looks employed. External suppliers don\'t typically manage internal staff or appear on the org chart.',
    weight: 1.0,
    source: {
      label: 'ESM0541',
      url: 'https://www.gov.uk/hmrc-internal-manuals/employment-status-manual/esm0541',
    },
    options: STANDARD_OPTIONS({
      clearlyOutside: 'Treated entirely as an external supplier',
      leaningOutside: 'External, with necessary system access for the project',
      leaningInside: 'Some integration — internal email, attends some staff meetings',
      clearlyInside: 'Fully integrated — on org chart, manages staff, attends staff events',
    }),
  },
  {
    id: 'exclusivity',
    factor: 'Exclusivity / multiple clients',
    prompt:
      'Is the worker free to take other clients during the engagement, and do they have multiple clients in practice?',
    explainer:
      'Freedom to work for others — and actually doing so — supports self-employment. Single-client exclusivity looks like employment.',
    weight: 0.9,
    source: {
      label: 'ESM0542',
      url: 'https://www.gov.uk/hmrc-internal-manuals/employment-status-manual/esm0542',
    },
    options: STANDARD_OPTIONS({
      clearlyOutside: 'Free to take other work AND has multiple concurrent clients',
      leaningOutside: 'Free to take other work; this is currently the main client',
      leaningInside: 'Effectively this is the sole client right now',
      clearlyInside: 'Contractually exclusive — cannot work elsewhere',
    }),
  },
  {
    id: 'business-on-own-account',
    factor: 'In business on own account',
    prompt:
      'Does the worker genuinely operate as a business — own marketing, professional indemnity insurance, business banking, branded invoicing, accountant?',
    explainer:
      'The "business on own account" test (Hall v Lorimer) looks at whether the worker conducts themselves as a genuine business — not just a PSC for tax-efficiency.',
    weight: 1.1,
    source: {
      label: 'ESM0540 + Hall v Lorimer [1992]',
      url: 'https://www.gov.uk/hmrc-internal-manuals/employment-status-manual/esm0540',
    },
    options: STANDARD_OPTIONS({
      clearlyOutside: 'Yes — clear business presence with multiple indicators',
      leaningOutside: 'Most indicators present',
      leaningInside: 'Few indicators — PSC mostly used for tax reasons',
      clearlyInside: 'No indicators — operates as if employed',
    }),
  },
];

export type Answers = Record<string, AnswerKey | undefined>;

export type IR35Status = 'outside' | 'borderline' | 'inside';

export interface IR35Result {
  answeredCount: number;
  totalQuestions: number;
  rawScore: number;
  maxScore: number;
  /** Score on a -100 to +100 scale (positive = outside, negative = inside). */
  scaledScore: number;
  status: IR35Status;
  statusLabel: string;
  statusDescription: string;
}

/** Sum of |weight × 2| across all questions — the magnitude of max possible swing. */
export const IR35_MAX_SCORE = IR35_QUESTIONS.reduce((acc, q) => acc + q.weight * 2, 0);

export function scoreIR35(answers: Answers): IR35Result {
  let rawScore = 0;
  let answeredCount = 0;

  for (const q of IR35_QUESTIONS) {
    const answerKey = answers[q.id];
    if (!answerKey) continue;
    const opt = q.options.find((o) => o.key === answerKey);
    if (!opt) continue;
    answeredCount += 1;
    rawScore += opt.score * q.weight;
  }

  const scaledScore = (rawScore / IR35_MAX_SCORE) * 100;

  let status: IR35Status;
  let statusLabel: string;
  let statusDescription: string;

  if (answeredCount < IR35_QUESTIONS.length) {
    status = 'borderline';
    statusLabel = 'Incomplete';
    statusDescription = `Answer all ${IR35_QUESTIONS.length} questions for an indicative status.`;
  } else if (scaledScore >= 33) {
    status = 'outside';
    statusLabel = 'Likely Outside IR35';
    statusDescription =
      'Factors point to a genuine business-to-business engagement. Still recommend a written contract review and a Status Determination Statement where required.';
  } else if (scaledScore <= -33) {
    status = 'inside';
    statusLabel = 'Likely Inside IR35';
    statusDescription =
      'Factors point to disguised employment. Tax should be operated as if employed; consider whether the engagement should be restructured.';
  } else {
    status = 'borderline';
    statusLabel = 'Borderline — seek advice';
    statusDescription =
      'Factors are mixed. A formal Status Determination Statement and professional review is strongly recommended.';
  }

  return {
    answeredCount,
    totalQuestions: IR35_QUESTIONS.length,
    rawScore,
    maxScore: IR35_MAX_SCORE,
    scaledScore,
    status,
    statusLabel,
    statusDescription,
  };
}

export function getAnswerOption(questionId: string, answerKey: AnswerKey): AnswerOption | undefined {
  const q = IR35_QUESTIONS.find((q) => q.id === questionId);
  return q?.options.find((o) => o.key === answerKey);
}

/** Builds the printable HTML used for PDF export. */
export function buildIR35Html(answers: Answers, result: IR35Result): string {
  const date = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const statusColor =
    result.status === 'outside' ? '#2a8a3e' : result.status === 'inside' ? '#b3261e' : '#a06b00';

  const answerBlocks = IR35_QUESTIONS.map((q) => {
    const answerKey = answers[q.id];
    const opt = answerKey ? q.options.find((o) => o.key === answerKey) : undefined;
    const answerText = opt ? opt.label : '<em style="color:#999">Not answered</em>';
    return `
      <div class="question">
        <div class="question-factor">${q.factor}</div>
        <div class="question-text">${q.prompt}</div>
        <div class="answer"><strong>Answer:</strong> ${answerText}</div>
        <div class="explainer">${q.explainer}</div>
        <div class="source">Source: ${q.source.label}</div>
      </div>
    `;
  }).join('');

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>
      body {
        font-family: -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
        padding: 40px;
        color: #1a1a1a;
        line-height: 1.5;
      }
      h1 { font-size: 26px; margin: 0 0 4px 0; }
      .subtitle { color: #666; font-size: 13px; margin-bottom: 24px; }
      .result-card {
        padding: 18px 20px;
        border: 1px solid #ddd;
        border-radius: 10px;
        margin-bottom: 28px;
      }
      .status {
        font-size: 22px;
        font-weight: 600;
        color: ${statusColor};
        margin-bottom: 6px;
      }
      .score { font-size: 13px; color: #666; }
      .description { font-size: 14px; color: #333; margin-top: 10px; }
      .question {
        margin-bottom: 18px;
        padding-bottom: 14px;
        border-bottom: 1px solid #eee;
      }
      .question-factor {
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        color: #888;
        margin-bottom: 4px;
      }
      .question-text { font-weight: 600; font-size: 15px; }
      .answer { margin-top: 6px; font-size: 14px; color: #333; }
      .explainer { font-size: 13px; color: #555; margin-top: 6px; }
      .source { font-size: 11px; color: #888; margin-top: 4px; }
      .disclaimer {
        font-size: 11px;
        color: #777;
        margin-top: 28px;
        padding-top: 16px;
        border-top: 1px solid #eee;
        line-height: 1.5;
      }
    </style>
  </head>
  <body>
    <h1>IR35 Status Assessment</h1>
    <div class="subtitle">TaxUpdates · ${date}</div>
    <div class="result-card">
      <div class="status">${result.statusLabel}</div>
      <div class="score">Scaled score: ${result.scaledScore.toFixed(0)} / ±100 · ${result.answeredCount} of ${result.totalQuestions} answered</div>
      <div class="description">${result.statusDescription}</div>
    </div>
    ${answerBlocks}
    <div class="disclaimer">
      <strong>Informational only — not a Status Determination Statement.</strong>
      This assessment is an indicative weighted score based on factors from HMRC&apos;s Employment Status Manual and key IR35 case law. It is not a substitute for HMRC&apos;s CEST tool, a formal Status Determination Statement, or professional advice. Borderline cases should be reviewed by a qualified tax adviser.
    </div>
  </body>
</html>`;
}
