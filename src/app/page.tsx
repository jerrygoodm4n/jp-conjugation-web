"use client";

import Image from "next/image";
import { toHiragana, toKana } from "wanakana";
import { useEffect, useMemo, useState } from "react";

type VerbType = "ichidan" | "godan" | "irr";
type FormKey = "masu" | "masen" | "mashita" | "masendeshita";

type Verb = {
  d: string;
  m: string;
  t: VerbType;
};

const verbs: Verb[] = [
  { d: "たべる", m: "to eat", t: "ichidan" },
  { d: "みる", m: "to see", t: "ichidan" },
  { d: "おきる", m: "to wake", t: "ichidan" },
  { d: "かく", m: "to write", t: "godan" },
  { d: "のむ", m: "to drink", t: "godan" },
  { d: "はなす", m: "to speak", t: "godan" },
  { d: "よむ", m: "to read", t: "godan" },
  { d: "いく", m: "to go", t: "godan" },
  { d: "する", m: "to do", t: "irr" },
  { d: "くる", m: "to come", t: "irr" },
];

const forms: FormKey[] = ["masu", "masen", "mashita", "masendeshita"];

const labels: Record<FormKey, string> = {
  masu: "Polite present (〜ます)",
  masen: "Polite negative (〜ません)",
  mashita: "Polite past (〜ました)",
  masendeshita: "Polite past negative (〜ませんでした)",
};

const iMap: Record<string, string> = {
  う: "い",
  く: "き",
  ぐ: "ぎ",
  す: "し",
  つ: "ち",
  ぬ: "に",
  ぶ: "び",
  む: "み",
  る: "り",
};

function randomItem<T>(arr: T[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function stem(v: Verb) {
  if (v.t === "irr") return v.d === "する" ? "し" : "き";
  if (v.t === "ichidan") return v.d.slice(0, -1);
  const last = v.d.slice(-1);
  return v.d.slice(0, -1) + iMap[last];
}

function conjugate(v: Verb, f: FormKey) {
  const s = stem(v);
  if (f === "masu") return `${s}ます`;
  if (f === "masen") return `${s}ません`;
  if (f === "mashita") return `${s}ました`;
  return `${s}ませんでした`;
}

function createQuestion() {
  return { verb: randomItem(verbs), form: randomItem(forms) };
}

export default function Home() {
  const [question, setQuestion] = useState({ verb: verbs[0], form: forms[0] as FormKey });
  const [answer, setAnswer] = useState("");
  const [correct, setCorrect] = useState<number>(0);
  const [total, setTotal] = useState<number>(0);
  const [feedback, setFeedback] = useState<null | { ok: boolean; text: string }>(null);
  const [jpInputMode, setJpInputMode] = useState(true);

  const accuracy = useMemo(() => (total ? Math.round((correct / total) * 100) : 0), [correct, total]);
  const expected = conjugate(question.verb, question.form);

  useEffect(() => {
    setQuestion(createQuestion());
  }, []);

  const nextQuestion = () => {
    setQuestion(createQuestion());
    setAnswer("");
    setFeedback(null);
  };

  const check = () => {
    const raw = answer.trim();
    if (!raw) return;

    const normalizedInput = toKana(raw);
    const normalizedExpected = toKana(expected);

    setTotal((t) => t + 1);
    if (normalizedInput === normalizedExpected) {
      setCorrect((c) => c + 1);
      setFeedback({ ok: true, text: "Correct! 🎉" });
      return;
    }

    setFeedback({ ok: false, text: `Not quite. Correct answer: ${expected}` });
  };

  const onAnswerChange = (value: string) => {
    if (jpInputMode) {
      setAnswer(toHiragana(value, { IMEMode: true }));
      return;
    }
    setAnswer(value);
  };

  return (
    <main className="min-h-screen px-4 py-10">
      <section className="mx-auto w-full max-w-3xl rounded-3xl border border-white/70 bg-white/85 p-6 shadow-xl backdrop-blur-md sm:p-8">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Image src="/logo.svg" alt="Katsuyo Coach logo" width={44} height={44} />
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Katsuyo Coach 🇯🇵</h1>
              <p className="text-sm text-slate-600">Practice polite Japanese verb forms fast</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setJpInputMode((v) => !v)}
              className={`rounded-xl px-3 py-2 text-xs font-semibold ${jpInputMode ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-700"}`}
            >
              JP Input {jpInputMode ? "ON" : "OFF"}
            </button>
            <div className="rounded-2xl bg-slate-100 px-4 py-2 text-sm text-slate-700">
              Score <span className="font-semibold">{correct}</span> / {total} · Accuracy <span className="font-semibold">{accuracy}%</span>
            </div>
          </div>
        </header>

        <div className="mt-5 h-2 rounded-full bg-slate-200">
          <div className="h-full rounded-full bg-gradient-to-r from-orange-400 to-red-500 transition-all" style={{ width: `${accuracy}%` }} />
        </div>

        <article className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Conjugate this verb</p>
          <h2 className="mt-1 text-3xl font-bold text-slate-900">{question.verb.d}</h2>
          <p className="mt-1 text-sm text-slate-600">{question.verb.m} · {question.verb.t}</p>
          <p className="mt-3 text-sm font-semibold text-red-600">{labels[question.form]}</p>
          <p className="mt-1 text-xs text-slate-500">JP Input uses IME-style conversion and handles edge cases like n+a → な.</p>

          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <input
              value={answer}
              onChange={(e) => onAnswerChange(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && check()}
              placeholder={jpInputMode ? "Type in romaji/hiragana (live JP convert)..." : "Type answer..."}
              lang="ja"
              inputMode="text"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              className="flex-1 rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100"
            />
            <button onClick={check} className="rounded-xl bg-slate-900 px-4 py-3 font-semibold text-white hover:bg-slate-700">Check</button>
            <button onClick={nextQuestion} className="rounded-xl border border-slate-300 bg-white px-4 py-3 font-semibold text-slate-700 hover:bg-slate-50">Next</button>
          </div>

          {feedback && (
            <div className={`mt-4 rounded-xl px-3 py-2 text-sm ${feedback.ok ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
              {feedback.text}
            </div>
          )}
        </article>
      </section>
    </main>
  );
}
