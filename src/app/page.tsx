"use client";

import { toHiragana, toKana } from "wanakana";
import { useEffect, useMemo, useRef, useState } from "react";

type ItemKind = "verb" | "i-adjective" | "na-adjective" | "noun";
type VerbClass = "ichidan" | "godan" | "irregular";
type Register = "formal" | "casual";

type Lexeme = {
  kana: string;
  kanji: string;
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

const lexemes: Lexeme[] = [
  { kana: "たべる", kanji: "食べる", meaning: "eat", kind: "verb", verbClass: "ichidan" },
  { kana: "みる", kanji: "見る", meaning: "see", kind: "verb", verbClass: "ichidan" },
  { kana: "のむ", kanji: "飲む", meaning: "drink", kind: "verb", verbClass: "godan" },
  { kana: "はなす", kanji: "話す", meaning: "speak", kind: "verb", verbClass: "godan" },
  { kana: "かく", kanji: "書く", meaning: "write", kind: "verb", verbClass: "godan" },
  { kana: "いく", kanji: "行く", meaning: "go", kind: "verb", verbClass: "godan" },
  { kana: "する", kanji: "する", meaning: "do", kind: "verb", verbClass: "irregular" },
  { kana: "くる", kanji: "来る", meaning: "come", kind: "verb", verbClass: "irregular" },
  { kana: "おおきい", kanji: "大きい", meaning: "big", kind: "i-adjective" },
  { kana: "ちいさい", kanji: "小さい", meaning: "small", kind: "i-adjective" },
  { kana: "おもしろい", kanji: "面白い", meaning: "interesting", kind: "i-adjective" },
  { kana: "さむい", kanji: "寒い", meaning: "cold", kind: "i-adjective" },
  { kana: "しずか", kanji: "静か", meaning: "quiet", kind: "na-adjective" },
  { kana: "べんり", kanji: "便利", meaning: "convenient", kind: "na-adjective" },
  { kana: "げんき", kanji: "元気", meaning: "healthy/energetic", kind: "na-adjective" },
  { kana: "がくせい", kanji: "学生", meaning: "student", kind: "noun" },
  { kana: "せんせい", kanji: "先生", meaning: "teacher", kind: "noun" },
  { kana: "にほんじん", kanji: "日本人", meaning: "Japanese person", kind: "noun" },
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

const iRowMap: Record<string, string> = { う: "い", く: "き", ぐ: "ぎ", す: "し", つ: "ち", ぬ: "に", ぶ: "び", む: "み", る: "り" };
const eRowMap: Record<string, string> = { う: "え", く: "け", ぐ: "げ", す: "せ", つ: "て", ぬ: "ね", ぶ: "べ", む: "め", る: "れ" };

function randomItem<T>(arr: T[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function titleCase(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function displayConjugationType(form: FormKey) {
  const register = formRegister[form];
  const base = formLabels[form];
  if (!register) return base;
  return `${titleCase(register)} ${base.charAt(0).toLowerCase()}${base.slice(1)}`;
}

function verbMasuStem(base: string, cls: VerbClass) {
  if (cls === "irregular") return base === "する" ? "し" : "き";
  if (cls === "ichidan") return base.slice(0, -1);
  return base.slice(0, -1) + iRowMap[base.slice(-1)];
}

function verbConjugate(v: Lexeme, form: FormKey, useKanji: boolean) {
  const base = useKanji ? v.kanji : v.kana;
  const cls = v.verbClass!;

  if (form === "present") return `${verbMasuStem(base, cls)}ます`;
  if (form === "past") return `${verbMasuStem(base, cls)}ました`;
  if (form === "negative") return `${verbMasuStem(base, cls)}ません`;
  if (form === "pastNegative") return `${verbMasuStem(base, cls)}ませんでした`;

  if (form === "te") {
    if (cls === "ichidan") return `${base.slice(0, -1)}て`;
    if (cls === "irregular") return v.kana === "する" ? "して" : useKanji ? "来て" : "きて";
    const last = base.slice(-1);
    const root = base.slice(0, -1);
    if (v.kana === "いく") return useKanji ? "行って" : "いって";
    if (["う", "つ", "る"].includes(last)) return `${root}って`;
    if (["む", "ぶ", "ぬ"].includes(last)) return `${root}んで`;
    if (last === "く") return `${root}いて`;
    if (last === "ぐ") return `${root}いで`;
    return `${root}して`;
  }

  if (form === "potential") {
    if (cls === "ichidan") return `${base.slice(0, -1)}られます`;
    if (cls === "irregular") return v.kana === "する" ? "できます" : useKanji ? "来られます" : "こられます";
    return `${base.slice(0, -1)}${eRowMap[base.slice(-1)]}ます`;
  }

  return base;
}

function iAdjConjugate(v: Lexeme, form: FormKey, useKanji: boolean) {
  const base = useKanji ? v.kanji : v.kana;
  const stem = base.slice(0, -1);
  if (form === "present") return `${base}です`;
  if (form === "past") return `${stem}かったです`;
  if (form === "negative") return `${stem}くないです`;
  if (form === "pastNegative") return `${stem}くなかったです`;
  if (form === "adverb") return `${stem}く`;
  return base;
}

function naAdjOrNounConjugate(v: Lexeme, form: FormKey, useKanji: boolean) {
  const base = useKanji ? v.kanji : v.kana;
  if (form === "presentCopula") return `${base}です`;
  if (form === "pastCopula") return `${base}でした`;
  if (form === "negativeCopula") return `${base}じゃないです`;
  if (form === "pastNegativeCopula") return `${base}じゃなかったです`;
  if (form === "adverb") return `${base}に`;
  return base;
}

function conjugate(lexeme: Lexeme, form: FormKey, useKanji: boolean) {
  if (lexeme.kind === "verb") return verbConjugate(lexeme, form, useKanji);
  if (lexeme.kind === "i-adjective") return iAdjConjugate(lexeme, form, useKanji);
  return naAdjOrNounConjugate(lexeme, form, useKanji);
}

function createQuestion(enabledKinds: ItemKind[]) {
  const pool = lexemes.filter((l) => enabledKinds.includes(l.kind));
  const item = randomItem(pool.length > 0 ? pool : lexemes);
  const form = randomItem(formsByKind[item.kind]);
  return { item, form };
}

const allKinds: ItemKind[] = ["verb", "i-adjective", "na-adjective", "noun"];

export default function Home() {
  const [enabledKinds, setEnabledKinds] = useState<ItemKind[]>(allKinds);
  const [question, setQuestion] = useState<{ item: Lexeme; form: FormKey }>({ item: lexemes[0], form: "present" });
  const [answer, setAnswer] = useState("");
  const [correct, setCorrect] = useState(0);
  const [total, setTotal] = useState(0);
  const [streak, setStreak] = useState(0);
  const [feedback, setFeedback] = useState<null | { ok: boolean }>(null);
  const [jpInputMode, setJpInputMode] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setQuestion(createQuestion(enabledKinds));
  }, [enabledKinds]);

  const expectedKana = conjugate(question.item, question.form, false);
  const expectedKanji = conjugate(question.item, question.form, true);
  const expectedDisplay = expectedKanji === expectedKana ? expectedKana : `${expectedKanji}（${expectedKana}）`;
  const conjugationTypeLabel = displayConjugationType(question.form);
  const accuracy = useMemo(() => (total ? Math.round((correct / total) * 100) : 0), [correct, total]);

  const nextQuestion = () => {
    setQuestion(createQuestion(enabledKinds));
    setAnswer("");
    setFeedback(null);
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const check = () => {
    const raw = answer.trim();
    if (!raw || feedback) return;

    const normalizedInput = toKana(raw);
    const isCorrect = normalizedInput === toKana(expectedKana) || normalizedInput === toKana(expectedKanji);

    setTotal((t) => t + 1);
    setFeedback({ ok: isCorrect });
    if (isCorrect) {
      setCorrect((c) => c + 1);
      setStreak((s) => s + 1);
    } else {
      setStreak(0);
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
    <main className="min-h-screen px-4 py-8">
      <section className="mx-auto w-full max-w-5xl rounded-2xl border border-white/70 bg-white/90 p-6 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Practice</h1>
            <p className="text-sm text-slate-600">Train with mixed word types and practical conjugation forms.</p>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <button
              onClick={() => setJpInputMode((v) => !v)}
              className={`rounded-xl px-3 py-2 font-semibold ${jpInputMode ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-700"}`}
            >
              JP Input {jpInputMode ? "ON" : "OFF"}
            </button>
            <div className="rounded-xl bg-slate-100 px-3 py-2 text-slate-700">Score {correct}/{total}</div>
            <div className="rounded-xl bg-amber-100 px-3 py-2 text-amber-800">Streak {streak}</div>
            <div className="rounded-xl bg-slate-100 px-3 py-2 text-slate-700">Accuracy {accuracy}%</div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {allKinds.map((k) => {
            const on = enabledKinds.includes(k);
            return (
              <button
                key={k}
                onClick={() => {
                  const next = on ? enabledKinds.filter((x) => x !== k) : [...enabledKinds, k];
                  if (next.length) setEnabledKinds(next);
                }}
                className={`rounded-full px-3 py-1.5 text-sm font-medium ${on ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700"}`}
              >
                {k}
              </button>
            );
          })}
        </div>

        <div className="mt-5 h-2 rounded-full bg-slate-200">
          <div className="h-full rounded-full bg-gradient-to-r from-orange-400 to-red-500" style={{ width: `${accuracy}%` }} />
        </div>

        <article className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Conjugate this word</p>
          <h2 className="mt-2 text-3xl font-bold text-slate-900">
            <ruby>
              {question.item.kanji}
              <rt className="text-sm text-slate-500">{question.item.kana}</rt>
            </ruby>
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            {question.item.meaning} · {question.item.kind}
            {question.item.kind === "verb" ? ` (${question.item.verbClass})` : ""}
          </p>
          <p className="mt-3 text-sm font-semibold text-red-600">{conjugationTypeLabel}</p>

          <div className="mt-4">
            <input
              ref={inputRef}
              value={answer}
              onChange={(e) => setAnswer(jpInputMode ? toHiragana(e.target.value, { IMEMode: true }) : e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleEnter()}
              placeholder={jpInputMode ? "Type in romaji / kana / kanji..." : "Type answer..."}
              lang="ja"
              inputMode="text"
              enterKeyHint={feedback ? "next" : "done"}
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100"
            />
          </div>

          <div className="mt-3 min-h-12 rounded-lg bg-transparent px-1 py-2 text-sm text-slate-700">
            {feedback ? (
              <>
                <span className={`font-semibold ${feedback.ok ? "text-emerald-700" : "text-red-700"}`}>
                  {feedback.ok ? "Correct! 🎉" : "Not quite."}
                </span>{" "}
                Correct answer: <span className="font-semibold">{expectedDisplay}</span>
              </>
            ) : (
              <span className="opacity-0">placeholder</span>
            )}
          </div>

          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {!feedback ? (
              <button onMouseDown={(e) => e.preventDefault()} onClick={check} className="w-full rounded-xl bg-slate-900 px-4 py-3 font-semibold text-white hover:bg-slate-700">
                Check
              </button>
            ) : (
              <button onMouseDown={(e) => e.preventDefault()} onClick={nextQuestion} className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 font-semibold text-slate-700 hover:bg-slate-50">
                Next
              </button>
            )}
            <button onMouseDown={(e) => e.preventDefault()} onClick={nextQuestion} className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 font-semibold text-slate-700 hover:bg-slate-50">
              Skip
            </button>
          </div>
        </article>
      </section>
    </main>
  );
}
