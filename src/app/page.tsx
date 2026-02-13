"use client";

import Image from "next/image";
import { toHiragana, toKana } from "wanakana";
import { useEffect, useMemo, useRef, useState } from "react";

type ItemKind = "verb" | "i-adjective" | "na-adjective" | "noun";
type VerbClass = "ichidan" | "godan" | "irregular";

type Lexeme = {
  base: string;
  meaning: string;
  kind: ItemKind;
  verbClass?: VerbClass;
};

type FormKey =
  | "present"
  | "past"
  | "negative"
  | "pastNegative"
  | "te"
  | "potential"
  | "adverb"
  | "presentCopula"
  | "pastCopula"
  | "negativeCopula"
  | "pastNegativeCopula";

type Register = "formal" | "casual";

const lexemes: Lexeme[] = [
  { base: "たべる", meaning: "eat", kind: "verb", verbClass: "ichidan" },
  { base: "みる", meaning: "see", kind: "verb", verbClass: "ichidan" },
  { base: "のむ", meaning: "drink", kind: "verb", verbClass: "godan" },
  { base: "はなす", meaning: "speak", kind: "verb", verbClass: "godan" },
  { base: "かく", meaning: "write", kind: "verb", verbClass: "godan" },
  { base: "いく", meaning: "go", kind: "verb", verbClass: "godan" },
  { base: "する", meaning: "do", kind: "verb", verbClass: "irregular" },
  { base: "くる", meaning: "come", kind: "verb", verbClass: "irregular" },

  { base: "おおきい", meaning: "big", kind: "i-adjective" },
  { base: "ちいさい", meaning: "small", kind: "i-adjective" },
  { base: "おもしろい", meaning: "interesting", kind: "i-adjective" },
  { base: "さむい", meaning: "cold", kind: "i-adjective" },

  { base: "しずか", meaning: "quiet", kind: "na-adjective" },
  { base: "べんり", meaning: "convenient", kind: "na-adjective" },
  { base: "げんき", meaning: "healthy/energetic", kind: "na-adjective" },

  { base: "がくせい", meaning: "student", kind: "noun" },
  { base: "せんせい", meaning: "teacher", kind: "noun" },
  { base: "にほんじん", meaning: "Japanese person", kind: "noun" },
];

const formsByKind: Record<ItemKind, FormKey[]> = {
  verb: ["present", "past", "negative", "pastNegative", "te", "potential"],
  "i-adjective": ["present", "past", "negative", "pastNegative", "adverb"],
  "na-adjective": ["presentCopula", "pastCopula", "negativeCopula", "pastNegativeCopula", "adverb"],
  noun: ["presentCopula", "pastCopula", "negativeCopula", "pastNegativeCopula"],
};

const formLabels: Record<FormKey, string> = {
  present: "Present ('do' / 'is')",
  past: "Past ('did' / 'was')",
  negative: "Negative ('don’t' / 'is not')",
  pastNegative: "Past negative ('didn’t' / 'was not')",
  te: "Te-form ('and…' / connective form)",
  potential: "Potential ('can' / 'is possible to')",
  adverb: "Adverb form ('-ly', e.g. quietly / quickly)",
  presentCopula: "Copula present ('is / am / are')",
  pastCopula: "Copula past ('was / were')",
  negativeCopula: "Copula negative ('is not / am not / are not')",
  pastNegativeCopula: "Copula past negative ('was not / were not')",
};

const formRegister: Partial<Record<FormKey, Register>> = {
  present: "formal",
  past: "formal",
  negative: "formal",
  pastNegative: "formal",
  potential: "formal",
  presentCopula: "formal",
  pastCopula: "formal",
  negativeCopula: "formal",
  pastNegativeCopula: "formal",
};

function titleCase(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function displayConjugationType(form: FormKey) {
  const register = formRegister[form];
  const base = formLabels[form];
  if (!register) return base;
  return `${titleCase(register)} ${base.charAt(0).toLowerCase()}${base.slice(1)}`;
}

const iRowMap: Record<string, string> = {
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

const eRowMap: Record<string, string> = {
  う: "え",
  く: "け",
  ぐ: "げ",
  す: "せ",
  つ: "て",
  ぬ: "ね",
  ぶ: "べ",
  む: "め",
  る: "れ",
};

function randomItem<T>(arr: T[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function verbMasuStem(base: string, cls: VerbClass) {
  if (cls === "irregular") return base === "する" ? "し" : "き";
  if (cls === "ichidan") return base.slice(0, -1);
  const last = base.slice(-1);
  return base.slice(0, -1) + iRowMap[last];
}

function verbConjugate(v: Lexeme, form: FormKey) {
  const base = v.base;
  const cls = v.verbClass!;

  if (form === "present") return `${verbMasuStem(base, cls)}ます`;
  if (form === "past") return `${verbMasuStem(base, cls)}ました`;
  if (form === "negative") return `${verbMasuStem(base, cls)}ません`;
  if (form === "pastNegative") return `${verbMasuStem(base, cls)}ませんでした`;

  if (form === "te") {
    if (cls === "ichidan") return `${base.slice(0, -1)}て`;
    if (cls === "irregular") return base === "する" ? "して" : "きて";
    const last = base.slice(-1);
    const root = base.slice(0, -1);
    if (base === "いく") return "いって";
    if (["う", "つ", "る"].includes(last)) return `${root}って`;
    if (["む", "ぶ", "ぬ"].includes(last)) return `${root}んで`;
    if (last === "く") return `${root}いて`;
    if (last === "ぐ") return `${root}いで`;
    return `${root}して`;
  }

  if (form === "potential") {
    if (cls === "ichidan") return `${base.slice(0, -1)}られます`;
    if (cls === "irregular") return base === "する" ? "できます" : "こられます";
    const last = base.slice(-1);
    return `${base.slice(0, -1)}${eRowMap[last]}ます`;
  }

  return base;
}

function iAdjConjugate(base: string, form: FormKey) {
  const stem = base.slice(0, -1);
  if (form === "present") return `${base}です`;
  if (form === "past") return `${stem}かったです`;
  if (form === "negative") return `${stem}くないです`;
  if (form === "pastNegative") return `${stem}くなかったです`;
  if (form === "adverb") return `${stem}く`;
  return base;
}

function naAdjOrNounConjugate(base: string, form: FormKey) {
  if (form === "presentCopula") return `${base}です`;
  if (form === "pastCopula") return `${base}でした`;
  if (form === "negativeCopula") return `${base}じゃないです`;
  if (form === "pastNegativeCopula") return `${base}じゃなかったです`;
  if (form === "adverb") return `${base}に`;
  return base;
}

function conjugate(lexeme: Lexeme, form: FormKey) {
  if (lexeme.kind === "verb") return verbConjugate(lexeme, form);
  if (lexeme.kind === "i-adjective") return iAdjConjugate(lexeme.base, form);
  return naAdjOrNounConjugate(lexeme.base, form);
}

function createQuestion() {
  const item = randomItem(lexemes);
  const form = randomItem(formsByKind[item.kind]);
  return { item, form };
}

export default function Home() {
  const [question, setQuestion] = useState<{ item: Lexeme; form: FormKey }>({ item: lexemes[0], form: "present" });
  const [answer, setAnswer] = useState("");
  const [correct, setCorrect] = useState(0);
  const [total, setTotal] = useState(0);
  const [feedback, setFeedback] = useState<null | { ok: boolean; text: string }>(null);
  const [jpInputMode, setJpInputMode] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setQuestion(createQuestion());
    inputRef.current?.focus();
  }, []);

  const expected = conjugate(question.item, question.form);
  const conjugationTypeLabel = displayConjugationType(question.form);
  const accuracy = useMemo(() => (total ? Math.round((correct / total) * 100) : 0), [correct, total]);

  const nextQuestion = () => {
    setQuestion(createQuestion());
    setAnswer("");
    setFeedback(null);
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const check = () => {
    const raw = answer.trim();
    if (!raw) return;

    const normalizedInput = toKana(raw);
    const normalizedExpected = toKana(expected);

    setTotal((t) => t + 1);
    if (normalizedInput === normalizedExpected) {
      setCorrect((c) => c + 1);
      setFeedback({ ok: true, text: "Correct! 🎉 (Press Enter for next)" });
    } else {
      setFeedback({ ok: false, text: `Not quite. Correct answer: ${expected} (Press Enter for next)` });
    }

    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const handleEnter = () => {
    if (feedback) {
      nextQuestion();
      return;
    }
    check();
  };

  return (
    <main className="min-h-screen px-4 py-10">
      <section className="mx-auto w-full max-w-3xl rounded-3xl border border-white/70 bg-white/85 p-6 shadow-xl backdrop-blur-md sm:p-8">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Image src="/logo.svg" alt="Katsuyo Coach logo" width={44} height={44} />
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Katsuyo Coach 🇯🇵</h1>
              <p className="text-sm text-slate-600">Practice common forms across verbs, i-adjectives, na-adjectives, and nouns</p>
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
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Conjugate this word</p>
          <h2 className="mt-1 text-3xl font-bold text-slate-900">{question.item.base}</h2>
          <p className="mt-1 text-sm text-slate-600">
            {question.item.meaning} · {question.item.kind}
            {question.item.kind === "verb" ? ` (${question.item.verbClass})` : ""}
          </p>
          <p className="mt-3 text-sm font-semibold text-red-600">{conjugationTypeLabel}</p>

          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <input
              ref={inputRef}
              value={answer}
              onChange={(e) => setAnswer(jpInputMode ? toHiragana(e.target.value, { IMEMode: true }) : e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleEnter()}
              placeholder={jpInputMode ? "Type in romaji/hiragana (live JP convert)..." : "Type answer..."}
              lang="ja"
              inputMode="text"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              className="flex-1 rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100"
            />
          </div>

          <div className="mt-3 min-h-12 rounded-lg bg-transparent px-1 py-2 text-sm text-slate-700">
            {feedback ? (
              <>
                <span className={`font-semibold ${feedback.ok ? "text-emerald-700" : "text-red-700"}`}>
                  {feedback.ok ? "Correct! 🎉" : "Not quite."}
                </span>{" "}
                Correct answer: <span className="font-semibold">{expected}</span>
              </>
            ) : (
              <span className="opacity-0">Feedback placeholder to keep spacing stable.</span>
            )}
          </div>

          <div className="mt-3">
            {!feedback ? (
              <button
                onMouseDown={(e) => e.preventDefault()}
                onClick={check}
                className="w-full rounded-xl bg-slate-900 px-4 py-3 font-semibold text-white hover:bg-slate-700"
              >
                Check
              </button>
            ) : (
              <button
                onMouseDown={(e) => e.preventDefault()}
                onClick={nextQuestion}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 font-semibold text-slate-700 hover:bg-slate-50"
              >
                Next
              </button>
            )}
          </div>
        </article>
      </section>
    </main>
  );
}
